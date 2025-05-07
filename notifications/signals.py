from django.contrib.auth.signals import user_logged_in
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from .models import Notification

User = get_user_model()

@receiver(user_logged_in)
def notify_superusers_on_login(sender, request, user, **kwargs):
    if user.is_superuser or user.access:
        return

    existing_notification = Notification.objects.filter(
        from_user=user,
        status='pending'
    ).exists()

    if existing_notification:
        return  

    superusers = User.objects.filter(is_superuser=True)
    for superuser in superusers:
        Notification.objects.create(
            to_user=superuser,
            from_user=user,
            message=f"{user.username} has requested access.",
            status="pending"
        )
