from django.contrib.auth.models import AbstractUser
from django.db import models
import uuid
from datetime import date, datetime
from django.core.exceptions import ValidationError
from django.utils import timezone
from decimal import Decimal

class User(AbstractUser):
    phone = models.CharField(max_length=15, blank=True)
    address = models.TextField(blank=True)
    profile_picture = models.ImageField(upload_to='profile_pictures/', blank=True, null=True)
    date_of_birth = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    email_verified = models.BooleanField(default=False)
    phone_verified = models.BooleanField(default=False)
    has_2fa = models.BooleanField(default=False)
    has_biometric = models.BooleanField(default=False)
    last_password_change = models.DateTimeField(auto_now_add=True)
    
    # Additional profile fields
    gender = models.CharField(max_length=20, choices=[
        ('male', 'Male'),
        ('female', 'Female'),
        ('other', 'Other'),
        ('prefer_not_to_say', 'Prefer not to say')
    ], blank=True)
    city = models.CharField(max_length=100, blank=True)
    state = models.CharField(max_length=100, blank=True)
    zip_code = models.CharField(max_length=20, blank=True)
    
    def __str__(self):
        return f"{self.username} - {self.email}"
    
    @property
    def age(self):
        if self.date_of_birth:
            today = date.today()
            return today.year - self.date_of_birth.year - (
                (today.month, today.day) < (self.date_of_birth.month, self.date_of_birth.day)
            )
        return None
    
    @property
    def verification_level(self):
        """Calculate user verification level"""
        level = 0
        if self.email_verified:
            level += 1
        if self.phone_verified:
            level += 1
        if self.has_2fa:
            level += 1
        return level

class Account(models.Model):
    ACCOUNT_TYPES = [
        ('savings', 'Savings Account'),
        ('checking', 'Checking Account'),
        ('business', 'Business Account'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='accounts')
    account_number = models.CharField(max_length=20, unique=True)
    account_type = models.CharField(max_length=20, choices=ACCOUNT_TYPES)
    balance = models.DecimalField(max_digits=15, decimal_places=2, default=0.00)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.account_number} - {self.user.username}"
    
    def clean(self):
        """Validate account data"""
        if self.balance < 0:
            raise ValidationError('Account balance cannot be negative.')
    
    def update_balance(self, amount, transaction_type):
        """Update account balance based on transaction type"""
        if transaction_type in ['deposit', 'transfer_in']:
            self.balance += Decimal(amount)
        elif transaction_type in ['withdrawal', 'transfer_out', 'payment']:
            if self.balance >= Decimal(amount):
                self.balance -= Decimal(amount)
            else:
                raise ValidationError('Insufficient funds')
        self.save()
        return self.balance
    
    def get_transaction_history(self, days=30):
        """Get recent transactions for this account"""
        return self.transactions.filter(
            timestamp__gte=timezone.now() - timezone.timedelta(days=days)
        ).order_by('-timestamp')
    
    @property
    def formatted_balance(self):
        """Return formatted balance for display"""
        return f"৳{self.balance:,.2f}"

