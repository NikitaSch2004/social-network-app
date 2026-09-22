from django.urls import path
from .views import (
    all_posts,
    create_post,
    current_user,
    follow_user,
    following_posts,
    login,
    my_posts,
    post_detail,
    reply_to_post,
    register,
    toggle_like,
    user_profile,
)

urlpatterns = [
    path('auth/register/', register, name='register'),
    path('auth/login/', login, name='login'),
    path('auth/me/', current_user, name='current_user'),
    path('posts/', all_posts, name='all_posts'),
    path('posts/create/', create_post, name='create_post'),
    path('posts/my/', my_posts, name='my_posts'),
    path('posts/following/', following_posts, name='following_posts'),
    path('posts/<int:post_id>/', post_detail, name='post_detail'),
    path('posts/<int:post_id>/like/', toggle_like, name='toggle_like'),
    path('posts/<int:post_id>/reply/', reply_to_post, name='reply_to_post'),
    path('users/<str:username>/', user_profile, name='user_profile'),
    path('follow/<str:username>/', follow_user, name='follow_user'),
]
