import json
from django.shortcuts import render
from django.http import HttpResponseRedirect
from miniproject.models import Lesson, File, Link, User
from miniproject.modules.base import get_base_url, model_to_dict
from miniproject.controllers.base import array_to_dict
from django.contrib.auth import logout


def error_page(request):
    data = {
        'base_url': get_base_url()
    }

    return render(request, '404.html', data)


def server_error(request):
    data = {
        'base_url': get_base_url()
    }

    return render(request, '500.html', data)


def home(request):
    data = {
        'base_url': get_base_url()
    }

    # If user is login redirect to overview
    if request.user.is_authenticated():
        return HttpResponseRedirect('/dashboard/')

    return render(request, 'home.html', data)


def register(request):
    data = {
        'base_url': get_base_url()
    }

    # If user is login redirect to overview
    if request.user.is_authenticated():
        return HttpResponseRedirect('/dashboard/')

    return render(request, 'register.html', data)


def login(request):
    data = {
        'base_url': get_base_url()
    }

    # If user is login redirect to overview
    if request.user.is_authenticated():
        return HttpResponseRedirect('/dashboard/')

    return render(request, 'login.html', data)


def forgot_password(request):
    data = {
        'base_url': get_base_url(),
        'expired': False
    }

    # if 'code' in request.GET:
    #     current_user = User.objects.get(reset_link=request.GET['code'])
    #
    #     if (int(round(time.time())) - current_user.reset_date) > 86400:
    #         data['expired'] = True

    # If user is login redirect to overview
    if request.user.is_authenticated():
        return HttpResponseRedirect('/dashboard/')

    return render(request, 'forgot_password.html', data)


def dashboard(request):
    current_user = request.user

    lessons = Lesson.objects.all()

    lesson_list = []

    for lesson in lessons:
        full_name = lesson.get_name()
        lesson = model_to_dict(lesson)
        lesson['username'] = full_name
        lesson_list.append(lesson)

    user_name = ''
    try:
        user_name = current_user.first_name + ' ' + current_user.last_name
    except:
        logout(request)

    data = {
        'base_url': get_base_url(),
        'username': current_user.username,
        'name': user_name,
        'lessons': json.dumps(lesson_list)
    }

    # Only go to dashboard if user is logged in
    if not current_user.is_authenticated():
        return HttpResponseRedirect('/login/')

    if current_user.username == 'admin':
        return render(request, 'admin.html', data)
    else:
        return render(request, 'dashboard.html', data)


def resources(request):
    current_user = request.user

    file_resources = File.objects.all()
    resource_list = []

    for current_file in file_resources:
        full_name = current_file.get_name()
        file_dict = model_to_dict(current_file)
        file_dict['username'] = full_name
        resource_list.append(file_dict)

    links = Link.objects.all()
    link_list = []

    for current_link in links:
        full_name = current_link.get_name()
        link_dict = model_to_dict(current_link)
        link_dict['username'] = full_name
        link_list.append(link_dict)

    user_name = ''
    try:
        user_name = current_user.first_name + ' ' + current_user.last_name
    except:
        logout(request)

    data = {
        'base_url': get_base_url(),
        'username': current_user.username,
        'name': user_name,
        'resources': json.dumps(resource_list),
        'links': json.dumps(link_list),
        'admin': json.dumps(current_user.username == 'admin')
    }

    # Only go to dashboard if user is logged in
    if not current_user.is_authenticated():
        return HttpResponseRedirect('/login/')

    return render(request, 'resources.html', data)


def users(request):
    current_host = request.user

    all_users = User.objects.filter(enabled=True)
    user_list = []

    for current_user in all_users:
        current_user = model_to_dict(current_user)
        current_user.pop('password', None)
        user_list.append(current_user)

    user_dict = array_to_dict(user_list)

    user_name = ''
    try:
        user_name = current_host.first_name + ' ' + current_host.last_name
    except:
        logout(request)

    data = {
        'base_url': get_base_url(),
        'username': current_host.username,
        'name': user_name,
        'users': json.dumps(user_dict)
    }

    # Only go to dashboard if user is logged in
    if not current_host.is_authenticated():
        return HttpResponseRedirect('/login/')

    return render(request, 'users.html', data)
