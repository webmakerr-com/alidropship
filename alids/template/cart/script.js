import addressAuto from './addressAuto.js';

function in_array( args, str ) {
    return args.includes(str);
}

function serialize_this($el) {
    let serialized = $el.serialize();
    if (!serialized)
        serialized = $el.find('input[name],select[name],textarea[name]').serialize();
    return serialized;
}



jQuery(function($){

    const checkout = ($('form#form_delivery').length);

    if( checkout ) {

        if(window.checkoutSettings && window.checkoutSettings.address_autocomplete)
            addressAuto.init();




        let steps = (function () {

            let obj = {
                data : {},
                stp : 1
            };

            let st = {
                btnStep1: '.js-save-step1',
                btnStep2: '.js-save-step2',
                hClass : 'box-hidden'
            };




            function setStep(stp) {

                obj.stp = stp;

                $.ajax({
                    url: alidAjax.ajaxurl,
                    type: 'POST',
                    dataType: 'json',
                    data: {
                        action: 'ads_save_checkout_form',
                        ads_action: 'step_checkout',
                        args: '',
                        step: stp
                    },
                    success: function (data) {

                        if (data.hasOwnProperty('error')) {
                            return;
                        }

                        $(window).trigger({ type: 'cart:step', step: stp, data: data });

                        render(stp, data);
                    }
                });
            }

            function render(stp, data) {
                renderPageEmpty(data);
                renderDiscount(data);
                if(!data.basket){
                    return;
                }

                obj.data = data;
                obj.stp = stp;

                if(window.ADS.Dispatcher){
                    window.ADS.Dispatcher.trigger('cart:render', data)
                }

                renderListOrders(data);

                $('.steps').addClass(st.hClass);
                $('.steps.step-' + data.step).removeClass(st.hClass);

                var basket = data.basket;

                $('.js-sub_total').text(basket.sub_total);
                let shipping_total = basket.shipping_total;
                if(shipping_total=='US $0.00'){
                    if($('.js-shipping_total').attr('data-free')!=''){
                        shipping_total = $('.js-shipping_total').attr('data-free');
                    }else{
                        shipping_total="FREE";
                    }

                }
                $('.js-shipping_total').text(shipping_total);
                if($('.js-cart-info-value').length)
                    $('.js-cart-info-value').text(basket.info.value);
                $('.js-total').html(basket.total);


                var box = $('.box-informer-cart'),
                    box2 = $('.box-step-2'),
                    box3 = $('.box-step-3');

                if (data.step === 1) {
                    box.addClass(st.hClass);
                    box2.addClass(st.hClass);
                    box3.addClass(st.hClass);
                } else if (data.step === 2) {
                    box.removeClass(st.hClass);
                    box2.removeClass(st.hClass);
                    box3.addClass(st.hClass);
                    $('.js-cartInfo-email').text(data.email);
                    $('.js-cartInfo-address').html(data.address);
                } else if (data.step === 3) {
                    box.removeClass(st.hClass);
                    box2.removeClass(st.hClass);
                    box3.removeClass(st.hClass);
                    $('.js-cartInfo-shipping').html(data.shipping_text);
                }

                $('.step1', '.link-step').toggleClass('active', data.step1 === 1);
                $('.step2', '.link-step').toggleClass('active', data.step2 === 1);
                $('.step3', '.link-step').toggleClass('active', data.step3 === 1);

                $('.step1, .step2, .step3', '.link-step').removeClass('current');
                $('.step' + data.step, '.link-step').addClass('current');

                if(data.basket.items){
                    if(data.basket.items.length>1 && !data.basket.isEqualShipping){
                        let trans_free = 'FREE';

                        if(window.ads_check_trans){
                            trans_free = ads_check_trans['free'];
                        }


                        let data_items = data.basket.items;
                        let item_tmpl = '';
                        for(let item in data_items){

                            let item_order_id = data_items[item]['order_id'];

                            item_tmpl += '<div class="shipping-item" data-id="'+item_order_id+'">'+
                                '<div class="order-title">'+
                                '<h3>'+data_items[item]['title']+'</h3>';
                            if(data_items[item]['variations']){
                                item_tmpl += '<span class="order-variations">'+data_items[item]['variations']+'</span>';
                            }

                            item_tmpl += '</div>'+
                                '<div class="box-shipping-order">';

                            for(let item_sh in data_items[item]['availableShipping']){
                                item_tmpl += '<label class="box-radio" for="shipping-'+item_sh+''+item_order_id+'">'+
                                    '<input class="js-order-shipping" data-asd1="'+data_items[item]['shipping_method']+'" data-asd2="'+item_sh+'" type="radio" name="order_shipping['+item_order_id+']" id="shipping-'+item_sh+''+item_order_id+'" value="'+item_sh+'" ';

                                if(data_items[item]['shipping_method'] === item_sh){
                                    item_tmpl += 'checked="checked"';
                                }

                                item_tmpl += '>'+
                                    '<span class="check"></span>'+
                                    '<span class="shipping-info">'+
                                    '<span class="shipping-title">'+data_items[item]['availableShipping'][item_sh]['title']+'</span>';

                                if(data_items[item]['availableShipping'][item_sh]['time']){
                                    item_tmpl += '<span class="shipping-time">'+data_items[item]['availableShipping'][item_sh]['time']+'</span>';
                                }

                                item_tmpl += '</span>'+

                                    '<span class="shipping-cost">';

                                if(data_items[item]['availableShipping'][item_sh]['cur_cost'] !== 'US $0.00'){
                                    item_tmpl += data_items[item]['availableShipping'][item_sh]['cur_cost'];
                                }else{
                                    item_tmpl += trans_free;
                                }

                                item_tmpl += '</span>'+

                                    '</label>';
                            }

                            item_tmpl += '</div>'+
                                '</div>';
                        }


                        $( '.box-shipping-cart' ).html('').hide();
                        $( '.box-shipping-orders' ).html( item_tmpl ).show();
                        $( '.box-shipping-orders' ).find('[value="'+data.shipping_method+'"]').prop('checked', true);
                    }else{
                        let trans_free = 'FREE';

                        if(window.ads_check_trans){
                            trans_free = ads_check_trans['free'];
                        }

                        let data_shipping = data.basket.shipping;
                        let ship_tmpl = '';

                        for(let ship in data_shipping){
                            ship_tmpl += '<label class="box-radio" for="shipping-'+ship+'">'+
                                '<input type="radio" name="shipping_cart" id="shipping-'+ship+'"'+
                                'value="'+ship+'" required="required">'+
                                '<span class="check"></span>'+
                                '<span class="shipping-info">'+
                                '<span class="shipping-title">'+data_shipping[ship]['title']+'</span>';
                            if(data_shipping[ship]['time']){
                                ship_tmpl += '<span class="shipping-time">'+data_shipping[ship]['time']+'</span>';
                            }

                            ship_tmpl += '</span>'+
                                '<span class="shipping-cost">';

                            if(data_shipping[ship]['cur_cost'] !== 'US $0.00'){
                                ship_tmpl += data_shipping[ship]['cur_cost'];
                            }else{
                                ship_tmpl += trans_free;
                            }

                            ship_tmpl += '</span>'+


                                '</label>';
                        }


                        $( '.box-shipping-orders' ).html('').hide();
                        $( '.box-shipping-cart' ).html( ship_tmpl ).show();
                        if(data.shipping_cart==0){
                            $( '.box-shipping-cart .box-radio input[type="radio"]:eq(0)' ).prop('checked', true);
                        }else{
                            $( '.box-shipping-cart' ).find('[value="'+data.shipping_cart+'"]').prop('checked', true);
                        }
                    }
                }




                if($( '.js-box-tax' ).length && data.basket.taxesRatesApply && !data.basket.isTaxIncluding){

                    let tax_tmpl = '';
                    let data_tax = data.basket.taxesRatesApply;

                    for(let tax in data_tax){
                        tax_tmpl += '<div class="row clearfix">'+
                            '<div class="pull-left">'+data_tax[tax]['name']+'</div>'+
                            '<div class="pull-right">'+data_tax[tax]['cur_value']+'</div>'+
                        '</div>'
                    }



                    $( '.js-box-tax' ).html( tax_tmpl );
                }

                if($( '.js-box-save' ).length && parseInt(data.basket.save)>0){

                    let trans_save = 'You Save';

                    if(window.ads_check_trans){
                        trans_save = ads_check_trans['save'];
                    }

                    let save_tmpl = '<div class="row clearfix">'+
                        '<div class="pull-left">'+trans_save+'</div>'+
                        '<div class="pull-right">'+data.basket.cur_save+'</div>'+
                    '</div>';

                     $( '.js-box-save' ).html( save_tmpl );
                }

                if($('.items_count').length){

                    let total_quantity=0;
                    basket.items.forEach(el=>total_quantity+=el.quantity)
                    $('.items_count').html(total_quantity);


                    if(total_quantity==1){
                        $('.items_plural').html($('.step_items').attr('data-item'));
                    }else{
                        $('.items_plural').html($('.step_items').attr('data-items'));
                    }
                }
                if($('.js-you_save').length){
                    $('.js-you_save').html(basket.cur_save);
                    if(parseInt(basket.save)>0){
                        $('.you_save').show();
                    }else{
                        $('.you_save').hide();
                    }
                }

                if(!data.basket.items.length){
                    $('.checkout-container-no').show();
                    $('.order-form').hide();
                }else{
                    $('.checkout-container-no').hide();
                    $('.order-form').show();
                }

                $('.checkout-main .order').fadeIn(500);

            }

            function btnLock( $el ) {
                $el.addClass('checkout-spinner').attr('disabled', true);
            }

            function btnUnLock( $el ) {
                setTimeout(function(){
                    if($el.length)
                        $el.removeClass('checkout-spinner').attr('disabled', false);
                },300);
            }

            function selectedShippingOrder() {
                $('.js-order-shipping').selectpicker();

                $('.js-order-shipping').on('change', function () {
                    var shipping = $(this).val();
                    var order_id = $(this).closest('.shipping-item').data('id');

                    $.ajax({
                        url: alidAjax.ajaxurl,
                        type: 'POST',
                        dataType: 'json',
                        data: {
                            action: 'ads_save_checkout_form',
                            ads_action: 'shipping_order',
                            shipping: shipping,
                            order_id: order_id
                        },
                        success: function (data) {

                            if (data.hasOwnProperty('error')) {
                                //todo чтото вывести
                            } else {
                                $(window).trigger('cart:shipping');
                                render(obj.stp, data);
                            }

                        }
                    });
                });
            }

            function dis(discount){
                $('[name="discount"]').val(discount).change();

                btnLock($( '.discount-apply') );
                $('.js-btn-pay').addClass('js-btn-pay-blocked');
                $('.payment-fields.paypal').addClass('js-btn-pay-blocked');

                $.ajax({
                    url: alidAjax.ajaxurl,
                    type: 'POST',
                    dataType: 'json',
                    data: {
                        action: 'ads_save_checkout_form',
                        ads_action: 'coupon',
                        discount: discount
                    },
                    success: function (data) {
                        if (data.hasOwnProperty('error')) {
                            //todo чтото вывести
                        } else {
                            $(window).trigger('cart:discount');
                            render(data.step, data);
                            $('.js-btn-pay-blocked').removeClass('js-btn-pay-blocked');
                            if(typeof createButtons === 'function'){
                                createButtons(true);
                            }


                        }

                        btnUnLock($( '.discount-apply') );
                    }
                });

            }

            function renderDiscount(data) {
                $('[name="discount"]').val(data.discount).parent().addClass('is-not-empty');
                if(data.discount){
                    $('[name="discount"]').parent().addClass('is-not-empty');
                }

                if(data.layout.type == 'DiscountTrue'){
                    $('.help-discount').removeClass('error').show().text(data.layout.message).parent().removeClass('is-empty').addClass('is-not-empty');
                }else if(data.layout.type == 'DiscountFalse'){
                    $('.help-discount').addClass('error').show().text(data.layout.message).parent().removeClass('is-empty').addClass('is-not-empty');
                }else{
                    $('.help-discount').hide();
                }
            }

            function renderListOrders(data) {
                if(!data.basket.items.length){
                    return;
                }



                let trans_remove = 'Remove';

                if(window.ads_check_trans){
                    trans_remove = ads_check_trans['remove'];
                }
                let is_remove = 1;

                if(window.ads_check_option){
                    is_remove = parseInt(ads_check_option['can_remove']);
                }


                let data_items = data.basket.items;
                let item_tmpl = '';
                for(let item in data_items){

                    item_tmpl += '<div class="order-item" data-id="'+data_items[item]['order_id']+'">'+
                                '<div class="flex-1">'+
                                    '<div class="order-thumb">'+
                                        '<div class="wrap-img"><img src="'+data_items[item]['thumb']+'"></div>'+
                                        '<span class="order-quantity">'+data_items[item]['quantity']+'</span>';
                                        if(is_remove){
                                            item_tmpl += '<a href="javascript:;" class="order-item-remove">'+trans_remove+'</a>';
                                        };
                    item_tmpl += '</div>'+
                                    '<div class="flex-1 order-title">'+
                                        '<h3>'+data_items[item]['title']+'</h3>';

                                        if(data_items[item]['variations']){
                                            item_tmpl += '<span class="order-variations">'+data_items[item]['variations']+'</span>';
                                        }

                    item_tmpl += '</div>'+
                                '</div>'+
                                '<div class="price">'+data_items[item]['total_salePrice']+'</div>'+
                            '</div>';



                }





                $( '.orders-list' ).html( item_tmpl );
            }

            function renderListOrders_cart(data) {
                if(!data.items.length){
                    return;
                }

                let trans_remove = 'Remove';

                if(window.ads_check_trans){
                    trans_remove = ads_check_trans['remove'];
                }
                
                
                let is_remove = 1;

                if(window.ads_check_option){
                    is_remove = parseInt(ads_check_option['can_remove']);
                }


                let data_items = data.basket.items;
                let item_tmpl = '';
                for(let item in data_items){

                    item_tmpl += '<div class="order-item" data-id="'+data_items[item]['order_id']+'">'+
                        '<div class="flex-1">'+
                        '<div class="order-thumb">'+
                        '<div class="wrap-img"><img src="'+data_items[item]['thumb']+'"></div>'+
                        '<span class="order-quantity">'+data_items[item]['quantity']+'</span>';
                    if(is_remove){
                        item_tmpl += '<a href="javascript:;" class="order-item-remove">'+trans_remove+'</a>';
                    };
                    item_tmpl += '</div>'+
                        '<div class="flex-1 order-title">'+
                        '<h3>'+data_items[item]['title']+'</h3>';

                    if(data_items[item]['variations']){
                        item_tmpl += '<span class="order-variations">'+data_items[item]['variations']+'</span>';
                    }

                    item_tmpl += '</div>'+
                        '</div>'+
                        '<div class="price">'+data_items[item]['total_salePrice']+'</div>'+
                        '</div>';



                }





                $( '.orders-list' ).html( item_tmpl );
            }

            function renderPageEmpty(data) {
                if(data.basket && data.basket.items.length){
                    $('.checkout-container-no').hide();
                    $('#form_delivery').show();
                }else{
                    $('.checkout-container-no').show();
                    $('#form_delivery').hide();
                }
            }

            function validStateSelect(){

                var error = false;

                $('#js-cart-stateSelect, #js-billing_cart-stateSelect').each(function () {
                    var stateSelect = $(this);
                    stateSelect.closest('.field').removeClass('error-empty');
                    if(stateSelect.closest('.hasSelect').is(':visible') && stateSelect.closest('.hasSelect').length && !stateSelect.val()){
                        stateSelect.closest('.field').addClass('error-empty');
                        error = true;
                    }
                });
                return !error;
            }



            return {
                init: function () {

                    var $d = $(document);

                    this.register();
                    this.post_code();
                    selectedShippingOrder();

                    let saveOnSelect_busy=0;
                    let wait_step_busy = 0;


                    $('body').on('saveOnSelect',function(){
                        if(!saveOnSelect_busy){
                            saveOnSelect_busy=1;
                            $.ajax({
                                url: alidAjax.ajaxurl,
                                type: 'POST',
                                dataType: 'json',
                                data: {
                                    action: 'ads_save_checkout_form',
                                    ads_action: 'save',
                                    args: serialize_this($('.steps.step-1'))
                                },
                                success: function (data) {
                                    if (data.hasOwnProperty('error')) {
                                        //todo чтото вывести
                                    }
                                    $.ajax({
                                        url: alidAjax.ajaxurl,
                                        type: 'POST',
                                        dataType: 'json',
                                        data: {
                                            action: 'ads_save_checkout_form',
                                            ads_action: 'cart'
                                        },
                                        success: function (data) {
                                            if (data.hasOwnProperty('error')) {
                                                //todo чтото вывести
                                            } else {
                                                if(!wait_step_busy){
                                                    render(obj.stp, data);
                                                }
                                            }
                                            saveOnSelect_busy=0;
                                            wait_step_busy = 0;
                                            btnUnLock($( '.js-save-step1, .js-save-step2, .discount-apply') );
                                        }
                                    });
                                }
                            });
                            setTimeout(function () {
                                if(saveOnSelect_busy==1){
                                    btnLock($( '.js-save-step1, .js-save-step2, .discount-apply') );
                                }
                                saveOnSelect_busy=0;
                            },1000);
                        }


                    });

                    $(document).on('click', '.order-item-remove',function () {
                        var th = $(this).closest('.order-item');
                        th.remove();

                        $.ajax({
                            url: alidAjax.ajaxurl,
                            type: 'POST',
                            dataType: 'json',
                            data: {
                                action: 'ads_save_checkout_form',
                                ads_action: 'remove_oder',
                                order_id: th.attr('data-id')
                            },
                            success: function (data) {
                                if (data.hasOwnProperty('error')) {
                                    //todo чтото вывести
                                } else {
                                    $(window).trigger('cart:remove');
                                    render(obj.stp, data);
                                }
                            }
                        });

                    });

                    obj.stp = $('.link-step .current a').data('step') || 1;
                    if($('.step_checkout').length){
                        obj.stp= $('.step_checkout').attr('data-step');
                    }

                    $d.on('click', 'img.js-complete_order', function () {
                        $('.wrap-btn-pay').trigger('click');
                        $('[name="ads_checkout"]').trigger('click');
                    });

                    $d.on('change', '#postal_code',function () {
                        $('body').trigger('saveOnSelect');
                    });

                    $d.on('change', '#email',function () {
                        $('body').trigger('saveOnSelect');
                    });

                    $d.on('click', st.btnStep1, function (e) {
                        e.preventDefault();

                        var $el = $(this).parents('form');
                        if(!validStateSelect()){
                            $el.trigger({type: 'cart:check'});
                            if($('.step_checkout .error-empty').length){
                                if(document.body.clientWidth<768){
                                    $('body,html').stop().animate({scrollTop: $('.error-empty').offset().top - 100}, 500);
                                }
                            }
                            return false;
                        }

                        btnLock($( this) );

                        $el.trigger({type: 'cart:check', step: 1});
                        setTimeout(function () {
                            if($('.step_checkout .js-invalid_empty').length){
                                if(document.body.clientWidth<768){
                                    $('body,html').stop().animate({scrollTop: $('.js-invalid_empty').offset().top - 100}, 500);
                                }
                                btnUnLock($( '.js-save-step1, .js-save-step2') );
                            }
                            if($('#cpf:visible').length && $('#cpf').parent().is('.js-invalid_empty')){
                                btnUnLock($( '.js-save-step1, .js-save-step2') );
                            }
                            if($('#cpf2:visible').length && $('#cpf2').parent().is('.js-invalid_empty')){
                                btnUnLock($( '.js-save-step1, .js-save-step2') );
                            }
                        },200)
                    });



                    $('body').on('change', '#js-cart-stateSelect, #js-billing_cart-stateSelect', function(){
                        validStateSelect();
                    });

                    $d.on('click', st.btnStep2, function (e) {
                        e.preventDefault();

                        var $el = $(this).parents('form');

                        $('.box-shipping-cart').removeClass('error');
                        if($('.box-shipping-cart').length && $('[name="shipping_cart"]').length && !$('[name="shipping_cart"]:checked').val()){
                            $('.box-shipping-cart').addClass('error');
                            $el.trigger({type: 'cart:check'});
                            return false;
                        }

                        if(!validStateSelect()){
                            $el.trigger({type: 'cart:check'});
                            return false;
                        }

                        btnLock($( this) );
                        $el.trigger({type: 'cart:check', step: 2});
                        if($('.step_checkout').length){
                            $('.move-to-step[data-step="1"],.move-to-step[data-step="2"]').addClass('checked');
                            $('.step-1,.step-2').addClass('checked');
                        }

                    });

                    $d.on('click', '.move-step, .link-step li.active a, .box-informer-cart .edit a', function (e) {
                        e.preventDefault();
                        var step = $(this).attr('data-step');
                        if(obj.stp !== 1){
                            setStep(step);
                            return;
                        }

                        var $el = $(this).parents('form');
                        $el.trigger({type: 'cart:check', setStep: step});

                    });

                    $(window).on('cart:shipping',function () {
                       $('.move-to-step[data-step="1"]').addClass('checked');
                        $('.step-1').addClass('checked');
                    });

                    $d.on('click', '.move-to-step', function (e) {
                        e.preventDefault();
                        let step = $(this).attr('data-step');
                        if(obj.stp>=step){
                            $('.move-to-step[data-step]').removeClass('checked');
                            $('.steps').removeClass('checked');
                            for (let i=1;i<step;i++){
                                $('.move-to-step[data-step="'+i+'"]').addClass('checked');
                                $('.step-'+i).addClass('checked');
                            }
                            setStep(step);
                        }

                    });

                    $('[name="discount"]').keyup(function(e){
                        if(e.keyCode === 13) {
                            e.preventDefault();
                            var discount = $(this).val();
                            dis(discount);
                        }
                    });

                    $('#street').keyup(function(e){
                        $('#address').val($('#street').val()+' '+$('#house').val());
                    });

                    $('#house').keyup(function(e){
                        $('#address').val($('#street').val()+' '+$('#house').val());
                    });

                    $('#form_delivery').keydown(function(event) {
                        if(event.keyCode == 13) {
                            event.preventDefault();
                        }
                    });

                    $d.on('click', '[name="type"]', function(){
                        $.ajax({
                            url: alidAjax.ajaxurl,
                            type: 'POST',
                            dataType: 'json',
                            data: {
                                action: 'ads_save_checkout_form',
                                ads_action: 'save_payment',
                                type: $(this).val()
                            },
                            success: function (data) {
                                if (data.hasOwnProperty('error')) {
                                    //todo чтото вывести
                                }else{
                                    render(obj.stp, data);
                                }
                            }
                        });
                    });

                    $d.on('change', '[name="shipping_cart"]', function(){

                        $.ajax({
                            url: alidAjax.ajaxurl,
                            type: 'POST',
                            dataType: 'json',
                            data: {
                                action: 'ads_save_checkout_form',
                                ads_action: 'save_shipping',
                                shipping_cart: $(this).val()
                            },
                            success: function (data) {
                                if (data.hasOwnProperty('error')) {
                                    //todo чтото вывести
                                } else {
                                    render(1, data);

                                    $(window).trigger('cart:shipping_saved');
                                }
                            }
                        });
                    });

                    $d.on('change', '.js-order-shipping', function(){

                        $.ajax({
                            url: alidAjax.ajaxurl,
                            type: 'POST',
                            dataType: 'json',
                            data: {
                                action: 'ads_save_checkout_form',
                                ads_action: 'shipping_order',
                                shipping: $(this).val(),
                                order_id: $(this).parents('.shipping-item').attr('data-id')
                            },
                            success: function (data) {
                                if (data.hasOwnProperty('error')) {
                                    //todo чтото вывести
                                } else {
                                    render(1, data);

                                    $(window).trigger('cart:shipping_saved');
                                }
                            }
                        });
                    });


                    $d.on('click', '.discount-apply', function () {
                        var discount = $(this).parent().find('[name="discount"]').val();
                        dis(discount);
                    });

                    let ajax_busy = 0;

                    $d.on('form:validated', function (e) {
                        //todo если step > 2 то не отправлять запрос, там уже редирект на чекаут идёт или оплата
                        btnUnLock($( '.js-save-step1, .js-save-step2') );
                        console.log('tosave');
                        console.log('ajax_busy'+ajax_busy);
                        if(!e.error){
                            if (e.step && ajax_busy===0) {

                                let stp = e.step;
                                ajax_busy=1;
                                $.ajax({
                                    url: alidAjax.ajaxurl,
                                    type: 'POST',
                                    dataType: 'json',
                                    data: {
                                        action: 'ads_save_checkout_form',
                                        ads_action: 'save_checkout',
                                        args: serialize_this($('.steps.step-' + e.step)),
                                        step: e.step
                                    },
                                    success: function (data) {
                                        if (data.hasOwnProperty('error')) {
                                            //todo чтото вывести
                                            ajax_busy=0;
                                        } else {
                                            ajax_busy=0;
                                            $(window).trigger('cart:shipping');
                                            $(window).trigger({ type: 'cart:step', step: stp, data: data });
                                            if(saveOnSelect_busy){
                                                wait_step_busy=1;
                                            }
                                            render(stp, data);
                                            if($('.onepage_checkout').length){
                                                if(!$('.onepage_valid1').length){
                                                    $('.onepage_checkout').addClass('onepage_valid1');
                                                    $('.onepage_checkout').trigger({type: 'cart:check',step:2});
                                                }else{


                                                    $('.onepage_checkout').addClass('onepage_valid2');
                                                    $('[name="ads_checkout"]').removeClass('btn-processed btn-clicked').click();

                                                    setTimeout(function () {
                                                        $('.onepage_checkout').removeClass('onepage_valid1 onepage_valid2');
                                                    },4000);

                                                    //$('.onepage_checkout').submit();
                                                }
                                            }
                                            if($('.step_checkout').length){
                                                if(document.body.clientWidth<769){
                                                    $(window).scrollTop($('.steps.step-'+data.step).offset().top - 19);
                                                }
                                            }
                                        }

                                    }
                                });
                            }

                            if (e.params.setStep) {
                                let step = e.params.setStep;
                                setStep(step);
                            }
                        }

                    });


                    $d.on('form:validated', function (e) {
                        if (!e.error && e.params.setStep) {
                            var step = e.params.setStep;
                            setStep(step);
                        }
                    });

                    $('#form_delivery').on('submit', function () {
                        $('[name="ads_checkout"]').addClass('btn-processed');
                    });


                    $('.onepage-wrap-btn-pay').on('click', function (e) {

                        if(!validStateSelect()){
                            $('body,html').stop().animate({scrollTop: $('.step-1').offset().top - 100}, 1000);
                            $(this).trigger({type: 'cart:check'});
                            $('[name="ads_checkout"]').removeClass('btn-processed btn-clicked');
                            return false;
                        }

                        if(!$('.onepage_valid1').length){
                            $(this).trigger({type: 'cart:check',step:1});
                        }

                        if ($('.js-btn-pay').find('[name="ads_checkout"][disabled="disabled"]').length) {
                            $('.conditions-help').text($('#readonly_text').text());
                            window.Notify($('#readonly_text').text(), 'danger');
                        }

                    });

                },
                post_code : function(){
                    $('#no_zip').on('change', function () {

                        var disable_block = $( '.no-zip-over' );
                        var input_postal_code = $( 'input#postal_code' );

                        if ($('#no_zip').prop('checked')) {
                            disable_block.css({ 'display' : 'block' });
                            input_postal_code.val('None').change();
                        } else {
                            disable_block.css({ 'display' : 'none' });
                            input_postal_code.val('').change();
                           // input_postal_code.closest('.field').addClass('is-empty').removeClass('is-not-empty, js-valid');
                        }

                        input_postal_code.trigger('blur');

                    });
                },
                register: function () {
                    var registerBox = $('input[name="register"]');
                    var country = $('select[name="country"]');
                    var that = this;

                    if (registerBox.length == 0) {
                        if (typeof country.attr('data-country-value') != 'undefined') {
                            $('select[name="country"] option[value="' + country.attr('data-country-value') + '"]').prop('selected', 'selected');
                        }
                    }

                    registerBox.on('change', function () {
                        var emailField = $('input[name="email"]');
                        $('.userExistsMessage').remove();
                        if (this.checked) {
                            that.checkUser(emailField.val());
                        } else {
                            that.hidePassword();
                        }
                    });
                },
                checkUser: function (email) {
                    var that = this;
                    if (email.length == 0) {
                        that.showPassword();
                        return false;
                    }

                    $.ajax({
                        url: alidAjax.ajaxurl,
                        type: "POST",
                        dataType: "json",
                        async: true,
                        data: {
                            action: "ads_validate_email",
                            email: email
                        },
                        success: function (xhr) {
                            if (xhr.result == false) {
                                that.showPassword();
                            } else {
                                var registerInput = $('input[name="register"]');
                                registerInput.parent()
                                    .append('<p class="userExistsMessage" style="display:inline;margin-left: 10px;color: red;">' + xhr.message + '</p>');
                            }
                        }
                    });
                },
                showPassword: function () {
                    $('.password_fields').prop('required', 'required');
                    $('#password-block').fadeIn('slow');
                },
                hidePassword: function () {
                    $('.password_fields').removeProp('required');
                    $('#password-block').fadeOut('slow');
                },
                validStateSelect(){
                    validStateSelect();
                }

            };
        })();

        steps.init();

        var readonly_checkbox = (function () {
            return {
                init: function () {
                    var box = $('.conditions');
                    if (box.length == 0) {
                        $('.wrap-btn-pay').hide();
                        return;
                    }

                    $('.wrap-btn-pay').show();

                    $('[name="ads_checkout"]').attr('disabled', true);
                    $('#conditions').on('change', function (e) {
                        var check = $('#conditions').is(':checked');
                        $('[name="ads_checkout"]').attr('disabled', !check);
                        $('.conditions-help').text('');
                        $('.wrap-btn-pay').toggle(!check);
                    });

                    $('.wrap-btn-pay').on('click', function () {
                        if ($('.js-btn-pay').find('[name="ads_checkout"][disabled="disabled"]').length) {
                            $('.conditions-help').text($('#readonly_text').text());
                            window.Notify($('#readonly_text').text(), 'danger');
                        }
                    });
                }
            }
        })();
        readonly_checkbox.init();

        var selectRegion = (function () {

            var $this;
            var state = {
                boostrap: true,
                country: '',
                countryBind: 'select.js-country-stateSelect',
                regionList: false,
                postalCode: false,
                region: ''
            };

            function renderRegion() {

                if (state.regionList) {
                    renderSelectRegion();
                } else {
                    renderInputRegion();
                }

                renderfindFields(state.country);

                //steps.validStateSelect();
            }

            function renderInputRegion() {

                var stateText = $('#js-cart-stateText');
                var select = $('#js-cart-stateSelect');
                var dataState = stateText.attr('data-state-value');

                select.html('').selectpicker('refresh').attr('name', '');
                select.closest('.field').removeClass('hasSelect').find('.bootstrap-select').hide();
                stateText.show().attr('name', 'state');
                if( dataState === 'None'){
                    stateText.val('');
                    stateText.attr('data-state-value', '');
                    stateText.parents('.field').addClass('js-valid');
                }

            }

            function renderSelectRegion() {
                var stateText = $('#js-cart-stateText');
                var select = $('#js-cart-stateSelect');
                var dataState = select.attr('data-state-value');

                select.attr('name', 'state');

                if (!dataState || dataState === 'None'){
                    dataState = '';
                    stateText.attr('data-state-value', '');
                }

                stateText
                    .attr('name', '')
                    .hide()
                    .closest('div')
                    .removeClass('js-valid js-invalid js-invalid_empty');

                $('#js-cart-stateText + span').hide();


                var options = '';
                for (var key in state.regionList) {
                    options += '<option value="' + key + '">' + state.regionList[key] + '</option>';
                }

                select.html(options);

                if ($('#js-cart-stateSelect option').length > 20){
                    $('#js-cart-stateSelect').data('live-search', 'true');
                }

                if (state.boostrap) {
                    select.closest('.field').addClass('hasSelect').find('.bootstrap-select').show();
                    if (dataState.length > 0) {
                        document.querySelectorAll('#js-cart-stateSelect option').forEach(function(el){
                            if(el.innerHTML === dataState){
                                document.querySelector('#js-cart-stateSelect').value = dataState;
                            }
                        });
                        select.selectpicker('refresh');
                    } else {
                        select.selectpicker('refresh');
                    }
                }
                $(select).on("changed.bs.select",
                    function() {
                        $('body').trigger('saveOnSelect');
                    });
                //stateText.val(dataState);
            }

            function setRegion() {

                state.regionList = false;

                $.ajax({
                    url: alidAjax.ajaxurl,
                    type: "POST",
                    dataType: "json",
                    async: true,
                    data: {
                        action: "ads_rg_list",
                        country: state.country
                    },
                    success: function (data) {
                        state.regionList = !$.isArray(data) ? data : false;
                        renderRegion();
                    }
                });
            }

            function setData() {
                state.country = $(state.countryBind + ' option:selected').val();
                setRegion();
                renderPostalCode(state.country);
                renderIsHouse(state.country);
                $('body').trigger('saveOnSelect');
            }

            function findFields( country ) {

                var args   = window.fieldsAccess;
                var fields = args[ 'fields' ][ 'default' ];

                $.each(args['countries'], function(k,v) {
                    if( in_array( v, country ) ) {
                        fields = args[ 'fields' ][ k ];
                    }
                });

                return fields;
            }

            function renderfindFields(country){
                var fileds       = findFields(country),
                    $stateSelect = $('#js-cart-stateSelect'),
                    $stateText   = $('#js-cart-stateText'),
                    $postalCode  = $('#postal_code'),
                    $cpf  = $('#cpf'),
                    $cpf2  = $('#cpf2');

                var $box_state     = $stateText.parent();
                var $box_post_code = $postalCode.parent();

                if( ! fileds.state ) {
                    $stateSelect.attr('name','');
                    $stateText.attr('name','state').val('None');
                    $box_state.addClass('box-hidden')
                } else {

                    if( $stateText.val() === 'None' )
                        $stateText.val('');

                    $box_state.removeClass('box-hidden');
                    if($('.step_checkout').length){
                        $box_state.find('.label_state').text(fileds.state);
                    }else{
                        $box_state.find('label').text(fileds.state);
                    }

                }

                if( ! fileds.postal_code ) {
                    $postalCode.val('None');
                    $box_post_code.addClass('box-hidden')
                } else {

                    if( $postalCode.val() === 'None' && (!$('#no_zip').length && $('#no_zip').prop('checked')) )
                        $postalCode.val('');

                    $box_post_code.removeClass('box-hidden');
                    if($('.postal_code_span').length){
                        $box_post_code.find('label[for="postal_code"]').find('.postal_code_span').text(fileds.postal_code);
                    }else{
                        $box_post_code.find('label[for="postal_code"]').text(fileds.postal_code);
                    }


                }

                if( ! fileds.cpf ) {
                    $cpf.val('').change();
                    $cpf.parent().addClass('box-hidden')
                } else {
                    $cpf.parent().removeClass('box-hidden');
                    $cpf.parent().find('label[for="cpf"]').text(fileds.cpf);
                }

                if( ! fileds.cpf2 ) {
                    $cpf2.val('').change();
                    $cpf2.parent().addClass('box-hidden')
                } else {
                    $cpf2.parent().removeClass('box-hidden');
                    $cpf2.parent().find('label[for="cpf2"]').text(fileds.cpf2);
                }

            }

            return {
                init: function () {
                    $this = this;

                    var $d = $(document);

                    $('.js-country-stateSelect').selectpicker('destroy');
                    $('#js-cart-stateSelect').selectpicker('destroy');

                    $d.find(state.countryBind).each(function (e) {
                        if ($(this).find('option').length > 20)
                            $(this).data('live-search', 'true');
                    }).selectpicker({enableCaseInsensitiveFiltering: true});

                    state.country = $(state.countryBind + ' option:selected').val();

                    setData();

                    $(state.countryBind).on('change', function () {
                        setData();
                        $('body').trigger('saveOnSelect');
                    });
                }
            };
        })();

        selectRegion.init();

        function renderPostalCode(country){
            let code = typeof ads_postal_code[country] !== "undefined" ? ads_postal_code[country] : false;

            if(code !== false){
                $('.no-zip-code').hide();
            }else{
                $('.no-zip-code').show();
            }

            if(!code || $('#postal_code').val()==''){
                return;
            }
            $('#postal_code').val($('#postal_code').val().toUpperCase());
            if($('#postal_code').val().match(code.reg)){
                $('#postal_code').parents('.field').removeClass('js-invalid').addClass('js-valid');
            }else{
                $('#postal_code').parents('.field').removeClass('js-valid').addClass('js-invalid');

                setTimeout(function(){
                    window.Notify(code.message, 'danger');
                },1000);

            }

        }

        function renderIsHouse(country){
            if(country==='DE' || country==='NL'){
                $('.noHouse').hide();
                $('.isHouse').show();
            }else{
                $('.noHouse').show();
                $('.isHouse').hide();
            }

        }

        var billing_selectRegion = (function () {

            var $this;
            var state = {
                boostrap: true,
                country: '',
                countryBind: 'select.js-billing_country-stateSelect',
                regionList: false,
                region: ''
            };

            function renderRegion() {

                if (state.regionList) {
                    renderSelectRegion();
                } else {
                    renderInputRegion();
                }

                renderfindFields(state.country);
            }

            function renderInputRegion() {
                var stateText = $('#js-billing_cart-stateText');
                var select = $('#js-billing_cart-stateSelect');
                var dataState = stateText.attr('data-state-value');

                select.html('').selectpicker('refresh').attr('name', '');
                select.closest('.field').removeClass('hasSelect').find('.bootstrap-select').hide();
                stateText.show().attr('name', 'billing_state');
                if( dataState === 'None'){
                    stateText.val('');
                    stateText.attr('data-state-value', '')
                }

            }

            function renderSelectRegion() {
                var stateText = $('#js-billing_cart-stateText');
                var select = $('#js-billing_cart-stateSelect');
                var dataState = select.attr('data-state-value');

                select.attr('name', 'billing_state');

                if (!dataState || dataState === 'None'){
                    dataState = '';
                    stateText.attr('data-state-value', '');
                }

                stateText
                    .attr('name', '')
                    .hide()
                    .closest('div')
                    .removeClass('js-valid js-invalid js-invalid_empty');

                $('#js-billing_cart-stateText + span').hide();


                var options = '';
                for (var key in state.regionList) {
                    options += '<option value="' + key + '">' + state.regionList[key] + '</option>';
                }

                select.html(options);

                if ($('#js-billing_cart-stateSelect option').length > 20){
                    $('#js-billing_cart-stateSelect').data('live-search', 'true');
                }

                if (state.boostrap) {
                    select.closest('.field').addClass('hasSelect').find('.bootstrap-select').show();
                    if (dataState.length > 0) {
                        document.querySelectorAll('#js-billing_cart-stateSelect option').forEach(function(el){
                            if(el.innerHTML === dataState){
                                document.querySelector('#js-billing_cart-stateSelect').value = dataState;
                            }
                        });
                        select.selectpicker('refresh');
                    } else {
                        select.selectpicker('refresh');
                    }
                }
                //stateText.val(dataState);
            }

            function setRegion() {

                state.regionList = false;

                $.ajax({
                    url: alidAjax.ajaxurl,
                    type: "POST",
                    dataType: "json",
                    async: true,
                    data: {
                        action: "ads_rg_list",
                        country: state.country
                    },
                    success: function (data) {
                        state.regionList = !$.isArray(data) ? data : false;
                        renderRegion();
                    }
                });
            }

            function setData() {
                state.country = $(state.countryBind + ' option:selected').val();
                setRegion();
                $('body').trigger('saveOnSelect');
            }

            function findFields( country ) {

                var args   = window.fieldsAccess;
                var fields = args[ 'fields' ][ 'default' ];

                $.each(args['countries'], function(k,v) {
                    if( in_array( v, country ) ) {
                        fields = args[ 'fields' ][ k ];
                    }
                });

                return fields;
            }

            function renderfindFields(country){
                var fileds       = findFields(country),
                    $stateSelect = $('#js-billing_cart-stateSelect'),
                    $stateText   = $('#js-billing_cart-stateText'),
                    $postalCode  = $('#billing_postal_code'),
                    $cpf         = $('#billing_cpf'),
                    $cpf2         = $('#billing_cpf2');

                var $box_state     = $stateText.parent();
                var $box_post_code = $postalCode.parent();

                if( ! fileds.state ) {
                    $stateSelect.attr('name','');
                    $stateText.attr('name','state').val('None');
                    $box_state.addClass('box-hidden')
                } else {

                    if( $stateText.val() === 'None' )
                        $stateText.val('');

                    $box_state.removeClass('box-hidden');
                    if($('.step_checkout').length){
                        $box_state.find('.label_state').text(fileds.state);
                    }else{
                        $box_state.find('label').text(fileds.state);
                    }
                }

                if( ! fileds.postal_code ) {
                    $postalCode.val('None');
                    $box_post_code.addClass('box-hidden')
                } else {

                    if( $postalCode.val() === 'None' )
                        $postalCode.val('');

                    $box_post_code.removeClass('box-hidden');
                    $box_post_code.find('label[for="postal_code"]').text(fileds.postal_code);
                }

                if( ! fileds.cpf ) {
                    $cpf.val('').change();
                    $cpf.parent().addClass('box-hidden')
                } else {
                    $cpf.parent().removeClass('box-hidden');
                    $cpf.parent().find('label[for="billing_cpf"]').text(fileds.cpf);
                }

                if( ! fileds.cpf2 ) {
                    $cpf2.val('').change();
                    $cpf2.parent().addClass('box-hidden')
                } else {
                    $cpf2.parent().removeClass('box-hidden');
                    $cpf2.parent().find('label[for="billing_cpf2"]').text(fileds.cpf2);
                }
            }

            return {
                init: function () {
                    $this = this;

                    var $d = $(document);

                    $('.js-billing_country-stateSelect').selectpicker('destroy');
                    $('#js-billing_cart-stateSelect').selectpicker('destroy');

                    $d.find(state.countryBind).each(function (e) {
                        if ($(this).find('option').length > 20)
                            $(this).data('live-search', 'true');
                    }).selectpicker({enableCaseInsensitiveFiltering: true});

                    state.country = $(state.countryBind + ' option:selected').val();

                    setData();

                    $(state.countryBind).on('change', function () {
                        setData();
                        $('body').trigger('saveOnSelect');
                    });
                }
            };
        })();

        billing_selectRegion.init();

        $('#enabled_billing_address').on('change', function () {
            if(!$(this).prop('checked'))
                $('.box_billing_address').fadeIn();
            else
                $('.box_billing_address').fadeOut();
        });

        var observe;

        if (window.attachEvent) {
            observe = function (element, event, handler) {
                element.attachEvent('on' + event, handler);
            };
        } else {
            observe = function (element, event, handler) {
                element.addEventListener(event, handler, false);
            };
        }

        (function () {
            var text = document.getElementById('description');
            if(text){
                function resize() {
                    text.style.height = 'auto';
                    text.style.height = text.scrollHeight + 'px';
                }

                /* 0-timeout to get the already changed text */
                function delayedResize() {
                    window.setTimeout(resize, 0);
                }

                observe(text, 'change', resize);
                observe(text, 'cut', delayedResize);
                observe(text, 'paste', delayedResize);
                observe(text, 'drop', delayedResize);
                observe(text, 'keydown', delayedResize);

                //text.focus();
                //text.select();
                resize();
            }

        })();

        let tab_on_run = 0;

        var payments = (function () {
            var $this;
            return {
                init: function () {
                    $this = this;
                    $('.payment-box .payment-item-radio').on('click', function () {
                        var payments = $('input[type="radio"]', this).prop('checked', true).val();
                        $this.activeTab(payments);
                    });

                    var payments = $('input[type="radio"]:checked', '.payment-box .payment-item-radio').val();
                    $this.activeTab(payments);
                },
                activeTab: function (payments) {
                    if ($('.payment-fields.' + payments + ':hidden').length && !tab_on_run) {
                        tab_on_run=1;
                        $('.payment-fields').hide(200);
                        $('.payment-fields.' + payments).slideDown(300);
                        setTimeout(function(){
                            tab_on_run=0;
                            },200)
                    }
                }
            }
        })();

        payments.init();

        $('.mobile-summary').on('click', function () {
            $('.mobile-summary').toggleClass('show');
        });


        $('.get_discount_field').on('click', 'a', function () {
            $('.box-discount').toggleClass('discount_disabled');
        });







/*        $(document).ready(function () {
            if(!$('.order').length ){
                return;
            }

            function r() {
                var obj = {
                    rh: $('.order').height(),
                    rleft: $('.order').offset().left,
                    lh: $('.inner-step').height(),
                    lleft: $('.inner-step').offset().left,
                    w: $(window).scrollTop()
                };

                if ($(window).height() > obj.lh && obj.lh < obj.rh && obj.rleft > obj.lleft) {
                    var h = obj.w - 68;
                    h = h > 0 ? h : 0;
                    $('.inner-step').css({top: h});
                } else {
                    $('.inner-step').css({top: 0});
                }
            }

            $(window).scroll(function () {
                r();
            });
            $(window).resize(function () {
                r();
            });
            r();
        });*/


        window.Notify = function ( text, style ,callback, close_callback ) {

            var time       = '10000';
            var $container = $( '#ads-notify' );
            var icon       = '<i class="fa fa-info-circle"></i>';

            if ( typeof style === 'undefined' ) style = 'warning';

            var html = $( '<div class="alert alert-' + style + '  hide">' + icon + " " + text + '</div>' );

            $( '<a>', {
                text  : '×',
                class : 'notify-close',
                href  : '#',
                click : function ( e ) {
                    e.preventDefault();
                    close_callback && close_callback();
                    remove_notice()
                }
            } ).prependTo( html );

            $container.prepend( html ).show();

            html.removeClass( 'hide' ).hide().fadeIn( 'slow' );

            function remove_notice() {
                $container.fadeOut( 'slow' );
                html.stop().fadeOut( 'slow' ).remove();
            }

            var timer = setInterval( remove_notice, time );

            $( html ).hover( function () {
                clearInterval( timer );
            }, function () {
                timer = setInterval( remove_notice, time );
            } );

            html.on( 'click', function () {
                clearInterval( timer );
                callback && callback();
                remove_notice();
            } );

            $('body').on( 'click', function () {
                clearInterval( timer );
                if($('#ads-notify .alert').length>1){
                    setTimeout(function(){
                        $('#ads-notify .alert:eq(0)').fadeOut('slow');
                        setTimeout(function(){
                            $('#ads-notify .alert:eq(0)').replaceWith('');
                        },500)
                    },5000)
                }

            } );
        };

        var ads_notify = $('#ads-notify');
        if(ads_notify.length && ads_notify.text()){
            var text = ads_notify.text();
            ads_notify.text('');
            window.Notify(text, 'danger');
        }

    }


    function check_countdown(dateEnd) {
        var timer, days, hours, minutes, seconds;

        dateEnd = new Date(dateEnd);
        dateEnd = dateEnd.getTime();

        if ( isNaN(dateEnd) ) {
            return;
        }

        timer = setInterval(calculate, 1000);

        function calculate() {
            var dateStart = new Date();
            var timeRemaining = parseInt((dateEnd - dateStart.getTime()) / 1000)

            if ( timeRemaining >= 0 ) {
                days    = parseInt(timeRemaining / 86400);
                timeRemaining   = (timeRemaining % 86400);
                hours   = parseInt(timeRemaining / 3600);
                timeRemaining   = (timeRemaining % 3600);
                minutes = parseInt(timeRemaining / 60);
                timeRemaining   = (timeRemaining % 60);
                seconds = parseInt(timeRemaining);

                $('.hurry-plate span').html(("0" + minutes).slice(-2)+':'+("0" + seconds).slice(-2))
            } else {
                return;
            }
        }
    }

    check_countdown(Date.now() + 15*60000);

    $('.step_items').on('click',function () {
        $(this).toggleClass('active');
        $(this).next().slideToggle(300);
    });

    $('.summary_adap').on('click',function () {
        $(this).toggleClass('active');
        $(this).next().slideToggle(300);
    });

    $('.promocode_btn u').on('click',function () {
        $(this).toggleClass('active');
        $(this).parent().next().slideToggle(300);
    });

    window.onload = function(){
        (function () {
            let $this;

            let phones = [];
            let country = '';

            function _setCountry() {
                country = jQuery('[name="country"]').val();
                if(typeof phones[country] !== "undefined"){
                    let mask = phones[country];
                    //$('#phone_number').val('');
                    $('#phone_number').inputmask({
                        mask: [{ "mask": mask} ],
                        greedy: false,
                        definitions: { 'd': { validator: "[0-9]", cardinality: 1}} });

                }
            }

            function setCountry() {
                jQuery('body').on('change', '[name="country"]', ()=>{
                    $('#phone_number').val('');
                    _setCountry()
                });
                _setCountry();
            }

            return {
                init() {

                    if($this)
                        return this;

                    $this = this;

                    if(!$('#phone_number').hasClass('phone_mask')){
                        return;
                    }

                    phones = alidCart.phones;

                    if(!phones){
                        return;
                    }

                    setCountry();

                    return this;
                }
            }
        })().init();
    };









});

