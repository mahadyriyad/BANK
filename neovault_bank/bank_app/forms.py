from django import forms
from django.contrib.auth.forms import UserCreationForm
from .models import User, Account, CreditCard, Bill, SavingsGoal
from django import forms
from .models import GalleryImage

class GalleryImageForm(forms.ModelForm):
    class Meta:
        model = GalleryImage
        fields = ['title', 'image', 'category', 'description', 'is_active']
        widgets = {
            'title': forms.TextInput(attrs={'class': 'form-control'}),
            'category': forms.Select(attrs={'class': 'form-select'}),
            'description': forms.Textarea(attrs={'class': 'form-control', 'rows': 3}),
            'is_active': forms.CheckboxInput(attrs={'class': 'form-check-input'}),
        }

class CustomUserCreationForm(UserCreationForm):
    email = forms.EmailField(required=True)
    phone = forms.CharField(max_length=15, required=False)
    
    class Meta:
        model = User
        fields = ('username', 'email', 'phone', 'password1', 'password2')

class AccountForm(forms.ModelForm):
    class Meta:
        model = Account
        fields = ('account_type',)

class DepositForm(forms.Form):
    amount = forms.DecimalField(max_digits=10, decimal_places=2, min_value=0.01)
    description = forms.CharField(widget=forms.Textarea(attrs={'rows': 3}))

class WithdrawalForm(forms.Form):
    amount = forms.DecimalField(max_digits=10, decimal_places=2, min_value=0.01)
    description = forms.CharField(widget=forms.Textarea(attrs={'rows': 3}))

class TransferForm(forms.Form):
    amount = forms.DecimalField(max_digits=10, decimal_places=2, min_value=0.01)
    to_account_number = forms.CharField(max_length=20)
    description = forms.CharField(widget=forms.Textarea(attrs={'rows': 3}))

class CreditCardApplicationForm(forms.ModelForm):
    class Meta:
        model = CreditCard
        fields = ('card_type', 'credit_limit')

class BillForm(forms.ModelForm):
    class Meta:
        model = Bill
        fields = ('bill_type', 'amount', 'due_date')

class SavingsGoalForm(forms.ModelForm):
    class Meta:
        model = SavingsGoal
        fields = ('name', 'target_amount', 'target_date')

class ProfileUpdateForm(forms.ModelForm):
    class Meta:
        model = User
        fields = ('first_name', 'last_name', 'email', 'phone', 'address', 'date_of_birth', 'profile_picture')