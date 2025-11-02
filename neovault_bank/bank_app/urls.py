from django.urls import path
from django.contrib.auth import views as auth_views
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('about/', views.about, name='about'),
    path('gallery/', views.gallery, name='gallery'),
     path('gallery/upload/', views.upload_gallery_image, name='upload_gallery_image'),
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
    path('credit-cards/', views.credit_cards, name='credit_cards'),
    path('bills/', views.bills, name='bills'),
    path('savings-goals/', views.savings_goals, name='savings_goals'),
    path('profile/', views.profile, name='profile'),
    
    # API endpoints
    path('api/pay-bill/<int:bill_id>/', views.pay_bill, name='pay_bill'),
    path('api/update-goal/<int:goal_id>/', views.update_savings_goal, name='update_goal'),
]