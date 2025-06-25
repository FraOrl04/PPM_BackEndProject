from django.contrib import admin
from .models import Post, Comment, Like  # importa i modelli

admin.site.register(Post)
admin.site.register(Comment)
admin.site.register(Like)