class Transaction(models.Model):
    TRANSACTION_TYPES = [
        ('deposit', 'Deposit'),
        ('withdrawal', 'Withdrawal'),
        ('transfer_in', 'Transfer In'),
        ('transfer_out', 'Transfer Out'),
        ('payment', 'Payment'),
        ('bill_payment', 'Bill Payment'),
    ]
    
    CATEGORIES = [
        ('salary', 'Salary'),
        ('shopping', 'Shopping'),
        ('bills', 'Bills'),
        ('food', 'Food'),
        ('entertainment', 'Entertainment'),
        ('transport', 'Transport'),
        ('healthcare', 'Healthcare'),
        ('education', 'Education'),
        ('transfer', 'Transfer'),
        ('other', 'Other'),
    ]
    
    account = models.ForeignKey(Account, on_delete=models.CASCADE, related_name='transactions')
    transaction_type = models.CharField(max_length=20, choices=TRANSACTION_TYPES)
    amount = models.DecimalField(max_digits=15, decimal_places=2)
    description = models.TextField()
    category = models.CharField(max_length=20, choices=CATEGORIES, default='other')
    timestamp = models.DateTimeField(auto_now_add=True)
    reference_number = models.UUIDField(default=uuid.uuid4, unique=True)
    merchant = models.CharField(max_length=200, blank=True)
    location = models.CharField(max_length=200, blank=True)
    is_completed = models.BooleanField(default=True)
    
    # For transfers
    related_transaction = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True)
    to_account = models.ForeignKey(Account, on_delete=models.SET_NULL, null=True, blank=True, related_name='incoming_transactions')
    
    class Meta:
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['account', 'timestamp']),
            models.Index(fields=['transaction_type', 'timestamp']),
        ]
    
    def __str__(self):
        return f"{self.transaction_type} - ৳{self.amount} - {self.account.account_number}"
    
    def save(self, *args, **kwargs):
        """Override save to update account balance"""
        if not self.pk:  # Only for new transactions
            if self.transaction_type in ['deposit', 'transfer_in']:
                self.account.balance += self.amount
            elif self.transaction_type in ['withdrawal', 'transfer_out', 'payment', 'bill_payment']:
                if self.account.balance >= self.amount:
                    self.account.balance -= self.amount
                else:
                    raise ValidationError('Insufficient funds for this transaction')
            self.account.save()
        super().save(*args, **kwargs)
    
    def get_icon(self):
        """Get FontAwesome icon for transaction type"""
        icons = {
            'deposit': 'arrow-down',
            'withdrawal': 'arrow-up',
            'transfer_in': 'exchange-alt',
            'transfer_out': 'exchange-alt',
            'payment': 'credit-card',
            'bill_payment': 'file-invoice-dollar',
        }
        return icons.get(self.transaction_type, 'exchange-alt')
    
    @classmethod
    def create_transaction(cls, account, amount, transaction_type, description="", category="other", to_account=None):
        """Create transaction and update account balance"""
        transaction = cls.objects.create(
            account=account,
            amount=amount,
            transaction_type=transaction_type,
            description=description,
            category=category,
            to_account=to_account
        )
        return transaction

