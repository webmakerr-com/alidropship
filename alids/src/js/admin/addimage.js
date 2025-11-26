jQuery(function($){
    $(document).ready(function(){

        function init_crop( e ) {
            if(typeof $.fn.cropper == 'undefined'){
                return;
            }

            var uploadedImageType = '';
            var height            = parseInt( $( e ).data( 'height' ) );
            var width             = parseInt( $( e ).data( 'width' ) );
            var options           = {
                aspectRatio : width / height,
                //dragMode: 'move',
                cropBoxResizable: false,
                zoomable: false,
                scalable: false,
                data        : {
                    x      : 0,
                    y      : 0,
                    height : height,
                    width  : width
                }
            };

            // Import image
            var $inputFileUrl = $( e ).find( '.file_url' );
            var $image      = $( e ).find( ".cropper" );
            var $self      = $( e );

            $image.cropper( options );

            $inputFileUrl.change( function () {
                if ( !$image.data( 'cropper' ) ) {
                    return;
                }
                $image.cropper( 'destroy' ).attr( 'src', $(this).val() );//.cropper( options );

            } );
            $image.cropper("setDragMode", "move");

            $( e ).find('.crop_file').prop('disabled', false).show();

            function crop (images, p, zoomWidth, zoomHeight){
                var crop_canvas,
                    left = p.left,
                    top =  p.top,
                    width = p.width,
                    height = p.height;

                var img = new Image();

                img.src = $(images).attr('src');

                var cW = $(images).width();
                var cH = $(images).height();

                var kW = img.width/cW;
                var kH = img.height/cH;

                crop_canvas = document.createElement('canvas');
                crop_canvas.width = width*kW;
                crop_canvas.height = height*kH;

                var kHW = zoomWidth/width;
                var kHH = zoomHeight/height;

                crop_canvas.getContext('2d').drawImage(img, left*kW, top*kH, zoomWidth, zoomHeight, 0, 0, width*kW, height*kH);

                $('body').append(crop_canvas);
                return crop_canvas.toDataURL("image/png");
            }

            $( e ).find('.crop_file').on('click', function () {
                var _this = $(this);


                var data = _this.data();
                var result;

                _this.prop('disabled', true);

                if ($image.data('cropper')) {
                    data = $.extend( {}, data ); // Clone a new one

                    if ( !data.option ) {
                        data.option = {};
                    }

                    if ( uploadedImageType === 'image/jpeg' ) {
                        data.option.fillColor = '#fff';
                    }

                    result = $image.cropper( 'getCroppedCanvas', data.option );


                    if ( result ) {

                        var form_Data = new FormData();

                        form_Data.append('action', 'ads_Media');
                        form_Data.append('ads_action', 'save_image64');
                        form_Data.append('file64', result.toDataURL( uploadedImageType ));
                        form_Data.append('src', $self.find('.file_url').val());
                        form_Data.append('crop_name', $self.find('.file_url').data('crop_name'));

                        $.ajax( {
                            url      : ajaxurl,
                            dataType : 'json',
                            data     : form_Data,
                            contentType:false,
                            processData:false,
                            type     : "POST",
                            success  : function ( attachment ) {
                                $self.find('.preview-upload').attr('src', attachment.url).parent().show();
                                $self.find('.file_url').val(attachment.id).trigger("change");
                                _this.hide();
                            }
                        } );
                    }
                }

                return false;

            } );
        }

        function add_img($el) {
            var _this = this;
            $el.find('.upload_file').click(function (e) {
                e.preventDefault();
                var button = $(this);
                var custom_uploader = wp.media({
                    multiple: false
                })
                    .on('select', function () {
                        var attachment = custom_uploader.state().get('selection').first().toJSON();
                        $(button).closest('.uploadImg-box').find('.preview-upload')
                            .attr('src', attachment.url)
                            .parent()
                            .show();
                        $(button).closest('.uploadImg-box').find('.file_url').val(attachment.id).trigger("change");
                        //init_crop($(button).closest('.uploadImg-box'));
                    })
                    .open();

                return false;
            });

            $el.find('.remove_file').click(function () {
                var r = true;//confirm("Уверены?");
                if (r == true) {
                    $(this).closest('.uploadImg-box').find('.preview-upload').attr('src', '').parent().hide();
                    $(this).closest('.uploadImg-box').find('.crop_file').hide();
                    $(this).closest('.uploadImg-box').find('.file_url').val('').trigger("change");
                    $(this).closest('.uploadImg-box').find('.file_url').parent().removeClass('active');
                }
                return false;
            });
        }
        $('.uploadImg-box').each(function(){
            add_img($(this));
        });






    });
});