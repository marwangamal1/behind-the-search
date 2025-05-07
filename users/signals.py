# {Ninja front Pass data}
from django.contrib.auth.signals import user_logged_in
from django.db.models.signals import post_save
from django.dispatch import receiver
from content.models import CourseVideo
from .models import UserActivity
from django.conf import settings


@receiver(user_logged_in)
def log_user_login(sender, request, user, **kwargs):
    """Log when a user logs in"""
    UserActivity.objects.create(
        user=user,
        activity_type='login',
        description=f'User logged in'
    )


@receiver(post_save, sender=CourseVideo)
def log_video_watch(sender, instance, created, **kwargs):
    """Log when a user completes watching a video"""
    if not created and instance.mark_as_watched:
        UserActivity.objects.create(
            user=instance.user,
            activity_type='video_watch',
            description=f'Completed watching video: {instance.title}',
            related_video=instance
        )
