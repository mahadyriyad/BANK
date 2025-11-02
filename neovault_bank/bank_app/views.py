from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import login, authenticate
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.contrib.auth.forms import AuthenticationForm
from .forms import CustomUserCreationForm, ProfileUpdateForm, CreditCardApplicationForm
from .models import Account, Transaction, Bill, SavingsGoal, Employee, GalleryImage, CreditCard, CreditCardApplication, User
from django.contrib import messages
from django.utils import timezone
import json
from decimal import Decimal
from django.db.models import Sum, Q
from datetime import date, timedelta
import uuid

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
    accounts = Account.objects.filter(user=request.user, is_active=True)
    total_balance = accounts.aggregate(Sum('balance'))['balance__sum'] or Decimal('0.00')
    
    # Get recent transactions across all user accounts
    transactions = Transaction.objects.filter(
        account__user=request.user
    ).select_related('account').order_by('-timestamp')[:10]
    
    credit_cards = CreditCard.objects.filter(user=request.user, is_active=True)
    
    # Get pending bills
    bills = Bill.objects.filter(user=request.user, is_paid=False).order_by('due_date')
    
    savings_goals = SavingsGoal.objects.filter(user=request.user)

    context = {
        'accounts': accounts,
        'total_balance': total_balance,
        'transactions': transactions,
        'credit_cards': credit_cards,
        'bills': bills,
        'savings_goals': savings_goals,
        'current_date': timezone.now().date(),
    }
    return render(request, 'dashboard.html', context)

@login_required
def deposit(request):
    user_accounts = Account.objects.filter(user=request.user, is_active=True)
    recent_deposits = Transaction.objects.filter(
        account__user=request.user, 
        transaction_type='deposit'
    ).order_by('-timestamp')[:5]
    
    context = {
        'user_accounts': user_accounts, 
        'recent_deposits': recent_deposits
    }
    return render(request, 'deposit.html', context)

@login_required
def withdraw(request):
    user_accounts = Account.objects.filter(user=request.user, is_active=True)
    recent_withdrawals = Transaction.objects.filter(
        account__user=request.user, 
        transaction_type='withdrawal'
    ).order_by('-timestamp')[:5]
    
    context = {
        'user_accounts': user_accounts, 
        'recent_withdrawals': recent_withdrawals
    }
    return render(request, 'withdraw.html', context)

@login_required
def transfer(request):
    user_accounts = Account.objects.filter(user=request.user, is_active=True)
    recent_transfers = Transaction.objects.filter(
        account__user=request.user,
        transaction_type__in=['transfer_in', 'transfer_out']
    ).order_by('-timestamp')[:5]
    
    context = {
        'user_accounts': user_accounts,
        'recent_transfers': recent_transfers
    }
    return render(request, 'transfer.html', context)

@login_required
def credit_cards(request):
    credit_cards = CreditCard.objects.filter(user=request.user, is_active=True)
    recent_transactions = Transaction.objects.filter(
        account__user=request.user,
        transaction_type='payment'
    ).order_by('-timestamp')[:10]
    
    # Calculate credit summary
    total_credit_limit = credit_cards.aggregate(Sum('credit_limit'))['credit_limit__sum'] or Decimal('0.00')
    available_credit = credit_cards.aggregate(Sum('available_credit'))['available_credit__sum'] or Decimal('0.00')
    current_balance = credit_cards.aggregate(Sum('current_balance'))['current_balance__sum'] or Decimal('0.00')
    
    if total_credit_limit > 0:
        total_utilization = (current_balance / total_credit_limit) * 100
    else:
        total_utilization = 0
    
    # Find next payment due
    next_payment_due = None
    minimum_payment = Decimal('0.00')
    for card in credit_cards:
        if card.next_payment_due:
            if next_payment_due is None or card.next_payment_due < next_payment_due:
                next_payment_due = card.next_payment_due
                minimum_payment = card.minimum_payment
    
    context = {
        'credit_cards': credit_cards,
        'recent_transactions': recent_transactions,
        'total_credit_limit': total_credit_limit,
        'available_credit': available_credit,
        'current_balance': current_balance,
        'total_utilization': round(total_utilization, 1),
        'next_payment_due': next_payment_due,
        'minimum_payment': minimum_payment,
    }
    return render(request, 'credit_cards.html', context)

@login_required
def apply_credit_card(request):
    if request.method == 'POST':
        form = CreditCardApplicationForm(request.POST)
        if form.is_valid():
            application = form.save(commit=False)
            application.user = request.user
            application.save()
            
            messages.success(request, 'Credit card application submitted successfully!')
            return redirect('credit_cards')
    else:
        form = CreditCardApplicationForm()
    
    return render(request, 'apply_credit_card.html', {'form': form})

