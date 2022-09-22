import http
import json

from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.urls import reverse
from django.core.paginator import Paginator
from .models import User, Post, Like, Link
from django.views.decorators.csrf import csrf_exempt


def index(request):

    if request.method == "GET":
        page = request.GET.get("page")
        if page:
            return send_posts(request.user, page)
        
        return render(request, "network/index.html", status=200)

def follow(request):
    if request.method != "GET":
        return HttpResponse("GET method only")
        
    page = request.GET.get("page")
    if page:
        return send_posts(request.user, page, None, True)
    
    return render(request, "network/follow.html", status=200)

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
    if request.method != "GET":
        return HttpResponse("GET method only")
    
    page = request.GET.get("page")
    if page:
        return send_posts(request.user, page, username)
    
    usr = User.objects.get(username=username)
    follow = Link.objects.filter(user_id=request.user, follows=usr)
    followers = Link.objects.filter(follows=usr).count()
    follows = Link.objects.filter(user_id=usr).count()
    return render(request, "network/profile.html", {
        "follow": follow, 
        "usr": usr, 
        "followers": followers, 
        "follows": follows
    }, status=200)




@csrf_exempt
def api(request, action):
    if request.method != "POST":
        return HttpResponse("This API supports POST method only")

    data = json.loads(request.body)

    if action in ("follow", "unfollow"):
        user_id = data["user_id"]
        follows_id = data["follows_id"]
        unfollow = True if action == "unfollow" else False
        status = new_follow(user_id, follows_id, unfollow)
        return JsonResponse({}, status=status)

    elif action == "like":
        post_id = Post.objects.get(id=int(data["post_id"]))
        liker_id = User.objects.get(username=request.user)
        new_like = Like(post_id=post_id, liker_id=liker_id)
        new_like.save()
        like = Like.objects.filter(post_id=post_id).count()
        return JsonResponse({"like": like} , status=200)
    
    elif action == "post":
        poster = User.objects.get(username=request.user)
        post_id = data.get("post_id")
        if post_id:
            post = Post.objects.get(pk=post_id)
            post.content = data.get("content")
            post.save()
        else:
            new_post = Post(poster=poster, content=data["content"])
            new_post.save()
        return JsonResponse({} , status=200)


def new_follow(user_id, follows_id, unfollow=False):
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

def send_posts(username, page=1, profile=None, follow=False):
    if profile:
        user = User.objects.get(username=profile)
        paginator = Paginator(Post.objects.filter(poster=user).order_by('-timestamp'), 10)
    elif follow:
        user = User.objects.get(username=username)
        users = Link.objects.filter(user_id=user).values('follows')
        paginator = Paginator(Post.objects.filter(poster__in=users).order_by('-timestamp'), 10)
    else:    
        paginator = Paginator(Post.objects.all().order_by('-timestamp'), 10)

    page = paginator.page(page)
    posts = {i: post.serialize(username) for i, post in enumerate(page.object_list)}
    previous_page = page.has_previous() and page.previous_page_number()
    next_page = page.has_next() and page.next_page_number()
    return JsonResponse({"posts": posts, "previous": previous_page, "next": next_page}, status=200)