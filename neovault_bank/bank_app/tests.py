from django.test import TestCase, Client
from django.urls import reverse
from django.contrib.auth import get_user_model
from .models import Account, Transaction, Bill, SavingsGoal
import json

User = get_user_model()

class BankAppAPITests(TestCase):
    def setUp(self):
        self.client = Client()
        self.user = User.objects.create_user(username='testuser', password='testpassword')
        self.client.login(username='testuser', password='testpassword')
        self.account = Account.objects.create(user=self.user, account_name='Savings', account_number='12345', balance=1000.00)
        self.bill = Bill.objects.create(user=self.user, bill_type='Electricity', amount=50.00, due_date='2025-12-01')
        self.savings_goal = SavingsGoal.objects.create(user=self.user, goal_name='Vacation', target_amount=5000.00, current_amount=1000.00)

    def test_deposit_api(self):
        url = reverse('deposit_api')
        payload = {
            'account_id': self.account.id,
            'amount': 200.00,
            'description': 'Test Deposit'
        }
        response = self.client.post(url, json.dumps(payload), content_type='application/json')
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data['success'])
        self.assertEqual(data['new_account_balance'], 1200.00)
        self.assertEqual(data['total_balance'], 1200.00)
        self.assertEqual(Transaction.objects.count(), 1)
        self.assertEqual(Transaction.objects.first().amount, 200.00)
        self.assertEqual(Transaction.objects.first().transaction_type, 'deposit')

    def test_withdraw_api(self):
        url = reverse('withdraw_api')
        payload = {
            'account_id': self.account.id,
            'amount': 100.00,
            'description': 'Test Withdrawal'
        }
        response = self.client.post(url, json.dumps(payload), content_type='application/json')
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data['success'])
        self.assertEqual(data['new_account_balance'], 900.00)
        self.assertEqual(data['total_balance'], 900.00)
        self.assertEqual(Transaction.objects.count(), 1)
        self.assertEqual(Transaction.objects.first().amount, 100.00)
        self.assertEqual(Transaction.objects.first().transaction_type, 'withdrawal')

    def test_pay_bill_api(self):
        url = reverse('pay_bill', args=[self.bill.id])
        response = self.client.post(url, json.dumps({}), content_type='application/json')
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data['success'])
        self.assertEqual(data['new_account_balance'], 950.00)
        self.assertEqual(data['total_balance'], 950.00)
        self.assertEqual(Transaction.objects.count(), 1)
        self.assertEqual(Transaction.objects.first().amount, 50.00)
        self.assertEqual(Transaction.objects.first().transaction_type, 'payment')
        self.bill.refresh_from_db()
        self.assertTrue(self.bill.is_paid)

    def test_update_savings_goal_api(self):
        url = reverse('update_goal', args=[self.savings_goal.id])
        payload = {
            'amount': 500.00
        }
        response = self.client.post(url, json.dumps(payload), content_type='application/json')
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data['success'])
        self.assertEqual(data['new_amount'], 1500.00)
        self.savings_goal.refresh_from_db()
        self.assertEqual(self.savings_goal.current_amount, 1500.00)

    def test_transfer_api(self):
        account2 = Account.objects.create(user=self.user, account_name='Checking', account_number='67890', balance=500.00)
        url = reverse('transfer_api')
        payload = {
            'from_account_id': self.account.id,
            'to_account_id': account2.id,
            'amount': 100.00
        }
        response = self.client.post(url, json.dumps(payload), content_type='application/json')
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data['success'])
        self.assertEqual(data['total_balance'], 1400.00) # 900 + 500
        self.account.refresh_from_db()
        account2.refresh_from_db()
        self.assertEqual(self.account.balance, 900.00)
        self.assertEqual(account2.balance, 600.00)
        self.assertEqual(Transaction.objects.count(), 2) # Two transactions for a transfer

    def test_dashboard_data_api(self):
        url = reverse('dashboard_data')
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn('total_balance', data)
        self.assertIn('accounts', data)
        self.assertIn('transactions', data)
        self.assertIn('bills', data)
        self.assertIn('savings_goals', data)
        self.assertEqual(data['total_balance'], 1000.00)
        self.assertEqual(len(data['accounts']), 1)
        self.assertEqual(len(data['bills']), 1)
        self.assertEqual(len(data['savings_goals']), 1)
