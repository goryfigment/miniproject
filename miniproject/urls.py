from django.conf.urls import url
from django.contrib import admin
from miniproject.controllers import site, account_handler, dashboard, resource

urlpatterns = [
    url(r'^admin/', admin.site.urls),
    url(r'^$', site.home, name='home'),
    url(r'^register/$', site.register, name='register_page'),
    url(r'^login/$', site.login, name='login_page'),
    url(r'^forgot_password/$', site.forgot_password, name='forgot_password'),
    url(r'^dashboard/$', site.dashboard, name='dashboard'),
    url(r'^resources/$', site.resources, name='resources'),

    # Account Handler
    url(r'^account/register/$', account_handler.register, name='register'),
    url(r'^account/login/$', account_handler.user_login, name='login'),
    url(r'^account/reset_password/$', account_handler.reset_password, name='reset_password'),
    url(r'^account/change_password/$', account_handler.change_password, name='change_password'),
    url(r'^logout/$', account_handler.user_logout, name='logout'),

    # Dashboard
    url(r'^file_upload/$', dashboard.file_upload, name='file_upload'),
    url(r'^print/$', dashboard.print_pdf, name='print'),
    url(r'^doc_creator/$', dashboard.create_doc, name='create_doc'),
    url(r'^reflection/$', dashboard.reflection, name='reflection'),

    # Admin
    url(r'^edit_lesson/$', dashboard.edit_lesson, name='edit_lesson'),
    url(r'^delete_lesson/$', dashboard.delete_lesson, name='delete_lesson'),

    # Resources
    url(r'^resource_upload/$', resource.resource_upload, name='resource_upload'),
    url(r'^create_link/$', resource.create_link, name='create_link'),
    url(r'^delete_resource/$', resource.delete_resource, name='delete_resource'),
]
