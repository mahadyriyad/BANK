from django.contrib.auth.models import AbstractUser
from django.db import models
import uuid
from datetime import date

class User(AbstractUser):
    phone = models.CharField(max_length=15, blank=True)
    address = models.TextField(blank=True)
    profile_picture = models.ImageField(upload_to='profile_pictures/', blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.username} - {self.email}"

class Account(models.Model):
    ACCOUNT_TYPES = [
        ('savings', 'Savings Account'),
        ('checking', 'Checking Account'),
        ('business', 'Business Account'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    account_number = models.CharField(max_length=20, unique=True)
    account_type = models.CharField(max_length=20, choices=ACCOUNT_TYPES)
    balance = models.DecimalField(max_digits=15, decimal_places=2, default=0.00)
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return f"{self.account_number} - {self.user.username}"

class Transaction(models.Model):
    TRANSACTION_TYPES = [
        ('deposit', 'Deposit'),
        ('withdrawal', 'Withdrawal'),
        ('transfer', 'Transfer'),
        ('payment', 'Payment'),
    ]
    
    account = models.ForeignKey(Account, on_delete=models.CASCADE)
    transaction_type = models.CharField(max_length=20, choices=TRANSACTION_TYPES)
    amount = models.DecimalField(max_digits=15, decimal_places=2)
    description = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    reference_number = models.UUIDField(default=uuid.uuid4, unique=True)
    
    def __str__(self):
        return f"{self.transaction_type} - {self.amount} - {self.account.account_number}"

class CreditCard(models.Model):
    CARD_TYPES = [
        ('visa', 'Visa'),
        ('mastercard', 'MasterCard'),
        ('amex', 'American Express'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    card_number = models.CharField(max_length=16)
    card_type = models.CharField(max_length=20, choices=CARD_TYPES)
    expiry_date = models.DateField()
    cvv = models.CharField(max_length=3)
    credit_limit = models.DecimalField(max_digits=10, decimal_places=2)
    available_credit = models.DecimalField(max_digits=10, decimal_places=2)
    is_active = models.BooleanField(default=True)
    design = models.CharField(max_length=50, default='default')
    
    def __str__(self):
        return f"{self.card_type} - {self.card_number[-4:]}"

class Bill(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    bill_type = models.CharField(max_length=50)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    due_date = models.DateField()
    is_paid = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.bill_type} - {self.amount}"

class SavingsGoal(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    target_amount = models.DecimalField(max_digits=15, decimal_places=2)
    current_amount = models.DecimalField(max_digits=15, decimal_places=2, default=0.00)
    target_date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    def progress_percentage(self):
        return (self.current_amount / self.target_amount) * 100
    
    def __str__(self):
        return f"{self.name} - {self.user.username}"

class Employee(models.Model):
    name = models.CharField(max_length=100)
    position = models.CharField(max_length=100)
    bio = models.TextField()
    profile_picture = models.ImageField(upload_to='employee_profiles/', blank=True)
    email = models.EmailField()
    phone = models.CharField(max_length=15)
    join_date = models.DateField()
    is_active = models.BooleanField(default=True)

    # Social media links
    facebook = models.URLField(blank=True)
    instagram = models.URLField(blank=True)
    github = models.URLField(blank=True)
    linkedin = models.URLField(blank=True)

    def __str__(self):
        return f"{self.name} - {self.position}"

class GalleryImage(models.Model):
    CATEGORIES = [
        ('events', 'Events'),
        ('party', 'Party'),
        ('holidays', 'Holidays'),
        ('branches', 'Branches'),
    ]
    
    title = models.CharField(max_length=200)
    image = models.ImageField(upload_to='gallery/')
    category = models.CharField(max_length=20, choices=CATEGORIES)
    description = models.TextField(blank=True)
    upload_date = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return self.title

class BankGoal(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    target_date = models.DateField()
    progress = models.IntegerField(default=0)
    is_completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.title

class Notice(models.Model):
    PRIORITIES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical'),
    ]
    
    title = models.CharField(max_length=200)
    content = models.TextField()
    priority = models.CharField(max_length=10, choices=PRIORITIES)
    publish_date = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return self.title