@login_required
def bills(request):
    bills = Bill.objects.filter(user=request.user).order_by('due_date')
    pending_bills = bills.filter(is_paid=False)
    paid_bills = bills.filter(is_paid=True)
    
    # Calculate summary
    total_due = pending_bills.aggregate(Sum('amount'))['amount__sum'] or Decimal('0.00')
    
    # Calculate paid this month
    current_month = timezone.now().month
    current_year = timezone.now().year
    paid_this_month = Bill.objects.filter(
        user=request.user,
        is_paid=True,
        paid_date__month=current_month,
        paid_date__year=current_year
    ).aggregate(Sum('amount'))['amount__sum'] or Decimal('0.00')
    
    # Calculate paid percentage
    total_bills_amount = bills.aggregate(Sum('amount'))['amount__sum'] or Decimal('0.00')
    if total_bills_amount > 0:
        paid_percentage = (paid_this_month / total_bills_amount) * 100
    else:
        paid_percentage = 0
    
    # Upcoming bills (due in next 7 days)
    upcoming_bills = pending_bills.filter(
        due_date__lte=date.today() + timedelta(days=7)
    )
    
    context = {
        'bills': bills,
        'pending_bills': pending_bills,
        'paid_bills': paid_bills,
        'total_due': total_due,
        'paid_this_month': paid_this_month,
        'paid_percentage': round(paid_percentage, 1),
        'upcoming_bills': upcoming_bills,
    }
    return render(request, 'bills.html', context)

@login_required
def savings_goals(request):
    savings_goals = SavingsGoal.objects.filter(user=request.user)
    
    # Calculate summary
    total_target = savings_goals.aggregate(Sum('target_amount'))['target_amount__sum'] or Decimal('0.00')
    total_saved = savings_goals.aggregate(Sum('current_amount'))['current_amount__sum'] or Decimal('0.00')
    
    if total_target > 0:
        overall_progress = (total_saved / total_target) * 100
    else:
        overall_progress = 0
    
    # Recent contributions (last 30 days)
    recent_contributions = Transaction.objects.filter(
        account__user=request.user,
        transaction_type='withdrawal',
        description__icontains='savings goal',
        timestamp__gte=timezone.now() - timedelta(days=30)
    ).order_by('-timestamp')[:5]
    
    context = {
        'savings_goals': savings_goals,
        'total_target': total_target,
        'total_saved': total_saved,
        'overall_progress': round(overall_progress, 1),
        'recent_contributions': recent_contributions,
        'user_accounts': Account.objects.filter(user=request.user, is_active=True),
    }
    return render(request, 'savings_goals.html', context)

@login_required
def profile(request):
    user_accounts = Account.objects.filter(user=request.user, is_active=True)
    credit_cards = CreditCard.objects.filter(user=request.user, is_active=True)
    savings_goals = SavingsGoal.objects.filter(user=request.user)
    bills = Bill.objects.filter(user=request.user, is_paid=False)
    
    if request.method == 'POST':
        form = ProfileUpdateForm(request.POST, request.FILES, instance=request.user)
        if form.is_valid():
            form.save()
            messages.success(request, 'Profile updated successfully!')
            return redirect('profile')
    else:
        form = ProfileUpdateForm(instance=request.user)
    
    context = {
        'form': form,
        'accounts': user_accounts,
        'credit_cards': credit_cards,
        'savings_goals': savings_goals,
        'bills': bills,
        'verification_level': request.user.verification_level,
        'connected_devices': [],  # You can implement this later
    }
    return render(request, 'profile.html', context)

# API Views for AJAX calls
@login_required
def dashboard_data(request):
    """API endpoint for dashboard data"""
    accounts = Account.objects.filter(user=request.user, is_active=True)
    total_balance = accounts.aggregate(Sum('balance'))['balance__sum'] or Decimal('0.00')
    
    transactions = Transaction.objects.filter(account__user=request.user).order_by('-timestamp')[:10]
    bills = Bill.objects.filter(user=request.user, is_paid=False)
    savings_goals = SavingsGoal.objects.filter(user=request.user)

    # Serialize data
    accounts_data = []
    for acc in accounts:
        accounts_data.append({
            'id': acc.id,
            'account_number': acc.account_number,
            'account_type': acc.get_account_type_display(),
            'balance': float(acc.balance),
            'formatted_balance': acc.formatted_balance
        })
    
    transactions_data = []
    for tr in transactions:
        transactions_data.append({
            'id': tr.id,
            'transaction_type': tr.transaction_type,
            'amount': float(tr.amount),
            'description': tr.description,
            'timestamp': tr.timestamp.isoformat(),
            'category': tr.category,
            'icon': tr.get_icon()
        })
    
    bills_data = []
    for bill in bills:
        bills_data.append({
            'id': bill.id,
            'bill_type': bill.bill_type,
            'provider': bill.provider,
            'amount': float(bill.amount),
            'due_date': bill.due_date.isoformat(),
            'is_overdue': bill.is_overdue,
            'due_soon': bill.due_soon
        })
    
    savings_goals_data = []
    for goal in savings_goals:
        savings_goals_data.append({
            'id': goal.id,
            'name': goal.name,
            'current_amount': float(goal.current_amount),
            'target_amount': float(goal.target_amount),
            'progress_percentage': goal.progress_percentage,
            'target_date': goal.target_date.isoformat(),
            'time_left': goal.time_left
        })

    return JsonResponse({
        'success': True,
        'total_balance': float(total_balance),
        'accounts_count': accounts.count(),
        'cards_count': CreditCard.objects.filter(user=request.user, is_active=True).count(),
        'bills_count': bills.count(),
        'goals_count': savings_goals.count(),
        'accounts': accounts_data,
        'transactions': transactions_data,
        'bills': bills_data,
        'savings_goals': savings_goals_data,
    })

