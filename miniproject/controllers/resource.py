from __future__ import print_function
import json, os
from django.http import JsonResponse
from miniproject.decorators import login_required, data_required
from miniproject.models import File, Link
from django.forms.models import model_to_dict


@login_required
@data_required(['file', 'file_type', 'file_name'], 'FILES')
def resource_upload(request):
    current_user = request.user

    resource_file = request.FILES['file']
    resource_name = request.POST['file_name']
    file_type = request.POST['file_type']
    resource_path = os.path.abspath(os.path.join(os.path.dirname( __file__ ), '..', '..', 'templates', 'bundle', 'assets', 'resources'))

    # Create File in DATABASE
    resource = File.objects.create(
        creator=current_user,
        name=resource_name
    )

    file_name = str(resource.id) + '.' + file_type

    try:
        with open(os.path.join(resource_path, file_name), 'wb+') as f:
            for chunk in resource_file.chunks():
                f.write(chunk)

        resource.file_url = file_name
        resource.save()
    except:
        print('Oh no file upload is messed up!')
        resource.delete()

    resources = File.objects.all()
    resource_list = []

    for current_file in resources:
        full_name = current_file.get_name()
        file_dict = model_to_dict(current_file)
        file_dict['username'] = full_name
        resource_list.append(file_dict)

    return JsonResponse({'resources': resource_list}, safe=False)


@login_required
@data_required(['url', 'name'], 'POST')
def create_link(request):
    current_user = request.user
    link = request.POST['url']
    name = request.POST['name']

    # Create Link in DATABASE
    Link.objects.create(
        creator=current_user,
        url=link,
        name=name
    )

    links = Link.objects.all()
    link_list = []

    for current_link in links:
        full_name = current_link.get_name()
        file_dict = model_to_dict(current_link)
        file_dict['username'] = full_name
        link_list.append(file_dict)

    return JsonResponse({'links': link_list}, safe=False)


@login_required
@data_required(['type', 'id'], 'POST')
def delete_resource(request):
    resource_type = request.POST['type']

    if resource_type == 'file':
        resource_file = File.objects.filter(id=request.POST['id'])[0]
        file_name = resource_file.file_url
        resource_file.delete()

        try:
            os.remove(os.path.join(os.path.abspath(os.path.join(os.path.dirname( __file__ ), '..', '..', 'templates', 'bundle', 'assets', 'resources')), file_name))
        except OSError:
            print('Could not find file: ' + file_name)
            pass

    else:
        Link.objects.filter(id=request.POST['id'])[0].delete()

    links = Link.objects.all()
    link_list = []

    for current_link in links:
        full_name = current_link.get_name()
        file_dict = model_to_dict(current_link)
        file_dict['username'] = full_name
        link_list.append(file_dict)

    resources = File.objects.all()
    resource_list = []

    for current_file in resources:
        full_name = current_file.get_name()
        file_dict = model_to_dict(current_file)
        file_dict['username'] = full_name
        resource_list.append(file_dict)

    return JsonResponse({'links': link_list, 'resources': resource_list}, safe=False)
