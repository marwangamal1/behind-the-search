from django import forms
from .models import CourseVideo, VideoSection


class CourseVideoForm(forms.ModelForm):
    class Meta:
        model = CourseVideo
        fields = ['title', 'lesson_number', 'section', 'bunny_video_id']


class VideoSectionForm(forms.ModelForm):
    class Meta:
        model = VideoSection
        fields = ['title', 'description']
