import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'behind_the_search.settings')  # تأكد أن الاسم صحيح
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

username = os.getenv("DJANGO_SUPERUSER_USERNAME", "marwangamal")
email = os.getenv("DJANGO_SUPERUSER_EMAIL", "marwanahmed1206@gmail.com")
password = os.getenv("DJANGO_SUPERUSER_PASSWORD", "mg120604")

if not User.objects.filter(username=username).exists():
    User.objects.create_superuser(username=username, email=email, password=password)
    print(f":white_check_mark: Superuser '{username}' created.")
else:
    print(f":information_source: Superuser '{username}' already exists.")