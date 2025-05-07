from django.urls import path
from . import views

urlpatterns = [
    path('', views.notification_list, name='notification_list'),
    path('accept/<int:notification_id>/', views.accept_request, name='accept_notification'),
    path('reject/<int:notification_id>/', views.reject_request, name='reject_notification'),
]
