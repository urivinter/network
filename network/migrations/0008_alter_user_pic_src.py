# Generated by Django 4.1 on 2022-09-19 07:51

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('network', '0007_user_pic_src'),
    ]

    operations = [
        migrations.AlterField(
            model_name='user',
            name='pic_src',
            field=models.CharField(blank=True, max_length=255),
        ),
    ]
