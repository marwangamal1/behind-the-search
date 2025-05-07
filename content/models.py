from django.db import models


class VideoSection(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField(default='', blank=True)

    def __str__(self):
        return self.title


class CourseVideo(models.Model):
    section = models.ForeignKey(
        VideoSection, on_delete=models.CASCADE, related_name='videos')
    title = models.CharField(max_length=255)
    mark_as_watched = models.BooleanField(default=False)
    lesson_number = models.IntegerField(null=False)
    bunny_video_id = models.CharField(max_length=255, null=True, blank=True,
                                      help_text="The video ID from Bunny.net (e.g., 'eefdc431-726a-4ccc-b2f1-127b9aa449a5')")
    bunny_library_id = models.CharField(
        max_length=255, default="421350", editable=False)
    completed_by = models.ManyToManyField(
        'users.CustomUser', related_name='completed_videos', blank=True)

    def __str__(self):
        return f"{self.title} (Section: {self.section.title})"

    class Meta:
        unique_together = ('section', 'lesson_number')


class UserVideoProgress(models.Model):
    user = models.ForeignKey('users.CustomUser', on_delete=models.CASCADE)
    video = models.ForeignKey(CourseVideo, on_delete=models.CASCADE)
    mark_as_watched = models.BooleanField(default=False)
    watched_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)

    class Meta:
        unique_together = ('user', 'video')