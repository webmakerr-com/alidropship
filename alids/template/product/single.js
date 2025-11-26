jQuery(function($){
    $(document).ready(function(){


        $('#tracking-form').on('submit',function () {
            return false;
        });

        const LayzrAll = Layzr({
            normal: 'data-src'
        });
        LayzrAll
            .update()           // track initial elements
            .check()            // check initial elements
            .handlers(true);    // bind scroll and resize handlers


        if($('.item_slider').length){

            mainslider = new Swiper('.item_slider.swiper-container', {
                slidesPerView: 6,
                direction: 'vertical',
                loop: $('.single_slide .swiper-slide').length>6,
                navigation: {
                    nextEl: '.single_slide .swiper-button-next',
                    prevEl: '.single_slide .swiper-button-prev',
                    hiddenClass: 'hidden_arrow',
                    disabledClass: 'dis_arrow',
                },
                breakpoints: {
                    1199: {
                        slidesPerView: 6,
                    }
                }
            });

            $(window).resize(function(){
                setTimeout(function(){
                    //mainslider.update();
                },50)
            });

            mainadapslider = new Swiper('.item_adap_slider.swiper-container', {
                slidesPerView: 1,
                loop: $('.item_adap_slider .swiper-slide').length>1,
                lazy: true,
                pagination: {
                    el: '.item_adap_slider .swiper-pagination',
                    type: 'bullets',
                    clickable:true,
                },
            });

            $('.meta-item-img').on('click','img',function(){
                if(document.body.clientWidth<768){
                    if(!$(this).is('.added')){
                        mainadapslider.removeSlide(0);
                        mainadapslider.prependSlide('<div class="swiper-slide"><img src="'+$(this).attr('data-img')+'" class="img-responsive" alt="" /></div>')

                        mainadapslider.slideTo(1,0);
                    }
                }
                $('.single_showroom img').attr('src',$(this).attr('data-img')).attr('data-zoom-image',$(this).attr('data-img'));
                elevate_destroy();

            });
        }


        $('.Review_formcont h5 span').on('click',function() {
            $('.wrap_review_list').fadeToggle(500);
        });

        $('.single_item_content .panel-title a').on('click',function() {
            $(this).parents('.content').toggleClass('active');
        });

        //rating stars
        $('.stars_set').on('click', 'span', function() {
            var that=$(this),thats=$(this).parent().find('span')
            thats.removeClass('star_full');
            thats.each(function(){
                if(thats.index($(this))<=thats.index(that)){
                    $(this).addClass('star_full');
                }
            });
            $(this).parent().next().val(thats.index(that)+1);

        });


        //content tables
        $('.content table').each(function(){
            $(this).wrap('<div style="max-width:100%;overflow:auto;"></div>');
        });

        //fancy miniatures
        $(".revpics").each(function () {
            $(this).find('a').simpleLightbox();
        });


        if($('.recents_slider').length){
            if($('.recents_slider .swiper-slide').length>4 || document.body.clientWidth<1001){
                recents_slider = new Swiper('.recents_slider .swiper-container', {
                    slidesPerView: 4,
                    loop: $('.recents_slider .swiper-slide').length>2,
                    spaceBetween:20,
                    pagination: {
                        el: '.recents_slider .swiper-pagination',
                        type: 'bullets',
                        clickable:true,
                    },
                    navigation: {
                        nextEl: '.recents_slider .swiper-button-next',
                        prevEl: '.recents_slider .swiper-button-prev',
                    },
                    breakpoints: {
                        1000: {
                            slidesPerView: 3,
                        },
                        768: {
                            slidesPerView: 2,
                        },
                        480: {
                            spaceBetween:10,
                            slidesPerView: 2,
                        }
                    }
                });
            }else{
                recents_slider = new Swiper('.recents_slider .swiper-container', {
                    slidesPerView: 4,
                    loop: false,
                    spaceBetween:20,
                    breakpoints: {
                        1000: {
                            slidesPerView: 3,
                        },
                        768: {
                            slidesPerView: 2,
                        },
                        480: {
                            spaceBetween:10,
                            slidesPerView: 2,
                        }
                    }
                });
                $('.recents_slider .swiper-button-prev').hide();
                $('.recents_slider .swiper-button-next').hide();
            }
        }



        if($('.recs_slider').length){
            if($('.recs_slider .swiper-slide').length>4 || document.body.clientWidth<1001){
                recs_slider = new Swiper('.recs_slider .swiper-container', {
                    slidesPerView: 4,
                    loop: $('.recs_slider .swiper-slide').length>2,
                    spaceBetween:20,
                    pagination: {
                        el: '.recs_slider .swiper-pagination',
                        type: 'bullets',
                        clickable:true,
                    },
                    navigation: {
                        nextEl: '.recs_slider .swiper-button-next',
                        prevEl: '.recs_slider .swiper-button-prev',
                    },
                    breakpoints: {
                        1000: {
                            slidesPerView: 3,
                        },
                        768: {
                            slidesPerView: 2,
                        },
                        480: {
                            spaceBetween:10,
                            slidesPerView: 2,
                        }
                    }
                });
            }else{
                recs_slider = new Swiper('.recs_slider .swiper-container', {
                    slidesPerView: 4,
                    loop: false,
                    spaceBetween:20,
                    breakpoints: {
                        1000: {
                            slidesPerView: 3,
                        },
                        768: {
                            slidesPerView: 2,
                        },
                        480: {
                            spaceBetween:10,
                            slidesPerView: 2,
                        }
                    }
                });
                $('.recs_slider .swiper-button-prev').hide();
                $('.recs_slider .swiper-button-next').hide();
            }
        }


        $('.swiper-slide-active .itembgr').addClass('active');
        $('.single_slide').on('click','.itembgr',function () {
            $('.itembgr.active').removeClass('active');
            $(this).addClass('active');
            $('.single_showroom img').attr('src',$(this).attr('data-img')).attr('data-zoom-image',$(this).attr('data-zoom-image'));
            elevate_destroy();
            if(can_elevate){
                add_elevate();
            }
        });

        $('.toreview').on('click', function() {
            $('.tab_head').removeClass('active');
            $('.tab_body').removeClass('show');

            $('#item-reviews').addClass('active');
            $('.item-reviews').addClass('show');
            $('html,body').animate({scrollTop:$('.fullreviews').offset().top-130}, '2000');
        });



        //category sort
        $( '.js-select_sort' ).on( 'change', function () {
            var url = jQuery( this ).val();
            if ( url ) {
                window.location = url;
            }
            return false;
        } );

    });

    $('.chart_modal').on('click',function(e){
        if (!$(e.target).closest('table').length) {
            $(this).fadeOut(500);
        }
    });

    $('.chart_close').on('click',function(e){
        $('.chart_modal').fadeOut(500);
    });

    $('.size_chart_btn').on('click',function(e){
        $('.chart_modal').fadeIn(500);
        return false;
    });

    function add_elevate(){
        if(document.body.clientWidth>1279){
            $('.makezoom').elevateZoom({
                zoomType				: "inner",
                cursor: "crosshair"
            });
        }
    }

    function elevate_destroy(){
        $('.makezoom').removeData('elevateZoom');
        $('.makezoom').removeData('zoomImage');
        $('.zoomWrapper img.zoomed').unwrap();
        $('.zoomContainer').remove();
    }

    can_elevate=1;

    function check_elevate(){
        if($('.makezoom').length){
            $('.makezoom').css('width','auto');
            if($('.single_showroom').width()>$('.makezoom').width() && $('.single_showroom').height()>$('.makezoom').height()){
                can_elevate=0;
            }else{
                can_elevate=1;
            }
            $('.makezoom').removeAttr('style');
        }

        if(can_elevate){
            add_elevate();
        }
    }

    $(window).load(function(){
        check_elevate();
    });

    $(window).resize(function(){
        check_elevate();
    });


    function tab_head(that){
        $('.tab_head').removeClass('active');
        $('.adap_tab_head').removeClass('active');
        that.addClass('active');
        $('.tab_body').removeClass('show');
        $('.'+that.attr('id')).addClass('show').prev().addClass('active');
    }

    $('.tab_head').on('click',function() {
        tab_head($(this));
    });

    if(document.location.hash=='#comments'){
        $('html,body').animate({scrollTop:$('#item-reviews').offset().top-130}, '0');
        tab_head($('#item-reviews'));

    }

    $('.adap_tab_head').on('click',function() {
        if($(this).is('.active') && !$(this).is('.adap_inactive')){
            $(this).addClass('adap_inactive');
        }else{
            $('.tab_head').removeClass('active');
            $('.adap_tab_head').removeClass('active');
            $(this).addClass('active').removeClass('adap_inactive');
            $('.tab_body').removeClass('show');
            $('.'+$(this).attr('data-id')).addClass('show');
            $('#'+$(this).attr('data-id')).addClass('active');
        }

    });




});











