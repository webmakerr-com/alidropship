jQuery( function ( $ ) {
window.currencyPrice = (function(){

	function renderPriceListProduct( products ) {
		$.each(products, function ( i, e ) {
			let productItem;
            productItem = $(('.product-item[data-post_id="'+e.post_id+'"]'));
            if(!productItem.length){
                productItem = $('input[name="post_id"][value="'+e.post_id+'"]').closest('.product-item');
			}
			$('.js-price',productItem).html( e.price );
            $('.js-salePrice',productItem).html( e.salePrice );
		});
	}

	function formatItem( item ) {

		item.price = window.formatPrice.convertPriceOut(item.price, item.priceCurrency );
		item.salePrice = window.formatPrice.convertPriceOut(item.salePrice, item.priceCurrency);

		return item;
	}

	function listProduct() {
		let products  = [];
		let $products = $( '.product-item' );

		if ( !$products ) {
			return;
		}

		$products.each( function () {
			let item;
			if($(this).attr('data-currency')){
                item = {
                    post_id       : $( this ).attr('data-post_id'),
                    priceCurrency : $( this ).attr('data-currency'),
                    price         : $( this ).attr('data-_price_nc'),
                    salePrice     : $( this ).attr('data-_salePrice_nc')
                };
            }else{
                item = {
                    post_id       : $( this ).find('input[name="post_id"]').val(),
                    priceCurrency : $( this ).find('input[name="currency"]').val(),
                    price         : $( this ).find('input[name="_price_nc"]').val(),
                    salePrice     : $( this ).find('input[name="_salePrice_nc"]').val()
                };
            }


			products.push( formatItem( item ) );
		} );

		renderPriceListProduct( products );
	}

	return {
		init: function ( ) {

			$('body').on('infoCurrency:done', function ( data ) {
				listProduct();
			});

			$('body').on('updateListPrice:init', function ( data ) {
				listProduct();
			});

		}
	}
})();
    window.currencyPrice.init();
});

