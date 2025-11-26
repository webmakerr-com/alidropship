jQuery(function($) {

    function p2COserialize( $el ) {

        let serialized = $el.serialize();

        if( ! serialized )
            serialized = $el.find( 'input[name],select[name],textarea[name]' ).serialize();

        return serialized;
    }

    let $form         = $('#form_singleProduct'),
        $cover        = $('#js_cover_paypal'),
        buttons       = '#js_paypal-button-container',
        array_current = false,
        $loader       = $('#js_cover_paypal-loader');

    let ButtonComponent;

    function needUpdate( params ) {

        let args = params.split('&');
        let need = false;

        let new_array_current = [];
        let counting          = [];

        if( ! array_current )
            array_current = {};

        $.each(args, function (i,v) {

            let a = v.split('=');

            if( typeof counting[a[0]] !== 'undefined') {
                counting[a[0]] = counting[a[0]] + 1;
            } else {
                counting[a[0]] = 1;
            }

            let ki = a[0]+'-'+counting[a[0]];

            new_array_current[ki] = a[1];

            if( array_current[ki] === undefined || array_current[ki] !== a[1] ) {

                need = true;
            }
        });

        array_current = new_array_current;

        return need;
    }

    function completeOrder( details ) {
        $.ajax({
            url: alidAjax.ajaxurl,
            type: 'POST',
            dataType: 'json',
            async: true,
            data: {
                action : 'ads_pay_complete_order',
                type   : 'paypal',
                args   : details
            },
            success: (response) => {

                if( response.hasOwnProperty('error') ) {
                    window.Notify( response.error, 'danger' );
                    $cover.hide();
                } else if( response.hasOwnProperty('redirect') ) {
                    window.location.replace( response.redirect );
                }
            }
        });
    }

    function createButtons() {

        $loader.show();

        setTimeout( () => {

            let params = p2COserialize( $form );

            if( ! needUpdate(params) )
                return false;

            $.ajax({
                url: alidAjax.ajaxurl,
                type: 'POST',
                dataType: 'json',
                async: true,
                data: {
                    action : 'ads_pay_set_express_order',
                    args   : params
                },
                success: (response) => {

                    if( response.hasOwnProperty('purchase_units') ) {

                        let units = response.purchase_units;

                        if( ButtonComponent ) {
                            ButtonComponent.close();
                        }

                        ButtonComponent = paypal.Buttons({
                            style: {
                                layout  : 'vertical',
                                color   : 'gold',
                                shape   : 'rect',
                                label   : 'pay',
                                tagline : false
                            },
                            createOrder: function(data, actions) {

                                return actions.order.create({
                                    purchase_units : units
                                });
                            },
                            onApprove: function(data, actions) {

                                $cover.show();

                                data.reference_id = units[0].reference_id;

                                completeOrder( data );
                            }
                        });

                        ButtonComponent.render(buttons);

                        setTimeout( () => { $loader.hide(); }, 500 );

                    } else {

                        window.Notify( response.error, 'danger' );
                    }
                }
            });
        }, 1500 );
    }

    function getSku( sticker = true ) {

        let options = {
                line      : 'js-item-sku',
                variation : '[name="sku-meta-set[]"]'
            },
            error   = false,
            foo     = [];

        $form.find( options.variation ).each( function () {

            if ( $( this ).val().length === 0 && sticker !== false ) {

                $( this ).closest( options.line ).addClass('is-empty');

                error = true;

            } else {

                $( this ).closest( options.line ).removeClass('is-empty');

                foo.push( $( this ).val() );
            }

        } );

        if ( error ) return false;

        return { foo : foo }
    }

    function setupBtnExpress() {

        if ( getSku() === false ) {

            return false;
        } else {

            createButtons();
        }
    }

    let can_btn_setup = 0;
    let d = document.getElementById("js_paypal-button-container");

    if(d != null){
        function try_init_btns() {
            if( can_btn_setup === 1 ){
                setupBtnExpress();
                can_btn_setup = 2;
            }
        }

        function re_init_btns() {
            if( can_btn_setup === 2 ){
                setupBtnExpress();
            }
        }

        function can_init_btns(){
            setTimeout(() => {
                can_btn_setup = 1;
                if( d != null && d.offsetTop < $(window).height() ){
                    try_init_btns();
                }
            }, 400);
        }

        $(window).on('scroll',function () {
            try_init_btns();
        });

        $('body').on('changeSku', function () {
            if(can_btn_setup){
                re_init_btns();
            }else{
                can_init_btns();
            }
        });

        if( ! $(document).find('.js-product-sku').length ) {
            can_init_btns();
        }
    }




});