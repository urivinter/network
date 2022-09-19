import json
from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.urls import reverse
from django.core.paginator import Paginator
from .models import User, Post, Like, Link


def index(request):
    posts = []
    if request.method == "POST":
        # following
        usr = User.objects.get(username=request.user)
        print(usr)
        users = Link.objects.filter(user_id=usr).values('follows')
        print(users)
        posts = Post.objects.filter(poster__in=users)
    else:
        # all posts
        posts = Post.objects.all()

    likes = [Like.objects.filter(post_id=post.id).count() for post in posts]
    return render(request, "network/index.html", {
        "posts": zip(posts, likes)
    }, status=200)


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
    # posts = User.get(username=data.usr).posts
    # likes = {post.post_id: Like.objects.filter(post_id=post).count() for post in posts}
    # return JsonResponse({"posts": posts,  "likes": likes}, status=200)
    return render(request, "network/profile.html")