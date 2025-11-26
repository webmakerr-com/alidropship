

(function ($) {
    var $this = null;
    
    var timerId = null;

    var obj = {
        active : false,
        categories: [],
        products: [],
        count: 0,
        countShow: false,
        q: '',
    };

    var template = '';
    var name = '';

    var objTotmpl = function ( tmpl, data ) {
        if ( typeof Handlebars === 'undefined' ) {
            return false
        }
        var template = Handlebars.compile( tmpl );
        return template( data );
    };

    function renderActive() {
        if(obj.active){
            $('.ads-search-product').show();
            $('body').addClass('ads-search-product--open');
        }else{
            $('.ads-search-product').hide();
            $('body').removeClass('ads-search-product--open');
        }
    }
    

    function render() {
        renderActive();

        if(!obj.active){
            return;
        }


        let search_html = '';

        let trans_categories = 'Categories';
        let top_matching_products = 'Top matching products';
        let trans_view_all = 'View all';
        if(window.ads_search_trans){
            trans_categories = ads_search_trans['categories'];
            top_matching_products = ads_search_trans['top_matching_products'];
            trans_view_all = ads_search_trans['view_all'];
        }




        search_html += '<div class="wrap-search-product">'
        if(obj.categories.length){
            search_html += '<div class="categories">'+
                '<div class="head">'+trans_categories+'</div>'+
                '<div class="list">'
                for(let category in obj.categories){
                    search_html += '<div class=""><a href="'+obj.categories[category].url+'"><div class="title">'+obj.categories[category].title+'</div></a></div>';
                }
                search_html += '</div>'+
                '</div>'
        }
        if(obj.products.length){
            search_html +=
                '<div class="products">'+
                '<div class="head"><a href="/?s='+obj.q+'">'+top_matching_products+'</a></div>'+
                '<div class="list">';

            for(let product in obj.products){
                search_html += '<a href="'+obj.products[product].url+'">'+
                '<div class="item">'+
                '<div class="box-img"><img src="'+obj.products[product].img+'" alt=""></div>'+
                '<div class="box-title">'+
                '<div class="title">'+obj.products[product].title+'</div>'+
                '<div class="price">'+obj.products[product].price+'</div>'+
                '</div>'+
                '</div>'+
                '</a>';
                }
            search_html += '</div>'+
                '</div>';
        }
        if(obj.countShow){
            search_html += '<div class="view-all"><a href="/?s='+obj.q+'">'+trans_view_all+'<span>'+obj.count+'</span></a></div>';
        }

        search_html += '</div>';
        $( '.ads-search-product' ).html( search_html );

    }

    function search(q,size="medium") {

        obj.q = q;

        $.ajax({
            url      : alidAjax.ajaxurl,
            type     : "POST",
            dataType : "json",
            async    : true,
            data     : {
                action  : 'ads_search_product',
                q : q,
                size : size
            },
            success  : function (resp) {
                obj.products = resp.products;
                obj.categories = resp.categories;
                obj.count = resp.count;
                obj.countShow = resp.countShow;

                render();
            }
        });
    }

    function events() {
        $('.js-autocomplete-search').on('keyup', function () {
            clearTimeout(timerId);

            var q = $(this).val();

            if(q.length < 2){
                return;
            }

            let newq = q.replace("‘", "'");
            newq = newq.replace("’", "'");
            $('.js-autocomplete-search').val(newq);

            timerId = setTimeout(function () {
                obj.active = true;

                search(newq,$('.js-autocomplete-search').attr('data-size'));
            }, 300);
        });

        $(document).on('click', function (e) {
            if($(e).closest('.ads-search-product').length){
                return;
            }
            obj.active = false;
            render();
        });
    }

    function addSearch() {
        $('.js-autocomplete-search').parent().append('<div class="ads-search-product" style="display: none"><div>');
    }

    function addTemplate() {
        $.ajax({
            url      : alidAjax.ajaxurl,
            type     : "POST",
            dataType : "json",
            async    : true,
            data     : {
                action  : 'ads_search_product_template',
            },
            success  : function (resp) {
                name = resp.name;
               $('body').addClass(name.toLowerCase());
                template = resp.template;
            }
        });
    }

    return {
        start: function () {
            if($this)return;
            $this = this;
            
            if(!$('.js-autocomplete-search').length){
                return;
            }

            // addTemplate();
            addSearch();
            events();

            return this;
        }
    }
})(jQuery).start();