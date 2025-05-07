from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import user_passes_test
from .models import Notification
from django.core.mail import send_mail
from django.conf import settings
from adminBoard.decorators import superuser_required
from django.db.models import Q
from django.shortcuts import render
from .models import Notification

@superuser_required
def notification_list(request):
    search_query = request.GET.get('search', '')
    notifications = Notification.objects.all().order_by('-created_at')

    if search_query:
        notifications = notifications.filter(from_user__username__icontains=search_query).order_by('-created_at')

    return render(request, 'notifications/list.html', {
        'notifications': notifications,
        'search_query': search_query
    })


@superuser_required
def accept_request(request, notification_id):
    notification = get_object_or_404(Notification, id=notification_id, to_user=request.user)
    
    notification.status = 'accepted'
    notification.message = f"{notification.from_user.username} has been accepted."
    notification.save()
    
    user = notification.from_user
    user.access = True
    user.save()


    send_mail(
        'Access Granted',
        f'Hello {user.username},\n\nYour access request has been approved. You now have full access.',
        settings.EMAIL_HOST_USER,
        [user.email],
        fail_silently=False,
    )
    
    # Redirect to the notification list
    return redirect('notification_list')

@superuser_required
def reject_request(request, notification_id):
    notification = get_object_or_404(Notification, id=notification_id, to_user=request.user)
    
    notification.status = 'rejected'
    notification.message = f"{notification.from_user.username} has been rejected."
    notification.save()
    user = notification.from_user
    send_mail(
        'Access Denied',
        f'Hello {user.username},\n\nYour access request has been rejected.',
        settings.EMAIL_HOST_USER,
        [user.email],
        fail_silently=False,
    )
    
    

    return redirect('notification_list')