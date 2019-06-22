import json
import re
import uuid
import time
import smtplib
import os
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from django.http import HttpResponseRedirect, HttpResponseBadRequest, JsonResponse, HttpResponse
from miniproject.modules.base import render_json
import miniproject.modules.base as helper
from django.contrib.auth import authenticate, login, logout
from miniproject.decorators import login_required, data_required
from django.forms.models import model_to_dict
from miniproject.models import User
from django.contrib.auth import update_session_auth_hash
from miniproject.controllers.base import array_to_dict
from miniproject.settings_secret import GMAIL, GMAIL_PASSWORD


@data_required(['username', 'email', 'password', 'first_name', 'last_name', 'id'], 'POST')
def edit_user(request):
    username = request.POST['username'].strip().lower()
    email = request.POST['email'].strip().lower()
    password = request.POST['password'].strip()
    first_name = request.POST['first_name']
    last_name = request.POST['last_name']
    current_user = User.objects.get(id=request.POST['id'])

    # Check first name
    if not len(first_name):
        data = {'success': False,  'error_msg': 'Must have a first name.'}
        return HttpResponseBadRequest(json.dumps(data), 'application/json')

    # Check last name
    if not len(last_name):
        data = {'success': False,  'error_msg': 'Must have a last name.'}
        return HttpResponseBadRequest(json.dumps(data), 'application/json')

    # Check username
    if len(username) <= 2 or len(username) >= 16:
        data = {'success': False,  'error_msg': 'Username must be between 3 to 15 characters.'}
        return HttpResponseBadRequest(json.dumps(data), 'application/json')

    # Check Email
    if not re.match(r"[^@]+@[^@]+\.[^@]+", email):
        data = {'success': False,  'error_msg': 'Invalid email.'}
        return HttpResponseBadRequest(json.dumps(data), 'application/json')

    # Check if valid password: Must be 8 or more characters and contain a combo of letters and numbers
    if password != '' and not len(password) >= 8:
        data = {'success': False,  'error_msg': 'Password must be 8 characters or more.'}
        return HttpResponseBadRequest(json.dumps(data), 'application/json')

    if password != '' and (not bool(re.search(r'\d', password)) or not bool(re.search(r'[a-zA-Z]', password))):
        data = {'success': False,  'error_msg': 'Invalid password.'}
        return HttpResponseBadRequest(json.dumps(data), 'application/json')

    # Check if username exist in the database
    if current_user.username != username and User.objects.filter(username=username).exists():
        data = {'success': False,  'error_msg': 'Username exists.'}
        return HttpResponseBadRequest(json.dumps(data), 'application/json')

    # Check if email exist in the database
    if current_user.email != email and User.objects.filter(email=email).exists():
        data = {'success': False,  'error_msg': 'Email exists.'}
        return HttpResponseBadRequest(json.dumps(data), 'application/json')

    current_user.username = username
    current_user.email = email
    current_user.first_name = first_name
    current_user.last_name = last_name
    if password != '':
        current_user.password = helper.create_password(password)
        update_session_auth_hash(request, current_user)
    current_user.save()

    user_list = []
    all_users = User.objects.filter(enabled=True)

    for current_user in all_users:
        current_user = model_to_dict(current_user)
        current_user.pop('password', None)
        current_user.pop('last_login', None)
        user_list.append(current_user)

    user_dict = array_to_dict(user_list)

    return render_json({'users': user_dict})


@login_required
@data_required(['id'], 'POST')
def delete_user(request):
    user_delete = User.objects.filter(id=request.POST['id'])[0]
    user_delete.username = user_delete.id
    user_delete.email = user_delete.id
    user_delete.enabled = False
    user_delete.save()

    user_list = []
    all_users = User.objects.filter(enabled=True)

    for current_user in all_users:
        current_user = model_to_dict(current_user)
        current_user.pop('password', None)
        current_user.pop('last_login', None)
        user_list.append(current_user)

    user_dict = array_to_dict(user_list)

    return render_json({'users': user_dict})
