from django.db import models
from django.contrib.auth.models import AbstractBaseUser
from django_mysql.models import JSONField
import time


def get_utc_epoch_time():
    return int(round(time.time()))


class User(AbstractBaseUser):
    email = models.EmailField(max_length=255, unique=True, blank=True, null=True)
    username = models.CharField(max_length=15, unique=True)
    first_name = models.CharField(max_length=255)
    last_name = models.CharField(max_length=255)
    reset_link = models.CharField(default=None, max_length=255,null=True)
    reset_date = models.IntegerField(default=None, blank=True, null=True)
    is_staff = models.BooleanField(default=True)
    is_superuser = models.BooleanField(default=True)
    # password = models.CharField(max_length=255)
    # last_login = models.DateTimeField(default=timezone.now, blank=True)

    USERNAME_FIELD = 'username'

    def __unicode__(self):
        return self.email

    def get_name(self):
        return self.first_name + ' ' + self.last_name

    def has_perm(self, perm, obj=None):
        return self.is_superuser

    def has_module_perms(self, app_label):
        return self.is_superuser

    class Meta:
        db_table = "user"


class Lesson(models.Model):
    creator = models.ForeignKey(User, default=None)
    date = models.IntegerField(default=get_utc_epoch_time, blank=True)
    name = models.CharField(max_length=100)
    file_url = models.CharField(max_length=100)
    tags = JSONField()
    program = models.CharField(choices=(('ELAA', 'ELAA'), ('GED', 'GED')), max_length=255, default='ELAA')
    subject = JSONField()
    level = JSONField()
    block = models.IntegerField()
    standard = models.IntegerField()
    lesson_work = models.CharField(max_length=1000, blank=True)
    add_or_take = models.CharField(max_length=1000, blank=True)

    def get_name(self):
        return self.creator.first_name + ' ' + self.creator.last_name

    class Meta:
        db_table = "lesson"


class File(models.Model):
    creator = models.ForeignKey(User, default=None)
    date = models.IntegerField(default=get_utc_epoch_time, blank=True)
    name = models.CharField(max_length=100)
    file_url = models.CharField(max_length=100)

    def get_name(self):
        return self.creator.first_name + ' ' + self.creator.last_name

    class Meta:
        db_table = "file"


class Link(models.Model):
    creator = models.ForeignKey(User, default=None)
    date = models.IntegerField(default=get_utc_epoch_time, blank=True)
    name = models.CharField(max_length=100)
    url = models.CharField(max_length=1000)

    def get_name(self):
        return self.creator.first_name + ' ' + self.creator.last_name

    class Meta:
        db_table = "link"
