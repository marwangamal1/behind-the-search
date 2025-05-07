from django.shortcuts import render, get_object_or_404, redirect
from .models import CourseVideo, VideoSection,UserVideoProgress
from .forms import CourseVideoForm, VideoSectionForm
from adminBoard.decorators import superuser_required, access_required
from django.contrib.auth.decorators import login_required
from django.http import Http404
# {Ai -Ninja} This view is used to stream the video content
from django.http import FileResponse, JsonResponse
from django.views.decorators.http import require_POST
import json
from django.db import transaction
from django.views.decorators.csrf import csrf_exempt
from users.models import UserActivity  # Add this import
from users.utils.discord_logger import log_video_watch


@access_required
def sections_list(request):
    # Fetch all VideoSection objects from the database
    sections = VideoSection.objects.all()
    videos_count = CourseVideo.objects.all().count()

    context = {
        'sections': sections,
        'videos_count': videos_count,
    }

    return render(request, 'content/sections_list.html', context)


@superuser_required
def delete_section(request, section_id):
    section = get_object_or_404(VideoSection, id=section_id)
    section.delete()
    return redirect('sections_list')\



@superuser_required
def edit_section(request, section_id):
    section = get_object_or_404(VideoSection, id=section_id)

    if request.method == 'POST':
        form = VideoSectionForm(request.POST, instance=section)
        if form.is_valid():
            form.save()
            return redirect('section_detail', section_id=section.id)
    else:
        form = VideoSectionForm(instance=section)

    return render(request, 'content/edit_section.html', {'form': form, 'section': section})


@access_required
def section_detail(request, section_id):
    section = get_object_or_404(VideoSection, id=section_id)
    videos = CourseVideo.objects.filter(
        section=section).order_by('lesson_number')
    description = section.description

    context = {
        'description': description,
        'section': section,
        'videos': videos,
    }

    return render(request, 'content/section_detail.html', context)


@superuser_required
def create_section(request):
    if request.method == 'POST':
        form = VideoSectionForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('sections_list')
    else:
        form = VideoSectionForm()

    return render(request, 'content/create_section.html', {'form': form})


@access_required
def video_detail(request, video_id):
    video = get_object_or_404(CourseVideo, id=video_id)
    section = video.section
    is_watched = UserVideoProgress.objects.filter(
        user=request.user, video=video, mark_as_watched=True).exists()
    # Get next and previous videos
    next_video = CourseVideo.objects.filter(
        section=section,
        lesson_number__gt=video.lesson_number
    ).order_by('lesson_number').first()

    prev_video = CourseVideo.objects.filter(
        section=section,
        lesson_number__lt=video.lesson_number
    ).order_by('-lesson_number').first()

    # Log video watch when accessed
    log_video_watch(request, request.user, video)

    context = {
        'video': video,
        'next_video': next_video,
        'prev_video': prev_video,
        'section': section,
        'video_is_watched_by_user': is_watched
    }
    return render(request, 'content/video_detail.html', context)


@superuser_required
def create_course_video(request):
    if request.method == 'POST':
        form = CourseVideoForm(request.POST, request.FILES)
        if form.is_valid():
            form.save()
            return redirect('section_detail', section_id=form.cleaned_data['section'].id)
    else:
        form = CourseVideoForm()

    return render(request, 'content/create_course_video.html', {'form': form})

# def video_description(request, video_id):
    # video = get_object_or_404(CourseVideo, id=video_id)

    # return render(request, 'content/video_description.html', {'video': video})


@superuser_required
def edit_course_video(request, video_id):
    video = get_object_or_404(CourseVideo, id=video_id)

    if request.method == 'POST':
        form = CourseVideoForm(request.POST, request.FILES, instance=video)
        if form.is_valid():
            form.save()
            section_id = form.cleaned_data['section'].id
            return redirect('section_detail', section_id)
    else:
        form = CourseVideoForm(instance=video)

    return render(request, 'content/edit_course_video.html', {'form': form, 'video': video, 'section_id': video.section.id})


@superuser_required
def delete_course_video(request, video_id):
    video = get_object_or_404(CourseVideo, id=video_id)
    video.delete()
    return redirect('section_detail', section_id=video.section.id)


@access_required
@require_POST
def mark_video_watched(request, video_id):
    if request.method != 'POST':
        return JsonResponse({'success': False, 'error': 'Invalid request method'}, status=405)

    video = get_object_or_404(CourseVideo, id=video_id)

    try:
        data = json.loads(request.body)
        watched = data.get('watched', False)

        with transaction.atomic():
            progress, created = UserVideoProgress.objects.get_or_create(
                user=request.user,
                video=video,
                defaults={'mark_as_watched': watched}
            )

            if not created:
                progress.mark_as_watched = watched
                progress.save()

            if watched:
                # Log activity only on watch
                UserActivity.objects.create(
                    user=request.user,
                    activity_type='video_watch',
                    description=f'Completed watching video: {video.title}'
                )

        return JsonResponse({'success': True, 'watched': watched})

    except json.JSONDecodeError:
        return JsonResponse({'success': False, 'error': 'Invalid JSON data'}, status=400)
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)

# API endpoint to check if a lesson number already exists {Ninja- Ai}
def check_lesson_number(request):
    """
    Checks if a lesson number already exists within a specific section.
    Returns JSON response with 'exists' property.
    """
    number = request.GET.get('number')
    section_id = request.GET.get('section_id')
    video_id = request.GET.get('current_id')

    if not number:
        return JsonResponse({'error': 'Lesson number is required'}, status=400)

    if not section_id:
        return JsonResponse({'error': 'Section ID is required'}, status=400)

    try:
        number = int(number)
        section_id = int(section_id)

        # Filter by both section_id and lesson_number
        query = CourseVideo.objects.filter(
            lesson_number=number, section_id=section_id)

        # If editing an existing video, exclude the current video from the check
        if video_id:
            try:
                video_id = int(video_id)
                query = query.exclude(id=video_id)
            except ValueError:
                pass

        exists = query.exists()
        return JsonResponse({'exists': exists})
    except ValueError:
        return JsonResponse({'error': 'Invalid lesson number or section ID'}, status=400)
