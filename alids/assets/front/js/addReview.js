function ttmessage_plugin(message = '',is_error = 0) {
    let message_cont = document.createElement('div');
    message_cont.classList.add('tt_message');
    message_cont.innerHTML = message;

    if(is_error){
        message_cont.classList.add('error_red');
    }

    document.body.append(message_cont);

    message_cont.style.display = 'block';
    setTimeout(function () {
        message_cont.style.display = 'none';
        message_cont.replaceWith('');
    },5000);

}

jQuery(function($) {
    let fileList = new Array();
    
    function isValid($form) {
        let $root = $('.conditions-review', $form);
        if(!$root.length){
            return true;
        }

        if(!$('.in-conditions-review', $form).is(':checked')){
            $('.conditions-help', $form).show();
            return false;
        }

        return true;

    }

    $('.in-conditions-review').on('change', function (e) {
        let check = $(this).is(':checked');
        $(this).closest('form').find('.conditions-help').toggle(!check);
    });

    $('.stars-container').rating();

    $('#review-file-upload').fileupload({
        url        : alidAjax.ajaxurl,
        dataType   : 'json',
        autoUpload : false
    }).on('fileuploadadd', function(e, data) {
        let typeFile = data.files[0].type.split('/');
        if (typeFile[0] != 'undefined' && typeFile[0] != 'image') {
            return false;
        }
        let params = data.files[0].name.split('.');
        params[0] = $.trim(params[0]).substring(0, 17) + "...";
        $('<p class="review_filenames" style="padding:10px 0px 0px 0px;">' + params.join("") + ' <i style="cursor:pointer;" class="glyphicon glyphicon-remove-circle remove-review-image" data-imagename="' + data.files[0].name + '"></i>;</p>').appendTo('.list-file');
        $.each(data.files, function(index, file) {
            fileList.push(data.files[index]);
        });

        $('.remove-review-image').on('click', function() {
            let imageName = $(this).data('imagename');
            $(this).parent('p').remove();
            $.each(fileList, function(index, value) {
                if (typeof value != 'undefined') {
                    if (imageName == value.name) {
                        fileList.splice(index, 1);
                    }
                }
            });
        });
    });

    $('form.addReviewForm').submit( function(event) {
        event.preventDefault();
        event.stopPropagation();

        let $form = $(this);

        if(!isValid($form)){
            return false;
        }

        if (fileList.length > 0) {
            $('#review-file-upload').fileupload(
                'send',
                {files: fileList}
            )
            .success(function(result, textStatus, jqXHR) {
                if (result.result == true) {
                    $form.trigger( 'reset' );
                    $('.stars .star').removeClass('fullStar');
                }
                ttmessage_plugin(result.message);

            })
            .error(function(jqXHR, textStatus, errorThrow) {
                ttmessage_plugin(jqXHR.responseText,1);
            })
            .complete(function(result, textStatus, jqXHR) {
                fileList = new Array();
                $('.review_filenames').remove();
            });
        } else {
            $.ajax({
                url: alidAjax.ajaxurl,
                type: "POST",
                data: $form.serialize(),
                dataType: 'json',
                success: function(xhr) {
                    if (xhr.result == true) {
                        fileList = new Array();
                        $form.trigger( 'reset' );
                        $('.review_filenames').remove();
                        $('.stars .star').removeClass('fullStar');
                    }
                    ttmessage_plugin(xhr.message);
                },
                error: function(xhr) {
                    ttmessage_plugin(xhr.responseText,1);
                 }
            });
        }
    });
});