from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):

    bio = models.TextField(blank=True)
    following = models.ManyToManyField('self', symmetrical=False, related_name='followers')
    is_staff = models.BooleanField(default=False)
