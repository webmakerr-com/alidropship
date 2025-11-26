/**
 * Created by pavel on 17.05.2016.
 */

(function($) {

    'use strict';

    window.adsCart = (function() {
        let $this;
        let cart_box  = false;
        let status    = false;
        let $time     = null;
        let params      = {
            cart : {}
        };

        let cb_update = function (obj) {

            if (obj) {
                status = true;

                params.cart = obj;

                window.ADS.Dispatcher.trigger('cart:update', {
                    cart : obj
                });

                $('body').trigger({
                    type : "cart:update",
                    cart : obj
                });
            }
        };

        let cb_change = function (obj, order_id) {

            if (obj) {

                params.cart = obj;

				window.ADS.Dispatcher.trigger('cart:change', {
				    cart : obj,
                    order_id : order_id
				});

                $('body').trigger({
                    type     : "cart:change",
                    cart     : obj,
                    order_id : order_id
                });
            }
        };

        let add_order = function (obj, order) {

			if (obj) {
                params.cart = obj;

				window.ADS.Dispatcher.trigger('cart:add', {
					cart  : obj,
					order : order,
					info  : {order_id : obj.info.change_order},
					obj   : obj.info
				});

                $('body').trigger( {
                    type  : "cart:add",
                    cart  : obj,
                    order : order,
                    info  : {order_id : obj.info.change_order},
                    obj   : obj.info
                });
            }
        };

        let objTotmpl = function ( tmpl, data ) {
            if ( typeof Handlebars === 'undefined' ) {
                return false
            }
            let template = Handlebars.compile( tmpl );
            return template( data );
        };

        let openCart = function(){
            $('html').addClass('cart-pull-page');
        };

        let init_cart_box = function() {

            if(cart_box){
                return;
            }

            cart_box = true;

            $('#modalCart').remove();

            let over = '#cart-sidebar-overlay',
                close = 'a.cart-close-btn';

            $(document).on('click', '.js-cart-info, .cart a:not(.login-button)',function(e){
                e.preventDefault();
                if($('#cart-sidebar').is('.no-cart-side')){
                    if($('#cart-sidebar').is('.enable-cart-page')){
                        document.location.href = '/shopping-cart';
                    }else{
                        document.location.href = '/cart';
                    }
                }else{
                    openCart();
                }

            });

            if($('#cart-sidebar').is('.no-cart-side')){
                $(document).on('click', '.view_cart', function (e) {
                    document.location.href = '/shopping-cart';
                });

                $( '[data-singleProduct="addCart"], .js-addToCart' ).on( 'click', function ( e ) {
                    if(!$('.outofstock').length){
                        $('#cart-message').html('"'+$('h1').html()+'" '+$('#cart-message').attr('data-success'));
                        $('#cart-message').fadeIn(500);
                        setTimeout(function(){$('#cart-message').fadeOut(500);},5000)
                    }
                });
            }

            $(document).on('click', close+','+over, function (e) {
                e.preventDefault();
                $('html').removeClass('cart-pull-page');
            });

            $(document).on('click', 'a.cart-item-remove', function(){
                let th = $(this).closest('.cart-item-flex');
                th.addClass('cart-loader');
                $this.remove( th.attr('data-order_id') );
            });



            $(document).on('click', '.cart-numb-plus', function(){
                let th = $(this).parent('.cart-quantity').find('[name="cart-quantity"]');
                let q = parseInt( th.val() );

                q = q + 1;
                th.val( q ).trigger('change');

            });

            $(document).on('click', '.cart-numb-minus', function(){
                let th = $(this).parent('.cart-quantity').find('[name="cart-quantity"]'),
                    q = parseInt( th.val() );

                q = q - 1;
                if( q <= 0 )
                    q = 1;

                th.val( q ).trigger('change');
            });

            $(document).on('change', '.cart-quantity [name="cart-quantity"]', function(){

                let v = $(this);
                let th = $(this).closest('.cart-item-flex');

                clearTimeout( $time );

                $time = setTimeout(function(){
                    $this.newQuantity( th.attr('data-order_id'), v.val() );
                }, 300);
            });
        };

        let renderCart = function( cart ) {

            let $bar  = $('#cart-sidebar'),
                $page_cart = $('.sc_cont');



            cart.items = cart.items.reverse();

            let data_items = cart.items;

            let item_tmpl = '';

            let data_remove = $('.cart-body').attr('data-remove');
            if(!data_remove){
                data_remove = 'Remove';
            }

            for(let item in data_items){
                let data_order_id = data_items[item]['order_id'];

                item_tmpl += '<div class="cart-item-flex" data-order_id="'+data_order_id+'">'+
                    ' <div class="cart-item-thumb">'+
                    ' <img src="'+data_items[item]['thumb']+'">'+
                    ' <a href="javascript:;" data-order_id="'+data_order_id+'" class="cart-item-remove">'+data_remove+'</a>'+
                    ' </div>'+
                    ' <div class="cart-item-flex-box cart-item-title">'+
                    ' <h3><a href="'+data_items[item]['link']+'" target="_blank">'+data_items[item]['title']+'</a></h3>'+
                    '<span class="item-variations">'+data_items[item]['vars']+'</span>'+
                    '  <div class="cart-form-box">'+
                    ' <div class="cart-quantity">'+
                    ' <a href="javascript:;" data-order_id="'+data_order_id+'" class="cart-numb cart-numb-minus">&minus;</a>' +
                    ' <a href="javascript:;" data-order_id="'+data_order_id+'" class="cart-numb cart-numb-plus">&plus;</a>' +
                    ' <input type="number" min="1" name="cart-quantity" autocomplete="off" value="'+data_items[item]['quantity']+'">' +
                    '</div>' +
                    ' <div class="cart-item-price">'+data_items[item]['total_salePrice']+'</div>' +
                    ' </div>' +
                    ' </div>' +
                    ' </div>'



            }


            $( $bar ).find( '.cart-body' ).html(item_tmpl );
            let price = cart.hasOwnProperty('cur_salePriceNotShipping') ? cart.cur_salePriceNotShipping : cart.cur_salePrice;
            $( $bar ).find( '.cart-footer .item-price' ).text( price );
            
            if(document.querySelector('.sc_cont')){
                $( $page_cart ).find( '.item-price' ).text( price );
                let page_item_tmpl = '';
                for(let item in data_items) {
                    let data_order_id = data_items[item]['order_id'];
                    page_item_tmpl += '<div class="sc_item cart-item-flex" data-order_id="'+data_order_id+'">'+
                        '<div class="sc_img">'+
                        '<div class="cart-item-thumb">'+
                        '<img src="'+data_items[item]['thumb']+'">'+
                        '<a href="javascript:;" class="cart-item-remove">Remove</a>'+
                        '</div>'+
                        '</div>'+
                        '<div class="sc_name">'+
                        '<a href="'+data_items[item]['link']+'" target="_blank">'+data_items[item]['title']+'</a>'+
                        '<div class="item-variations">'+data_items[item]['vars']+'</div>'+
                        '</div>'+
                        '<div class="sc_quant cart-form-box">'+
                        '<div class="cart-quantity">'+
                        '<span class="cart-numb cart-numb-minus">&minus;</span>'+
                        '<span class="cart-numb cart-numb-plus">&plus;</span>'+
                        '<input type="number" min="1" name="cart-quantity" autocomplete="off" value="'+data_items[item]['quantity']+'">'+
                        '</div>'+
                        '</div>'+
                        '<div class="sc_price">'+
                        '<div class="cart-item-price">'+data_items[item]['total_salePrice']+'</div>'+
                        '</div>'+
                        '</div>';

                }


                $( $page_cart ).find( '.sc_items' ).html( page_item_tmpl );
            }
        };

        function _cart_box() {

            let $body = $('body');

            $body.on('cart:update', function (e) {

                if(!jQuery('#cart-sidebar').length) {
                    return;
                }

                init_cart_box();
                renderCart(e.cart);
            });

            $body.on('cart:add', function (e) {
                if(!jQuery('#cart-sidebar').length) {
                    return;
                }

                init_cart_box();
                renderCart(e.cart);

                if(!$('#cart-sidebar').is('.no-cart-side')){
                    openCart();
                }

            });

            $body.on('cart:change', function (e) {
                if(!jQuery('#cart-sidebar').length) {
                    return;
                }

                init_cart_box();
                renderCart(e.cart);
            });

            if(jQuery('#cart-sidebar').length) {
                init_cart_box();
            }
        }

        return {
            init : function (el) {
                $this           = this;
                $this.$discount = '[name="discount"]';

                let $body = $('body');

				window.ADS.Dispatcher.trigger('cart:init');

                $body.trigger({
                    type     : "cart:init"
                });

                $this.load();

                _cart_box();

                let popover = '[data-toggle="popover"]';

                if( $( popover ).length )
                    $( popover ).popover();

                $(window).on('click touchstart', function (e) {
                    $(popover).each(function () {
                        if (!$(this).is(e.target) && $(this).has(e.target).length === 0 && $('.popover').has(e.target).length === 0) {
                            $(this).popover('hide');
                        }
                    });
                });

            },
            cartGetStatus : function() {
                return status;
            },
            newQuantity    : function (order_id, quantity) {
                $.ajax({
                    url     : alidAjax.ajaxurl,
                    type    : "POST",
                    async   : true,
                    data    : {
                        discount    : adsCart.getDiscount(),
                        action      : "ads_actions_basket",
                        ads_actions : "set_quantity",
                        order_id    : order_id,
                        quantity    : quantity
                    },
                    success : function (data) {
                        cb_change(data, order_id);
                    }
                });
            },
            newShipping    : function (order_id, shipping) {
                $.ajax({
                    url     : alidAjax.ajaxurl,
                    type    : "POST",
                    async   : true,
                    data    : {
                        discount    : adsCart.getDiscount(),
                        action      : "ads_actions_basket",
                        ads_actions : "set_shipping",
                        order_id    : order_id,
                        shipping    : shipping
                    },
                    success : function (data) {
                        cb_change(data, order_id);

                        let obj = data;
                        if (obj) {
							window.ADS.Dispatcher.trigger('cart:shipping',
                                {
									cart : obj,
									info : {
										order_id : obj.info.change_order
									}
                                }
                            );

                            $('body').trigger( {
                                type : "cart:shipping",
                                cart : obj,
                                info : {
                                    order_id : obj.info.change_order
                                }
                            });
                        }
                    }
                });
            },
            newShippingForOrdersGroup    : function ( ordersObj ) {

              let orders_ids = [];
              let shipping = '';

              for( let key in ordersObj ) {
                if( !ordersObj.hasOwnProperty(key) ) continue;
                orders_ids.push( key );
                shipping = ordersObj[key];
              }

              $.ajax({
                url: alidAjax.ajaxurl,
                type: "POST",
                async: true,
                data: {
                  discount: adsCart.getDiscount(),
                  action: "ads_actions_basket",
                  ads_actions: "set_shipping_to_orders_group",
                  orders_ids: orders_ids,
                  shipping: shipping
                },
                success: function (data) {

                  cb_change(data, orders_ids[orders_ids.length - 1]);

                  let obj = data;
                  if (obj) {
                    window.ADS.Dispatcher.trigger('cart:shipping',
                      {
                        cart: obj,
                        info: {
                          order_id: obj.info.change_order
                        }
                      }
                    );

                    $('body').trigger({
                      type: "cart:shipping",
                      cart: obj,
                      info: {
                        order_id: obj.info.change_order
                      }
                    });
                  }
                }
              });

            },
            add            : function (order) {
                let data = $.extend({
                    id        : '',
                    quantity  : 1,
                    variation : '',
                    title     : ''
                }, order);

                data.action      = "ads_actions_basket";
                data.ads_actions = "add";
                data.discount    = adsCart.getDiscount();
                $.ajax({
                    url     : alidAjax.ajaxurl,
                    type    : "POST",
                    async   : true,
                    data    : data,
                    success : function (data) {
                        add_order(data, order);
                    }
                });
            },
            remove         : function (order_id) {
                $.ajax({
                    url     : alidAjax.ajaxurl,
                    type    : "POST",
                    async   : true,
                    data    : {
                        discount    : adsCart.getDiscount(),
                        action      : "ads_actions_basket",
                        ads_actions : "remove",
                        order_id    : order_id
                    },
                    success : function(data){

                        if (data) {
                            window.ADS.Dispatcher.trigger('cart:remove', {
                                cart : params.cart,
                                order_id : order_id
                            });
                            $('.sc_cont .cart-item-flex[data-order_id="'+order_id+'"]').replaceWith('');

                        }

                        cb_update(data);

                    }
                });
            },
            load           : function () {
                return new Promise(function (resolve, reject){
                    $.ajax({
                        url     : alidAjax.ajaxurl,
                        type    : "POST",
                        async   : true,
                        data    : {
                            discount    : adsCart.getDiscount(),
                            action      : "ads_actions_basket",
                            ads_actions : "get_orders"
                        },
                        success : function (obj){
                            cb_update(obj);
                            return resolve(obj);
                        }
                    });
                })

            },
            convPrice      : function ( v, callback ) {
                $.ajax({
                    url     : alidAjax.ajaxurl,
                    type    : "POST",
                    async   : true,
                    data    : {
                        action   : "ads_conv_price",
                        price    : v[ 0 ],
                        currency : v[ 1 ]
                    },
                    success : callback
                });
            },
            convPriceTotal : function (v, callback) {
                $.ajax({
                    url     : alidAjax.ajaxurl,
                    type    : "POST",
                    async   : true,
                    data    : {
                        action            : "ads_conv_price_total",
                        price             : v.price,
                        currency          : v.currency,
                        price_shipping    : v.price_shipping,
                        currency_shipping : v.currency_shipping,
                        quantity          : v.quantity
                    },
                    success : callback
                });
            },
            getDiscount    : function () {
                let $discount = $( $this.$discount );
                if ($discount.length) {
                    return $discount.val();
                }
                return '';
            },
            cart: function () {
                return params.cart;
            },
            setOrders: function (orders, discount) {
                $.ajax({
                    url     : alidAjax.ajaxurl,
                    type    : "POST",
                    async   : true,
                    data    : {
                        discount    : discount,
                        orders      : orders,
                        action      : "ads_actions_basket",
                        ads_actions : "set_orders"
                    },
                    success : cb_update
                });
            },
            setShipping: function (shipping, discount) {
            $.ajax({
                url     : alidAjax.ajaxurl,
                type    : "POST",
                async   : true,
                data    : {
                    discount    : discount,
                    shipping      : shipping,
                    action      : "ads_actions_basket",
                    ads_actions : "set_shipping_cart"
                },
                success : cb_update
            });
        }
        };
    })();

    let tt = setInterval(function(){
        if( typeof alidAjax != 'undefined' ){
            clearInterval(tt);
            window.adsCart.init();
        }
    }, 300);

})(jQuery);
