# -*- coding: utf-8 -*-
# Generated by Django 1.10.5 on 2019-02-13 21:57
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='User',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('password', models.CharField(max_length=128, verbose_name='password')),
                ('last_login', models.DateTimeField(blank=True, null=True, verbose_name='last login')),
                ('email', models.EmailField(blank=True, max_length=255, null=True, unique=True)),
                ('username', models.CharField(max_length=15, unique=True)),
                ('first_name', models.CharField(max_length=255)),
                ('last_name', models.CharField(max_length=255)),
                ('reset_link', models.CharField(default=None, max_length=255)),
                ('reset_date', models.IntegerField(blank=True, default=None)),
                ('is_staff', models.BooleanField(default=True)),
                ('is_superuser', models.BooleanField(default=True)),
            ],
            options={
                'db_table': 'user',
            },
        ),
    ]
