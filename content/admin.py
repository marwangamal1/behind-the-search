from django.contrib import admin
from .models import CourseVideo,VideoSection,UserVideoProgress

admin.site.register(CourseVideo)
admin.site.register(VideoSection)
admin.site.register(UserVideoProgress)