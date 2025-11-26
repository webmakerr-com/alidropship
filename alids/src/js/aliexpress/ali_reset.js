jQuery(function($) {

    var lockBtn = false;

    var resetProduct = (function(){

        var $this = null,
            con = {
                total   : '#total_item',
                current : '#current_item'
            },
            obj = {
                form     : '#ads_setting-form',
                list     : '#ads_activities-list',
                progress : '#activity-list'
            },
            atc = {
                save   : '#js-saveSettings',
                reset : '#js-startNow',
                next   : '#js-getNext'
            },
            $tmpl = {
                settings : $('#ali-reset-settings').html(),
                item     : $('#item-product-template').html()
            },
            taskTimer = null;

        function renderSettingForm ( response ) {

            var target = $( obj.form );

            if( response ) {

                if ( response.hasOwnProperty( 'error' ) ) {
                    window.ADS.notify( response.error, 'danger' );
                } else {

                    target.html( window.ADS.objTotmpl( $tmpl.settings, response ) );
                    setTimeout( window.ADS.switchery( target ), 300 );

                    var total   = parseInt( $( con.total ).val() ),
                        current = parseInt( $( con.current ).val() );

                    if( current > 0 && total > 0 ) {
                        window.ADS.progress( $( obj.progress ), total, current );
                    }

                    $.event.trigger( {
                        type : "request:done",
                        obj  : '#'+$(obj.form).attr('id')
                    } );
                }
            }
        }

        function request(action, args, callback) {

            args = args !== '' && typeof args === 'object' ? window.ADS.serialize(args) : args;

            $.ajax({
                url: ajaxurl,
                data: {action: 'ads_reset_product', ads_action: action, args: args},
                type: 'POST',
                dataType: 'json',
                success: callback
            });
        }

        function resetActivity( response ) {

            var item = $( obj.list ).find('[data-post_id="' + response.post_id + '"]');
            let classNotify = response.notice_code === 'no_longer_available' ? 'color-red' : 'color-light-green';
            item.find('.status-message').html( $('<span/>', {class: classNotify}).text( response.notice ) );
            var price_item = item.find('.price-item');
            price_item.html( response.html_price );

            if(response.changePrice)
                price_item.addClass('price-'+response.changePrice);

            if(response.changeQuantity)
                price_item.addClass('quantity-'+response.changeQuantity);

            getNextProduct( response );
        }



        function getNextProduct( response ) {

            if (response.hasOwnProperty('error')) {

                window.ADS.notify(response.error, 'danger');

                window.ADS.btnUnLock(lockBtn);
                lockBtn = false;
            } else if ( response.hasOwnProperty( 'message' ) ) {

                window.ADS.notify(response.message, 'success');
                window.ADS.progress( $(obj.progress), 10, 10 );

                window.ADS.btnUnLock(lockBtn);
                lockBtn = false;
            } else {

                var $el = $( obj.list );

                if (!$el.find('.table-container').length)
                    $el.html($('<div/>', {class: 'table-container'}));

                $el = $el.find('.table-container');

                window.ADS.progress( $(obj.progress), response.total, response.current );

                var c = $el.find('.review-item');

                if (c.length >= 15) {
                    c.last().remove();
                }

                $el.prepend( window.ADS.objTotmpl( $tmpl.item, response.row ) );

                $( con.current ).val(response.current);

                if( ! response.row.url ) {
                    if(response.row.post_id)
                        $('[data-post_id="'+response.row.post_id+'"]').find('.status-message').html('');
                    reset(false);
                } else {

                    window.ADS.resetProduct(response.row.post_id, {
                        resetVariantStockPrice  : $('#resetAll').is(':checked'),
                        resetDescription : $('#resetDescription').is(':checked'),
                        resetFeaturedAndGallery    : $('#resetFeaturedAndGallery').is(':checked'),

                    }).then((response) => {
                        resetActivity(response);
                        clearTimeout(taskTimer);
                    }).catch((e)=>{
                        if(e.code === false){
                            clearTimeout(taskTimer);
                            request( 'next_product', $( obj.form ), getNextProduct );
                            return;
                        }else{
                            console.log(e);
                        }
                    })

                    taskTimer = setTimeout(function () {
                        window.ADS.aliExtension.startTask(response.row.url);
                    }, 60000);

                }
            }
        }

        function reset( first ) {

            var action = first ? 'first_product' : 'next_product';

            request( action, $( obj.form ), getNextProduct );
        }

        function checkStatus() {
            var inn = $('#interval').parents('.form-group');

            if( $(document).find('#enabled').is(':checked') ) {
                inn.show();
            } else {
                inn.hide();
            }
        }


        return {
            init: function(){

                $this = this;

                window.ADS.aliExtension.sleepTask(1);
                window.ADS.aliExtension.enableAjax();

                request( 'setting_form', '', renderSettingForm );

                $(document).on('click', atc.reset, function(e){

                    e.preventDefault();

                    $( obj.list ).html('');
                    $( atc.next ).remove();

                    lockBtn = $(this);
                    window.ADS.btnLock( lockBtn );

                    $( con.current ).val(0);

                    window.ADS.progress( $( obj.progress ), 0, 0 );

                    reset(true);
                });

                $(document).on('click', atc.next, function(e){

                    e.preventDefault();

                    $( obj.list ).html('');
                    $( atc.next ).remove();

                    lockBtn = $(atc.reset);
                    window.ADS.btnLock( lockBtn );

                    reset();
                });

                $(document).on('click', atc.save, function(e){

                    e.preventDefault();

                    lockBtn = $(this);
                    window.ADS.btnLock( lockBtn );

                    request( 'save_form', $(obj.form), renderSettingForm );
                });

                /*                $(document).on('click', '#js-reviewNext', function(e){

                                    e.preventDefault();

                                    $(this).remove();
                                    lockBtn = $('#js-reviewImport');

                                    window.ADS.btnLock( lockBtn );

                                    $('#current_item').val(0);

                                    importReviews(false);
                                });*/

                $(document).on('request:done', function(e) {
                    if( e.obj === obj.form ) {
                        checkStatus();
                    }
                });



            }
        };
    })();

    resetProduct.init();
});
