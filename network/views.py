import json

from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.urls import reverse
from django.core.paginator import Paginator
from .models import User, Post, Like, Link
from django.views.decorators.csrf import csrf_exempt


@csrf_exempt
def index(request):
    
    if request.method == "POST":
        data = json.loads(request.body)
        
        post_id = data.get('post_id')
        if post_id:
            # like button clicked
            post_id = int(post_id)
            usr = User.objects.get(username=request.user)
            post = Post.objects.get(id=post_id)
            new_like = Like(post_id=post, liker_id=usr)
            new_like.save()
            like = Like.objects.filter(post_id=post).count()
            print(like)
            return JsonResponse({"like": like} , status=200)
        else:
            # following    
            usr = User.objects.get(username=request.user)
            users = Link.objects.filter(user_id=usr).values('follows')
            entries = Post.objects.filter(poster__in=users)
            posts = { str(i): entry.serialize() for i, entry in enumerate(entries)}
            return JsonResponse(posts, status=200)
    else: 
        # all posts
        posts = Post.objects.all()
        likes = [Like.objects.filter(post_id=post.id).count() for post in posts]
        return render(request, "network/index.html", {
            "posts": zip(posts, likes)
        }, status=200)

@csrf_exempt
def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")


def profile(request, username):
    usr = User.objects.get(username=username)
    posts = Post.objects.filter(poster=usr)
    likes = [Like.objects.filter(post_id=post.id).count() for post in posts]
    follow = Link.objects.filter(user_id=request.user, follows=usr)
    followers = Link.objects.filter(follows=usr).count()
    follows = Link.objects.filter(user_id=usr).count()
    return render(request, "network/profile.html", {
        "posts": zip(posts, likes), 
        "follow": follow, 
        "usr": usr, 
        "followers": followers, 
        "follows": follows
    }, status=200)

@csrf_exempt
def api(request, action):
    if request.method == "POST":
        data = json.loads(request.body)
        print(data)
        if action in ("follow", "unfollow"):
            user_id = data["user_id"]
            follows_id = data["follows_id"]
            unfollow = True if action == "unfollow" else False
            status = follow(user_id, follows_id, unfollow)
            return JsonResponse({}, status=status)


def follow(user_id, follows_id, unfollow=False):
    user = User.objects.get(id=user_id)
    follows = User.objects.get(id=follows_id)

    if unfollow:
        Link.objects.filter(user_id=user, follows=follows).delete()
        status = 200
    else:
        new_link = Link(user_id=user, follows=follows)
        new_link.save()
        status = 200
    return status

