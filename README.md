<p align="center">
  <a href="https://front2back.dev">
   <img src="https://i.postimg.cc/1XvRJc27/front2back.png" alt="Front2back Logo" style="border-radius: 12px;" width="200" height="200">
  </a>
</p>

<h1 align="center">Behind The Search: Search Engine Rating Course</h1>

<p align="center">
  <a href="https://www.python.org">
    <img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python">
  </a>
  <a href="https://www.djangoproject.com">
    <img src="https://img.shields.io/badge/Django-092E20?style=for-the-badge&logo=django&logoColor=white" alt="Django">
  </a>
  <a href="https://www.sqlite.org">
    <img src="https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white" alt="SQLite">
  </a>
  <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript">
    <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript">
  </a>
  <a href="https://www.w3.org/Style/CSS">
    <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white" alt="CSS3">
  </a>
  <a href="https://html.spec.whatwg.org">
    <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white" alt="HTML5">
  </a>
  <a href="https://discord.com/developers/docs/intro">
    <img src="https://img.shields.io/badge/Discord-5865F2?style=for-the-badge&logo=discord&logoColor=white" alt="Discord">
  </a>
  <a href="https://fontawesome.com">
    <img src="https://img.shields.io/badge/Font_Awesome-339AF0?style=for-the-badge&logo=fontawesome&logoColor=white" alt="Font Awesome">
  </a>
  <a href="https://quilljs.com">
    <img src="https://img.shields.io/badge/Quill.js-52B0E7?style=for-the-badge&logo=quill&logoColor=white" alt="Quill.js">
  </a>
  <a href="https://michalsnik.github.io/aos/">
    <img src="https://img.shields.io/badge/AOS-FF69B4?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0id2hpdGUiIGQ9Ik0xMiAyTDEgMjFoMjJMMTIgMnptMCAxNi4zTDUuNyAyMGgxMi42TDEyIDE4LjN6Ii8+PC9zdmc+" alt="AOS">
  </a>
  <a href="https://spline.design">
    <img src="https://img.shields.io/badge/Spline-FF6B6B?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0id2hpdGUiIGQ9Ik0xMiAyTDIgN3YxMGwyMCAxMFYyeiIvPjwvc3ZnPg==" alt="Spline">
  </a>
  <a href="https://github.com/AlexKvazos/VanillaToasts">
    <img src="https://img.shields.io/badge/VanillaToasts-FFA500?style=for-the-badge&logo=javascript&logoColor=white" alt="VanillaToasts">
  </a>
</p>

<p align="center">A modern, responsive web platform for delivering a comprehensive Search Engine Rating course. This Django-based application provides secure access to video lessons, resources, and learning materials for individuals interested in search quality evaluation.</p>

## 🌟 Features

- **Secure Authentication System**: User registration, login, and password recovery
- **Course Content Management**: 
  - Structured video lessons with sections
  - Lesson number validation and duplicate prevention
  - Rich text description editor using Quill.js
  - Video preview functionality
- **Progress Tracking**: Users can track their learning journey and completion status
- **Admin Dashboard**: Manage user access, monitor platform usage, and view analytics
- **Mobile-Responsive Design**: Optimized learning experience across all devices
- **Manual Access Control**: Admin grants course access after confirming payment
- **Advanced Video Security**:
  - Integration with Bunny.net for secure video delivery
  - Dynamic watermarking with user identification
  - Copy protection and download prevention
  - Encrypted video streaming
  - Session-based access controls

## 🔒 Content Protection

This platform implements multiple layers of security to protect course content:

- **Dynamic Watermarking**: Each video is overlaid with the viewer's personal information
- **Anti-Download Measures**: 
  - Disabled right-click functionality
  - Custom video player with no download option
  - Modern MutationObserver-based DOM protection
- **Encryption**: Video content is encrypted during storage and streaming
- **Session Management**: Time-limited viewing sessions with re-authentication requirements
- **Screen Recording Prevention**: Visual safeguards against unauthorized screen recording
- **Access Monitoring**: IP and device tracking to prevent account sharing

## 📊 Logging & Monitoring

The platform includes comprehensive logging and monitoring through Discord integration:

- **Activity Tracking**:
  - User registrations and logins
  - Video watching progress
  - Page visit duration
  - Security events
- **User Analytics**:
  - Detailed user information
  - IP address tracking
  - Geolocation data
  - Browser information
- **Security Monitoring**:
  - Real-time security event notifications
  - Suspicious activity alerts
  - Access attempt logging
  - System status updates

## 🛠️ Tech Stack

- **Backend**: 
  - Django (Python)
  - Custom middleware for tracking
  - Discord webhook integration
  - Automated logging system
- **Frontend**: 
  - HTML5, CSS3, JavaScript (ES6+)
  - AOS (Animate On Scroll) for scroll animations
  - Spline for 3D graphics and animations
  - VanillaToasts for notification system
  - Quill.js for rich text editing
  - Custom CSS with modern animations
- **UI Components**:
  - Font Awesome for iconography
  - Custom toast notifications
  - Responsive navigation system
  - Mobile-optimized interfaces
- **Security**:
  - Django's built-in security features
  - Custom middleware for session management
  - IP and device tracking
  - Access control system
- **Video Delivery**: 
  - Bunny.net integration
  - Custom video player theming
- **Database**: SQLite
- **Monitoring**:
  - Discord webhook logging
  - User activity tracking
  - Performance monitoring
  - Security event logging

## 📂 Project Structure

```
behind-the-search/
├── adminBoard/              # Admin dashboard functionality
├── behind_the_search/      # Core Django project settings
├── content/               # Course content management
│   ├── models.py         # Content data models
│   ├── views.py          # Content view logic
│   └── templates/        # Content templates
├── notifications/        # Notification system
├── static/              # Static assets
│   ├── css/            # Stylesheets
│   ├── js/             # JavaScript files
│   └── imgs/           # Image assets
├── templates/          # Base templates
├── users/              # User management
│   ├── utils/          # Utility functions
│   │   └── discord_logger.py  # Discord logging system
│   ├── middleware.py   # Custom middleware
│   └── models.py       # User models
├── media/             # User-uploaded content
└── manage.py          # Django management script
```

## 👥 Admin Features

- View registered users and their activity
- Grant/revoke course access
- Ban/unban users
- View platform insights and analytics
- Monitor security logs through Discord
- Manage session and device access

## 👤 User Features

- Register and request access to the course
- Access secure video lessons with content protection
- Track course progress
- View on authorized devices only

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
