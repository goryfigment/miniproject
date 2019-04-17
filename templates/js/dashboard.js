require('./../css/general.css');
require('./../css/dashboard.css');
require('./../css/sortable.css');
require('./../library/fontawesome/fontawesome.js');
require('./../library/print/print.js');
var $ = require('jquery');
require('./../js/sortable.js');

var tagTemplate = require('./../handlebars/tag.hbs');
var listTemplate = require('./../handlebars/list.hbs');
var lessonTemplate = require('./../handlebars/lessons.hbs');
var emptyLessonTemplate = require('./../handlebars/empty_lessons.hbs');
var overlayTemplate = require('./../handlebars/overlay.hbs');

function init() {
    var $lessonListWrapper = $('#lesson-list-wrapper');

    if(globals.lessons.length) {
        $lessonListWrapper.append(lessonTemplate(globals.lessons));
    } else {
        $lessonListWrapper.append(emptyLessonTemplate(globals.lessons));
    }
}


function capitalize(value) {
    return value.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

$(document).ready(function() {
    init();

    $(document).on('click', '#home-link', function () {
        window.location.replace(globals.base_url + '/dashboard');
    });

    $(document).on('click', '#account-link', function () {
        $(this).closest('#nav-wrapper').toggleClass('account-active');
    });

    $(document).on('click', '#logout-link', function () {
        window.location.replace(globals.base_url + '/logout');
    });

    $(document).on('keyup', '#tag-input', function (e) {
        var keycode = e.keyCode;

        if(keycode == 13) {
            var $this = $(this);
            var value = capitalize($this.val().replace(',', '').trim().toLowerCase());
            $('#upload-wrapper .tag-wrapper').append(tagTemplate({value: value}));
            $this.val('');
        }
    });

    $(document).on('click', '#upload-wrapper .tag-wrapper span, .input-wrapper .list', function () {
        $(this).remove();
    });

    //OVERLAY//
    $(document).on('click', 'body, #lesson-cancel-button, #doc-cancel-button', function () {
        var $overlay = $('#overlay');
        $overlay.removeClass('active');
        $overlay.removeClass('drop');
        $overlay.removeClass('document');
    });

    $(document).on('click', 'body', function () {
        $('#overlay').removeClass('active');
    });

    $(document).on('click', '#upload-wrapper, #create-document-overlay', function (e) {
        e.stopPropagation();
    });
    //OVERLAY//

    //FILE UPLOAD//
    $('body').on({
        'dragover dragenter': function(e) {
            e.preventDefault();
            e.stopPropagation();

            $('#overlay').addClass('active');
        }
    });

    $('#overlay').on({
        'dragexit dragleave': function() {
            $('#overlay').removeClass('active');
        },
        'drop': function(e) {
            e.preventDefault();
            e.stopPropagation();

            var file = e.originalEvent.dataTransfer.files[0];
            var fileType = file.type;

            if(fileType == 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || fileType == 'application/msword') {
                $('#overlay').addClass('drop');
                globals.file = file;
            } else {
                alert('This file must be doc or docx!');
            }
        }
    });

    $(document).on('click', '#lesson-submit-button', function () {
        var formData = new FormData();
        var $tags = $('#overlay').find('.tag');
        var $subjects = $('#file-section-3 input');
        var tags = [];
        var subjects = [];

        for (var i = 0; i < $tags.length; i++) {
            var $currentTag = $($tags[i]);
            tags.push($currentTag.attr('data-value'));
        }

        for (var s = 0; s < $subjects.length; s++) {
            var $currentSubject = $($subjects[s]);

            if($currentSubject.prop(("checked"))) {
                subjects.push($currentSubject.val());
            }
        }

        formData.append('file', globals.file);
        formData.append('lesson_name', $('#file-name-input').val());
        formData.append('tags', JSON.stringify(tags));
        formData.append('program', $('#program-input').val());
        formData.append('subject', JSON.stringify(subjects));
        formData.append('level', $('#level-input').val());
        formData.append('block', $('#block-input').val());
        formData.append('standard', $('#standard-input').val());

        $.ajax({
            headers: {"X-CSRFToken": $('input[name="csrfmiddlewaretoken"]').attr('value')},
            url: globals.base_url + '/file_upload/',
            data: formData,
            type: "POST",
            cache: false,
            contentType: false,
            processData: false,
            success: function (response) {
                console.log(JSON.stringify(response));
                $('#lesson-cancel-button').click();
                var $lessonListWrapper = $('#lesson-list-wrapper');
                globals.lessons = response['lessons'];
                $lessonListWrapper.empty();
                $lessonListWrapper.append(lessonTemplate(globals.lessons));

                var $overlay = $('#overlay');
                $overlay.empty();
                $overlay.append(overlayTemplate({}));
            }
        });
    });
    //FILE UPLOAD//

    //PRINT//
    $(document).on('click', '#print-button', function () {
        var file_name = $(this).attr('data-file_name');

        //$.ajax({
        //    headers: {"X-CSRFToken": $('input[name="csrfmiddlewaretoken"]').attr('value')},
        //    url: globals.base_url + '/print/',
        //    data: {'file_name': file_name},
        //    dataType: 'json',
        //    type: "POST",
        //    success: function (response) {
        //        //console.log(JSON.stringify(response));
        //        printJS('/templates/bundle/assets/temporary/' + response['pdf_file']);
        //    }
        //});

        printJS('/templates/bundle/assets/lessons/' + file_name);
    });
    //PRINT//

    //SEARCH//
    $(document).on('keyup', '#search-input', function () {
        var value = $(this).val().replace(' ', '').replace('-', '').toLowerCase();
        var $items = $('#lesson-table').find('tbody tr');

        for (var i = 0; i < $items.length; i++) {
            var $currentItem = $($items[i]);
            var currentName = $currentItem.find('.lesson-name').text().replace(' ', '').replace('-', '').toLowerCase();
            var currentId = $currentItem.find('.lesson-id').text();

            if(currentName.indexOf(value) !== -1 || currentId.indexOf(value) !== -1) {
                $currentItem.show();
            } else {
                var tags = $currentItem.find('.tag');
                var tagVerification = false;

                for (var t = 0; t < tags.length; t++) {
                    var currentText = $(tags[t]).text();
                    if(currentText.indexOf(value) !== -1) {
                        tagVerification = true;
                        break;
                    }
                }

                if (tagVerification) {
                    $currentItem.show();
                } else {
                    $currentItem.hide();
                }
            }
        }
    });

    $(document).on('click', 'table .tag', function () {
        var $searchInput = $('#search-input');
        $searchInput.val($(this).text());
        $searchInput.keyup();
    });
    //SEARCH//

    //CREATE DOCUMENT//
    $(document).on('click', '#create-document-button', function (e) {
        e.stopPropagation();
        var $overlay = $('#overlay');
        $overlay.addClass('active');
        $overlay.addClass('document');
    });

    $(document).on('keyup', '#addressed-input', function (e) {
        var keycode = e.keyCode;

        if(keycode == 13) {
            var $this = $(this);
            $('#addressed-wrapper').append(listTemplate({value: $this.val().trim()}));
            $this.val('');
        }
    });

    $(document).on('keyup', '#lesson-objective-input', function (e) {
        var keycode = e.keyCode;

        if(keycode == 13) {
            var $this = $(this);
            $('#lesson-objective-wrapper').append(listTemplate({value: $this.val().trim()}));
            $this.val('');
        }
    });

    $(document).on('keyup', '#resources-input', function (e) {
        var keycode = e.keyCode;

        if(keycode == 13) {
            var $this = $(this);
            $('#resources-wrapper').append(listTemplate({value: $this.val().trim()}));
            $this.val('');
        }
    });

    $(document).on('click', '#doc-submit-button', function () {
        var $addressedList = $('#addressed-wrapper').find('.list');
        var addressed = [];

        for (var i = 0; i < $addressedList.length; i++) {
            var $currentList = $($addressedList[i]);
            addressed.push({'Standards': $currentList.attr('data-value')});
        }

        var $objectiveList = $('#lesson-objective-wrapper').find('.list');
        var objective = [];

        for (var q = 0; q < $objectiveList.length; q++) {
            $currentList = $($objectiveList[q]);
            objective.push({'Objective': $currentList.attr('data-value')});
        }

        var $resourceList = $('#resources-wrapper').find('.list');
        var resource = [];

        for (var r = 0; r < $resourceList.length; r++) {
            $currentList = $($resourceList[r]);
            resource.push({'Resources': $currentList.attr('data-value')});
        }

        var data = {
            'name': $('#name-input').val(),

            'abe-1': $('#abe-1-checkbox').prop("checked") ? 'x' : '',
            'abe-2': $('#abe-2-checkbox').prop("checked") ? 'x' : '',
            'abe-3': $('#abe-3-checkbox').prop("checked") ? 'x' : '',
            'abe-4': $('#abe-4-checkbox').prop("checked") ? 'x' : '',
            'abe-5': $('#abe-5-checkbox').prop("checked") ? 'x' : '',
            'abe-6': $('#abe-6-checkbox').prop("checked") ? 'x' : '',

            'elaa-1': $('#elaa-1-checkbox').prop("checked") ? 'x' : '',
            'elaa-2': $('#elaa-2-checkbox').prop("checked") ? 'x' : '',
            'elaa-3': $('#elaa-3-checkbox').prop("checked") ? 'x' : '',
            'elaa-4': $('#elaa-4-checkbox').prop("checked") ? 'x' : '',
            'elaa-5': $('#elaa-5-checkbox').prop("checked") ? 'x' : '',
            'elaa-6': $('#elaa-6-checkbox').prop("checked") ? 'x' : '',

            'abe-r': $('#abe-r-checkbox').prop("checked") ? 'x' : '',
            'abe-w': $('#abe-w-checkbox').prop("checked") ? 'x' : '',
            'abe-m': $('#abe-m-checkbox').prop("checked") ? 'x' : '',
            'abe-ss': $('#abe-ss-checkbox').prop("checked") ? 'x' : '',
            'abe-s': $('#abe-s-checkbox').prop("checked") ? 'x' : '',

            'elaa-r': $('#elaa-r-checkbox').prop("checked") ? 'x' : '',
            'elaa-w': $('#elaa-w-checkbox').prop("checked") ? 'x' : '',
            'elaa-l': $('#elaa-l-checkbox').prop("checked") ? 'x' : '',
            'elaa-s': $('#elaa-s-checkbox').prop("checked") ? 'x' : '',

            'lesson-title': $('#lesson-title-input').val(),
            'introduction': $('#introduction-input').val(),
            'input-modeling': $('#input-modeling-input').val(),
            'understanding': $('#understanding-input').val(),
            'practice': $('#practice-input').val(),
            'closure': $('#closure-input').val(),
            'extended-learning': $('#extended-learning-input').val(),
            'assessment': $('#assessment-input').val(),
            'udl': $('#udl-input').val(),
            'work': $('#work-input').val(),
            'add': $('#add-input').val(),

            'addressed': addressed,
            'objective': objective,
            'resource': resource
        };

        $.ajax({
            headers: {"X-CSRFToken": $('input[name="csrfmiddlewaretoken"]').attr('value')},
            url: globals.base_url + '/doc_creator/',
            data: JSON.stringify(data),
            type: "POST",
            cache: false,
            contentType: false,
            processData: false,
            success: function (response) {
                printJS('/templates/bundle/assets/document/' + response['doc']);
                //console.log(JSON.stringify(response));
                //$('#lesson-cancel-button').click();
                //var $lessonListWrapper = $('#lesson-list-wrapper');
                //globals.lessons = response['lessons'];
                //$lessonListWrapper.empty();
                //$lessonListWrapper.append(lessonTemplate(globals.lessons));
            }
        });
    });
    //CREATE DOCUMENT//
});