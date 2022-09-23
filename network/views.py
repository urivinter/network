import http
import json
from django.contrib.auth.decorators import login_required
from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.urls import reverse
from django.core.paginator import Paginator
from .models import User, Post, Like, Link
from django.views.decorators.csrf import csrf_exempt


def index(request):
    """ Render index view / return index posts """

    if request.method != "GET":
        return HttpResponse("GET method only")
    
    if (page := request.GET.get("page")):    
        return send_posts(request.user, page)
    
    return render(request, "network/index.html", status=200)


@login_required
def follow(request):
    """ Render follow view / return follow posts """

    if request.method != "GET":
        return HttpResponse("GET method only")
    
    if (page := request.GET.get("page")):
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
    """ Render username profile page / return posts by username """

    if request.method != "GET":
        return HttpResponse("GET method only")

    profile_user = User.objects.get(username=username)

    # If page number is specified in request, return posts
    if (page := request.GET.get("page")): 
        return send_posts(request.user, page, profile_user)

    follow_status = None  # in case of anonymouse user
    if request.user.is_authenticated:
        follow_status = Link.objects.filter(user_id=request.user, follows=profile_user)

    # Count followers and follows
    followers = Link.objects.filter(follows=profile_user).count()
    follows = Link.objects.filter(user_id=profile_user).count()

    return render(request, "network/profile.html", {
        "follow": follow_status, 
        "usr": profile_user, 
        "followers": followers, 
        "follows": follows
    }, status=200)


@csrf_exempt
def api(request, action):
    """ Api for follow/unfollow, like, new post and edit post """

    if request.method != "POST":
        return HttpResponse("This API supports POST method only")

    data = json.loads(request.body)

    if action in ("follow", "unfollow"):

        follows_name = data["follows_name"]
        unfollow = True if action == "unfollow" else False
        status = new_follow(request.user, follows_name, unfollow)
        return JsonResponse({}, status=status)

    elif action == "like":

        post_id = Post.objects.get(id=int(data["post_id"]))
        liker_id = User.objects.get(username=request.user)
        new_like = Like(post_id=post_id, liker_id=liker_id)
        new_like.save()
        like_count = Like.objects.filter(post_id=post_id).count() 
        return JsonResponse({"likeCount": like_count} , status=200)
    
    elif action == "post":

        poster = User.objects.get(username=request.user)
        post_id = data.get("post_id")

        if post_id:
            # Edited post
            post = Post.objects.get(pk=post_id)
            post.content = data.get("content")
            post.save()

        else:
            # New post
            new_post = Post(poster=poster, content=data["content"])
            new_post.save()

        return JsonResponse({} , status=200)


def new_follow(user, follows_name, unfollow=False):
    """ Update database for follow/unfollow by user """

    follows = User.objects.get(username=follows_name)

    if unfollow:
        Link.objects.filter(user_id=user, follows=follows).delete()
        status = 200

    else:
        new_link = Link(user_id=user, follows=follows)
        new_link.save()
        status = 200

    return status


def send_posts(username, page=1, profile=None, follow=False):
    """ Return requested posts """

    if profile:
        # Posts by user profile
        paginator = Paginator(Post.objects.filter(poster=profile).order_by('-timestamp'), 10)
    
    elif follow:
        # Posts by users how are followed by user
        user = User.objects.get(username=username)
        users = Link.objects.filter(user_id=user).values('follows')
        paginator = Paginator(Post.objects.filter(poster__in=users).order_by('-timestamp'), 10)

    else:  
        # All posts  
        paginator = Paginator(Post.objects.all().order_by('-timestamp'), 10)

    # requested page
    page = paginator.page(page)

    # Arrange data
    posts = {i: post.serialize(username) for i, post in enumerate(page.object_list)}

    # Add pagination information
    previous_page = page.has_previous() and page.previous_page_number()
    next_page = page.has_next() and page.next_page_number()

    return JsonResponse({"posts": posts, "previous": previous_page, "next": next_page}, status=200)