@login_required
def deposit_api(request):
    """API endpoint for deposits"""
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            account_id = data.get('account_id')
            amount = Decimal(data.get('amount'))
            description = data.get('description', 'Deposit')

            if amount <= 0:
                return JsonResponse({
                    'success': False, 
                    'message': 'Deposit amount must be positive'
                })

            account = Account.objects.get(id=account_id, user=request.user)

            # Create transaction (this automatically updates balance via save method)
            transaction = Transaction.objects.create(
                account=account,
                transaction_type='deposit',
                amount=amount,
                description=description,
                category='transfer'
            )

            # Get updated data
            accounts = Account.objects.filter(user=request.user, is_active=True)
            total_balance = accounts.aggregate(Sum('balance'))['balance__sum'] or Decimal('0.00')

            return dashboard_data(request)

        except Account.DoesNotExist:
            return JsonResponse({
                'success': False, 
                'message': 'Account not found'
            })
        except Exception as e:
            return JsonResponse({
                'success': False, 
                'message': f'Error: {str(e)}'
            })

    return JsonResponse({'success': False, 'message': 'Invalid request method'})

@login_required
def withdraw_api(request):
    """API endpoint for withdrawals"""
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            account_id = data.get('account_id')
            amount = Decimal(str(data.get('amount')))
            description = data.get('description', 'Withdrawal')

            print(f"Withdraw request: account_id={account_id}, amount={amount}")

            if amount <= 0:
                return JsonResponse({
                    'success': False, 
                    'message': 'Withdrawal amount must be positive'
                })

            account = Account.objects.get(id=account_id, user=request.user)

            # Check sufficient funds
            if account.balance < amount:
                return JsonResponse({
                    'success': False, 
                    'message': 'Insufficient funds'
                })

            # Create transaction
            transaction = Transaction.objects.create(
                account=account,
                transaction_type='withdrawal',
                amount=amount,
                description=description,
                category='transfer'
            )

            print(f"Withdrawal successful. New balance: {account.balance}")

            # Return success with updated data
            return JsonResponse({
                'success': True,
                'message': f'Successfully withdrew ৳{amount:.2f}',
                'transaction_id': str(transaction.reference_number),
                'new_balance': float(account.balance),
                'total_balance': float(Account.objects.filter(user=request.user, is_active=True).aggregate(Sum('balance'))['balance__sum'] or Decimal('0.00'))
            })

        except Account.DoesNotExist:
            return JsonResponse({
                'success': False, 
                'message': 'Account not found'
            })
        except Exception as e:
            print(f"Withdraw error: {str(e)}")
            return JsonResponse({
                'success': False, 
                'message': f'Error: {str(e)}'
            })

    return JsonResponse({'success': False, 'message': 'Invalid request method'})

@login_required
def transfer_api(request):
    """API endpoint for transfers"""
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            from_account_id = data.get('from_account_id')
            to_account_id = data.get('to_account_id')
            amount = Decimal(data.get('amount'))
            description = data.get('description', 'Transfer')

            if amount <= 0:
                return JsonResponse({
                    'success': False, 
                    'message': 'Transfer amount must be positive'
                })

            from_account = Account.objects.get(id=from_account_id, user=request.user)
            to_account = Account.objects.get(id=to_account_id, user=request.user)

            if from_account.id == to_account.id:
                return JsonResponse({
                    'success': False, 
                    'message': 'Cannot transfer to the same account'
                })

            # Check sufficient funds
            if from_account.balance < amount:
                return JsonResponse({
                    'success': False, 
                    'message': 'Insufficient funds'
                })

            # Create transactions (these automatically update balances via save method)
            transfer_out = Transaction.objects.create(
                account=from_account,
                transaction_type='transfer_out',
                amount=amount,
                description=f'Transfer to {to_account.account_number} - {description}',
                category='transfer'
            )

            transfer_in = Transaction.objects.create(
                account=to_account,
                transaction_type='transfer_in',
                amount=amount,
                description=f'Transfer from {from_account.account_number} - {description}',
                category='transfer'
            )

            # Link the transactions
            transfer_out.related_transaction = transfer_in
            transfer_out.save()
            transfer_in.related_transaction = transfer_out
            transfer_in.save()

            # Get updated data
            accounts = Account.objects.filter(user=request.user, is_active=True)
            total_balance = accounts.aggregate(Sum('balance'))['balance__sum'] or Decimal('0.00')

            return dashboard_data(request)

        except Account.DoesNotExist:
            return JsonResponse({
                'success': False, 
                'message': 'Account not found'
            })
        except Exception as e:
            return JsonResponse({
                'success': False, 
                'message': f'Error: {str(e)}'
            })

    return JsonResponse({'success': False, 'message': 'Invalid request method'})

