from django.urls import path
from . import views

urlpatterns = [
    path('', views.dashboard, name='admin-dashboard'),
    # {pass data to Ninja Front}
    path('api/stats/', views.dashboard_stats, name='dashboard-stats'),
    path('users', views.getUsers, name='users'),
    path('user/<int:pk>/', views.getUser, name='user'),
    path('users/ban/<int:user_id>/', views.ban_user, name='ban_user'),
    path('users/delete/<int:user_id>/', views.delete_user, name='delete_user'),
]
