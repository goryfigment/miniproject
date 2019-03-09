require('./../css/general.css');
require('./../css/dashboard.css');
require('./../library/fontawesome/fontawesome.js');
require('./../library/print/print.js');
var $ = require('jquery');

var tagTemplate = require('./../handlebars/tag.hbs');
var lessonTemplate = require('./../handlebars/lessons.hbs');
var emptyLessonTemplate = require('./../handlebars/empty_lessons.hbs');

function init() {
    var $lessonListWrapper = $('#lesson-list-wrapper');

    if(globals.lessons.length) {
        $lessonListWrapper.append(lessonTemplate(globals.lessons));
    } else {
        $lessonListWrapper.append(emptyLessonTemplate(globals.lessons));
    }

    //var $lessonListWrapper = $('#lesson-list-wrapper');
    //$lessonListWrapper.append(lessonTemplate(globals.lessons));
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

    $(document).on('click', '#lesson-submit-button', function () {
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
                var $lessonListWrapper = $('#lesson-list-wrapper');
                globals.lessons = response['lessons'];
                $lessonListWrapper.empty();
                $lessonListWrapper.append(lessonTemplate(globals.lessons));
            }
        });
    });
    //FILE UPLOAD//

    //PRINT//
    $(document).on('click', '#print-button', function () {
        var file_name = $(this).attr('data-file_name');

        $.ajax({
            headers: {"X-CSRFToken": $('input[name="csrfmiddlewaretoken"]').attr('value')},
            url: globals.base_url + '/print/',
            data: {'file_name': file_name},
            dataType: 'json',
            type: "POST",
            success: function (response) {
                //console.log(JSON.stringify(response));
                printJS('/templates/bundle/assets/temporary/' + response['pdf_file']);
            }
        });
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
});