jQuery(function($){


    const $form = $('#form_singleProduct');

    function getSku( sticker = true ) {

        var options = {
                line      : 'js-item-sku',
                variation : '[name="sku-meta-set[]"]'
            },
            error   = false,
            foo     = [];

        $(options.variation,$form).each( function () {

            if ( $( this ).val().length === 0 && sticker !== false ) {
                $( this ).closest( options.line ).addClass('is-empty');
                var errorText = $('.sku-warning',$(this).closest('.js-item-sku')).text();
                toastr.error(errorText);
                error = true;
            }
            else {
                $( this ).closest( options.line ).removeClass('is-empty');
                foo.push( $( this ).val() );
            }

        } );

        if ( error ) return false;

        return { foo : foo }
    }

    const pageSingleProduct = (function () {
        var $this;
        var $body         = $( 'body' );
        var _timeout      = null;
        var _timeoutStage = null;

        var obj = {
            outValue : {
                price       : '[data-singleProduct="price"]',
                salePrice   : '[data-singleProduct="savePrice"]',
                stock    : '[data-singleProduct="stock"]',
                save        : '[data-singleProduct="save"]',
                savePercent : '[data-singleProduct="savePercent"]',
                totalPrice  : '[data-singleProduct="totalPrice"]',
            },

            box : {
                price       : '[data-singleProductBox="price"]',
                salePrice   : '[data-singleProductBox="salePrice"]',
                savePercent : '[data-singleProductBox="savePercent"]',
                stock    : '[data-singleProductBox="stock"]',
                save    	: '[data-singleProductBox="savePercent"]',
                totalPrice  : '[data-singleProductBox="totalPrice"]'
            }
        };

        let stage = {
            isTotalPrice: true,

            price     : $('[name="price"]',$form).val(),
            save      : $('[name="save"]',$form).val(),
            salePrice : $('[name="salePrice"]',$form).val(),
            savePercent  :  $('[name="savePercent"]',$form).val(),
            stock     : $('[name="stock"]',$form).val(),

            _price        : $('[name="_price"]',$form).val(),
            _price_nc     : $('[name="_price_nc"]',$form).val(),
            _salePrice    : $('[name="_salePrice"]',$form).val(),
            _quantity     : $('[data-singleProductInput="quantity"]').val(),
            _salePrice_nc :  $('[name="_salePrice_nc"]',$form).val(),
            _save         :  $('[name="_save"]',$form).val(),
            _save_nc      :  $('[name="_save_nc"]',$form).val(),

            currency          : $('[name="currency"]',$form).val(),
            currency_shipping : $('[name="currency_shipping"]',$form).val(),
            price_shipping    : $('[data-singleproduct="shipping"] option:selected',$form).data( 'price' ),
        };

        function getCurrency(  ) {
            stage.currency = $('[name="currency"]',$form).val();
            return stage.currency;
        }

        function getCurrencyShipping() {
            stage.currency_shipping = $('[name="currency_shipping"]',$form).val();
            return stage.currency_shipping;
        }

        function renderShipping(  ) {

            var shippingInput = $('input[data-singleproduct="single-shipping"]'),
                shippingSelect = $('select[data-singleproduct="single-shipping"]');

            if(shippingSelect.length){
                $('option',shippingSelect).each(function ( e, i ) {
                    var _price_nc = $(this).attr('data-cost_nc');
                    var _price = window.formatPrice.convertPriceOut( _price_nc , getCurrencyShipping(), false );

                    var template = $(this).attr('data-template');
                    template = template.replace(/{{\s*price\s*}}/, _price);
                    $(this).text(template);
                });


            }else if(shippingInput.length){
                var _price_nc = shippingInput.attr('data-cost_nc');
                if(_price_nc >0){
                    var valueBoxShipping = $('[data-singleproduct="single-shipping_value"]');

                    var _price = window.formatPrice.convertPriceOut( _price_nc , getCurrencyShipping(), false );
                    var template = shippingInput.attr('data-template');
                    template = template.replace(/{{\s*price\s*}}/, _price);

                    valueBoxShipping.text(template);
                }

            }
        }

        function renderPrice() {

            $( obj.outValue.salePrice ).text( stage.salePrice );
            $( obj.outValue.totalPrice ).text( stage.totalPrice );
            $( obj.outValue.price ).text( stage.price );

            $( obj.outValue.save ).text( stage.save );
            $( obj.outValue.savePercent ).text( stage.savePercent + "%" );

            $( obj.outValue.stock ).text( stage.stock );

            $( obj.box.salePrice ).show();

            if ( parseFloat( stage._price ) > 0 && stage._price !== stage._salePrice ) {
                $( obj.box.price ).show();
            } else {
                $( obj.box.price ).hide();
            }

            if ( parseFloat( stage._price ) - parseFloat( stage._salePrice ) > 0 ) {
                $( obj.box.savePercent ).show();
            } else {
                $( obj.box.savePercent ).hide();
            }

            if(stage.stock > 0){
                $( obj.box.totalPrice ).show();
            }else{
                $( obj.box.totalPrice ).hide();
            }

            if (window.adstmCustomize.tp_single_stock_enabled) {
                $( obj.box.stock ).show();
            } else {
                $( obj.box.stock ).hide();
            }
        }

        function setInfoShipping(){
            var option = $('[data-singleproduct="single-shipping"] option:selected');
            $( '[data-singleproduct="shipping-info"]' ).html( option.data( 'info' ) );
        }

        return {
            init     : function () {
                $this = this;

                $body.on( 'keyup mouseup click', '[data-singleProductInput="quantity"]', function () {

                        clearTimeout( _timeout );
                        var _this = this;
                        _timeout  = setTimeout( function () {
                            var quantity = parseInt( $( _this ).val() );
                            quantity     = quantity > 0 ? quantity : 1;
                            $('[data-singleproductinput="quantity"]').val(quantity);
                            $this.setStage( '_quantity', quantity );
                            $this.setPrice();
                        }, 400 );
                    }
                );

                $( '[data-singleproduct="single-shipping"]' ).on( 'change', function () {
                    setInfoShipping();
                } );
                setInfoShipping();

                $this.setPrice();

                changePriceSku.init();
            },
            setStage : function ( name, value, trigger ) {
                if ( typeof name === "object" ) {
                    for ( var i in name ) {
                        stage[ i ] = name[ i ];
                    }
                    trigger = value;
                } else {
                    stage[ name ] = value;
                }

                if ( trigger !== true ) return;

                clearTimeout( _timeoutStage );
                _timeoutStage = setTimeout( function () {
                    renderPrice();
                    renderShipping();
                }, 100 );

            },
            setPrice : function () {

                stage._quantity = stage._quantity || 0;

                var val_quantity = 1;
                if(stage.isTotalPrice){
                    val_quantity = stage._quantity;
                }

                var _price = window.formatPrice.convertPrice( stage._price_nc , getCurrency() );
                var price = window.formatPrice.outPrice( _price * val_quantity );

                var _salePrice = window.formatPrice.convertPrice( stage._salePrice_nc, getCurrency() );
                var salePrice = window.formatPrice.outPrice( _salePrice * val_quantity);

                var _save = stage._price - stage._salePrice;
                var save = window.formatPrice.outPrice(_save, getCurrency());

                var savePercent = _price > 0 && _salePrice > 0 ? Math.round( ( ( _price - _salePrice ) / _price ) * 100 ) : '';
                if(_price > 0 && _salePrice == 0){
                    savePercent = 100;
                }
                var totalPrice = window.formatPrice.outPrice( _salePrice * stage._quantity);


                $this.setStage( '_price', _price );
                $this.setStage( '_salePrice', _salePrice );
                $this.setStage( 'price', price );
                $this.setStage( 'salePrice', salePrice );
                $this.setStage( 'save', save );
                $this.setStage( 'totalPrice', totalPrice );
                $this.setStage( 'savePercent', savePercent, true );

            },
            isTotalPrice($value){
                $this.setStage( 'isTotalPrice', !!$value );

            }
        }
    })();

    const  changePriceSku = (function () {
        var $this, skuAttr, sku, currency;

        function setFirstSku() {
            if ( typeof skuAttr == 'undefined' ) {
                return null
            }

            selectSku(Object.keys( skuAttr )[ 0 ]);
        }

        function setMinPriceSku() {
            if ( typeof skuAttr == 'undefined' ) {
                return null
            }
            var name='', min;
            $.each(skuAttr, function ( i, e ) {
                if(!min || (min > parseFloat(e._salePrice) && e.quantity > 0)  ){
                    min = e._salePrice;
                    name = i;
                }
            });
            if(!$('.force_url_sku').length){
                selectSku( name );
            }

        }

        function setOneSku() {
            if ( typeof skuAttr == 'undefined' ) {
                return null
            }

            $('.js-item-sku').each(function() {
                if($('.js-sku-set', this).length === 1){
                    $('.js-sku-set', this).click();
                }
            });
        }

        function selectSku( name ) {

            var names = name.split( ';' ),
                key;

            for ( key in names ) {
                var sku = $( 'input[value="' + names[ key ] + '"]' ).closest( '.js-sku-set' );
                setSkuParamsActive( sku );
            }

            render($("body").hasClass("js-show-pre-selected-variation"));
            changeSku();
        }

        function renderSkuActive(first = true) {
            var value = getSku( false );

            if ( !value )return false;
            var foo = value.foo;

            $( '.js-sku-set' ).addClass( 'disabled' ).removeClass( 'active' );

            $.each( skuAttr, function ( skuAttrName, e ) {
                var sku = skuAttrName.split( ';' );

                var count = 0, l = foo.length;

                for ( var k in foo ) {
                    if ( foo[ k ] == sku[ k ] ) {
                        count++;
                    }

                    $( 'input[value="' + foo[ k ] + '"]' ).closest( '.js-sku-set' ).addClass( 'active' );
                }

                if ( count >= l - 1 ) {
                    $.each( sku, function ( i ) {
                        $( 'input[value="' + sku[ i ] + '"]').closest( '.js-sku-set' ).removeClass( 'disabled' );
                    } );
                }
                if(first) {
                    $(".js-sku-set.active").each(function () {
                        zr($(this));
                    });
                }

            } );

        }

        function renderValidSku() {
            var value = getSku( false );
            if ( !value ){
                $( '.js-sku-set' ).removeClass( 'disabled' ).removeClass( 'active' );
            }

            var foo = value.foo;

            for ( var k in foo ) {
                if ( !foo[ k ] ){
                    return;
                }
            }

            if(typeof skuAttr[foo.join(';')] === "undefined"){
                $( '.js-sku-set' ).removeClass( 'disabled' ).removeClass( 'active' );
            }
        }

        function renderEmptySetSku() {
            var emptyCount =  $( '[name="sku-meta-set[]"][value=""]').length;
            var countRowSku =  $('[name="sku-meta-set[]"]').length;
            if(emptyCount && countRowSku > 1){
                $('.js-item-sku').each(function (index) {

                    $('.js-sku-set',this).removeClass( 'disabled' );

                    if(!$('[name="sku-meta-set[]"]',this).val()){
                        $('[name="sku-meta"]',this).each(function () {
                            var val = $(this).val();
                            var value = getSku( false );
                            var foo 	= value.foo;

                            if(foo.join('')){
                                foo[index] = val;
                                var nSku = foo.join(';');

                                if( typeof skuAttr[nSku] == 'undefined' ){
                                    $(this).closest('.js-sku-set').addClass( 'disabled' );
                                }
                            }

                        });
                    }
                });

                var l = $('.js-item-sku').length;
                var c = $('[name="sku-meta-set[]"][value=""]').length;

                if(c !==1 && c <= l-1){
                    $('.js-item-sku [name="sku-meta-set[]"]').each(function () {
                        if(!$(this).val()){
                            $('.js-sku-set',$(this).closest('.js-item-sku')).removeClass( 'disabled' ).addClass( 'test' );
                        }
                    });
                }

            }
            $('[name="sku-meta-set[]"]',$( '.js-sku-set.disabled.active' ).removeClass( 'active' ).closest('.js-item-sku')).val('');
        }

        function changeSku() {

            var value = getSku( false ),
                skuAttrName;

            if ( !value )return false;

            var foo     = value.foo;
            skuAttrName = foo.join( ';' );

            if ( typeof skuAttr[ skuAttrName ] == 'undefined' ) {
                return;
            }

            $( 'body' ).trigger( {
                type        : "changeSku",
                foo         : foo,
                item        : skuAttr[ skuAttrName ],
                skuAttrName : skuAttrName
            } );

        }

        function setSkuParamsActive( skuSet ) {

            var pid       = $( skuSet ).data( 'set' ),
                variation = $( skuSet ).data( 'meta' ),
                skuval    = $( '#check-' + pid + '-' + variation ).val();

            $( '#js-set-' + pid ).val( skuval );

        }

        function setSkuParamsToggle( skuSet ) {

            var pid       = $( skuSet ).data( 'set' ),
                variation = $( skuSet ).data( 'meta' ),
                skuval    = $( '#check-' + pid + '-' + variation ).val(),
                skuvalOld = $( '#js-set-' + pid ).val();

            if(skuval == skuvalOld){
                $( '#js-set-' + pid ).val( '' );
            }else{
                $( '#js-set-' + pid ).val( skuval );
            }
        }

        function setSkuParams( skuSet ) {

            if($(skuSet).hasClass('disabled')){
                $('.js-item-sku [name="sku-meta-set[]"]').val( '' );
            }

            var pid       = $( skuSet ).data( 'set' ),
                variation = $( skuSet ).data( 'meta' ),
                skuval    = $( '#check-' + pid + '-' + variation ).val();

            $( '#js-set-' + pid ).val( skuval );
        }

        function setSkuPrice( e ) {
            var item = e.item;
            var data = {
                price         : item.price,
                _price        : item._price,
                _price_nc     : item._price_nc,
                salePrice     : item.salePrice,
                _salePrice    : item._salePrice,
                _salePrice_nc : item._salePrice_nc,
                stock         : item.quantity,
                savePercent   : item.discount,
                _save         : item._price - item._salePrice,
                _save_nc      : item._price_nc - item._salePrice_nc,
                save          : item.save,
            };

            if ( data._save < 0 ) {
                data._save = 0
            }

            pageSingleProduct.setStage( data );
            pageSingleProduct.setPrice();

        }

        function render(first = true) {
            renderSkuActive(first);
            renderEmptySetSku();
            renderValidSku();
        }

        function setUnselectedSkuViewAndValues() {

            $('[name="sku-meta-set[]"]').val('');
            $('.js-sku-set').removeClass('active').removeClass('disabled');

        }

        function zr(th){
            $('span',th.parents('.value_cont').prev()).replaceWith('');
            th.parents('.value_cont').prev().append('<span style="margin:0 0 0 5px;">'+th.attr('data-title')+'</span>');
        }

        return {
            init : function () {
                if($this){
                    return;
                }
                $this    = this;
                skuAttr  = window.skuAttr;
                sku      = window.sku;
                currency = $( '[name="currency"]' ).val();
                $( 'body' )
                    .on( 'click', '.js-sku-set', function () {
                        setSkuParams( this );
                        render();
                        changeSku();
                    } )
                    .on( 'changeSku', setSkuPrice );

                //setFirstSku();
                let $variation_default = $('form [name="variation_default"]');
                if(typeof skuAttr !== 'undefined' && $variation_default.length && $variation_default.val() !== 'lowest_price'){
                    selectSku( $variation_default.val() );
                }else{
                    setMinPriceSku();
                }

                if(!$( 'body' ).hasClass( 'js-show-pre-selected-variation')){
                    setUnselectedSkuViewAndValues();
                }

                $( '.js-empty-sku-view' ).removeClass( 'js-empty-sku-view' );

                setOneSku();

                $('.js-product-sku').show();

                var height2line = 96;
                $('.sku-row .value').each(function () {
                    if($(this).height() > height2line){
                        $('.js-all-sku',$(this).closest('.sku-row').addClass('line-sku')).show();
                    }
                });

                $('.js-all-sku').on('click', function () {
                    $(this).closest('.sku-row').toggleClass('line-sku');
                });

                if($(".js-sku-set").length){
                    render($("body").hasClass("js-show-pre-selected-variation"));
                }
                $('body').trigger('sku_ready');

                $(window).scrollTop($(window).scrollTop()+1);
                $(window).scrollTop($(window).scrollTop()-1);

            }
        }
    })();


    $('body').on('infoCurrency:done', function (  ) {
        pageSingleProduct.init();
    });

    $(".js-addToCart").on("mouseup", function (t) {
        t.preventDefault(), function () {
            if(!$('.outofstock').length){
                let is_active_vars=1;
                $('.js-item-sku').each(function(){
                    if(!$('.active',this).length){
                        is_active_vars=0;
                    }
                });

                if(is_active_vars){
                    var options = {
                        item     : '[data-singleProductInput="quantity"]',
                        post_id  : 'form#form_singleProduct [name="post_id"]',
                        shipping : '[name="shipping"]'
                    };

                    var $sku = getSku();

                    if ( $sku === false ) return false;
                    window.adsCart.add( {
                        post_id   : $( options.post_id ).val(),
                        quantity  : $( options.item ).val(),
                        shipping  : $( options.shipping ).val(),
                        variation : $sku.foo
                    } );
                }else{

                    $('.js-item-sku').each(function(){
                        if(!$('.active',this).length){
                            toastr.error($('.sku-warning',this).text());
                        }
                    });
                    $('body').addClass('no_cart_message');
                    setTimeout(function(){$('body').removeClass('no_cart_message');},5000)

                }
            }
        }()
    });

    $("#cart-sidebar").length || $(".view_cart").hide(), $("body").on("cart:change cart:update cart:add", function (t) {
        $("#cart-sidebar").length && t.cart.quantity > 0 ? $(".view_cart").show() : $(".view_cart").hide()
    })
    $(".view_cart").on("click", function () {
        $("html").addClass("cart-pull-page")
    })

    //quantity
    var options = {
        el     : '.js-select_quantity',
        add    : '.js-quantity_add',
        remove : '.js-quantity_remove',
        input  : 'input'
    };

    var $body = $( 'body' );
    $body.on( 'click', options.add, function ( e ) {
        e.preventDefault();
        set( 1, this )
    } );

    $body.on( 'click', options.remove, function ( e ) {
        e.preventDefault();
        set( -1, this )
    } );

    function set( change, $this ) {
        var $input = $(options.input ,$( $this ).closest( options.el ))
        var v      = $input.val();
        v          = (v = parseInt( v ) + change) > 0 ? v : 1;
        $input.val( v )
            .trigger( 'mouseup' );

    }



});
