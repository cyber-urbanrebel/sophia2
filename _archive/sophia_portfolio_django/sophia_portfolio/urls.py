from django.contrib import admin
from django.urls import path, include
from core import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', views.home, name='home'),
    path('accounts/', include('django.contrib.auth.urls')),
    # Register + profile
    path('accounts/register/', views.register, name='register'),
    path('accounts/profile/', views.profile, name='profile'),
    # Password reset series
    path('accounts/password_reset/', views.CustomPasswordResetView.as_view(), name='password_reset'),
    path('accounts/password_reset/done/', views.CustomPasswordResetDoneView.as_view(), name='password_reset_done'),
    path('accounts/reset/<uidb64>/<token>/', views.CustomPasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    path('accounts/reset/done/', views.CustomPasswordResetCompleteView.as_view(), name='password_reset_complete'),
]
