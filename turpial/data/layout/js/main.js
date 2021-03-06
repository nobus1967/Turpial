var arg_sep = '<% @arg_sep %>';
var maxcharlimit = 140;
var num_columns = <% @num_columns %>;
var friends = [];

$(document).ready(function() {
    recalculate_column_size();
    $('#alert-message').click(function() {
        hide_notice();
    });
    $('a').live('click', (function(){
        this.blur();
    }));
    $(window).resize(function() {
        recalculate_column_size();
    });
    enable_key_events();
    $('#imageview').click(function() {
        hide_imageview();
    });
});

function recalculate_column_size(nw, nh) {
    var width = window.innerWidth;
    var height = window.innerHeight;
    if (nw != undefined)
        width = nw;
    if (nh != undefined)
        height = nh;
    
    var content_height = height - 23;
    var column_width = (width / num_columns) - 1;
    var column_height = content_height;
    var wrapper_height = height - 32;
    var list_width = column_width - 11;
    var list_height = column_height - 35;
    var combo_width = column_width - 60;
    var tweet_width = column_width - 92;
    var update_msg_width = width - 12;
    
    var alert_msg_width = width - 60;
    var alert_msg_left = 20;
    var alert_lbl_width = alert_msg_width - 35;
    
    var profile_win_left = (width - 290) / 2;
    var autocomplete_win_left = (width - 200) / 2;
    
    $('#content').css('height', content_height + 'px');
    $('.column').css('width', column_width + 'px');
    $('.column').css('height', column_height + 'px');
    $('.wrapper').css('height', wrapper_height + 'px');
    $('.wrapper').css('width', column_width + 'px');
    
    $('.list').css('height', list_height + 'px');
    $('.list').css('width', list_width + 'px');
    $('.combo').css('width', combo_width + 'px');
    $('.tweet .content').css('width', tweet_width + 'px');
    
    $('.message-container').css('width', update_msg_width + 'px');
    
    $('#alert-message').css('width', alert_msg_width + 'px');
    $('#alert-message').css('left', alert_msg_left + 'px');
    $('#alert-label').css('width', alert_lbl_width + 'px');
    
    $('#profile-window').css('left', profile_win_left + 'px');
    $('#autocomplete-window').css('left', autocomplete_win_left + 'px');
}

function change_num_columns(num) {
    num_columns = num;
}

function enable_trigger() {
    $('.content').mouseover(function() {
        var name = $(this).attr('name');
        var indicator = $('#indicator-' + name).val();
        if (indicator != "") return;
        $('#buttonbox-' + name).show();
    });
    
    $('.content').mouseleave(function() {
        var name = $(this).attr('name');
        $('#buttonbox-' + name).hide();
    });
}

function enable_key_events() {
    $('#update-message').keyup(function(e) {
        count_chars();
    });
    
    $('#update-message').keydown(function(e) {
        if (e.keyCode == 27) {
            close_update_box();
            e.stopPropagation();
            return;
        } else if (e.keyCode == 13) {
            /* TODO: Submit with Enter */
            console.log('submit with enter');
            e.stopPropagation();
            return;
        }
    });
    
    /* Activate autocomplete dialog */
    $('#update-message').keypress(function(event) {
        if (event.which == 64) {
            event.stopPropagation();
            var index = $(this).getCursorPosition();
            var text = $('#update-message').val();
            if (index == 0) {
                show_autocomplete_for_status(index);
            } else {
                var prev = text.substr(index - 1, 1);
                if (prev == ' ') {
                    show_autocomplete_for_status(index);
                }
            }
            return;
        }
    });
    
    $('#autocomplete-username').keyup(function(e) {
        e.preventDefault();
        e.stopPropagation();
        if (e.keyCode == 27) {
            close_autocomplete_window();
        } else if (e.keyCode == 13) {
            eval($('#autocomplete-add-function').val());
        }
    });
}

/* Columns */

function add_column() {
    num_columns++;
    recalculate_column_size();
}

function remove_column(column_id) {
    $('#column-' + column_id).remove();
    num_columns--;
    recalculate_column_size();
}

function reset_column(column_id) {
    $('#list-' + column_id).animate({scrollTop : 0},1000);
}

/* Updatebox */

function show_update_box(message, status_id, account_id, title) {
    $('#modal').fadeIn();
    $('#update-box').fadeIn();
    $('#upload-img-cmd').show();
    $('#direct-message-to').val('');
    
    if (title == undefined) {
        $('#update-box-title').html("<% $whats_happening %>");
    } else {
        $('#update-box-title').html(title);
    }
    
    if (message != undefined) {
        console.log('message ' + message);
        $('#update-message').focus().val(message);
        count_chars();
    }
    
    $('#update-message').focus();
    
    if (status_id != undefined) {
        $('#in-reply-to-id').val(status_id);
        $('.acc_selector').each(function() {
            $(this).attr('disabled', 'disabled');
            $(this).attr('checked', false);
        });
        $('#acc-selector-' + account_id).attr('checked', true);
    }
}

