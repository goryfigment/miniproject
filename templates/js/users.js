require('./../css/general.css');
require('./../css/users.css');
require('./../css/sortable.css');

require('./../library/fontawesome/fontawesome.js');
var $ = require('jquery');
require('./../js/sortable.js');
var userTemplate = require('./../handlebars/users.hbs');


function init() {
    var $userWrapper = $('#user-wrapper');
    $userWrapper.append(userTemplate(globals.users));
}

function checkEmail(email) {
    return /\S+@\S+\.\S+/.test(email);
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

    $(document).on('click', '#resources-link', function () {
        window.location.replace(globals.base_url + '/resources');
    });

    $(document).on('click', '#users-link', function () {
        window.location.replace(globals.base_url + '/users');
    });

    //OVERLAY//
    $(document).on('click', 'body, #edit-user-cancel-button, #delete-cancel-button', function () {
        var $overlay = $('#overlay');
        $overlay.removeClass('active');
        $overlay.removeClass('edit-user');
        $overlay.removeClass('delete');
    });

    $(document).on('click', '#edit-user-wrapper, #delete-wrapper', function (e) {
        e.stopPropagation();
    });
    //OVERLAY//

    //EDIT USER//
    $(document).on('click', '#edit-button', function (e) {
        var $this = $(this);
        e.stopPropagation();
        var $overlay = $('#overlay');
        $overlay.addClass('active');
        $overlay.addClass('edit-user');

        var user = globals.users[$this.closest('.user').attr('data-id')];

        $('#first-name').val(user['first_name']);
        $('#last-name').val(user['last_name']);
        $('#email').val(user['email']);
        $('#username-input').val(user['username']);
        $('#password1').val('');
        $('#password2').val('');
        $('#edit-user-submit-button').attr('data-id', user['id']);
    });

    $(document).on('click', '#edit-user-submit-button', function () {
        var $errors = $('.error');
        $errors.hide();

        var username = $('#username-input').val();
        var password1 = $('#password1').val();
        var password2 = $('#password2').val();
        var email = $('#email').val();
        var firstName = $('#first-name').val();
        var lastName = $('#last-name').val();
        var id = $(this).attr('data-id');

        // Check if username is greater than 2 characters or less than 16
        if(username.length <= 2 || username.length >= 16) {
            var $error = $('.error.username');
            $error.text('Username must be between 3 to 15 characters.');
            $error.show();
        }

        //Check if password matches
        if(password1 != password2) {
            $error = $('.error.password');
            $error.text('Confirmed password must match.');
            $error.show();
        }

        // Check if password is 8 characters or more.
        if(password1 != '' && password1.length <= 7) {
            $error = $('.error.password');
            $error.text('Password must be 8 characters or more.');
            $error.show();
        }

        if(!checkEmail(email)) {
            $error = $('.error.email');
            $error.text('Must be a valid email.');
            $error.show();
        }

        if(firstName.length == 0) {
            $error = $('.error.first-name');
            $error.show();
        }

        if(lastName.length == 0) {
            $error = $('.error.last-name');
            $error.show();
        }

        var postData = {
            'id': id,
            'username': username,
            'email': email,
            'password': password1,
            'first_name': firstName,
            'last_name': lastName
        };

        $.ajax({
            headers: {"X-CSRFToken": $('input[name="csrfmiddlewaretoken"]').attr('value')},
            url: globals.base_url + '/edit_user/',
            data: postData,
            dataType: 'json',
            type: "POST",
            success: function (response) {
                globals.users = response['users'];
                var $userWrapper = $('#user-wrapper');
                $userWrapper.empty();
                $userWrapper.append(userTemplate(globals.users));

                $('#edit-user-cancel-button').click();
                //window.location.replace(globals.base_url + '/dashboard');
            },
            error: function (response) {
                console.log(JSON.stringify(response.responseJSON));
                var error = response.responseJSON['error_msg'];

                if (error == 'Must have an access code.') {
                    var $error = $('.error.code');
                    $error.text(error);
                    $error.show();
                } else if(error == 'Invalid access code.') {
                    $error = $('.error.code');
                    $error.text(error);
                    $error.show();
                }

                if (error == 'Username must be between 3 to 15 characters.') {
                    $error = $('.error.code');
                    $error.text(error);
                    $error.show();
                } else if(error == 'Username exists.') {
                    $error = $('.error.username');
                    $error.text('Username is not available.');
                    $error.show();
                }

                if (error == 'Password must be 8 characters or more.') {
                    $error = $('.error.password');
                    $error.text(error);
                    $error.show();

                } else if(error == 'Invalid password.') {
                    $error = $('.error.password');
                    $error.text('Password must contain letter and digit.');
                    $error.show();
                }

                if(error == 'Invalid email.') {
                    $error = $('.error.email');
                    $error.text('Must be a valid email.');
                    $error.show();
                } else if(error == 'Email exists.') {
                    $error = $('.error.email');
                    $error.text('Email is not available.');
                    $error.show();
                }

                if(error == 'Must have a first name.') {
                    $error = $('.error.email');
                    $error.show();
                }

                if(error == 'Must have a last name.') {
                    $error = $('.error.email');
                    $error.show();
                }
            }
        });
    });
    //EDIT USER//

    //DELETE//
    $(document).on('click', '#delete-wrapper', function (e) {
        e.stopPropagation();
    });

    $(document).on('click', '#delete-button', function (e) {
        e.stopPropagation();
        var $this = $(this);
        var $user = $this.closest('.user');
        var $overlay = $('#overlay');

        $('#delete-username').text($user.attr('data-username'));
        $('#delete-submit-button').attr('data-id', $user.attr('data-id'));

        $overlay.addClass('delete');
    });

    $(document).on('click', '#delete-submit-button', function () {
        $.ajax({
            headers: {"X-CSRFToken": $('input[name="csrfmiddlewaretoken"]').attr('value')},
            url: globals.base_url + '/delete_user/',
            data: {'id': $(this).attr('data-id')},
            dataType: 'json',
            type: "POST",
            success: function (response) {
                $('#delete-cancel-button').click();
                globals.users = response['users'];
                var $userWrapper = $('#user-wrapper');
                $userWrapper.empty();
                $userWrapper.append(userTemplate(globals.users));
            }
        });
    });
    //DELETE//
});