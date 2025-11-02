from .models import Notice, BankGoal

def bank_context(request):
    context = {
        'notices': Notice.objects.filter(is_active=True).order_by('-publish_date')[:5],
        'bank_goals': BankGoal.objects.filter(is_completed=False),
        'bank_name': 'NeoVault Bank',
        'current_year': 2024,
    }
    
    if request.user.is_authenticated:
        context['user_accounts'] = request.user.account_set.filter(is_active=True)
    
    return context