function show_update_box_for_direct(user) {
    $('#update-box').fadeIn();
    $('#upload-img-cmd').hide();
    $('#update-box-title').html("<% $send_message_to %> " + user);
    $('#direct-message-to').val(user);
    $('#update-message').focus();
}

function close_update_box() {
    var status = $('#update-box').attr('name');
    if (status != '') return;
    hide_notice();
    $('#update-box').fadeOut(400, reset_update_box);
    $('#modal').fadeOut(400);
}

function done_update_box(recalculate) {
    $('#update-box').attr('name', '');
    if ((recalculate != undefined) && (recalculate == true)) {
        recalculate_column_size();
        enable_trigger();
    }
    close_update_box();
}

function done_update_box_with_direct() {
    $('#update-box').attr('name', '');
    close_update_box();
}

function reset_update_box() {
    $('#update-message').val('');
    $('#in-reply-to-id').val('');
    $('#char-counter').html('140');
    $('#char-counter').removeClass('maxchar');
    unlock_update_box();
}

function update_status_error(message) {
    $('#update-box').attr('name', '');
    show_notice(message, 'error');
    unlock_update_box();
}

function broadcast_status_error(good_accounts, message) {
    $('#update-box').attr('name', '');
    show_notice(message, 'error');
    unlock_update_box();
    for (var i=0; i < good_accounts.length; i++) {
        var acc = good_accounts[i];
        $('#acc-selector-' + acc).attr('disabled', 'disabled');
        $('#acc-selector-' + acc).attr('checked', false);
    }
}

function lock_update_box(message) {
    $('#update-box').attr('name', message);
    $('#update-message').attr('disabled', 'disabled');
    $('.acc_selector').each(function() {
        $(this).attr('disabled', 'disabled');
    });
    $('#buttonbox-update').hide();
    $('#progress-box-updatebox').show();
    $('#progress-msg-updatebox').html(message);
}

function unlock_update_box() {
    $('#update-message').removeAttr('disabled');
    var in_reply = $('#in-reply-to-id').val();
    if (in_reply == '') {
        $('.acc_selector').each(function() {
            $(this).removeAttr('disabled');
        });
    }
    $('#update-box').attr('name', '');
    $('#progress-box-updatebox').hide();
    $('#progress-msg-updatebox').html('');
    $('#buttonbox-update').show();
}

function count_chars() {
    var count = maxcharlimit - $('#update-message').val().length;
    $('#char-counter').html(count);
    if (count < 10) {
        $('#char-counter').addClass('maxchar');
    } else {
        $('#char-counter').removeClass('maxchar');
    }
}

/* Statuses */

function lock_status(status_id, message) {
    $('#buttonbox-' + status_id).hide();
    $('.favmark-' + status_id).hide();
    $('#progress-box-' + status_id).show();
    $('#progress-msg-' + status_id).html(message);
    $('#indicator-' + status_id).val(message);
}

function unlock_status(status_id) {
    $('#progress-box-' + status_id).fadeOut(400, function() {
        $('#progress-msg-' + status_id).html('');
        $('#indicator-' + status_id).val('');
    });
}

function update_favorite_mark(status_id, cmd, label, visible) {
    $('#fav-mark-' + status_id).attr('href', cmd);
    $('#fav-mark-' + status_id).html(label);
    if (visible == true)
        $('#fav-icon-' + status_id).show();
    else
        $('#fav-icon-' + status_id).hide();
}

function update_retweeted_mark(status_id, cmd, label, visible) {
    $('#repeat-mark-' + status_id).attr('href', cmd);
    $('#repeat-mark-' + status_id).html(label);
    if (visible == true)
        $('#retweeted-icon-' + status_id).show();
    else
        $('#retweeted-icon-' + status_id).hide();
}

function update_profile_follow_cmd(cmd, label) {
    $('#profile-follow-cmd').attr('href', cmd);
    $('#profile-follow-cmd').html(label);
}

function update_profile_mute_cmd(cmd, label) {
    $('#profile-mute-cmd').attr('href', cmd);
    $('#profile-mute-cmd').html(label);
}

function delete_status(status_id) {
    $('#' + status_id).hide('slow', function(){ $('#' + status_id).remove(); });
}

/* Profile Window */

