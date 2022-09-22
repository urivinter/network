from importlib.resources import contents
from operator import mod
# from msilib import CAB
from re import T
from sqlite3 import Timestamp
from statistics import mode
# from tkinter import CASCADE
from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):

    pic_src = models.CharField(
        max_length=255, 
        blank=True
    )

    def serialize(self):
        return {
            "id": self.id,
            "pic_src": self.pic_src,
            "username": self.username
        }



class Post(models.Model):
    poster = models.ForeignKey(
        'User', 
        on_delete=models.PROTECT, 
        related_name='posts'
    )
    content = models.TextField(max_length=1024)
    timestamp = models.DateTimeField(auto_now_add=True)

    def serialize(self, request_user=None):
        liked = None
        if request_user:
            liker = User.objects.get(username=request_user)
            liked = True if Like.objects.filter(post_id=self, liker_id=liker) else False

        return {
            "id": self.id,
            "username": self.poster.username,
            "pic_src": self.poster.pic_src, 
            "likes": Like.objects.filter(post_id=self.id).count(),
            "liked": liked,
            "content": self.content,
            "timestamp": self.timestamp.strftime("%b %d %Y, %I:%M %p")
        }


class Like(models.Model):
    post_id = models.ForeignKey(
        'Post', 
        on_delete=models.CASCADE, 
        related_name='liking_users'
    )
    liker_id = models.ForeignKey(
        'User', 
        on_delete=models.CASCADE, 
        related_name='posts_liked'
    )

class Link(models.Model):
    user_id = models.ForeignKey(
        'User', 
        on_delete=models.CASCADE, 
        related_name="followers"
    )

    follows = models.ForeignKey(
        'User', 
        on_delete=models.CASCADE, 
        related_name="followed"
    )