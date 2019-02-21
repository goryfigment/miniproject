require('./../css/general.css');
require('./../css/dashboard.css');
require('./../library/fontawesome/fontawesome.js');
var $ = require('jquery');

var tagTemplate = require('./../handlebars/tag.hbs');

function init() {

}

function capitalize(value) {
    return value.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});;
}

$(document).ready(function() {
    init();

    $(document).on('click', '#account-link', function () {
        $(this).closest('#nav-wrapper').toggleClass('account-active');
    });

    $(document).on('click', '#logout', function () {
        window.location.replace(globals.base_url + '/logout');
    });

    $(document).on('keyup', '#tag-input', function (e) {
        var keycode = e.keyCode;

        if(keycode == 188) {
            var $this = $(this);
            var value = capitalize($this.val().replace(',', '').trim().toLowerCase());
            $('#tag-wrapper').append(tagTemplate({value: value}));
            $this.val('');
        }
    });

    $(document).on('click', '#tag-wrapper span', function (e) {
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
            }
        });
    });
    //FILE UPLOAD//
});