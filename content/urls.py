from django.urls import path
from . import views

urlpatterns = [
    path('video/<int:video_id>/', views.video_detail, name='video_detail'),
    path('video/create/', views.create_course_video, name='create_course_video'),
    path('video/edit/<int:video_id>/',
         views.edit_course_video, name='edit_course_video'),
    path('video/delete/<int:video_id>/',
         views.delete_course_video, name='delete_course_video'),
    path('api/videos/<int:video_id>/mark-watched/',
         views.mark_video_watched, name='mark_video_watched'),
    path('sections/create/', views.create_section, name='create_section'),
    path('sections/', views.sections_list, name='sections_list'),
    path('section/<int:section_id>/', views.section_detail, name='section_detail'),
    path('section/<int:section_id>/edit/',
         views.edit_section, name='edit_section'),
    path('section/<int:section_id>/delete/',
         views.delete_section, name='delete_section'),
    path('api/check-lesson-number/', views.check_lesson_number,
         name='check_lesson_number'),
]
