require('./../css/general.css');
require('./../css/resources.css');
require('./../css/sortable.css');
require('./../library/fontawesome/fontawesome.js');
var $ = require('jquery');
require('./../js/sortable.js');

var resourceTemplate = require('./../handlebars/resources.hbs');
var emptyResourceTemplate = require('./../handlebars/empty_resources.hbs');
var linksTemplate = require('./../handlebars/links.hbs');
var emptyLinksTemplate = require('./../handlebars/empty_links.hbs');

function init() {
    var $fileWrapper = $('#file-wrapper');
    var $linkWrapper = $('#link-wrapper');

    if(globals.resources.length) {
        $fileWrapper.append(resourceTemplate(globals.resources));
    } else {
        $fileWrapper.append(emptyResourceTemplate(globals.resources));
    }

    if(globals.links.length) {
        $linkWrapper.append(linksTemplate(globals.links));
    } else {
        $linkWrapper.append(emptyLinksTemplate(globals.links));
    }

    if(globals.admin) {
        $('#users-link').show();
        $('body').addClass('admin');
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

    $(document).on('click', '#resources-link', function () {
        window.location.replace(globals.base_url + '/resources');
    });

    $(document).on('click', '#logout-link', function () {
        window.location.replace(globals.base_url + '/logout');
    });

    $(document).on('click', '#users-link', function () {
        window.location.replace(globals.base_url + '/users');
    });

    //OVERLAY//
    $(document).on('click', 'body, #file-cancel-button, #link-cancel-button, #delete-cancel-button', function () {
        var $overlay = $('#overlay');
        $overlay.removeClass('resources');
        $overlay.removeClass('active');
        $overlay.removeClass('link');
        $overlay.removeClass('drop');
        $overlay.removeClass('delete');
    });

    $(document).on('click', '#edit-user-wrapper', function (e) {
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
            $('#overlay').addClass('resources');
            globals.file = file;
        }
    });

    $(document).on('click', '#file-submit-button', function () {
        var formData = new FormData();
        var fileType = globals.file.name.replace(/^.*\./, '');
        var $fileNameInput = $('#file-name-input');

        formData.append('file', globals.file);
        formData.append('file_type', fileType);
        formData.append('file_name', $fileNameInput.val());

        $.ajax({
            headers: {"X-CSRFToken": $('input[name="csrfmiddlewaretoken"]').attr('value')},
            url: globals.base_url + '/resource_upload/',
            data: formData,
            type: "POST",
            cache: false,
            contentType: false,
            processData: false,
            success: function (response) {
                console.log(JSON.stringify(response));
                $('#file-cancel-button').click();
                var $fileWrapper = $('#file-wrapper');
                globals.resources = response['resources'];
                $fileWrapper.empty();
                $fileWrapper.append(resourceTemplate(globals.resources));
                $fileNameInput.val('');
            }
        });
    });
    //FILE UPLOAD//

    //LINK//
    $(document).on('click', '#empty-link-wrapper, #link-button', function (e) {
        e.stopPropagation();
        var $overlay = $('#overlay');
        $overlay.addClass('active');
        $overlay.addClass('link');
    });

    $(document).on('click', '#link-submit-button', function () {
        var $linkInput = $('#link-input');
        var $linkNameInput = $('#link-name-input');

        $.ajax({
            headers: {"X-CSRFToken": $('input[name="csrfmiddlewaretoken"]').attr('value')},
            url: globals.base_url + '/create_link/',
            data: {'url': $linkInput.val(), 'name': $linkNameInput.val()},
            dataType: 'json',
            type: "POST",
            success: function (response) {
                console.log(JSON.stringify(response));
                $('#link-cancel-button').click();
                var $linkWrapper = $('#link-wrapper');
                globals.links = response['links'];
                $linkWrapper.empty();
                $linkWrapper.append(linksTemplate(globals.links));
                $linkInput.val('');
                $linkNameInput.val('');
            }
        });
    });
    //LINK//

    //DELETE//
    $(document).on('click', '#delete-wrapper', function (e) {
        e.stopPropagation();
    });

    $(document).on('click', '.delete-button', function (e) {
        e.stopPropagation();
        var $this = $(this);

        var $file = $this.closest('.file');
        var $link = $this.closest('.link');

        if($file.length) {
            var type = 'file';
            var id = $file.attr('data-id');
        } else {
            type = 'link';
            id = $link.attr('data-id');
        }

        var $deleteSubmitButton = $('#delete-submit-button');
        var $overlay = $('#overlay');

        $deleteSubmitButton.attr('data-id', id);
        $deleteSubmitButton.attr('data-type', type);

        $('#delete-resource-id').text(id);
        $('#delete-type').text(type);

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
            url: globals.base_url + '/delete_resource/',
            data: {'type': $(this).attr('data-type'), 'id': $(this).attr('data-id')},
            dataType: 'json',
            type: "POST",
            success: function (response) {
                $('#delete-cancel-button').click();
                globals.resources = response['resources'];
                globals.links = response['links'];

                var $fileWrapper = $('#file-wrapper');
                var $linkWrapper = $('#link-wrapper');

                $fileWrapper.empty();
                $linkWrapper.empty();

                if(globals.resources.length) {
                    $fileWrapper.append(resourceTemplate(globals.resources));
                } else {
                    $fileWrapper.append(emptyResourceTemplate(globals.resources));
                }

                if(globals.links.length) {
                    $linkWrapper.append(linksTemplate(globals.links));
                } else {
                    $linkWrapper.append(emptyLinksTemplate(globals.links));
                }
            }
        });
    });
    //DELETE//

    //SEARCH//
    $(document).on('keyup', '#search-input', function () {
        var value = $(this).val().replace(' ', '').replace('-', '').toLowerCase();
        var $items = $('#file-table').find('tbody tr');

        for (var i = 0; i < $items.length; i++) {
            var $currentItem = $($items[i]);
            var currentName = $currentItem.find('.file-name').text().replace(' ', '').replace('-', '').toLowerCase();
            var currentId = $currentItem.find('.file-id').text();

            if(currentName.indexOf(value) !== -1 || currentId.indexOf(value) !== -1) {
                $currentItem.show();
            } else {
                $currentItem.hide();
            }
        }

        var $links = $('#link-table').find('tbody tr');

        for (var l = 0; l < $links.length; l++) {
            $currentItem = $($links[l]);
            currentName = $currentItem.find('.link-name a').text().replace(' ', '').replace('-', '').toLowerCase();
            currentId = $currentItem.find('.link-id').text();

            if(currentName.indexOf(value) !== -1 || currentId.indexOf(value) !== -1) {
                $currentItem.show();
            } else {
                $currentItem.hide();
            }
        }
    });
    //SEARCH//
});