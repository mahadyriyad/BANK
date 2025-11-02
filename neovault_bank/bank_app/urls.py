from django.urls import path
from django.contrib.auth import views as auth_views
from . import views

urlpatterns = [
    # Main pages
    path('', views.home, name='home'),
    path('about/', views.about, name='about'),
    path('gallery/', views.gallery, name='gallery'),
    path('contact/', views.contact, name='contact'),
    path('help/', views.help_section, name='help'),
    
    # Authentication
    path('register/', views.register, name='register'),
    path('login/', views.custom_login, name='login'),
    path('logout/', auth_views.LogoutView.as_view(), name='logout'),
    
    # Dashboard and banking operations
    path('dashboard/', views.dashboard, name='dashboard'),
    path('deposit/', views.deposit, name='deposit'),
    path('withdraw/', views.withdraw, name='withdraw'),
    path('transfer/', views.transfer, name='transfer'),
    path('bills/', views.bills, name='bills'),
    path('credit-cards/', views.credit_cards, name='credit_cards'),
    path('savings-goals/', views.savings_goals, name='savings_goals'),
    path('profile/', views.profile, name='profile'),
    
    # Credit card related
    path('apply-credit-card/', views.apply_credit_card, name='apply_credit_card'),
    
    # API endpoints for AJAX calls
    path('api/dashboard-data/', views.dashboard_data, name='dashboard_data'),
    path('api/deposit/', views.deposit_api, name='deposit_api'),
    path('api/withdraw/', views.withdraw_api, name='withdraw_api'),
    path('withdraw_api/', views.withdraw_api, name='withdraw_api'),
    path('api/transfer/', views.transfer_api, name='transfer_api'),
    path('api/pay-bill/<int:bill_id>/', views.pay_bill, name='pay_bill'),
    path('api/add-savings-funds/<int:goal_id>/', views.add_savings_funds, name='add_savings_funds'),
    path('api/credit-card-payment/<int:card_id>/', views.credit_card_payment, name='credit_card_payment'),
    path('api/update-profile-picture/', views.update_profile_picture, name='update_profile_picture'),
    
    # New API endpoints to match frontend calls
    path('transfer_api/', views.transfer_api, name='transfer_api'),
    path('credit_card_payment/<int:card_id>/', views.credit_card_payment, name='credit_card_payment'),

    # Additional API endpoints for specific operations
    path('pay-bill/<int:bill_id>/', views.pay_bill, name='pay_bill_direct'),
    path('add-savings-funds/<int:goal_id>/', views.add_savings_funds, name='add_savings_funds_direct'),
    path('credit-card-payment/<int:card_id>/', views.credit_card_payment, name='credit_card_payment_direct'),
    
    # Dashboard data endpoint (alternative naming)
    path('dashboard_data/', views.dashboard_data, name='dashboard_data_alt'),
]