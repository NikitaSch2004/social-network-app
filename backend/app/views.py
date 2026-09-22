import json
from django.contrib.auth.models import User
from django.contrib.auth.hashers import check_password
from django.http import HttpResponse, JsonResponse
from django.shortcuts import get_object_or_404
from django.views.decorators.csrf import csrf_exempt
from .models import Follow, Like, Post, Token


def json_response(payload, status=200):
    return JsonResponse(payload, safe=False, status=status)


def parse_body(request):
    try:
        return json.loads(request.body.decode('utf-8')) if request.body else {}
    except json.JSONDecodeError:
        return {}


def authenticate_request(request):
    header = request.headers.get('Authorization', '')
    if header.startswith('Token '):
        token_key = header.split(' ', 1)[1].strip()
        try:
            token = Token.objects.get(key=token_key)
            return token.user
        except Token.DoesNotExist:
            return None
    return None


def create_token_for_user(user):
    token, _ = Token.objects.get_or_create(user=user)
    return token.key


def post_to_dict(post, current_user=None):
    replies = [post_to_dict(reply, current_user) for reply in post.replies.all().order_by('created_at')]
    return {
        'id': post.id,
        'author': post.author.username,
        'content': post.content,
        'created_at': post.created_at.isoformat(),
        'updated_at': post.updated_at.isoformat(),
        'reply_to': post.reply_to.id if post.reply_to else None,
        'reply_count': post.replies.count(),
        'likes': post.likes.count(),
        'liked_by_user': current_user is not None and post.likes.filter(user=current_user).exists(),
        'replies': replies,
    }


@csrf_exempt
def register(request):
    if request.method != 'POST':
        return json_response({'error': 'Method not allowed'}, status=405)
    data = parse_body(request)
    username = data.get('username', '').strip()
    password = data.get('password', '').strip()

    if not username or not password:
        return json_response({'error': 'username and password are required'}, status=400)

    if User.objects.filter(username=username).exists():
        return json_response({'error': 'Username already exists'}, status=400)

    user = User.objects.create_user(username=username, password=password)
    token = create_token_for_user(user)
    return json_response({'token': token, 'username': user.username})


@csrf_exempt
def login(request):
    if request.method != 'POST':
        return json_response({'error': 'Method not allowed'}, status=405)
    data = parse_body(request)
    username = data.get('username', '').strip()
    password = data.get('password', '').strip()

    if not username or not password:
        return json_response({'error': 'username and password are required'}, status=400)

    user = User.objects.filter(username=username).first()
    if user is None or not check_password(password, user.password):
        return json_response({'error': 'Invalid credentials'}, status=401)

    token = create_token_for_user(user)
    return json_response({'token': token, 'username': user.username})


def current_user_response(user):
    if user is None:
        return json_response({'user': None}, status=401)

    follower_count = Follow.objects.filter(following=user).count()
    following_count = Follow.objects.filter(follower=user).count()
    return json_response({
        'user': {
            'username': user.username,
            'followers': follower_count,
            'following': following_count,
        }
    })


def auth_required(request):
    user = authenticate_request(request)
    if user is None:
        return None, json_response({'error': 'Authentication required'}, status=401)
    return user, None


def current_user(request):
    if request.method != 'GET':
        return json_response({'error': 'Method not allowed'}, status=405)
    user = authenticate_request(request)
    if user is None:
        return json_response({'user': None}, status=200)
    return current_user_response(user)


def all_posts(request):
    if request.method != 'GET':
        return json_response({'error': 'Method not allowed'}, status=405)
    user = authenticate_request(request)
    posts = Post.objects.filter(reply_to__isnull=True).order_by('-created_at')
    return json_response([post_to_dict(post, user) for post in posts])


def user_profile(request, username):
    if request.method != 'GET':
        return json_response({'error': 'Method not allowed'}, status=405)
    profile_owner = get_object_or_404(User, username=username)
    current = authenticate_request(request)
    follower_count = Follow.objects.filter(following=profile_owner).count()
    following_count = Follow.objects.filter(follower=profile_owner).count()
    profile_posts = Post.objects.filter(author=profile_owner, reply_to__isnull=True).order_by('-created_at')
    return json_response({
        'username': profile_owner.username,
        'followers': follower_count,
        'following': following_count,
        'is_followed': current is not None and Follow.objects.filter(follower=current, following=profile_owner).exists(),
        'is_self': current is not None and current.username == profile_owner.username,
        'posts': [post_to_dict(post, current) for post in profile_posts],
    })


