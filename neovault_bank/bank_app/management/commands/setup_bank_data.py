from django.core.management.base import BaseCommand
from bank_app.models import Employee, BankGoal, Notice, GalleryImage
from datetime import date, timedelta

class Command(BaseCommand):
    help = 'Setup initial bank data'

    def handle(self, *args, **options):
        # Create employees
        employees_data = [
            {
                'name': 'Mahady Riyad',
                'position': 'Chief Executive Officer',
                'bio': 'Experienced banking professional with 20+ years in financial services.',
                'email': 'mahady.riyad@neovault.com',
                'phone': '+1 (555) 123-4567',
                'join_date': date(2015, 1, 15)
            },
            {
                'name': 'Arif Khan',
                'position': 'Chief Technology Officer',
                'bio': 'Technology innovator with expertise in digital banking solutions.',
                'email': 'arif.khan@neovault.com',
                'phone': '+1 (555) 987-6543',
                'join_date': date(2018, 3, 22)
            },
            {
                'name': 'Sara Hossain',
                'position': 'Head of Customer Service',
                'bio': 'Dedicated to providing exceptional customer experiences.',
                'email': 'sara.hossain@neovault.com',
                'phone': '+1 (555) 456-7890',
                'join_date': date(2019, 7, 10)
            }
        ]

        for emp_data in employees_data:
            Employee.objects.get_or_create(
                name=emp_data['name'],
                defaults=emp_data
            )

        # Create bank goals
        goals_data = [
            {
                'title': 'Security First',
                'description': 'Implementing the highest security standards to protect customer data.',
                'target_date': date(2024, 12, 31),
                'progress': 90
            },
            {
                'title': 'Digital Transformation',
                'description': 'Enhancing our digital platforms for seamless banking experiences.',
                'target_date': date(2024, 10, 31),
                'progress': 85
            },
            {
                'title': 'Customer Centricity',
                'description': 'Putting customers at the center of everything we do.',
                'target_date': date(2024, 11, 30),
                'progress': 88
            }
        ]

        for goal_data in goals_data:
            BankGoal.objects.get_or_create(
                title=goal_data['title'],
                defaults=goal_data
            )

        # Create notices
        notices_data = [
            {
                'title': 'System Maintenance',
                'content': 'Our online banking system will undergo maintenance this weekend.',
                'priority': 'medium'
            },
            {
                'title': 'New Mobile App Features',
                'content': 'Check out the latest features in our mobile banking app.',
                'priority': 'low'
            },
            {
                'title': 'Fraud Alert',
                'content': 'Be aware of phishing attempts. We never ask for passwords via email.',
                'priority': 'high'
            }
        ]

        for notice_data in notices_data:
            Notice.objects.get_or_create(
                title=notice_data['title'],
                defaults=notice_data
            )

        self.stdout.write(
            self.style.SUCCESS('Successfully setup initial bank data')
        )