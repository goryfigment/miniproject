from __future__ import print_function
from mailmerge import MailMerge
from datetime import date
import json, os
from django.http import JsonResponse
from miniproject.decorators import login_required, data_required
from miniproject.models import Lesson
from django.forms.models import model_to_dict
from docx import Document


@login_required
@data_required(['file', 'lesson_name', 'tags', 'program', 'subject', 'level', 'block', 'standard', 'file_type'], 'FILES')
def file_upload(request):
    current_user = request.user

    lesson_file = request.FILES['file']
    lesson_name = request.POST['lesson_name']
    tags = json.loads(request.POST['tags'])
    program = request.POST['program']
    subject = json.loads(request.POST['subject'])
    level = json.loads(request.POST['level'])
    block = request.POST['block']
    standard = request.POST['standard']
    file_type = request.POST['file_type']
    lesson_path = os.path.abspath(os.path.join(os.path.dirname( __file__ ), '..', '..', 'templates', 'bundle', 'assets', 'lessons'))

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

    file_name = str(lesson_obj.id) + '.' + file_type

    try:
        with open(os.path.join(lesson_path, file_name), 'wb+') as f:
            for chunk in lesson_file.chunks():
                f.write(chunk)

        lesson_obj.file_url = file_name
        lesson_obj.save()
    except:
        print('Oh no file upload is messed up!')
        lesson_obj.delete()

    lessons = Lesson.objects.all()

    lesson_list = []

    for lesson in lessons:
        full_name = lesson.get_name()
        lesson = model_to_dict(lesson)
        lesson['username'] = full_name
        lesson_list.append(lesson)

    return JsonResponse({'lessons': lesson_list}, safe=False)


@login_required
@data_required(['file_name'], 'FILES')
def print_pdf(request):
    lesson_path = os.path.abspath(os.path.join(os.path.dirname( __file__ ), '..', '..', 'templates', 'bundle', 'assets', 'lessons'))
    temporary_path = os.path.abspath(os.path.join(os.path.dirname( __file__ ), '..', '..', 'templates', 'bundle', 'assets', 'temporary'))
    file_name = request.POST['file_name']
    pdf_file_name = file_name.replace('.docx', '.pdf')

    word_file = os.path.join(lesson_path, file_name)
    pdf_file = os.path.join(temporary_path, pdf_file_name)

    # pythoncom.CoInitialize()
    #
    # # Delete all files in temporary folder
    # for the_file in os.listdir(temporary_path):
    #     file_path = os.path.join(temporary_path, the_file)
    #     try:
    #         if os.path.isfile(file_path):
    #             os.unlink(file_path)
    #     except Exception as e:
    #         print(e)
    #
    # word = comtypes.client.CreateObject('Word.Application')
    # doc = word.Documents.Open(word_file)
    # doc.SaveAs(pdf_file, FileFormat=17)
    # doc.Close()
    # word.Quit()

    return JsonResponse({'pdf_file': pdf_file_name}, safe=False)


@login_required
@data_required(['lesson_name', 'tags', 'program', 'subject', 'level', 'block', 'standard', 'id'], 'FILES')
def edit_lesson(request):
    lesson_id = str(request.POST['id'])

    lesson = Lesson.objects.filter(id=request.POST['id'])[0]

    if 'file' in request.FILES:
        lesson_file = request.FILES['file']
        lesson_path = os.path.abspath(os.path.join(os.path.dirname( __file__ ), '..', '..', 'templates', 'bundle', 'assets', 'lessons'))
        document = Document(lesson_file)
        file_name = str(lesson_id) + '.docx'
        document.save(os.path.join(lesson_path, file_name))
        lesson.file_url = file_name

    lesson.name = request.POST['lesson_name']
    lesson.tags = json.loads(request.POST['tags'])
    lesson.program = request.POST['program']
    lesson.subject = json.loads(request.POST['subject'])
    lesson.level = json.loads(request.POST['level'])
    lesson.block = request.POST['block']
    lesson.standard = request.POST['standard']

    lesson.save()
    lessons = Lesson.objects.all()
    lesson_list = []

    for lesson in lessons:
        full_name = lesson.get_name()
        lesson = model_to_dict(lesson)
        lesson['username'] = full_name
        lesson_list.append(lesson)

    return JsonResponse({'lessons': lesson_list}, safe=False)


