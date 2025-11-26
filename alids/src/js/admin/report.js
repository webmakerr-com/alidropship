/**
 * Created by user on 05.06.2017.
 */
jQuery(function($){

    let report = {

        request : function(method, sort, sortby, page, action,  callback){

            const from = $('#date-from').val(), 
                to = $('#date-to').val();
                action = action || $('#ajax_action').val();

            $.ajax( {
                url     : ajaxurl,
                data    : {
                    action : action,
                    from   : from,
                    to     : to,
                    method : method,
                    sort   : sort,
                    sortby : sortby,
                    index  : page,
                    page  : page
                },
                type    : 'POST',
                dataType: 'json',
                success : callback
            });
        },

        overview : function(){

            var target = $('#ads_overview'),
                tmpl   = $('#ads_overview-template').html();

            if( ! target.length )
                return;

            let panel = target.closest('.panel')
            if(panel.length > 0) {
                panel.addClass('animate-spinner');
            }

            this.request('overview', '', '', 1, false, function( response ) {

                if( response ) {
                    if(panel.length > 0) {
                        panel.removeClass('animate-spinner');
                    }
                    if( response.hasOwnProperty( 'error' ) ) {
                        window.ADS.notify( response.error, 'danger' );
                    } else {
                        target.html( window.ADS.objTotmpl( tmpl, response ) );

                        for(let i in response.data){
                            let d = response.data[i];
                            if(d.icon === 'total'){
                                $('.header-chart .total').text(d['count'])
                            }

                            if(d.icon === 'orders'){
                                $('.header-chart .order').text(d['count'])
                            }
                        }
                        $('[data-toggle="tooltip"]').tooltip();
                        $('.header-chart').show()
                    }
                }
            });
        },

        bigTable : function(a, method, page) {

            if( typeof $(a) === 'undefined' ) return false;

            var tmpl   = $(a).data('ads_template'),
                target = $(a).data('ads_target'),
                action = $(a).data('ads_request'),
                sort   = typeof $(a).data('sort') !== 'undefined' ? $(a).data('sort') : '',
                sortby = typeof $(a).data('sortby') !== 'undefined' ? $(a).data('sortby') : '';

            target = typeof target === 'undefined' ? $(a) : $(target);

            let panel = $(a).closest('.panel');

            if(panel.length > 0) {
                panel.addClass('animate-spinner')
            }

            this.request(method, sort, sortby, page, action,function( response ) {

                if( response ) {
                    if(panel.length > 0) {
                        panel.removeClass('animate-spinner');
                    }
                    if( response.hasOwnProperty( 'error' ) ) {
                        window.ADS.notify( response.error, 'danger' );
                    } else {
                        target.html( window.ADS.objTotmpl( $(tmpl).html(), response ) );
                        if( $(a).find('.pagination-menu').length ){
                            let total = response.total;
                            let current = response.current;
                            let count = response.count;
                            if(response.meta){
                                total = response.meta.total;
                                current = response.meta.page;
                                count = response.meta.limit;
                            }
                            window.ADS.createJQPagination(a, total, current, count);
                        }


                        var sortby = $(a).data('sortby');
                        $(a).find('[data-of]').each(function(){
                            if( $(this).data('of') === sortby ) {
                                $(this).addClass($(a).data('sort'));
                            }
                        });
                    }
                }
            });
        },

        renderAllPanel: function(){
            $('.bigTable').each(function(){
                report.bigTable('#' + $(this).attr('id'), $(this).data('method'), 1);
            });
        },

        chart : function( element ) {

            var action  = $('#ajax_action').val();

            window.lineChart.chartData( element, action, $(element).data('method'), $('#date-from').val(), $('#date-to').val(), 256 );


        },
        eventChart: function(){
            const ddm = '.graph-methods';
            $(ddm).on('click', 'a', function(){

                let action  = $('#ajax_action').val();

                let p = $(this).parents(ddm);

                let element = p.data('ads_target');

                if( $(this).data('method') ) {

                    $( element ).data('method', $(this).data('method') );

                    window.lineChart.chartData( element, action, $(element).data('method'), $('#date-from').val(), $('#date-to').val(), 256 );
                    $(this).parents('ul').find('.dropdown-toggle').html($(this).text() + ' <i class="caret"></i>');
                }
            });
        },
        handler : function() {
            var $this = this;

            $(document).on('click', 'a.sort', function(e){
                e.preventDefault();

                var $a     = $(this).parents('.bigTable'),
                    sort   = $(this).hasClass('desc') ? 'asc' : 'desc',
                    sortby = $(this).data('of'),
                    method = $a.data('method');

                $a.find('.sort').removeClass('desc asc');
                $a.data({sort:sort, sortby:sortby});

                $(this).addClass(sort);

                $this.bigTable( '#'+$a.attr('id'), method, 1);
            });

            $(document).on('pagination:click', function(e){
                var method = $(e.obj).data('method');

                if(method){
                    $this.bigTable( e.obj, $(e.obj).data('method'), e.page);
                }
                else{
                    $(e.obj).find('[name="page"]').val(e.page);
                    window.ADS.mainRequest($(e.obj));
                }

            });
            $(document).on('datepicker:update', function(){
                $this.overview();
                $this.chart('#report-chart');
                $this.renderAllPanel();
            });

            var ddm = '.panel-methods';
            $(ddm).on('click', 'a', function(){
                var p = $(this).parents(ddm);
                if( $(this).data('method') ) {
                    $( p.data('ads_target') ).data('method', $(this).data('method') );
                    $this.bigTable( p.data('ads_target'), $(this).data('method'), 1);
                    $(this).parents('ul').find('.dropdown-toggle').html($(this).text() + ' <i class="caret"></i>');
                }
            });
        },

        init: function () {
            var $this = this;
            this.overview();
            this.handler();
            this.chart('#report-chart');
            this.eventChart();

            $(document).on('request:done', function (e) {
                if (e.obj === '#ads_top_search') {
                    window.ADS.createJQPagination('#ads_top_search', e.response.total, e.response.current, e.response.count);
                }
            });

            $this.renderAllPanel();

            $(document).on('request:button', function (e) {

                if(
                    e.action === 'save_page_ads_gapi' &&
                    e.hasOwnProperty('response') &&
                    e.response.hasOwnProperty('redirect')
                ) {
                    setTimeout( () => {
                        window.location.replace(e.response.redirect);
                    }, 500 );
                }
            });


            $('body').on('click', '.js-default-product', function () {
                var productId = $(this).closest('.table-item').data('productid');
                var tmpl   = $('#default-product-template').html();
                var target = $('[data-default="'+productId+'"]');

                $(this).closest('.table-item').addClass('open');
                if(target.html()){
                    target.html('');
                    $(this).closest('.table-item').removeClass('open');
                    return false;
                }

                var from   = $('#date-from').val(),
                    to     = $('#date-to').val();

                    $.ajax( {
                    url     : ajaxurl,
                    data    : {
                        action : 'ads_orders_by_productId',
                        from   : from,
                        to     : to,
                        productId  : productId
                    },
                    type    : 'POST',
                    dataType: 'json',
                    success : function( response ) {

                        if( response ) {

                            if( response.hasOwnProperty( 'error' ) ) {
                                window.ADS.notify( response.error, 'danger' );
                            } else {
                                target.html( window.ADS.objTotmpl( tmpl, response ) );
                            }
                        }
                    }
                });

        });

        }
    };

    report.init();
});
