require('./../css/general.css');
require('./../css/dashboard.css');
require('./../css/admin.css');
require('./../library/fontawesome/fontawesome.js');
require('./../library/print/print.js');
var $ = require('jquery');

var tagTemplate = require('./../handlebars/tag.hbs');
var lessonTemplate = require('./../handlebars/lessons.hbs');
var emptyLessonTemplate = require('./../handlebars/empty_lessons.hbs');
var emptyActivityTemplate = require('./../handlebars/empty_activity.hbs');
var activityFeedTemplate = require('./../handlebars/activity_feed.hbs');

function init() {
    var $lessonListWrapper = $('#lesson-list-wrapper');
    var $activityWrapper = $('#activity-wrapper');

    if(globals.lessons.length) {
        $lessonListWrapper.append(lessonTemplate(globals.lessons));
        $activityWrapper.append(activityFeedTemplate(globals.lessons));
    } else {
        $lessonListWrapper.append(emptyLessonTemplate(globals.lessons));
        $activityWrapper.append(emptyActivityTemplate(globals.lessons));
    }

    for (var i = 0; i < globals.lessons.length; i++) {
        var currentLesson = globals.lessons[i];
        $('.lesson[data-id=' + globals.lessons[i]['id'].toString() +']').data('lesson', currentLesson);
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

        if(keycode == 188) {
            var $this = $(this);
            var value = capitalize($this.val().replace(',', '').trim().toLowerCase());
            $('#upload-wrapper .tag-wrapper').append(tagTemplate({value: value}));
            $this.val('');
        }
    });

    $(document).on('click', '#upload-wrapper .tag-wrapper span', function () {
        $(this).remove();
    });

    //OVERLAY//
    $(document).on('click', 'body, #lesson-cancel-button', function () {
        var $overlay = $('#overlay');
        $overlay.removeClass('active');
        $overlay.removeClass('drop');
        $overlay.removeClass('edit');
        $overlay.removeClass('delete');
    });

    $(document).on('click', 'body', function () {
        $('#overlay').removeClass('active');
    });

    $(document).on('click', '#upload-wrapper', function (e) {
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
        'dragexit dragleave': function(e) {
            $('#overlay').removeClass('active');
        },
        'drop': function(e) {
            e.preventDefault();
            e.stopPropagation();
            $('#overlay').addClass('drop');

            globals.file = e.originalEvent.dataTransfer.files[0];
        }
    });

    $(document).on('click', '.drop #lesson-submit-button', function () {
        var formData = new FormData();
        var $tags = $('#overlay').find('.tag');
        var tags = [];

        for (var i = 0; i < $tags.length; i++) {
            var $currentTag = $($tags[i]);
            tags.push($currentTag.attr('data-value'));
        }

        formData.append('file', globals.file);
        formData.append('lesson_name', $('#file-name-input').val());
        formData.append('tags', JSON.stringify(tags));
        formData.append('program', $('#program-input').val());
        formData.append('subject', $('#subject-input').val());
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
                globals.lessons = response['lessons'];

                var $lessonListWrapper = $('#lesson-list-wrapper');
                var $activityWrapper = $('#activity-wrapper');

                $lessonListWrapper.empty();
                $lessonListWrapper.append(lessonTemplate(globals.lessons));

                $activityWrapper.empty();
                $activityWrapper.append(activityFeedTemplate(globals.lessons));
            }
        });
    });
    //FILE UPLOAD//

    //PRINT//
    $(document).on('click', '#print-button', function () {
        var file_name = $(this).attr('data-file_name');

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

    //EDIT//
    $(document).on('click', '#edit-button', function (e) {
        e.stopPropagation();
        var $this = $(this);
        var lesson = $this.closest('.lesson').data('lesson');
        var $overlay = $('#overlay');

        $overlay.addClass('edit');

        var $tagWrapper = $('#upload-wrapper .tag-wrapper');
        $tagWrapper.empty();

        for (var t = 0; t < lesson['tags'].length; t++) {
            $tagWrapper.append(tagTemplate({value: lesson['tags'][t]}));
        }

        $('#file-name-input').val(lesson['name']);
        $('#program-input').val(lesson['program']);
        $('#subject-input').val(lesson['subject']);
        $('#level-input').val(lesson['level']);
        $('#block-input').val(lesson['block']);
        $('#standard-input').val(lesson['standard']);
        $('#lesson-submit-button').attr('data-id', lesson['id']);

        globals.file = null;
    });

    $(document).on('click', '.edit #lesson-submit-button', function () {
        var formData = new FormData();
        var $tags = $('#overlay').find('.tag');
        var tags = [];

        for (var i = 0; i < $tags.length; i++) {
            var $currentTag = $($tags[i]);
            tags.push($currentTag.attr('data-value'));
        }

        if (globals.file !== null) {
            formData.append('file', globals.file);
        }

        formData.append('id', $('#lesson-submit-button').attr('data-id'));
        formData.append('lesson_name', $('#file-name-input').val());
        formData.append('tags', JSON.stringify(tags));
        formData.append('program', $('#program-input').val());
        formData.append('subject', $('#subject-input').val());
        formData.append('level', $('#level-input').val());
        formData.append('block', $('#block-input').val());
        formData.append('standard', $('#standard-input').val());

        $.ajax({
            headers: {"X-CSRFToken": $('input[name="csrfmiddlewaretoken"]').attr('value')},
            url: globals.base_url + '/edit_lesson/',
            data: formData,
            type: "POST",
            cache: false,
            contentType: false,
            processData: false,
            success: function (response) {
                console.log(JSON.stringify(response));
                $('#lesson-cancel-button').click();
                globals.lessons = response['lessons'];

                var $lessonListWrapper = $('#lesson-list-wrapper');
                var $activityWrapper = $('#activity-wrapper');

                $lessonListWrapper.empty();
                $lessonListWrapper.append(lessonTemplate(globals.lessons));

                $activityWrapper.empty();
                $activityWrapper.append(activityFeedTemplate(globals.lessons));
            }
        });
    });
    //EDIT//

    //DELETE//
    $(document).on('click', '#delete-wrapper', function (e) {
        e.stopPropagation();
    });

    $(document).on('click', '#delete-button', function (e) {
        e.stopPropagation();
        var $this = $(this);
        var lesson = $this.closest('.lesson').data('lesson');
        var $overlay = $('#overlay');

        $('#delete-lesson-id').text(lesson['id']);
        $('#delete-submit-button').attr('data-id', lesson['id']);

        $overlay.addClass('delete');
    });

    $(document).on('click', '#delete-cancel-button', function (e) {
        e.stopPropagation();
        var $overlay = $('#overlay');
        $overlay.removeClass('active');
        $overlay.removeClass('delete');
    });


    $(document).on('click', '#delete-submit-button', function () {
        $.ajax({
            headers: {"X-CSRFToken": $('input[name="csrfmiddlewaretoken"]').attr('value')},
            url: globals.base_url + '/delete_lesson/',
            data: {'id': $(this).attr('data-id')},
            dataType: 'json',
            type: "POST",
            success: function (response) {
                $('#delete-cancel-button').click();
                globals.lessons = response['lessons'];

                var $lessonListWrapper = $('#lesson-list-wrapper');
                var $activityWrapper = $('#activity-wrapper');

                $lessonListWrapper.empty();
                $lessonListWrapper.append(lessonTemplate(globals.lessons));

                $activityWrapper.empty();
                $activityWrapper.append(activityFeedTemplate(globals.lessons));
            }
        });
    });

    //DELETE//
});