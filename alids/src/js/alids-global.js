/**
 * Created by user on 18.05.2017.
 */
jQuery(function($){

    $('.alids-menu-thumbler').on('click', function(e){
        e.preventDefault();

        var show = $(this).data('show'),
            hide = $(this).data('hide');
        $(this).removeClass('active').hide();
        $('.menu-'+show).addClass('active').show();

        $('#adminmenu .'+show).removeClass('alids-invisible').addClass('alids-visible');
        $('#adminmenu .'+hide).removeClass('alids-visible').addClass('alids-invisible');
    });

    function toggleRender() {
        if($('[name="attach_tracking"]:checked').length){

            setTimeout(function () {
                if($('[name="attach_tracking"]').prop("checked")){
                    $('[name="re_send_mail_attach_tracking"]').prop("checked", true);
                    $('[name="re_send_mail_attach_tracking"]').click();
                    $('[name="re_send_mail_attach_tracking"]').prop("disabled", true);

                }
            }, 100)

        }else{
            $('[name="re_send_mail_attach_tracking"]').prop("disabled", false);
        }

    }

    $(document).on('request:done', function (e) {
        if (e.obj === '#ali_settings-tracking_service') {
            toggleRender();
        }
    });

    $('body').on('change', '#attach_tracking', function () {
        toggleRender();
    });
});
