import json, os
from django.http import JsonResponse, HttpResponseBadRequest
from miniproject.decorators import login_required, data_required
from docx import Document


@login_required
@data_required(['file', 'lesson_name', 'tags', 'program', 'subject', 'level', 'block', 'standard'], 'FILES')
def file_upload(request):
    current_user = request.user

    lesson_file = request.FILES['file']
    lesson_name = request.POST['lesson_name']
    tags = json.loads(request.POST['tags'])
    program = request.POST['program']
    subject = request.POST['subject']
    level = request.POST['level']
    block = request.POST['block']
    standard = request.POST['standard']

    # print lesson_file
    # print lesson_name
    # print type(tags)
    # print program
    # print subject
    # print level
    # print block
    # print standard

    lesson_path = os.path.abspath(os.path.join(os.path.dirname( __file__ ), '..', '..', 'templates', 'bundle', 'assets', 'lessons'))

    document = Document(lesson_file)
    document.save(os.path.join(lesson_path, 'test.docx'))


    # try:
    #     picture_file = Image.open(request.FILES['file'])
    # except:
    #     return HttpResponseBadRequest('Must be an image.', 'application/json')
    #
    # asset_directory = os.path.abspath(os.path.join(os.path.dirname( __file__ ), '..', '..', 'templates', 'bundle', 'assets', 'files'))
    # boss_directory = os.path.join(asset_directory, boss_username)
    # store_directory = os.path.join(boss_directory, store_name)
    # file_name = item_id + '_' + str(int(time.time())) + '.' + picture_file.format.lower()
    #
    # if not os.path.exists(boss_directory):
    #     os.mkdir(os.path.join(asset_directory, boss_username))
    #
    # if not os.path.exists(store_directory):
    #     os.mkdir(os.path.join(boss_directory, store_name))
    #
    # picture_file.save(os.path.join(store_directory, file_name))
    #
    # store.inventory[item_id][store.picture_column].append(file_name)
    # store.save()
    #
    # store_inventory = sort_inventory(store, store.inventory)

    return JsonResponse({}, safe=False)
