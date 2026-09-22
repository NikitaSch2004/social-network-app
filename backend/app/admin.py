from django.contrib import admin
from .models import Follow, Like, Post, Token

admin.site.register(Post)
admin.site.register(Follow)
admin.site.register(Like)
admin.site.register(Token)
