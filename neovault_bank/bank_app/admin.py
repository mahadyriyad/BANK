from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import GalleryImage
from .models import *

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'first_name', 'last_name', 'phone', 'is_staff')
    fieldsets = UserAdmin.fieldsets + (
        ('Additional Info', {
            'fields': ('phone', 'address', 'profile_picture', 'date_of_birth')
        }),
    )

@admin.register(Account)
class AccountAdmin(admin.ModelAdmin):
    list_display = ('account_number', 'user', 'account_type', 'balance', 'is_active')
    list_filter = ('account_type', 'is_active')
    search_fields = ('account_number', 'user__username')

@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ('reference_number', 'account', 'transaction_type', 'amount', 'timestamp')
    list_filter = ('transaction_type', 'timestamp')
    search_fields = ('reference_number', 'account__account_number')

@admin.register(CreditCard)
class CreditCardAdmin(admin.ModelAdmin):
    list_display = ('card_number', 'user', 'card_type', 'credit_limit', 'available_credit', 'is_active')
    list_filter = ('card_type', 'is_active')

@admin.register(Bill)
class BillAdmin(admin.ModelAdmin):
    list_display = ('user', 'bill_type', 'amount', 'due_date', 'is_paid')
    list_filter = ('bill_type', 'is_paid')

@admin.register(SavingsGoal)
class SavingsGoalAdmin(admin.ModelAdmin):
    list_display = ('name', 'user', 'target_amount', 'current_amount', 'target_date')
    list_filter = ('target_date',)

@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = ('name', 'position', 'email', 'join_date', 'is_active')
    list_filter = ('position', 'is_active')

@admin.register(GalleryImage)
class GalleryImageAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'upload_date', 'is_active')
    list_filter = ('category', 'is_active')

class GalleryImageAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'upload_date', 'is_active')
    list_filter = ('category', 'is_active', 'upload_date')
    search_fields = ('title', 'description')
    
@admin.register(Notice)
class NoticeAdmin(admin.ModelAdmin):
    list_display = ('title', 'priority', 'publish_date', 'is_active')
    list_filter = ('priority', 'is_active')