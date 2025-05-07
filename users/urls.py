from django.urls import path, include
from . import views

urlpatterns = [
    path('register/', views.registerUser, name='register'),
    path('login/', views.loginUser, name='login'),
    path('logout/', views.logoutUser, name='logout'),
    path('waiting-page/', views.waitingPage, name='waiting-page'),
    path('api/log-security-event/', views.log_security_event_view,
         name='log-security-event'),
]
