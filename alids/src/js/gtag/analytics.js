"use strict";

let ga4 = document.createElement('script')
ga4.setAttribute('src', 'https://www.googletagmanager.com/gtag/js?id='+window.ga4const.id )
document.head.appendChild(ga4);

ga4.addEventListener("load", ga4Loaded, false);

function ga4Loaded() {

    const g = new ga4Events()
    g.dispatch()
    g.renderEvent()
}

class ga4Events {

    quantity = 0;

    constructor() {
        window.dataLayer = window.dataLayer || [];
        this.gtag('js', new Date())
        this.gtag('config', window.ga4const.id)
    }

    gtag() {
        window.dataLayer.push(arguments);
    }

    renderEvent() {

        if( ['page:purchase', 'page:cart', 'page:product'].includes( window.ga4const.event ) ) {
            window.ADS.Dispatcher.trigger(window.ga4const.event, window.ga4const.params)
        }
    }

    dispatch() {

        const foo = [
            {k:'page:product', c:'pageProduct'},
            {k:'page:purchase', c:'pagePurchase'},
            {k:'page:cart', c:'pageCart'},
            {k:'cart:add', c:'cartAdd'},
            {k:'cart:update', c:'cartUpdate'},
            {k:'cart:remove', c:'cartRemove'},
        ];

        foo.forEach((item) => {
            window.ADS.Dispatcher.on(item.k, (params) => {
                if( ! params )
                    return;

                this[item.c]( params )
            })
        })
    }

    // calls on single page product
    pageProduct( params ) {

        this.gtag('event', 'view_item', {
            currency: params.currency,
            value: params.amount,
            items : [{
                item_id: params.post_id,
                item_name: params.title,
                item_category: params.category,
                item_variant: params.vars,
                price: parseFloat(params.sale_price).toFixed(2),
                quantity: 1,
            }]
        })
    }

    // calls on thank you page when purchase is done
    pagePurchase( params ) {

        if( ! params.hasOwnProperty('transaction_id') )
            return;

        this.gtag( 'event', 'purchase', params )
    }

    // checkout page
    pageCart( params ) {

        if( ! params.hasOwnProperty('items') )
            return;

        this.gtag( 'event', 'begin_checkout', params )
    }

    // add to cart
    cartAdd( params ) {

        if( typeof params.obj.change_order === "undefined" )
            return;

        let order_add = params.order;
        let order = params.obj.change_order;

        params = params.cart.items.filter( (item) => {
            return item.order_id === order;
        });

        if( ! params )
            return;

        params = params[0];

        if( ! params || typeof params.post_id === "undefined" )
            return;

        const p = parseFloat(params._not_convert_salePrice).toFixed(2);

        this.gtag('event', 'add_to_cart', {
            currency: params.currency,
            value: p,
            items : [{
                item_id: params.post_id,
                item_name: params.title,
                item_category: params.category,
                item_variant: params.vars,
                price: p,
                quantity: parseInt(order_add.quantity),
            }]
        })
    }

    // update cart
    cartUpdate( params ) {

        this.quantity = parseInt( params.cart.quantity );

        // change quantity in cart
        window.ADS.Dispatcher.on('cart:change', (params) => {

            if( ! params || ! params.order_id )
                return;

            let new_quantity = parseInt( params.cart.quantity );

            let product = {};
            for( let i in params.cart.items ) {
                if( parseInt( params.cart.items[i].order_id ) === parseInt( params.order_id ) ) {
                    product = params.cart.items[i];
                }
            }

            if( ! product.hasOwnProperty('post_id') )
                return;

            const p = parseFloat(product._not_convert_salePrice).toFixed(2);

            if( new_quantity > this.quantity ) {
                this.gtag('event', 'add_to_cart', {
                    currency: product.currency,
                    value: p,
                    items : [{
                        item_id: product.post_id,
                        item_name: product.title,
                        item_category: product.category,
                        item_variant: product.vars,
                        price: p,
                        quantity: parseInt( new_quantity - this.quantity ),
                    }]
                })
            } else if ( new_quantity < this.quantity ) {

                this.gtag('event', 'remove_from_cart', {
                    currency: product.currency,
                    value: p,
                    items : [{
                        item_id: product.post_id,
                        item_name: product.title,
                        item_category: product.category,
                        item_variant: product.vars,
                        price: p,
                        quantity: parseInt( this.quantity - new_quantity ),
                    }]
                })

                this.quantity = new_quantity;
            }
        })
    }

    // remove item from cart
    cartRemove( params ) {

        if( ! params.order_id )
            return;

        let product = {};
        for( let i in params.cart.items ) {
            if( parseInt( params.cart.items[i].order_id ) === parseInt( params.order_id ) ) {
                product = params.cart.items[i];
            }
        }

        if( ! product.hasOwnProperty('post_id') )
            return;

        const p = parseFloat(product._not_convert_salePrice).toFixed(2);

        this.gtag('event', 'remove_from_cart', {
            currency: product.currency,
            value: p,
            items : [{
                item_id: product.post_id,
                item_name: product.title,
                item_category: product.category,
                item_variant: product.vars,
                price: p,
                quantity: parseInt( product.quantity ),
            }]
        })
    }
}