@login_required
def pay_bill(request, bill_id):
    """API endpoint for bill payments"""
    bill = get_object_or_404(Bill, id=bill_id, user=request.user)
    
    if request.method == 'POST':
        try:
            account_id = request.POST.get('account_id')
            account = Account.objects.get(id=account_id, user=request.user)

            # Process bill payment
            transaction = bill.pay_bill(account)

            # Get updated data
            accounts = Account.objects.filter(user=request.user, is_active=True)
            total_balance = accounts.aggregate(Sum('balance'))['balance__sum'] or Decimal('0.00')

            return dashboard_data(request)

        except Account.DoesNotExist:
            return JsonResponse({
                'success': False, 
                'message': 'Account not found'
            })
        except Exception as e:
            return JsonResponse({
                'success': False, 
                'message': f'Error: {str(e)}'
            })
    
    return JsonResponse({'success': False, 'message': 'Invalid request'})

@login_required
def add_savings_funds(request, goal_id):
    """API endpoint for adding funds to savings goals"""
    goal = get_object_or_404(SavingsGoal, id=goal_id, user=request.user)
    
    if request.method == 'POST':
        try:
            account_id = request.POST.get('account_id')
            amount = Decimal(request.POST.get('amount'))
            account = Account.objects.get(id=account_id, user=request.user)

            # Add funds to savings goal
            transaction = goal.add_funds(amount, account)

            # Get updated data
            accounts = Account.objects.filter(user=request.user, is_active=True)
            total_balance = accounts.aggregate(Sum('balance'))['balance__sum'] or Decimal('0.00')

            return dashboard_data(request)

        except Account.DoesNotExist:
            return JsonResponse({
                'success': False, 
                'message': 'Account not found'
            })
        except Exception as e:
            return JsonResponse({
                'success': False, 
                'message': f'Error: {str(e)}'
            })
    
    return JsonResponse({'success': False, 'message': 'Invalid request'})

@login_required
def credit_card_payment(request, card_id):
    """API endpoint for credit card payments"""
    card = get_object_or_404(CreditCard, id=card_id, user=request.user)
    
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            account_id = data.get('account_id')
            amount = Decimal(data.get('amount'))
            account = Account.objects.get(id=account_id, user=request.user)

            # Process credit card payment
            card.make_payment(amount, account)

            # Get updated data
            accounts = Account.objects.filter(user=request.user, is_active=True)
            total_balance = accounts.aggregate(Sum('balance'))['balance__sum'] or Decimal('0.00')

            return dashboard_data(request)

        except Account.DoesNotExist:
            return JsonResponse({
                'success': False, 
                'message': 'Account not found'
            })
        except Exception as e:
            return JsonResponse({
                'success': False, 
                'message': f'Error: {str(e)}'
            })
    
    return JsonResponse({'success': False, 'message': 'Invalid request'})

@login_required
def update_profile_picture(request):
    """API endpoint for updating profile picture"""
    if request.method == 'POST' and request.FILES.get('profile_picture'):
        try:
            profile_picture = request.FILES['profile_picture']
            
            # Validate file size (max 5MB)
            if profile_picture.size > 5 * 1024 * 1024:
                return JsonResponse({
                    'success': False, 
                    'message': 'File size too large. Maximum 5MB allowed.'
                })
            
            # Validate file type
            allowed_types = ['image/jpeg', 'image/png', 'image/gif']
            if profile_picture.content_type not in allowed_types:
                return JsonResponse({
                    'success': False, 
                    'message': 'Invalid file type. Please upload JPEG, PNG, or GIF.'
                })
            
            # Save profile picture
            request.user.profile_picture = profile_picture
            request.user.save()
            
            return JsonResponse({
                'success': True,
                'message': 'Profile picture updated successfully!',
                'image_url': request.user.profile_picture.url
            })
            
        except Exception as e:
            return JsonResponse({
                'success': False, 
                'message': f'Error: {str(e)}'
            })
    
    return JsonResponse({'success': False, 'message': 'Invalid request'})