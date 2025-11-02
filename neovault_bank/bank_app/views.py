from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import login, authenticate
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.contrib.auth.forms import AuthenticationForm
from .forms import CustomUserCreationForm
from .models import Account, Transaction, Bill, SavingsGoal, Employee, GalleryImage
from django.contrib import messages
from django.utils import timezone
import json

def home(request):
    employees = Employee.objects.filter(is_active=True)
    context = {
        'employees': employees,
    }
    return render(request, 'index.html', context)

def about(request):
    return render(request, 'about.html')

def gallery(request):
    categories = GalleryImage.CATEGORIES
    images = GalleryImage.objects.filter(is_active=True).order_by('-upload_date')
    return render(request, 'gallery.html', {
        'categories': categories,
        'images': images,
    })

def contact(request):
    return render(request, 'contact.html')

def help_section(request):
    return render(request, 'help_section.html')

def register(request):
    if request.method == 'POST':
        form = CustomUserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            return redirect('dashboard')
    else:
        form = CustomUserCreationForm()
    return render(request, 'registration/register.html', {'form': form})

def custom_login(request):
    if request.method == 'POST':
        form = AuthenticationForm(request=request, data=request.POST)
        if form.is_valid():
            username = form.cleaned_data.get('username')
            password = form.cleaned_data.get('password')
            user = authenticate(request, username=username, password=password)
            if user is not None:
                login(request, user)
                return redirect('dashboard')
    else:
        form = AuthenticationForm()
    return render(request, 'registration/login.html', {'form': form})

@login_required
def dashboard(request):
    return render(request, 'dashboard.html')

@login_required
def deposit(request):
    return render(request, 'deposit.html')

@login_required
def withdraw(request):
    return render(request, 'withdraw.html')

@login_required
def transfer(request):
    return render(request, 'transfer.html')

@login_required
def credit_cards(request):
    return render(request, 'credit_cards.html')

@login_required
def bills(request):
    return render(request, 'bills.html')

@login_required
def savings_goals(request):
    return render(request, 'savings_goals.html')

@login_required
def profile(request):
    return render(request, 'profile.html')

@login_required
def pay_bill(request, bill_id):
    bill = get_object_or_404(Bill, id=bill_id, user=request.user)
    
    if request.method == 'POST':
        account = Account.objects.filter(user=request.user, is_active=True).first()
        
        if account and account.balance >= bill.amount:
            account.balance -= bill.amount
            account.save()
            
            bill.is_paid = True
            bill.save()
            
            # Create transaction record
            Transaction.objects.create(
                account=account,
                transaction_type='payment',
                amount=bill.amount,
                description=f'Bill payment: {bill.bill_type}'
            )
            
            return JsonResponse({
                'success': True,
                'message': f'Bill paid successfully!',
                'new_balance': account.balance
            })
        else:
            return JsonResponse({
                'success': False,
                'message': 'Insufficient funds'
            })
    
    return JsonResponse({'success': False, 'message': 'Invalid request'})

@login_required
def update_savings_goal(request, goal_id):
    goal = get_object_or_404(SavingsGoal, id=goal_id, user=request.user)
    
    if request.method == 'POST':
        amount = request.POST.get('amount')
        
        try:
            amount = float(amount)
            if amount > 0:
                goal.current_amount += amount
                goal.save()
                
                return JsonResponse({
                    'success': True,
                    'message': f'Added ${amount} to your savings goal!',
                    'new_amount': goal.current_amount
                })
        except (ValueError, TypeError):
            pass
    
    return JsonResponse({'success': False, 'message': 'Invalid amount'})

@login_required
def withdraw_api(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        account_id = data.get('account_id')
        amount = data.get('amount')

        try:
            amount = float(amount)
            account = Account.objects.get(id=account_id, user=request.user)

            if account.balance >= amount:
                account.balance -= amount
                account.save()

                Transaction.objects.create(
                    account=account,
                    transaction_type='withdrawal',
                    amount=amount,
                    description=data.get('description', 'Withdrawal')
                )

                return JsonResponse({'success': True, 'new_balance': account.balance})
            else:
                return JsonResponse({'success': False, 'message': 'Insufficient funds'})
        except (Account.DoesNotExist, ValueError, TypeError):
            return JsonResponse({'success': False, 'message': 'Invalid request'})

    return JsonResponse({'success': False, 'message': 'Invalid request method'})

@login_required
def deposit_api(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        account_id = data.get('account_id')
        amount = data.get('amount')

        try:
            amount = float(amount)
            account = Account.objects.get(id=account_id, user=request.user)

            account.balance += amount
            account.save()

            Transaction.objects.create(
                account=account,
                transaction_type='deposit',
                amount=amount,
                description=data.get('description', 'Deposit')
            )

            return JsonResponse({'success': True, 'new_balance': account.balance})
        except (Account.DoesNotExist, ValueError, TypeError):
            return JsonResponse({'success': False, 'message': 'Invalid request'})

    return JsonResponse({'success': False, 'message': 'Invalid request method'})