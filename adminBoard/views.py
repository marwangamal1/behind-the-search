from django.shortcuts import render, redirect, get_object_or_404
from django.contrib import messages
from django.http import JsonResponse
from django.views.decorators.http import require_POST
from django.db.models import Count
from .decorators import superuser_required
from users.models import CustomUser, UserActivity
from content.models import VideoSection, CourseVideo
from .utils import searchusers
from notifications.models import Notification

# {pass data to Ninja Front}

# {pass data to Ninja Front}


@superuser_required
def dashboard(request):
    total_users = CustomUser.objects.filter(is_superuser=False).count()
    active_users = CustomUser.objects.filter(
        access=True, is_superuser=False).count()
    waiting_users = CustomUser.objects.filter(
        access=False, is_superuser=False).count()
    total_videos = CourseVideo.objects.count()
    total_sections = VideoSection.objects.count()

    context = {
        'total_users': total_users,
        'active_users': active_users,
        'waiting_users': waiting_users,
        'total_videos': total_videos,
        'total_sections': total_sections,
    }
    return render(request, 'adminBoard/dashboard.html', context)

# {pass data to Ninja Front}


@superuser_required
def dashboard_stats(request):
    """API endpoint for dashboard statistics"""
    total_users = CustomUser.objects.filter(is_superuser=False).count()
    active_users = CustomUser.objects.filter(
        access=True, is_superuser=False).count()
    waiting_users = CustomUser.objects.filter(
        access=False, is_superuser=False).count()
    total_videos = CourseVideo.objects.count()
    total_sections = VideoSection.objects.count()

    return JsonResponse({
        'total_users': total_users,
        'active_users': active_users,
        'waiting_users': waiting_users,
        'total_videos': total_videos,
        'total_sections': total_sections,
    })


@superuser_required
def getUsers(request):
    users = CustomUser.objects.filter(access=True, is_superuser=False)
    context = {'users': users}
    return render(request, 'adminBoard/users.html', context)


@superuser_required
def getUser(request, pk):
    user = get_object_or_404(CustomUser, id=pk)
    total_videos = CourseVideo.objects.count()
    completed_videos_count = user.completed_videos.count()
    progress_percentage = (completed_videos_count /
                           total_videos * 100) if total_videos > 0 else 0

    # Get user activities
    user_activities = UserActivity.objects.filter(
        user=user).order_by('-timestamp')[:10]

    context = {
        'user': user,
        'total_videos': total_videos,
        'completed_videos_count': completed_videos_count,
        'progress_percentage': progress_percentage,
        'user_activities': user_activities
    }
    return render(request, 'adminBoard/single-user.html', context)


@superuser_required
@require_POST
def ban_user(request, user_id):
    user = get_object_or_404(CustomUser, id=user_id)

    # Toggle access
    user.access = not user.access
    user.save()


    if notification := Notification.objects.filter(from_user=user, status='pending').exists() and user.access==False:
        notification = Notification.objects.filter(from_user=user, status='pending').latest('created_at')
        notification.status = 'rejected'
        notification.message = f"{notification.from_user.username} has been rejected."
        notification.save()
    elif notification := Notification.objects.filter(from_user=user, status='pending').exists() and user.access==True:
        notification = Notification.objects.filter(from_user=user, status='pending').latest('created_at')
        notification.status = 'accepted'
        notification.message = f"{notification.from_user.username} has been accepted."
        notification.save()



    # Log the activity
    activity_type = 'access_granted' if user.access else 'access_revoked'
    description = f'Access was {"granted" if user.access else "revoked"} by admin'

    UserActivity.objects.create(
        user=user,
        activity_type=activity_type,
        description=description
    )

    return JsonResponse({
        'status': 'success',
        'message': f'User {user.username} access has been {"granted" if user.access else "revoked"}.'
    })


@superuser_required
@require_POST
def grant_access(request, user_id):
    user = get_object_or_404(CustomUser, id=user_id)
    user.access = True
    user.save()

    # Log the activity
    UserActivity.objects.create(
        user=user,
        activity_type='access_granted',
        description='Access was granted by admin'
    )

    messages.success(request, f'Access granted to {user.username}.')
    return JsonResponse({'status': 'success'})


@superuser_required
def delete_user(request, user_id):
    user = get_object_or_404(CustomUser, id=user_id)
    user.delete()
    messages.success(request, f'User {user.username} has been deleted.')
    return redirect('users')
