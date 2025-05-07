from django.db import models
from django.contrib.auth.models import AbstractUser
from phonenumber_field.modelfields import PhoneNumberField


class CustomUser(AbstractUser):
    phone_number = PhoneNumberField(max_length=15, null=False, blank=False)
    email = models.EmailField(
        max_length=254, unique=True, null=False, blank=False)
    access = models.BooleanField(default=False)
    full_name = models.CharField(
        max_length=255, null=False, blank=False, default='')

    def save(self, *args, **kwargs):
        if self.is_superuser:
            self.access = True
        super().save(*args, **kwargs)


# {Ninja front Pass data}
class UserActivity(models.Model):
    ACTIVITY_TYPES = [
        ('login', 'User Login'),
        ('video_watch', 'Watched Video'),
        ('access_granted', 'Access Granted'),
        ('access_revoked', 'Access Revoked'),
    ]

    user = models.ForeignKey(
        CustomUser, on_delete=models.CASCADE, related_name='activities')
    activity_type = models.CharField(max_length=20, choices=ACTIVITY_TYPES)
    description = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    related_video = models.ForeignKey(
        'content.CourseVideo', on_delete=models.SET_NULL, null=True, blank=True)

    class Meta:
        ordering = ['-timestamp']
        verbose_name_plural = 'User Activities'

    def __str__(self):
        return f"{self.user.username} - {self.activity_type} - {self.timestamp}"
