# Product Requirements Document (PRD)

## Project Title: Search Engine Rating Course Platform

---

## 1. Objective

Build a clean, modern, and functional website that offers a **paid Search Engine Rating course**. The client will handle payments manually (outside the platform). The website must support user authentication, course access management, and provide an admin panel for controlling user access and viewing insights.

---

## 2. Target Users

- Users interested in learning Search Engine Rating methodologies and techniques
- Individuals looking to work in the search quality evaluation industry
- Admin (course author) who manages users and access permissions

---

## 3. Key Features (MVP)

### 1. Landing Page

- Brief introduction about the Search Engine Rating course
- Call to action (CTA) for registration or login
- Course highlights (search engine evaluation techniques, industry standards, job opportunities, etc.)
- Course outline and expected learning outcomes

### 2. Authentication

- User registration and login system
- Password reset functionality

### 3. Course Access Page (Private Area)

- Accessible only to users with granted access (approved manually by admin)
- Structured course content with secure video player (HTML5 video with DRM protection)
- Video security features:
  - Watermarking with user identification
  - Disabled right-click and download functionality
  - Encrypted video streams
  - Session-based viewing restrictions
- Navigation for course sections/lessons on Search Engine Rating techniques
- Downloadable resources (worksheets, rating guidelines, practice materials)

### 4. Manual Access Control

- No payment gateway
- Admin grants access manually after confirming payment via external means (e.g., bank transfer)

### 5. Admin Dashboard

Accessible only to authenticated admin user(s).

#### Admin Capabilities:

- View list of registered users
- Ban/unban users
- View platform insights:
  - Total registered users
  - Active users
  - Number of users with access
  - Basic activity log (last login, last lesson viewed, etc.)

---

## 4. Data Models (Django ORM)

```python
from django.contrib.auth.models import User

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    has_access = models.BooleanField(default=False)
    is_banned = models.BooleanField(default=False)
    progress = models.IntegerField(default=0)  # Track user progress as percentage

class Lesson(models.Model):
    title = models.CharField(max_length=255)
    video_url = models.URLField()
    encrypted_path = models.CharField(max_length=255, blank=True)  # Path to encrypted video
    watermark_enabled = models.BooleanField(default=True)
    order = models.PositiveIntegerField()
    is_published = models.BooleanField(default=True)
    description = models.TextField(blank=True)
    duration = models.PositiveIntegerField(default=0)  # Duration in seconds

class VideoSession(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE)
    session_id = models.CharField(max_length=255)
    ip_address = models.GenericIPAddressField()
    device_info = models.TextField()
    started_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_active = models.BooleanField(default=True)

class Resource(models.Model):
    title = models.CharField(max_length=255)
    file = models.FileField(upload_to='resources/')
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name='resources')

class ActivityLog(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    action = models.CharField(max_length=255)
    timestamp = models.DateTimeField(auto_now_add=True)

class LessonProgress(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE)
    completed = models.BooleanField(default=False)
    last_watched_position = models.PositiveIntegerField(default=0)  # Position in seconds
```

---

## 5. Tech Stack

- **Frontend**: HTML, CSS (modern, responsive), JavaScript (vanilla or minimal framework)
- **Backend**: Django (Python)
- **Database**: SQLite (for simplicity in the MVP stage)
- **Video Security**:
  - Encrypted HLS/DASH streaming
  - Dynamic watermarking service
  - Video content protection with custom player
- **Deployment**: Any free-tier hosting (e.g., Vercel for frontend, Render/Railway for Django backend)

---

## 6. Security Measures

- **Video Content Protection**:
  - Dynamic user-specific watermarking with identifiable information (email/user ID)
  - Disabled browser video controls for download/save
  - Encrypted video storage and streaming
  - Time-limited video session tokens
  - Device and IP restrictions for video playback
  - Anti-screen recording measures (visual artifacts for screen capture)
- **User Authentication Security**:
  - JWT-based authentication with short expiry
  - Rate limiting for login attempts
  - Session management and forced logout capabilities
  - Admin ability to revoke access immediately

---

## 7. Success Criteria

- Users can register, log in, and request access to the Search Engine Rating course
- Admin can manage users, access rights, and view basic metrics
- The course content is secure with multiple layers of protection against unauthorized copying
- Users can track their progress through the course
- Video content cannot be easily downloaded or screen-recorded without visible watermarks

---

## 8. Out of Scope (for MVP)

- Online payments
- Multi-course support
- Instructor/multi-admin system
- Mobile application
- Forum/community features
- Certification generation