function show_profile_window(account_id, username) {
    $('#modal').fadeIn();
    $('#profile-window').fadeIn();
    $('#progress-box-profile-window').fadeIn();
    exec_command('cmd:show_profile:' + account_id + arg_sep + username);
}

function update_profile_window(profile) {
    $('#progress-box-profile-window').hide();
    $('#profile-window-content').html(profile).slideDown();
}

function send_direct_from_profile(username) {
    var message = $('#update-message');
    show_update_box_for_direct(username);
    close_profile_window(true);
    message.focus();
}

function profile_window_error(message) {
    $('#progress-box-profile-window').hide();
    show_notice(message, 'error');
}

function close_profile_window(keep_modal) {
    var status = $('#profile-window').attr('name');
    if (status != '') return;
    hide_notice();
    $('#profile-window').fadeOut(400, reset_profile_window);
    if ((keep_modal == undefined) || (keep_modal == false))
        $('#modal').fadeOut(400);
}

function reset_profile_window() {
    $('#profile-window-content').html('');
}

function lock_profile(message) {
    $('#profile-options').hide();
    $('#progress-box-profile-options').show();
    $('#progress-msg-profile-options').html(message);
    $('#indicator-profile-window').val(message);
}

function unlock_profile() {
    $('#progress-box-profile-options').hide();
    $('#progress-msg-profile-options').html('');
    $('#indicator-profile-window').val('');
    $('#profile-options').show();
}

/* Autocomplete */

function build_autocomplete_dialog(title, addcmd, index) {
    $('#modal').fadeIn();
    $('#modal').css('z-index', 101);
    if (index != undefined)
        $('#autocomplete-index').val(index);
    $('#autocomplete-window-title').html(title);
    $('#autocomplete-add-cmd').attr('href', 'javascript: ' + addcmd);
    $('#autocomplete-add-function').val(addcmd);
    $('#autocomplete-window').fadeIn();
    $('#autocomplete-username').focus();
}

function show_autocomplete_for_status(index) {
    build_autocomplete_dialog('<% $add_friend %>', 'select_friend();', index);
}

function show_autocomplete_for_direct() {
    build_autocomplete_dialog('<% $select_user %>', 'select_friend_for_direct();');
}

function close_autocomplete_window() {
    var status = $('#autocomplete-window').attr('name');
    if (status != '') return;
    $('#autocomplete-window').fadeOut(400, reset_autocomplete_window);
    if (!$('#update-box').is(":visible")) {
        $('#modal').fadeOut(400);
    }
}

function reset_autocomplete_window() {
    $('#autocomplete-index').val('');
    $('#autocomplete-username').val('');
    $('#modal').css('z-index', 99);
    if ($('#update-box').is(":visible")) {
        $('#update-message').focus();
    }
}

function lock_autocomplete() {
    $('#autocomplete-username').attr('disabled', 'disabled');
    $('#autocomplete-load-cmd').css('opacity', 0.4);
    $('#autocomplete-load-cmd').attr('href', '#');
    $('#buttonbox-autocomplete').hide();
    $('#progress-box-autocomplete').show();
}

function unlock_autocomplete() {
    $('#autocomplete-username').removeAttr('disabled');
    $('#autocomplete-load-cmd').attr('href', "javascript: load_friends();");
    $('#autocomplete-load-cmd').css('opacity', 1);
    $('#buttonbox-autocomplete').show();
    $('#progress-box-autocomplete').hide();
}

function load_friends() {
    lock_autocomplete();
    exec_command('cmd:load_friends');
}

function update_friends(array) {
    friends = array;
    var label = '';
    var plabel = "<% $friends %>";
    var slabel = "<% $friend %>";
    
    if (friends.length == 1)
        label = friends.length + ' ' + slabel;
    else
        label = friends.length + ' ' + plabel;
    
    $('#friends_counter').html(label);
    $("#autocomplete-username").autocompleteArray(friends, {delay:10, minChars:1, 
        matchSubset:1, maxItemsToShow:10, onItemSelect: autocomplete_friend});
    unlock_autocomplete();
}

function select_friend(value) {
    var username = null;
    if (username == undefined) {
        username = $('#autocomplete-username').val();
    } else {
        username = value;
    }
    var message = $('#update-message');
    var index = $('#autocomplete-index').val();
    var text = message.val();
    var prevtext = text.substr(0, index + 1);
    var nexttext = text.substr(index + 1, text.length);
    /*
    if (nexttext.substr(0) != ' ')
        username += ' '
    */
    var newtext = prevtext + username + nexttext;
    message.val(newtext);
    close_autocomplete_window();
    message.focus();
    message.setCursorPosition(index + 2 + username.length);
    count_chars();
}

function select_friend_for_direct() {
    close_autocomplete_window();
    show_update_box_for_direct($('#autocomplete-username').val());
}

