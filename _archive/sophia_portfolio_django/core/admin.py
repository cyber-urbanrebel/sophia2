from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Habit

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (
        ('Profile extras', {'fields': ('bio', 'timezone')}),
    )

admin.site.register(Habit)
