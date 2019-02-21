from django.shortcuts import render
from miniproject.modules.base import get_base_url
from django.http import HttpResponseRedirect


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

    data = {
        'base_url': get_base_url(),
        'username': current_user.username,
        'name': current_user.first_name + ' ' + current_user.last_name
    }

    # Only go to dashboard if user is logged in
    if not current_user.is_authenticated():
        return HttpResponseRedirect('/login/')

    return render(request, 'dashboard.html', data)