@login_required
@data_required(['id'], 'POST')
def delete_lesson(request):
    lesson = Lesson.objects.filter(id=request.POST['id'])[0]
    file_name = lesson.file_url
    lesson.delete()

    try:
        os.remove(os.path.join(os.path.abspath(os.path.join(os.path.dirname( __file__ ), '..', '..', 'templates', 'bundle', 'assets', 'lessons')), file_name))
    except OSError:
        print('Could not find file: ' + file_name)
        pass

    lessons = Lesson.objects.all()
    lesson_list = []

    for lesson in lessons:
        full_name = lesson.get_name()
        lesson = model_to_dict(lesson)
        lesson['username'] = full_name
        lesson_list.append(lesson)

    return JsonResponse({'lessons': lesson_list}, safe=False)


@login_required
@data_required(['id', 'lesson_work', 'add_or_take'], 'POST')
def reflection(request):
    lesson = Lesson.objects.filter(id=request.POST['id'])[0]
    lesson.lesson_work = request.POST['lesson_work']
    lesson.add_or_take = request.POST['add_or_take']
    lesson.save()

    lessons = Lesson.objects.all()
    lesson_list = []

    for lesson in lessons:
        full_name = lesson.get_name()
        lesson = model_to_dict(lesson)
        lesson['username'] = full_name
        lesson_list.append(lesson)

    return JsonResponse({'lessons': lesson_list}, safe=False)


@login_required
@data_required(['name'], 'BODY')
def create_doc(request):
    document = MailMerge(os.path.abspath(os.path.join(os.path.dirname( __file__ ), 'lvmc_template.docx')))

    document.merge(
        Name=request.BODY['name'],
        Date=date.today().strftime('%m/%d/%y'),

        ABE1=request.BODY['abe-1'],
        ABE2=request.BODY['abe-2'],
        ABE3=request.BODY['abe-3'],
        ABE4=request.BODY['abe-4'],
        ABE5=request.BODY['abe-5'],
        ABE6=request.BODY['abe-6'],

        ELAA1=request.BODY['elaa-1'],
        ELAA2=request.BODY['elaa-2'],
        ELAA3=request.BODY['elaa-3'],
        ELAA4=request.BODY['elaa-4'],
        ELAA5=request.BODY['elaa-5'],
        ELAA6=request.BODY['elaa-6'],

        ABE_R=request.BODY['abe-r'],
        ABE_S=request.BODY['abe-s'],
        ABE_W=request.BODY['abe-w'],
        ABE_SS=request.BODY['abe-ss'],
        ABE_M=request.BODY['abe-m'],

        ELAA_L=request.BODY['elaa-l'],
        ELAA_R=request.BODY['elaa-r'],
        ELAA_S=request.BODY['elaa-s'],
        ELAA_W=request.BODY['elaa-w'],

        LessonTitle=request.BODY['lesson-title'],
        Introduction=request.BODY['introduction'],
        InputModeling=request.BODY['input-modeling'],
        Understanding=request.BODY['understanding'],
        IndependentPractice=request.BODY['practice'],
        Closure=request.BODY['closure'],
        ExtendedLearning=request.BODY['extended-learning'],
        Proficiency=request.BODY['assessment'],
        UDL=request.BODY['udl'],
        Reflection1=request.BODY['work'],
        Reflection2=request.BODY['add']
    )

    document.merge_rows('Standards', request.BODY['addressed'])
    document.merge_rows('Objective', request.BODY['objective'])
    document.merge_rows('Resources', request.BODY['resource'])

    document_path = os.path.abspath(os.path.join(os.path.dirname( __file__ ), '..', '..', 'templates', 'bundle', 'assets', 'document'))

    # Delete all files in temporary folder
    for the_file in os.listdir(document_path):
        file_path = os.path.join(document_path, the_file)
        try:
            if os.path.isfile(file_path):
                os.unlink(file_path)
        except Exception as e:
            print(e)

    doc_file = os.path.join(document_path, request.BODY['lesson-title'] + '.docx')
    document.write(doc_file)

    return JsonResponse({'doc': request.BODY['lesson-title'] + '.docx'}, safe=False)
