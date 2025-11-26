jQuery(function($){
    $(document).ready(function(){

        //category sort
        $( '.js-select_sort' ).on( 'change', function () {
            var url = jQuery( this ).val();
            if ( url ) {
                window.location = url;
            }
            return false;
        } );

        const LayzrAll = Layzr({
            normal: 'data-src'
        });
        LayzrAll
            .update()           // track initial elements
            .check()            // check initial elements
            .handlers(true);    // bind scroll and resize handlers

    });

});