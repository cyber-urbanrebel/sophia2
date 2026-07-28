from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    bio = models.TextField('Bio', blank=True)
    timezone = models.CharField('Timezone', max_length=64, blank=True, default='UTC')

    def __str__(self):
        return self.username

class Habit(models.Model):
    user = models.ForeignKey('core.User', related_name='habits', on_delete=models.CASCADE)
    name = models.CharField(max_length=120)
    frequency = models.CharField(max_length=20, choices=[('daily','Daily'),('weekly','Weekly'),('monthly','Monthly')], default='daily')
    completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.name} ({self.user.username})'
