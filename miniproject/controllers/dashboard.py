import json, os, comtypes.client, pythoncom
from django.http import JsonResponse, HttpResponseBadRequest
from miniproject.decorators import login_required, data_required
from miniproject.models import Lesson
from django.forms.models import model_to_dict
from miniproject.modules.base import models_to_dict
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

    lesson_path = os.path.abspath(os.path.join(os.path.dirname( __file__ ), '..', '..', 'templates', 'bundle', 'assets', 'lessons'))

    document = Document(lesson_file)

    # Create Lesson in DATABASE
    lesson_obj = Lesson.objects.create(
        creator=current_user,
        name=lesson_name,
        tags=tags,
        program=program,
        subject=subject,
        level=level,
        block=block,
        standard=standard
    )

    file_name = str(lesson_obj.id) + '.docx'
    document.save(os.path.join(lesson_path, file_name))
    lesson_obj.file_url = file_name
    lesson_obj.save()

    lessons = models_to_dict(Lesson.objects.all())

    return JsonResponse({'lesson': model_to_dict(lesson_obj), 'lessons': lessons}, safe=False)


@login_required
@data_required(['file_name'], 'FILES')
def print_pdf(request):
    lesson_path = os.path.abspath(os.path.join(os.path.dirname( __file__ ), '..', '..', 'templates', 'bundle', 'assets', 'lessons'))
    temporary_path = os.path.abspath(os.path.join(os.path.dirname( __file__ ), '..', '..', 'templates', 'bundle', 'assets', 'temporary'))
    file_name = request.POST['file_name']
    pdf_file_name = file_name.replace('.docx', '.pdf')

    word_file = os.path.join(lesson_path, file_name)
    pdf_file = os.path.join(temporary_path, pdf_file_name)

    pythoncom.CoInitialize()

    # Delete all files in temporary folder
    for the_file in os.listdir(temporary_path):
        file_path = os.path.join(temporary_path, the_file)
        try:
            if os.path.isfile(file_path):
                os.unlink(file_path)
        except Exception as e:
            print(e)

    word = comtypes.client.CreateObject('Word.Application')
    doc = word.Documents.Open(word_file)
    doc.SaveAs(pdf_file, FileFormat=17)
    doc.Close()
    word.Quit()

    return JsonResponse({'pdf_file': pdf_file_name}, safe=False)
