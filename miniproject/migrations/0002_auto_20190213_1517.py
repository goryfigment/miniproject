# -*- coding: utf-8 -*-
# Generated by Django 1.10.5 on 2019-02-13 22:17
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('miniproject', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='user',
            name='reset_date',
            field=models.IntegerField(blank=True, default=None, null=True),
        ),
        migrations.AlterField(
            model_name='user',
            name='reset_link',
            field=models.CharField(default=None, max_length=255, null=True),
        ),
    ]