@csrf_exempt
def follow_user(request, username):
    if request.method != 'POST':
        return json_response({'error': 'Method not allowed'}, status=405)
    user, error_response = auth_required(request)
    if error_response:
        return error_response
    target = get_object_or_404(User, username=username)
    if target == user:
        return json_response({'error': 'Cannot follow yourself'}, status=400)
    relation = Follow.objects.filter(follower=user, following=target).first()
    if relation:
        relation.delete()
        status = 'unfollowed'
    else:
        Follow.objects.create(follower=user, following=target)
        status = 'followed'
    return json_response({'status': status})


@csrf_exempt
def create_post(request):
    if request.method != 'POST':
        return json_response({'error': 'Method not allowed'}, status=405)
    user, error_response = auth_required(request)
    if error_response:
        return error_response
    data = parse_body(request)
    content = data.get('content', '').strip()
    reply_to_id = data.get('reply_to')
    if not content:
        return json_response({'error': 'Post content cannot be empty'}, status=400)
    reply_to = None
    if reply_to_id:
        reply_to = get_object_or_404(Post, id=reply_to_id)
    post = Post.objects.create(author=user, content=content, reply_to=reply_to)
    return json_response(post_to_dict(post, user), status=201)


def my_posts(request):
    if request.method != 'GET':
        return json_response({'error': 'Method not allowed'}, status=405)
    user, error_response = auth_required(request)
    if error_response:
        return error_response
    posts = Post.objects.filter(author=user, reply_to__isnull=True).order_by('-created_at')
    return json_response([post_to_dict(post, user) for post in posts])


def following_posts(request):
    if request.method != 'GET':
        return json_response({'error': 'Method not allowed'}, status=405)
    user, error_response = auth_required(request)
    if error_response:
        return error_response
    following_users = Follow.objects.filter(follower=user).values_list('following', flat=True)
    posts = Post.objects.filter(author__in=following_users, reply_to__isnull=True).order_by('-created_at')
    return json_response([post_to_dict(post, user) for post in posts])


@csrf_exempt
def post_detail(request, post_id):
    post = get_object_or_404(Post, id=post_id)
    user = authenticate_request(request)
    if request.method == 'GET':
        return json_response(post_to_dict(post, user))

    if request.method == 'PUT':
        author, error_response = auth_required(request)
        if error_response:
            return error_response
        if post.author != author:
            return json_response({'error': 'Forbidden'}, status=403)
        data = parse_body(request)
        content = data.get('content', '').strip()
        if not content:
            return json_response({'error': 'Post content cannot be empty'}, status=400)
        post.content = content
        post.save()
        return json_response(post_to_dict(post, author))

    if request.method == 'DELETE':
        author, error_response = auth_required(request)
        if error_response:
            return error_response
        if post.author != author:
            return json_response({'error': 'Forbidden'}, status=403)
        post.delete()
        return json_response({'status': 'deleted'})

    return json_response({'error': 'Method not allowed'}, status=405)


@csrf_exempt
def toggle_like(request, post_id):
    if request.method != 'POST':
        return json_response({'error': 'Method not allowed'}, status=405)
    user, error_response = auth_required(request)
    if error_response:
        return error_response
    post = get_object_or_404(Post, id=post_id)
    like = Like.objects.filter(user=user, post=post).first()
    if like:
        like.delete()
        status = 'unliked'
    else:
        Like.objects.create(user=user, post=post)
        status = 'liked'
    return json_response({'status': status, 'likes': post.likes.count()})


@csrf_exempt
def reply_to_post(request, post_id):
    if request.method != 'POST':
        return json_response({'error': 'Method not allowed'}, status=405)
    user, error_response = auth_required(request)
    if error_response:
        return error_response
    original = get_object_or_404(Post, id=post_id)
    data = parse_body(request)
    content = data.get('content', '').strip()
    if not content:
        return json_response({'error': 'Reply content cannot be empty'}, status=400)
    reply = Post.objects.create(author=user, content=content, reply_to=original)
    return json_response(post_to_dict(reply, user), status=201)
