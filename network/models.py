from importlib.resources import contents
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

    followers = models.ManyToManyField(
        'User',  
        related_name='follows',
        blank=True
    )
    follow = models.ManyToManyField(
        'User', 
        related_name='followed',
        blank=True
    )

class Post(models.Model):
    poster = models.ForeignKey(
        'User', 
        on_delete=models.PROTECT, 
        related_name='posts'
    )
    content = models.TextField(max_length=1024)
    Timestamp = models.DateTimeField(auto_now_add=True)

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