function autocomplete_friend(value) {
    eval($('#autocomplete-add-function').val());
}

/* Images */

function show_imageview(img_url) {
    console.log(img_url);
    $('#modal').fadeIn();
    $('#imageview-window').fadeIn();
    if (img_url == undefined) {
        //Show the loading progress
    } else {
        $('#imageview').attr('src', img_url);
    }
}

function update_imageview(img_url) {
    $('#imageview').attr('src', img_url);
}

function hide_imageview() {
    $('#imageview-window').fadeOut(400, function() {
        $('#imageview').attr('src', '');
        $('#modal').fadeOut(400);
    });
}

/* Callbacks */

function start_updating_column(column_id) {
    $('#header-buttons-' + column_id).hide();
    $('#header-progress-' + column_id).show();
}

function stop_updating_column(column_id) {
    $('#header-buttons-' + column_id).show();
    $('#header-progress-' + column_id).hide();
    recalculate_column_size();
    enable_trigger();
}

function show_replies_to_status(status_id) {
    recalculate_column_size();
    enable_trigger();
    $('#replycontainer-' + status_id).fadeIn(1000);
    $('#bubble-' + status_id).show();
}

function hide_replies_to_status(status_id) {
    $('#bubble-' + status_id).hide();
    $('#replycontainer-' + status_id).fadeOut(1000);
}

function stop_updating_column(column_id) {
    $('#header-buttons-' + column_id).show();
    $('#header-progress-' + column_id).hide();
    recalculate_column_size();
    enable_trigger();
}

function append_status_to_timeline(account_id, html_status) {
    $('#list-' + account_id + '-timeline').prepend(html_status);
    recalculate_column_size();
    enable_trigger();
}

function mute_user(username, mute) {
    $('.tweet .content .name').each(function(){
        var html = $(this).html();
        var start = html.indexOf('>') + 1;
        var end = html.length - 4;
        var name = html.substring(start, end);
        if (name == username) {
            if (mute == true) {
                $(this).parent().parent().parent().hide();
            } else {
                $(this).parent().parent().parent().show();
            }
        }
    });
}

function set_update_box_message(message) {
    $('#update-message').val(message);
    count_chars();
    unlock_update_box();
}

/* Commands */

function update_status() {
    var selected = '';
    var in_reply_to_id = $('#in-reply-to-id').val();
    var direct_message_to = $('#direct-message-to').val();
    var text = $('#update-message').val();
    var accounts = 0;
    $('.acc_selector').each(function() {
        if ($(this).attr('checked')) {
            if (selected == '')
                selected = $(this).val();
            else
                selected += '|' + $(this).val();
            accounts += 1;
        }
    });
    
    if (accounts > 0) {
        if (text == '') {
            show_notice('<% $you_must_write_something %>', 'warning');
        } else if (text.length > maxcharlimit) {
            show_notice('<% $message_like_testament %>', 'warning');
        } else {
            if (direct_message_to != '') {
                /* Direct message */
                if (accounts > 1) {
                    show_notice('<% $can_send_message_to_one_account %>', 'warning');
                } else {
                    lock_update_box('<% $sending_message %>');
                    exec_command('cmd:direct_message:' + selected + arg_sep + direct_message_to + arg_sep + packstr(text));
                }
            } else {
                /* Regular status */
                lock_update_box('<% $updating_status %>');
                if (in_reply_to_id == ''){
                    exec_command('cmd:update_status:' + selected + arg_sep + packstr(text));
                } else {
                    exec_command('cmd:reply_status:' + selected + arg_sep + in_reply_to_id + arg_sep + packstr(text));
                }
            }
        }
    } else {
        show_notice('<% $select_account_to_post %>', 'warning');
    }
}

function quote_status(account_id, username, text) {
    //console.log(account_id + ',' + username + ',' + text);
    var rt = "RT @" + username + ": " + text;
    show_update_box(rt);
}

function reply_status(account_id, status_id, title, mentions) {
    //console.log(account_id + ',' + status_id + ',' + mentions);
    var msg = "";
    for (var i=0; i < mentions.length; i++) {
        msg += "@" + mentions[i] + " ";
    }
    show_update_box(msg, status_id, account_id, title);
}

function short_url() {
    var text = $('#update-message').val();
    
    if (text == '') {
        show_notice('<% $you_must_write_something %>', 'warning');
    } else {
        lock_update_box('<% $shorting_urls %>');
        exec_command('cmd:short_urls:' + packstr(text));
    }
}

function show_avatar(account_id, username) {
    show_imageview();
    exec_command('cmd:profile_image:' + account_id + arg_sep + username);
}