class CreditCard(models.Model):
    CARD_TYPES = [
        ('visa', 'Visa'),
        ('mastercard', 'MasterCard'),
        ('amex', 'American Express'),
    ]
    
    CARD_DESIGNS = [
        ('classic', 'Classic'),
        ('gold', 'Gold'),
        ('platinum', 'Platinum'),
        ('signature', 'Signature'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='credit_cards')
    card_number = models.CharField(max_length=16)
    card_type = models.CharField(max_length=20, choices=CARD_TYPES)
    card_design = models.CharField(max_length=20, choices=CARD_DESIGNS, default='classic')
    expiry_date = models.DateField()
    cvv = models.CharField(max_length=3)
    credit_limit = models.DecimalField(max_digits=10, decimal_places=2)
    available_credit = models.DecimalField(max_digits=10, decimal_places=2)
    current_balance = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    is_active = models.BooleanField(default=True)
    is_locked = models.BooleanField(default=False)
    is_primary = models.BooleanField(default=False)
    issued_date = models.DateField(auto_now_add=True)
    
    # Billing information
    billing_cycle_day = models.IntegerField(default=1)  # Day of month when billing cycle ends
    minimum_payment = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    
    class Meta:
        ordering = ['-issued_date']
    
    def __str__(self):
        return f"{self.card_type} - ****{self.card_number[-4:]}"
    
    def clean(self):
        """Validate credit card data"""
        if self.available_credit < 0:
            raise ValidationError('Available credit cannot be negative.')
        if self.available_credit > self.credit_limit:
            raise ValidationError('Available credit cannot exceed credit limit.')
    
    @property
    def utilization_percentage(self):
        """Calculate credit utilization percentage"""
        if self.credit_limit > 0:
            return (self.current_balance / self.credit_limit) * 100
        return 0
    
    @property
    def next_payment_due(self):
        """Calculate next payment due date"""
        today = date.today()
        due_date = date(today.year, today.month, self.billing_cycle_day)
        if due_date < today:
            due_date = date(today.year, today.month + 1, self.billing_cycle_day)
        return due_date
    
    @property
    def days_until_due(self):
        """Calculate days until next payment due"""
        return (self.next_payment_due - date.today()).days
    
    def make_payment(self, amount, from_account):
        """Process credit card payment"""
        if amount <= 0:
            raise ValidationError('Payment amount must be positive')
        
        if amount > self.current_balance:
            raise ValidationError('Payment amount cannot exceed current balance')
        
        # Update credit card balance
        self.current_balance -= amount
        self.available_credit += amount
        self.save()
        
        # Create transaction record
        Transaction.objects.create(
            account=from_account,
            amount=amount,
            transaction_type='payment',
            description=f"Credit Card Payment - ****{self.card_number[-4:]}",
            category='transfer'
        )
        
        return True

class CreditCardApplication(models.Model):
    APPLICATION_STATUS = [
        ('pending', 'Pending Review'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('additional_info', 'Additional Information Required'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='credit_card_applications')
    card_type = models.CharField(max_length=20, choices=CreditCard.CARD_DESIGNS)
    employment_status = models.CharField(max_length=20, choices=[
        ('employed', 'Employed'),
        ('self_employed', 'Self-Employed'),
        ('student', 'Student'),
        ('retired', 'Retired'),
        ('unemployed', 'Unemployed'),
    ])
    monthly_income = models.DecimalField(max_digits=12, decimal_places=2)
    desired_credit_limit = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=APPLICATION_STATUS, default='pending')
    applied_date = models.DateTimeField(auto_now_add=True)
    reviewed_date = models.DateTimeField(null=True, blank=True)
    review_notes = models.TextField(blank=True)
    
    class Meta:
        ordering = ['-applied_date']
    
    def __str__(self):
        return f"{self.user.username} - {self.card_type} - {self.status}"

class Bill(models.Model):
    BILL_TYPES = [
        ('electricity', 'Electricity'),
        ('water', 'Water'),
        ('gas', 'Gas'),
        ('internet', 'Internet'),
        ('phone', 'Phone'),
        ('credit_card', 'Credit Card'),
        ('loan', 'Loan Payment'),
        ('rent', 'Rent'),
        ('mortgage', 'Mortgage'),
        ('insurance', 'Insurance'),
        ('cable', 'Cable TV'),
        ('other', 'Other'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bills')
    bill_type = models.CharField(max_length=50, choices=BILL_TYPES)
    provider = models.CharField(max_length=200, default='General Provider')  # Add default here
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    due_date = models.DateField()
    is_paid = models.BooleanField(default=False)
    paid_date = models.DateTimeField(null=True, blank=True)
    account_number = models.CharField(max_length=50, blank=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Auto-pay settings
    auto_pay_enabled = models.BooleanField(default=False)
    auto_pay_account = models.ForeignKey(Account, on_delete=models.SET_NULL, null=True, blank=True)
    
    class Meta:
        ordering = ['due_date']
        indexes = [
            models.Index(fields=['user', 'due_date']),
            models.Index(fields=['is_paid', 'due_date']),
        ]
    
    def __str__(self):
        return f"{self.bill_type} - {self.provider} - ৳{self.amount}"
    
    @property
    def is_overdue(self):
        """Check if bill is overdue"""
        return not self.is_paid and self.due_date < date.today()
    
    @property
    def days_until_due(self):
        """Calculate days until due date"""
        return (self.due_date - date.today()).days
    
    @property
    def due_soon(self):
        """Check if bill is due within 7 days"""
        return 0 <= self.days_until_due <= 7
    
    def pay_bill(self, from_account):
        """Process bill payment"""
        if self.is_paid:
            raise ValidationError('This bill has already been paid')
        
        # Create transaction
        transaction = Transaction.create_transaction(
            account=from_account,
            amount=self.amount,
            transaction_type='bill_payment',
            description=f"{self.bill_type} - {self.provider}",
            category='bills'
        )
        
        # Update bill status
        self.is_paid = True
        self.paid_date = timezone.now()
        self.save()
        
        return transaction

class SavingsGoal(models.Model):
    CATEGORIES = [
        ('emergency', 'Emergency Fund'),
        ('vacation', 'Vacation'),
        ('vehicle', 'Vehicle'),
        ('home', 'Home'),
        ('education', 'Education'),
        ('retirement', 'Retirement'),
        ('wedding', 'Wedding'),
        ('gadgets', 'Gadgets'),
        ('other', 'Other'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='savings_goals')
    name = models.CharField(max_length=100)
    target_amount = models.DecimalField(max_digits=15, decimal_places=2)
    current_amount = models.DecimalField(max_digits=15, decimal_places=2, default=0.00)
    target_date = models.DateField()
    category = models.CharField(max_length=20, choices=CATEGORIES, default='other')
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_completed = models.BooleanField(default=False)
    completed_date = models.DateTimeField(null=True, blank=True)
    
    # Auto-save settings
    auto_save_enabled = models.BooleanField(default=False)
    auto_save_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    auto_save_frequency = models.CharField(max_length=20, choices=[
        ('weekly', 'Weekly'),
        ('monthly', 'Monthly'),
    ], default='monthly')
    auto_save_account = models.ForeignKey(Account, on_delete=models.SET_NULL, null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.name} - {self.user.username}"
    
    def clean(self):
        """Validate savings goal data"""
        if self.target_amount <= 0:
            raise ValidationError('Target amount must be positive')
        if self.target_date <= date.today():
            raise ValidationError('Target date must be in the future')
    
    @property
    def progress_percentage(self):
        """Calculate progress percentage"""
        if self.target_amount > 0:
            return (self.current_amount / self.target_amount) * 100
        return 0
    
    @property
    def time_left(self):
        """Calculate time left until target date"""
        today = date.today()
        days_left = (self.target_date - today).days
        if days_left <= 0:
            return "Target date passed"
        
        if days_left < 30:
            return f"{days_left} days"
        elif days_left < 365:
            months = days_left // 30
            return f"{months} months"
        else:
            years = days_left // 365
            months = (days_left % 365) // 30
            return f"{years} years, {months} months"
    
    @property
    def monthly_saving(self):
        """Calculate required monthly saving"""
        today = date.today()
        months_left = max(1, (self.target_date.year - today.year) * 12 + self.target_date.month - today.month)
        remaining_amount = self.target_amount - self.current_amount
        return remaining_amount / months_left
    
    @property
    def status(self):
        """Get goal status"""
        if self.is_completed:
            return "completed"
        elif self.progress_percentage >= 100:
            return "achieved"
        elif self.target_date < date.today():
            return "overdue"
        else:
            return "active"
    
    def add_funds(self, amount, from_account):
        """Add funds to savings goal from specified account"""
        if amount <= 0:
            raise ValidationError('Amount must be positive')
        
        if self.is_completed:
            raise ValidationError('Cannot add funds to completed goal')
        
        # Check if account has sufficient funds
        if from_account.balance < amount:
            raise ValidationError('Insufficient funds in account')
        
        # Update savings goal
        self.current_amount += amount
        if self.current_amount >= self.target_amount:
            self.is_completed = True
            self.completed_date = timezone.now()
        self.save()
        
        # Create transaction
        transaction = Transaction.create_transaction(
            account=from_account,
            amount=amount,
            transaction_type='withdrawal',
            description=f"Savings Goal: {self.name}",
            category='savings'
        )
        
        return transaction

class SavingsContribution(models.Model):
    """Track individual contributions to savings goals"""
    goal = models.ForeignKey(SavingsGoal, on_delete=models.CASCADE, related_name='contributions')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    contribution_date = models.DateTimeField(auto_now_add=True)
    description = models.TextField(blank=True)
    source_account = models.ForeignKey(Account, on_delete=models.SET_NULL, null=True)
    
    class Meta:
        ordering = ['-contribution_date']
    
    def __str__(self):
        return f"৳{self.amount} to {self.goal.name}"

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

class UserSession(models.Model):
    """Track user login sessions for security"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sessions')
    session_key = models.CharField(max_length=40)
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField()
    login_time = models.DateTimeField(auto_now_add=True)
    last_activity = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        ordering = ['-login_time']
    
    def __str__(self):
        return f"{self.user.username} - {self.login_time}"

class ConnectedDevice(models.Model):
    """Track user's connected devices"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='devices')
    device_name = models.CharField(max_length=100)
    device_type = models.CharField(max_length=50)  # mobile, tablet, desktop, etc.
    os = models.CharField(max_length=50)
    browser = models.CharField(max_length=50)
    last_used = models.DateTimeField(auto_now=True)
    is_trusted = models.BooleanField(default=False)
    
    class Meta:
        ordering = ['-last_used']
    
    def __str__(self):
        return f"{self.user.username} - {self.device_name}"