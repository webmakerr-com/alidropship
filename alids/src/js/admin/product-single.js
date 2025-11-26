jQuery(function ($) {

    //var productSingle =
        (function () {
        var $this;

        var form = [
            '#ads-form-box-callGeneral',
            '#ads-form-box-callInventory',
            '#ads-form-box-callVariation',
            '#ads-form-box-callShipping',
            '#ads-form-box-callAttributes',
            '#ads-form-box-callPackaging',
            '#ads-form-box-callSupplier',
            '#ads-form-box-callGallery',
            '#ads-form-box-callCrossSelling',
            '#ads-form-box-callReviews',
            '#ads-form-box-callSeo'

        ];


        function isChangeFormFilds(el) {
            if (!$(el).data('hash')) {
                return false;
            }

            return $(el).data('hash') !== $(el).find("input, textarea, select").not('.not-hash').serialize();
        }

        return {
            init: function () {

                if ($this) return;
                $this = this;

                $(document).on('request:done', function (e) {

                });


                $('body').on('click', '#publish', function () {
                    if (!$('#ads-product-single-options').length) {
                        return;
                    }
                    for (var i in form) {
                        if (isChangeFormFilds(form[i])) {
                            var save = confirm($('.confirm-text').val());
                            if (save) {
                                for (var x in form) {
                                    if (isChangeFormFilds(form[x])) {
                                        $(form[x]).closest('.body-panel').find('.foot-panel [name="save"]').click();
                                    }
                                }
                                return false;
                            }
                            break;
                        } else {
                            $('#ads-product-single-options').remove();
                        }
                    }

                });


            }
        }
    })().init();

    //var ItemSpecific =
    (function () {
        var $this;
        var obj = {
            check: '#checkAll-Attributes',
            'bulk-apply': '#bulk-apply-attributes',
            'bulk-action': '#bulk-action-attributes',
        };

        function renderChecker() {

            var u = $('#ads-form-callAttributes').find('.table-container [id^="check-item-"]:not(:checked)');

            if (u.length && $(obj.check).prop("checked")) {
                $(obj.check).prop("checked", false);
            } else if (u.length === 0 && !$(obj.check).prop("checked")) {
                $(obj.check).prop("checked", true);
            }
            $.uniform.update(obj.check);
        }

        function checker() {

            $(document).on('change', obj.check, function () {
                $(this).closest('.table-container').find('[id^="check-item-"]').prop('checked', $(this).is(':checked'));
                $.uniform.update();
            });

            $('body').on('click', '.table-container .attr-item-line', renderChecker);

        };

        function bulk() {
            $('body').on('click', obj['bulk-apply'], function (e) {
                e.preventDefault();

                var value = $(obj['bulk-action']).val();

                var items = $('#ads-form-callAttributes').find('.table-container [id^="check-item-"]:checked')
                    .closest('.attr-item-line');

                if (!items.length) {
                    window.ADS.notify($('.select-element-text').val());
                    return false;
                }

                switch (value) {
                    case 'delete':
                        items.remove();
                        $('[data-for="#ads-form-callAttributes"]').click();

                        break;
                }
                return false;
            })
        }

        return {
            init: function () {
                if ($this) return;
                $this = this;

                $('body').on('click', '#ads-form-callAttributes .js-add-attributes', function (e) {
                    var tmpl = $('#ads-tmpl-attributes-row').html();
                    $('#ads-form-callAttributes .table-container').append(window.ADS.objTotmpl(tmpl, {
                        name: '',
                        value: ''
                    }));
                    $('#ads-form-callAttributes .table-container').find('.uniform-checkbox, .uniform-radio').uniform();
                    renderChecker();
                    //$('[data-for="#ads-form-callAttributes"]').click();
                    return false;
                });

                $('body').on('click', '#ads-form-callAttributes .js-remove', function (e) {
                    $(this).closest('.attr-item-line').remove();
                    renderChecker();
                    $('[data-for="#ads-form-callAttributes"]').click();
                    return false;
                });

                $('body').on('click', '#ads-form-callAttributes .js-reset-attributes', function (e) {
                    e.preventDefault();
                    var _this = this;
                    window.ADS.btnLock($(_this));
                    window.ADS.product($('[name="post_id"]').val(), ['productUrl'])
                        .then(function (product) {
                            var productUrl = product.productUrl;
                            return window.ADS.aliExtension.productAli(productUrl).then(function (params) {
                                return params.product
                            });

                        }).then(function (product) {
                        var params = {attributes: product.params};
                        var tmpl = $('#ads-tmpl-callAttributes').html();
                        $('#ads-form-box-callAttributes').html(window.ADS.objTotmpl(tmpl, params));
                        $('#ads-form-box-callAttributes').find('.uniform-checkbox, .uniform-radio').uniform();
                        renderChecker();
                        $('[data-for="#ads-form-callAttributes"]').click();
                        window.ADS.btnUnLock($(_this));
                    });
                });

                checker();
                bulk();
            }
        }
    })().init();

    function isNumeric(value) {
        return /^-?\d+$/.test(value);
    }

    //var callGallery =
        (function () {
        var $this;

        var obj = {
            row: '#tmpl-row-edit',
            img: '#tmpl-item-media',
            gallery: '#ads-gallery',
            sku: '#ads-sku'
        };

        function manageGallery() {

            var el = obj.gallery;
            var item = '.image-item';

            $(el).sortable({
                items: ".image-item:not(#ads-upload-image)"
            });

            $(el).on('click', '[data-toggle="remove"]', function () {
                $(this).parents(item).remove();
                return false;
            });

            $(el).on('click', '[data-toggle="move-left"]', function () {
                var $th = $(this).parents(item);
                if ($th.prev().length) {
                    $th.prev().before($th);
                }
                return false;
            });

            $(el).on('click', '[data-toggle="move-right"]', function () {
                var $th = $(this).parents(item);
                if ($th.next().length) {
                    $th.next().after($th);
                }
                return false;
            });

            $(el).on('click', '[data-toggle="move-featured"]', function () {
                var $th = $(this).parents(item);
                var $gallery = $th.find('[name="gallery[]"]');
                if ($gallery) {
                    console.log($gallery.val());

                    let val = $gallery.val();

                    $.ajax({
                        url: ajaxurl,
                        data: {
                            action: 'ads_action_request_post',
                            ads_action: 'ads_set_featured',
                            args : {
                                post_id: $('[name="post_ID"]').val(),
                                val: val,
                            }

                        },
                        type: "POST",
                        success: function (response) {

                            if(!isNumeric(val)){
                                if($('.featured-custom').length){
                                    $('.featured-custom').attr('src', val )
                                }
                            }
                        }
                    });


                }


                return false;
            });
        };

        function checkExistingId(id) {

            var el = $(obj.gallery).find('.image-item');

            if (!el.length) return false;

            id = id.toString();

            var res = false;
            el.each(function () {

                var value = $(this).find('[name="gallery[]"]').val();

                if (value == id)
                    res = true;
            });

            return res;
        }

        function mediaUploader() {

            return new Promise(function (resolve, reject) {
                var file_frame;

                if (undefined !== file_frame) {
                    file_frame.open();
                    return;
                }

                file_frame = wp.media.frames.file_frame = wp.media({
                    frame: 'post',
                    state: 'insert',
                    multiple: false
                });

                file_frame.state('embed').on( 'select', function() {
                    var state = file_frame.state(),
                        type = state.get('type'),
                        embed = state.props.toJSON();


                    return resolve({
                        url : embed.url
                    })
                });

                file_frame.on('insert', function () {

                    file_frame.state().get('selection').each(function (image) {
                        return resolve({
                            url : image.changed.url
                        })
                    });

                });

                file_frame.open();
            })


        }

        function renderMediaUploader() {

            var file_frame;

            if (undefined !== file_frame) {
                file_frame.open();
                return;
            }

            file_frame = wp.media.frames.file_frame = wp.media({
                frame: 'post',
                state: 'insert',
                multiple: true
            });

            file_frame.state('embed').on( 'select', function() {
                var state = file_frame.state(),
                    type = state.get('type'),
                    embed = state.props.toJSON();

                if( 'image' !== type){
                    return;
                }

                let response = {value: embed.url, url: embed.url};
                $(obj.gallery).find('#ads-upload-image').before(window.ADS.objTotmpl($(obj.img).html(), response))
            });

            file_frame.on('insert', function () {

                file_frame.state().get('selection').each(function (image) {
                    var id = image.id;
                    if (!checkExistingId(image.id)) {
                        $.ajax({
                            url: ajaxurl,
                            data: {
                                action: 'ads_get_image',
                                id: id,
                                size: 'ads-medium'
                            },
                            type: "POST",
                            success: function (response) {

                                response = {value: id, url: response};
                                $(obj.gallery).find('#ads-upload-image').before(window.ADS.objTotmpl($(obj.img).html(), response))
                            }
                        });
                    }
                });

            });

            file_frame.open();
        }

        return {
            init: function () {
                if ($this) return;
                $this = this;

                $('body').on('click', '#ads-upload-image', function (e) {
                    e.preventDefault();
                    renderMediaUploader();

                });

                $('body').on('click', '.select-media', function (e) {
                    e.preventDefault();
                    let input = $(this).closest('.row-media').find('input');
                    mediaUploader().then((image) => {
                        input.val(image.url)
                    });

                });

                $(document).on('request:done', function (e) {

                    if ('#ads-form-box-callGallery' === e.obj) {
                        manageGallery();
                    }
                });

            }
        }
    })().init();

    //var Attributes =
        (function () {
        var $this;

        var obj = {
            head: {
                edit: '.attr-head .js-edit',
                remove: '.attr-head .js-remove',
            },
            sku: {
                remove: '.row-sku .js-remove',
            },
            addAttributes: '.js-add-attributes',
            addSku: '.js-add-item',
            root: '.product-sku',
            rootSku: '.attr-sku',
            template: {
                prop: $('#ads-tmpl-callInventory-prop').html(),
                sku: $('#ads-tmpl-callInventory-sku').html(),
                img: $('#ads-tmpl-callInventory-sku-img').html()
            }
        };

        function renderMediaUploader(cb) {

            var file_frame;

            if (undefined !== file_frame) {
                file_frame.open();
                return;
            }

            file_frame = wp.media.frames.file_frame = wp.media({
                frame: 'post',
                state: 'insert',
                multiple: false
            });

            file_frame.on('insert', function () {

                file_frame.state().get('selection').each(function (image) {
                    var id = image.id;
                    $.ajax({
                        url: ajaxurl,
                        data: {
                            action: 'ads_get_image',
                            id: id,
                            size: 'ads-medium'
                        },
                        type: "POST",
                        success: function (response) {
                            response = {value: id, url: response};
                            cb(response);
                        }
                    });
                });

            });

            file_frame.open();
        }

        return {
            init: function () {
                if ($this) return;
                $this = this;

                $('body').on('click', obj.head.edit, function () {
                    var i = $(this).closest('.attr-head').find('.attr-title input');
                    var len = i.val().length * 2;
                    i.focus();
                    i[0].setSelectionRange(len, len);
                });

                $('body').on('click', obj.head.remove, function (e) {
                    e.preventDefault();
                    $(this).closest('.row-attr').remove();
                });

                $('body').on('click', obj.sku.remove, function (e) {
                    e.preventDefault();
                    $(this).closest('.row-sku').remove();
                });

                $('body').on('click', obj.addAttributes, function (e) {
                    e.preventDefault();
                    var inventory = [];

                    var key_prop = (function () {
                        var prop = [],
                            max = 0;

                        $('.product-sku .row-attr').find('input[name="key_prop"]').each(function (e, i) {
                            prop.push($(this).val());
                        });

                        if (prop.length)
                            max = Math.max.apply(null, prop);

                        return max + 1;
                    })();

                    inventory[key_prop] = {title: ''};
                    $(obj.root).prepend(window.ADS.objTotmpl(obj.template.prop, {inventory: inventory}));

                });

                $('body').on('click', obj.addSku, function (e) {
                    e.preventDefault();
                    var $root = $(this).closest(obj.rootSku).find('.list-sku');


                    var key_sku = (function () {
                        var sku = [],
                            max = 0;
                        $root.find('input[name="key_sku"]').each(function (e, i) {
                            sku.push($(this).val());
                        });

                        if (sku.length)
                            max = Math.max.apply(null, sku);

                        return max + 1;
                    })();

                    var key_prop = $(this).closest('.row-attr').find('input[name="key_prop"]').val();

                    var inventory = [];
                    inventory[key_prop] = {
                        title: '',
                        sku: []
                    };

                    inventory[key_prop]['sku'][key_sku] = {title: ''};

                    $root.append(window.ADS.objTotmpl('{{#each inventory}}' + obj.template.sku + '{{/each}}', {inventory: inventory}));
                });

                $('body').on('click', '.js-add-img', function (e) {
                    e.preventDefault();
                    var $root = $(this).closest('.row-sku');
                    renderMediaUploader(function (response) {
                        $root.find('.js-img-value').val(response.value);
                        $root.find('.js-sku-img').html(window.ADS.objTotmpl(obj.template.img, {
                            img_url: response.url
                        }))
                    });

                });

                $('body').on('click', '.js-delete-img', function (e) {
                    e.preventDefault();
                    var $root = $(this).closest('.row-sku');
                    $root.find('.js-img-value').val('');
                    $root.find('.js-sku-img').html(window.ADS.objTotmpl(obj.template.img, {
                        img_url: false
                    }))
                });

                 $(document).on('request:done', function (e) {
                     if ('#ads-form-box-callVariation' === e.obj) {
                        $('.list-sku').sortable({
                            items: ".row-sku",
                            handle: ".js-sort",
                        });
                    }
                });
            }
        }
    })().init();

    //var Variations =
        (function () {
        var $this;

        let globalResponse;

        var obj = {
            'bulk-apply': '#bulk-apply-variation',
            'bulk-action': '#bulk-action-variation'
        };

        function renderEdit(enable) {
            $('#bulk-edit').toggle(enable);
        }

        function checker(root) {
            var checkerObj = {
                all: '.checkAll',
                item: '.check-item'
            };

            function renderChecker() {

                var u = $(root).find(checkerObj.item).not(':checked');
                if (u.length && $(checkerObj.all).prop("checked")) {
                    $(root + ' ' + checkerObj.all).prop("checked", false);
                } else if (u.length === 0 && !$(checkerObj.all).prop("checked")) {
                    $(root + ' ' + checkerObj.all).prop("checked", true);
                }
                $.uniform.update(root + ' ' + checkerObj.all);
            }

            $(document).on('change', root + ' ' + checkerObj.all, function () {
                $(this).closest(root).find(checkerObj.item).prop('checked', $(this).is(':checked'));
                $.uniform.update();
            });

            $('body').on('click', root + ' ' + '.table-item', renderChecker);

        };

        function bulk() {
            $('body').on('click', obj['bulk-apply'], function (e) {
                e.preventDefault();

                var value = $(obj['bulk-action']).val();

                var $root = $('#ads-form-callVariation').find('.table-container .check-item:checked').closest('.table-item');
                if (!$root.length) {
                    window.ADS.notify($('.select-element-text').val());
                    return false;
                }

                window.ADS.btnLock($(obj['bulk-apply']));

                switch (value) {
                    case 'delete':

                        $root.each(function () {
                            var id = $(this).data('id');
                            $('.edit-variation.edit-' + id).remove();
                            $('.row-variation-supplier-' + id).remove();
                        });

                        $root.remove();
                        $('[data-for="#ads-form-callVariation"]').click();
                        break;
                    case 'edit':
                        var price = $('[name="bulk[price]"]').val();
                        var salePrice = $('[name="bulk[salePrice]"]').val();
                        var quantity = $('[name="bulk[quantity]"]').val();

                        $root.each(function () {
                            var id = $(this).data('id');
                            var $item = $('.edit-variation.edit-' + id);

                            if (price !== '') {
                                $item.find('[name*="variation[price]"]').val(price);
                                $('[name="bulk[price]"]').val('');
                            }
                            if (salePrice !== '') {
                                $item.find('[name*="variation[salePrice]"]').val(salePrice);
                                $('[name="bulk[salePrice]"]').val('');
                            }
                            if (quantity !== '') {
                                $item.find('[name*="variation[quantity]"]').val(quantity);
                                $('[name="bulk[quantity]"]').val('');
                            }
                        });

                        $('[data-for="#ads-form-callVariation"]').click();
                        break;
                    case 'split':

                        var selectSkuAttr = [];
                        $root.each(function () {
                            selectSkuAttr.push($(this).data('key'));
                        });

                        if (!selectSkuAttr) {
                            return;
                        }

                        $.ajax({
                            url: ajaxurl,
                            dataType: 'json',
                            data: {
                                action: 'ads_action_split_variations',
                                skuAttr: selectSkuAttr,
                                post_ID: $('#post_ID').val()
                            },
                            type: "POST",
                            success: function (response) {
                                window.ADS.btnUnLock($(obj['bulk-apply']));
                                window.ADS.notify(response.message, 'success');
                            }

                        });

                        break;
                    default:
                        window.ADS.btnUnLock($(obj['bulk-apply']));
                        break;
                }
                return false;
            });

            $('body').on('change', $(obj['bulk-action']), function () {
                var value = $(obj['bulk-action']).val();

                renderEdit(value === 'edit');

            });
        }

        function renderSupplier() {

            let response = globalResponse;

            for (let key in response.variation) {
                let variation = response.variation[key];
                for(let keySupplier in variation.suppliers){
                    let suppliers = variation.suppliers[keySupplier]
                    changeSupplier(key, keySupplier, suppliers.suppliers_values)

                }
            }

        }

        function addSupplier(key, skuIndex){
            let tmpl = $('#new_row_variation_supplier').html();

            let $root = $('.row-variation-supplier-' + key);

            let response = globalResponse;
            let new_skuIndex = parseInt(skuIndex) + 1

            let new_variation = {
                key : key,
                skuIndex : new_skuIndex,
                suppliers_values: response.suppliers_values,
                supplier_value: 'default',
            };

            $root.find('.btn-add-supplier-variant').before(window.ADS.objTotmpl(tmpl, new_variation));
            $root.find('.variation_supplier-'+new_skuIndex).find('.suppliers_values').selectpicker();

            let variation = response.variation[key];

            variation.supplier_sku_option = response.supplier_sku_values_default;

            variation.key = key;

            let $rootVariation = $('.row-variation-supplier[data-id="' + key + '"] .variation_supplier[data-id="' + new_skuIndex + '"] .supplier_sku_value');
            $rootVariation.html(window.ADS.objTotmpl($('#select_ali_variation').html(), variation));
            $rootVariation.find('.supplier_sku_values').val('');
            $rootVariation.find('.supplier_sku_values').selectpicker();

        }

        function changeSupplier(key, keySupplier, suppliers_values) {

            let response = globalResponse;

            let tmpl = $('#select_ali_variation').html();

            let variation = response.variation[key];
            if (suppliers_values === 'default') {
                variation.supplier_sku_option = response.supplier_sku_values_default;
            } else {
                variation.supplier_sku_option = response.supplier_sku_values[suppliers_values];
            }

            variation.key = key;
            variation.keySupplier = keySupplier;

            let $root = $('.row-variation-supplier[data-id="' + key + '"] .variation_supplier[data-id="' + keySupplier + '"] .supplier_sku_value');

            $root.html(window.ADS.objTotmpl(tmpl, variation));
            let supplier_sku_values = variation.suppliers[keySupplier] && variation.suppliers[keySupplier].supplier_sku_values ? variation.suppliers[keySupplier].supplier_sku_values : '';
            $root.find('.supplier_sku_values').val(supplier_sku_values);
            $root.find('.supplier_sku_values').selectpicker();

        }

        function renderBtnDeleteSupplierVariant(){
            $('.row-variation-supplier').each(function (){
                $btn = $(this).find('.js-delete-supplier-variant');
                $btn.show();
                if($btn.length === 1){
                    $btn.hide();
                }
            })
        }

        let countLoaderCallVariation = 0;

        return {
            init: function () {
                if ($this) return;
                $this = this;

                $(document).on('request:done', function (e) {
                    if (e.obj !== '#ads-form-box-callVariation') {
                        return;
                    }
                    renderBtnDeleteSupplierVariant();

                    countLoaderCallVariation++;

                    globalResponse = e.response;
                    renderSupplier(e.response);

                    if(countLoaderCallVariation > 1)
                        window.ADS.mainRequest($('#ads-form-callInventory'));

                    window.ADS.btnUnLock($(obj['bulk-apply']));
                });

                $('body').on('change', 'select.suppliers_values', function () {
                    let suppliers_values = $(this).val();
                    let key = $(this).closest('.row-variation-supplier').attr('data-id');
                    let keySupplier = $(this).closest('.variation_supplier').attr('data-id');
                    changeSupplier(key, keySupplier, suppliers_values)
                });

                $('body').on('click', '.js-add-supplier-variant', function () {
                    let key = $(this).closest('.row-variation-supplier').attr('data-id');

                    let skuIndex = 0;
                    $(this).closest('.row-variation-supplier').find('.variation_supplier')
                        .each(function (){
                            skuIndex = $(this).attr('data-id');
                    });

                    addSupplier(key, skuIndex);
                    renderBtnDeleteSupplierVariant();
                    return false;
                });

                $('body').on('click', '.js-delete-supplier-variant', function () {
                    $(this).closest('.variation_supplier').remove();
                    renderBtnDeleteSupplierVariant();
                    return false;
                });





                $('body').on('click', '.row-variation .js-edit', function (e) {
                    e.preventDefault();
                    var $root = $(this).closest('.row-variation');
                    $root.toggleClass('open');
                    let id = $root.attr('data-id');
                    $('.edit-variation.edit-'+id).toggleClass('open');
                });

                $('body').on('click', '.js-split', function (e) {
                    e.preventDefault();
                    var _self = this;
                    window.ADS.btnLock($(_self));
                    $.ajax({
                        url: ajaxurl,
                        dataType: 'json',
                        data: {
                            action: 'ads_action_split_attr',
                            prop_id: $(this).data('prop_id'),
                            post_ID: $('#post_ID').val()
                        },
                        type: "POST",
                        success: function (response) {
                            window.ADS.btnUnLock($(_self));
                            window.ADS.notify(response.message, 'success');
                        }

                    });

                });

                $('body').on('click', '.row-variation .js-delete', function (e) {
                    e.preventDefault();
                    var $root = $(this).closest('.row-variation');
                    var id = $root.data('id');
                    $('.edit-variation.edit-' + id).remove();
                    $('.row-variation-supplier-' + id).remove();
                    $root.remove();
                    $('[data-for="#ads-form-callVariation"]').click();
                });

                $('body').on('change', '#variation_default', function (e) {
                    e.preventDefault();
                    $('[data-for="#ads-form-callVariation"]').click();
                });

                checker('#ads-form-box-callVariation');
                bulk();
            }
        }
    })().init();

    //var VariationsAdd =
        (function () {
        var $this;

        var obj = {
            root: '.select-sku',
            row: '.js-list-sku-row',
            sku: '.js-select-sku-item',
            value: '#js-new_sku_item',
            addBtn: '#js-variations-add',
        };

        var params = {
            skuAttr: {},
            sku: {},
            variation: [],
            skuRender: []
        };

        function getSelectSku() {
            var foo = [];
            $(obj.sku + '.active').each(function (i, e) {
                foo.push($(this).data('key'));
            });

            if ($(obj.row).length !== foo.length)
                return [];

            return foo;
        }

        function renderSku() {

            var foo = [];
            $(obj.sku + '.active').each(function (i, e) {
                foo.push($(this).data('key'));
            });

            var l = foo.length;

            $(obj.sku).addClass('disabled');

            $.each(params.generateVariation, function (i, skuAttrName) {

                if (typeof params.skuAttr[skuAttrName] !== 'undefined') {
                    return;
                }

                var sku = skuAttrName.split(';');
                var count = 0;
                for (var k in foo) {
                    if (foo[k] == sku[k]) {
                        count++;
                    }
                }

                if (count >= l - 1) {
                    $.each(sku, function (i) {
                        $(obj.sku + '[data-key="' + sku[i] + '"]').removeClass('disabled');
                    });
                }

            });

            $(obj.sku + '.active.disabled').removeClass('active');
        }

        function setActiveDefault() {
            for (var i in params.generateVariation) {
                var skuAttrName = params.generateVariation[i];
                if (typeof params.skuAttr[skuAttrName] !== 'undefined') {
                    continue;
                }
                var sku = skuAttrName.split(';');

                $.each(sku, function (i) {
                    $(obj.sku + '[data-key="' + sku[i] + '"]').addClass('active');
                });

                break;
            }
            return skuAttrName;
        }

        function setValue() {
            $(obj.value).val(getSelectSku().join(';'));
        }

        return {
            init: function () {
                if ($this) return;
                $this = this;

                $(document).on('request:done', function (e) {
                    if (e.obj !== '#ads-form-box-callVariation') {
                        return;
                    }

                    var response = e.response;

                    params.skuAttr = response.skuAttr;
                    params.variation = response.variation;
                    params.skuRender = response.skuRender;
                    params.sku = response.sku;
                    params.generateVariation = response.generateVariation;
                    setActiveDefault();
                    setValue();
                    renderSku();
                });

                $('body').on('click', obj.sku + ':not(.disabled)', function () {
                    $(this).closest(obj.row).find(obj.sku).removeClass('active');
                    $(this).addClass('active');
                    setValue();
                    renderSku();
                });

            }
        }
    })().init();


    //var Shipping =
        (function () {
        var $this;

        var active = false;

        return {
            init: function () {
                if ($this) return;
                $this = this;

                $('body #ads-form-callShipping').on('click', '.checkbox:not(.disabled) input[type="checkbox"]', function () {
                    if (active) {
                        return;
                    }
                    active = true;
                    $('[data-for="#ads-form-callShipping"]').click();
                    $('input[type="checkbox"]', 'body #ads-form-callShipping').prop("disabled", true);
                });

                $(document).on('request:done', function (e) {

                    if (e.obj !== '#ads-form-box-callShipping') {
                        return;
                    }

                    $('.checkbox:not(.disabled) input[type="checkbox"]', 'body #ads-form-callShipping').prop("disabled", false);

                    active = false;
                });

            }
        }
    })().init();

    //var CrossSelling =
        (function () {
        var $this;

        var obj = {
            addProductBtn: '#js-cross-selling-add-product',
            targetValue: '#js-cross-selling-applyto',
            bulk: {
                apply: '#bulk-apply-crossSelling',
                value: '#bulk-action-crossSelling'
            }
        };

        function bulk() {
            $('body').on('click', obj.bulk.apply, function (e) {
                e.preventDefault();

                var value = $('body').find(obj.bulk.value).val();

                var $items = $('body').find('.check-item:checked').closest('.table-item');

                if (!$items.length) {
                    window.ADS.notify($('.select-element-text').val());
                    return false;
                }

                switch (value) {
                    case 'delete':

                        var targetValue = $(obj.targetValue).val();

                        targetValue = targetValue ? targetValue.split(',') : [];

                        $items.each(function () {
                            var id = $(this).data('id');
                            targetValue.splice(targetValue.indexOf(id), 1);

                        });

                        $(obj.targetValue).val(targetValue.join(','));
                        $('[data-for="#ads-form-callCrossSelling"]').click();
                        break;
                }

                return false;
            });

        }

        function getApply() {
            var targetValue = $(obj.targetValue).val();
            return targetValue ? targetValue.split(',') : [];
        }

        return {
            init: function () {
                if ($this) return;
                $this = this;

                $(document).on('request:done', function (e) {

                    if (e.obj !== '#ads-form-box-callCrossSelling') {
                        return;
                    }

                    $(obj.addProductBtn).selectProductsAds(function (data) {

                        var post_ids = data.join(',');

                        $(obj.targetValue).val(post_ids);

                        $('[data-for="#ads-form-callCrossSelling"]').click();

                    }, {list: getApply});

                    if (getApply().length)
                        window.ADS.createJQPagination('#ads-form-box-callCrossSelling', getApply().length, $('.bulk-crossSelling .page').val());

                    window.checker('#ads-form-box-callCrossSelling');

                    $('#ads-form-box-callCrossSelling').on('pagination:click', function (e) {
                        $('.bulk-crossSelling .page').val(e.page);

                        window.sendOptionsProduct('callCrossSelling', {
                            page: e.page,
                            post_id: $('[name="post_id"]').val(),

                        }, function (response) {
                            $('.cross-product-list').html(window.ADS.objTotmpl($('#ads-tmpl-cross-product-list').html(), response))
                                .find('.uniform-checkbox, .uniform-radio').uniform();
                            $('.table-item').click();
                        });

                    });

                });

                bulk();

            }
        }
    })().init();

});

jQuery(function ($) {

    $('.ads-product-options-menu a').click(function (e) {
        // No e.preventDefault() here
        $(this).tab('show');
    });

    $('body').on('click', '.go-tab-variation a', function (e) {
        // No e.preventDefault() here
        $(this).tab('show');
    });

    window.checker = function (root) {
        var checkerObj = {
            all: '.checkAll',
            item: '.check-item'
        };

        function renderChecker() {

            var u = $(root).find(checkerObj.item).not(':checked');

            if (u.length && $(root + " " + checkerObj.all).prop("checked")) {
                $(root + " " + checkerObj.all).prop("checked", false);
            } else if (u.length === 0 && !$(checkerObj.all).prop("checked")) {
                $(root + " " + checkerObj.all).prop("checked", true);
            }
            $.uniform.update(root + " " + checkerObj.all);
        }

        $(document).on('change', root + " " + checkerObj.all, function () {
            $(this).closest(root).find(checkerObj.item).prop('checked', $(this).is(':checked'));
            $.uniform.update();
        });

        $('body').on('click', root + " " + '.table-item', renderChecker);

    };

    window.sendOptionsProduct = function (action, args, cb) {
        $.ajax({
            url: ajaxurl,
            dataType: 'json',
            data: {
                action: 'ads_action_request_post',
                ads_action: action,
                args: args
            },
            type: "POST",
            success: cb

        });
    };

    //var Reviews =
        (function () {
        var $this;

        var _obj = {
            count: 0,
            country: 'US'
        };

        function getStar(width) {
            var star;
            width = parseInt(width.replace(/[^0-9]/g, ''));

            star = 0;
            if (width > 0) {
                star = parseInt(5 * width / 100);
            }

            return star;
        }

        function buildUrl(hostName, urlArray) {
            var url = hostName + '?';
            var urlParams = [];

            $.each(urlArray, function (index, value) {
                if (typeof value === 'undefined') {
                    value = '';
                }
                urlParams.push(index + '=' + value);
            });

            url += urlParams.join('&');
            return url;
        }

        function parseUrl(url) {

            var chipsUrl = url.split('?'),
                hostName = chipsUrl[0],
                paramsUrl = chipsUrl[1],
                chipsParamsUrl = paramsUrl.split('&'),
                urlArray = {};

            $.each(chipsParamsUrl, function (i, value) {
                var tempChips = value.split('=');
                urlArray[tempChips[0]] = tempChips[1];
            });

            return {
                'hostName': hostName,
                'urlArray': urlArray
            };
        }

        function addReview(page, post_id, feedbackUrl, product_id, productUrl) {

            var select_translate = $('#select_translate').val();

            var args = {
                rate: $('#min_star').val(),
                countReviews: $('#count_review').val(),
                onlyFromMyCountry: false,
                translate: select_translate === 'none' ? '+N+' : '+Y+',
                ignoreImages: $('#ignoreImages').is(':checked'),
                withPictures: $('#withImage').is(':checked'),
                uploadImages: $('#uploadImage').is(':checked'),
                approved: $('#approved').is(':checked'),
                skip_keywords: $('#skip_keywords').val(),
                select_translate: select_translate,
                select_country: $('#select_country').val(),
            };

            var _c = _obj.count > args.countReviews ? args.countReviews : _obj.count;
            window.ADS.progress($('#activity-list-review'), args.countReviews, _c);

            var params = {
                post_id: post_id,
                product_id: product_id,
                productUrl: productUrl,
                page: page,
                feedbackUrl: feedbackUrl,
                countReviews: args.countReviews,
                withPictures: args.withPictures,
                uploadImages: args.uploadImages,
                ignoreImages: args.ignoreImages,
                approved: args.approved,
                star_min: args.rate,
                skip_keywords: args.skip_keywords,
                select_translate: args.select_translate,
                select_country: args.select_country,
            };

            if(productUrl){

                let reviews = [];

                window.ADS.aliExtension.sendAliExtension('getReviewsProduct', {
                    productid: product_id,
                    page: page,
                    product_url : productUrl,
                    countReviews: args.countReviews,
                    withPictures: args.withPictures,
                    uploadImages: args.uploadImages,
                    ignoreImages: args.ignoreImages,
                    approved: args.approved,
                    star_min: args.rate,
                    skip_keywords: args.skip_keywords,
                    select_translate: args.select_translate,
                    select_country: args.select_country,
                }).then(function (data) {

                    if(!data){
                        console.log('error get review');
                        return;
                    }

                    let reviewsAli = data.reviewInfo.reviews;
                    for(let i in reviewsAli){
                        let review = reviewsAli[i];
                        reviews.push({
                            feedback : review.text,
                            flag : review.country.toUpperCase(),
                            author : review.username,
                            star : review.rating,
                            date : dateFormat(review.date),
                            images : review.gallery,
                        })
                    }

                    sendReview(false, params, reviews);

                });

            }

        }

        function dateFormat(date){

            let dateTest = date.match( /(\d+) (\W+) (\d+) (\d+):(\d+)/im );

            if(!dateTest){
                return date;
            }

            let arr={
                'янв' : '01',
                'фев': '02',
                'мар': '03',
                'апр': '04',
                'май': '05',
                'июн': '06',
                'июл': '07',
                'авг': '08',
                'сен': '09',
                'окт': '10',
                'ноя': '11',
                'дек': '12',
            }

            let d = date.match( /(\d+) (\W+) (\d+) (\d+):(\d+)/im );

            let index = arr.findIndex(i=> i=== d[2]);
            return d[0].replace(d[2],arr[index]);
        }

        function checkIgnoreImages() {

            var im = $('#withImage'),
                i = im.parents('.checkbox-switchery'),
                up = $('#uploadImage'),
                u = up.parents('.checkbox-switchery');

            if ($(document).find('#ignoreImages').is(':checked')) {

                if (im.prop('checked')) {
                    im.click();
                }
                if (up.prop('checked')) {
                    up.click();
                }

                i.hide();
                u.hide();
            } else {
                i.show();
                u.show();
            }
        }

        function send(action, args, callback) {

            $.ajax({
                url: ajaxurl,
                data: {action: 'ads_action_reviews', ads_action: action, args: args},
                type: 'POST',
                dataType: 'json',
                success: callback
            });
        }

        function sendReview($obj, params, reviews = []) {

            var post_id = params.post_id,
            product_id = params.product_id,
                productUrl = params.productUrl,
                args = params,
                review = {
                    'flag': '',
                    'author': '',
                    'star': '',
                    'feedback': '',
                    'date': ''
                },

                feedList = [];

            if($obj){
                $feedbackList = $obj.find('.feedback-list-wrap .feedback-item'),
                $feedbackList.each(function (i, e) {

                    var images = [];

                    review = {
                        feedback : '',
                        flag : '',
                        author : '',
                        star : '',
                        date : '',
                        images : [],
                    };

                    review.feedback = $(this).find('.buyer-feedback').text();
                    if ($(this).find('.buyer-feedback .r-time-new').length) {
                        review.feedback = $(this).find('.buyer-feedback span:not(.r-time-new)').text();
                    }
                    review.feedback = review.feedback.replace('seller', 'store');
                    review.flag = $(this).find('.css_flag').text();
                    review.author = $(this).find('.user-name').text();
                    review.star = getStar($(this).find('.star-view span').attr('style'));

                    $(this).find('.pic-view-item').each(function (index, value) {
                        images.push($(value).data('src'));
                    });

                    var dateBox = $(this).find('.r-time');

                    if ($(this).find('.r-time-new').length) {
                        dateBox = $(this).find('.r-time-new');
                    }
                    review.date = dateBox.text();
                    review.images = images;
                    reviews.push(review);
                });
            }


            for (let i in reviews){
                feedList.push(reviews[i]);
            }

            if (reviews.length !== 0 && _obj.count <= args.countReviews) {

                var data = {
                    post_id: post_id,
                    product_id: product_id,
                    productUrl: productUrl,
                    feed_list: ADS.b64EncodeUnicode(JSON.stringify(feedList)),
                    star_min: args.star_min,
                    withPictures: args.withPictures,
                    uploadImages: args.uploadImages,
                    ignoreImages: args.ignoreImages,
                    approved: args.approved,
                    importedReview: _obj.count,
                    page: args.page++,
                    feedbackUrl: args.feedbackUrl,
                    count_review: $('#count_review').val(),
                    select_country: JSON.stringify(args.select_country),
                    skip_keywords: args.skip_keywords,
                    select_translate: args.select_translate,
                };

                send('upload_review', data, updateActivity);
            } else {
                end();
            }
        }

        function updateActivity(response) {

            var post_id = response.post_id;
            var product_id = response.product_id;
            var productUrl = response.productUrl;
            _obj.count += response.count;

            if (_obj.count < parseInt($('#count_review').val()) && response.page < 30) {
                addReview(response.page, post_id, response.feedbackUrl, product_id, productUrl);
            } else {
                end();
            }
        }

        function end() {

            window.ADS.notify(_obj.count + ' ' + $('.info-reviews-text').val(), 'success');

            window.ADS.btnUnLock($('#js-reviewSingleImport'));

            window.ADS.progress($('#activity-list-review'), 100, 100);
        }

        function checkLan(country, lan) {
            country = country.toUpperCase();
            lan = lan.toUpperCase();
            var obj = {
                'WWW': 'US',
                'PT': 'BR',
                'RU': 'RU',
                'ES': 'ES',
                'FR': 'FR',
                'PL': 'PL',
                'HE': 'IW',
                'IT': 'IT',
                'TR': 'TR',
                'DE': 'DE',
                'KO': 'KR',
                'AR': 'MA',
            };

            return typeof obj[country] !== "undefined" && obj[country] === lan;
        }

        function linkToLocation(url) {

            if (_obj.country === 'none') {
                return url;
            }

            url = url.replace(/\/\/(\w+)\./, '//' + _obj.country + '.');


            return url;
        }

        function setLocationAli() {

            var country = $('#select_translate').val();

            _obj.country = country;

            if (country === 'none') {
                return Promise.resolve(true);
            }

            return window.ADS.aliExtension.getPage('https://www.aliexpress.com/').then(function (value) {
                window.ADS.aliExtension.enableAjax();
                return window.ADS.aliExtension.getPage('https://' + country + '.aliexpress.com').then(function (value) {
                    var headerConfig = value.obj.find('script:contains("headerConfig")').text();

                    var loc = headerConfig.match(/locale: "\w+_(\w+)",/im);

                    if (loc === null) {
                        return false;
                    }

                    var flagAli = loc[1].toUpperCase();
                    return checkLan(country, flagAli);
                });
            });
        }

        function getUrlProduct(post_id){
            let supplierUrlProduct = $('#supplier').val();

            if(supplierUrlProduct === 'default'){
                return window.ADS.product(post_id, ['productUrl']).then(function (product) {
                    if (!product) {
                        return
                    }

                    if (!product.productUrl) {
                        window.ADS.notify('There is no link for review. Please update product', 'danger');
                        return;
                    }

                    return product.productUrl;
                });
            }

            return Promise.resolve(supplierUrlProduct);
        }

            function getID(linkProduct) {
                var id = (/\/(\d+_)?(\d+)\.html/).exec(linkProduct);
                return id ? id[2] : null;
            }

        function importReviews(post_id) {

            getUrlProduct(post_id)
                .then(function (productUrl) {

                   let product_id = getID(productUrl)

                    addReview(1, post_id, '', product_id, productUrl );

                });
        }

        return {
            init: function () {
                if ($this) return;
                $this = this;

                $('body').on('click', '#js-reviewSingleImport', function (e) {
                    e.preventDefault();

                    window.ADS.btnLock($(this));
                    var post_id = $('[name="post_id"]').val();

                    importReviews(post_id);

                });

                $('body').on('click', '#ignoreImages', function () {
                    checkIgnoreImages();
                });

                $(document).on('request:done', function (e) {

                    if (e.obj !== '#ads-form-box-callReviews') {
                        return;
                    }

                    checkIgnoreImages();
                });
            }
        }
    })().init();

    //var Supplier =
        (function () {
        var $this;

        var params = {
            post_id: '',
            productUrl: '',
            product_id: ''
        };

        function sendResetProduct(e, post_id, product_id, option) {

            if (e.code === false) {
                ADS.notify('Unknown error.');
                ADS.btnUnLock($('#js-update_ali_product_url'));
                return;
            }

            var product = e.product;

            if (e.code && e.code === 404) {
                product = {
                    id: product_id,
                };
                product.available_product = false;
            } else {
                product.available_product = true;
            }

            sendOptionsProduct('reset_product',
                {
                    post_id: post_id,
                    product: ADS.b64EncodeUnicode(JSON.stringify(product)),
                    option : option,
                },
                function (response) {
                    if (response && typeof response.message !== 'undefined') {
                        ADS.notify(response.message, 'success');
                        //TODO reload tabs
                        setTimeout(function () {
                            var url = window.location,
                                path = url.origin + '/wp-admin/post.php?post=' + params.post_id + '&action=edit' + url.hash;
                            window.location.replace(path);
                            location.reload();
                        }, 2500);

                    } else if (response && response.error) {
                        ADS.notify(response.error);
                    } else {
                        ADS.notify('Unknown error.');
                    }
                    ADS.btnUnLock($('#js-update_ali_product_url'));
                });

        }

        function sendResetReviewsLink(e, post_id, product_id) {

            if (e.code === false) {
                ADS.notify('Unknown error.');
                ADS.btnUnLock($('#js-update_ali_product_url'));
                return;
            }

            var product = e.product;

            if (e.code && e.code === 404) {
                product = {
                    id: product_id,
                };
                product.available_product = false;
            } else {
                product.description = '';
                product.available_product = true;
            }

            sendOptionsProduct('reset_product_store',
                {
                    post_id: post_id,
                    product: ADS.b64EncodeUnicode(JSON.stringify(product))
                },
                function (response) {

                    if (response && typeof response.message !== 'undefined') {
                        ADS.notify(response.message, 'success');
                        //TODO reload tabs
                        setTimeout(function () {
                            var url = window.location,
                                path = url.origin + '/wp-admin/post.php?post=' + params.post_id + '&action=edit' + url.hash;
                            window.location.replace(path);
                            location.reload();
                        }, 2500);

                    } else if (response && response.error) {
                        ADS.notify(response.error);
                    } else {
                        ADS.notify('Unknown error.');
                    }
                    ADS.btnUnLock($('#js-update_ali_product_url'));
                });

        }

        function updateActivity(post_id) {

            ADS.btnUnLock($('#js-reset_product'));
            //TODO reload tabs
            setTimeout(function () {
                var url = window.location,
                    path = url.origin + '/wp-admin/post.php?post=' + post_id + '&action=edit' + url.hash;
                window.location.replace(path);
                location.reload();
            }, 2500);
        }

        function getID(linkProduct) {
            var id = (/\/(\d+_)?(\d+)\.html/).exec(linkProduct);
            return id ? id[2] : null;
        }

        return {
            init: function () {
                if ($this) return;
                $this = this;

                $('body').on('click', '.ads-reset-supplier', function (e) {
                    e.preventDefault();
                    $('#changeProduct').modal('show');
                    window.ADS.switchery($('#changeProduct'));

                });

                $('body').on('click', '#js-update_ali_product_url', $this.reset);
                $('body').on('click', '#js-reset_product', function (e) {
                    e.preventDefault();

                    ADS.btnLock($('#js-reset_product'));

                    const post_id = $('[name="post_id"]').val();

                    window.ADS.updateProduct(post_id, {
                        status: $('#status').val(),
                        variant: $('#variant').val(),
                        cost: $('#cost').val(),
                        stock: $('#stock').val()
                    }).then((response) => {
                        updateActivity(post_id)
                    })

                });

                $('.ads-product-options-item [data-ads_action]').each(function () {
                    window.ADS.mainRequest($(this));
                });

            },
            reset: function (e) {
                e.preventDefault();

                var productUrl = params.productUrl = $('#aliLink').val();
                var post_id = params.post_id = $('[name="post_id"]').val();
                var product_id = params.product_id = getID(params.productUrl);

                ADS.btnLock($('#js-update_ali_product_url'));

                sendOptionsProduct('save_productUrl', {post_id: post_id, productUrl: productUrl}, function (response) {
                    if (!response) {
                        return;
                    }

                    if (typeof response.error != 'undefined') {
                        ADS.btnUnLock($('#js-update_ali_product_url'));
                        ADS.notify(response.error);
                        return;
                    }

                    const resetVariantStockPrice = $('#resetAll').is(":checked")
                    const resetDescription = $('#resetDescription').is(":checked")
                    const resetFeaturedAndGallery = $('#resetFeaturedAndGallery').is(":checked")
                    if (resetVariantStockPrice || resetDescription || resetFeaturedAndGallery) {
                        window.ADS.aliExtension.productAli(productUrl).then(function (params) {
                            sendResetProduct(params, post_id, product_id, {
                                resetVariantStockPrice,
                                resetDescription,
                                resetFeaturedAndGallery
                            })
                        });
                    } else {
                        window.ADS.aliExtension.productAli(productUrl).then(function (params) {
                            sendResetReviewsLink(params, post_id, product_id)
                        });
                    }
                });

            }
        }
    })().init();

    //var Update =
        (function () {
        var $this;

        return {
            init: function () {
                if ($this) return;
                $this = this;

                $('body').on('click', '#needUpdate', function (e) {
                    $('[data-for="#ads-form-callUpdate"]').click();
                });
                $('body').on('click', '#autoUpdatePrice', function (e) {
                    $('[data-for="#ads-form-callUpdate"]').click();
                });

            }
        }
    })().init();

    //const addSupplier =
        (function () {
        let $this;

        function getProduct(productUrl) {
            return window.ADS.aliExtension.productAli(productUrl)
                .then(function (params) {
                    return params.product
                });
        }

        function deleteSupplierByID(id) {
            return new Promise((resolve) => {
                $.ajax({
                    url: alidAjax.ajaxurl,
                    type: "POST",
                    async: true,
                    data: {
                        action: 'ads_action_request_post',
                        ads_action: "delete_supplier",
                        args: {
                            post_id: $('[name="post_ID"]').val(),
                            id: id,
                        }

                    },
                    success: function (e) {
                        return resolve(e)
                    }
                });
            })
        }

        function addSupplierByPostID(product) {
            delete product.paramsModule
            product.description = '';

            var form_Data = new FormData();

            form_Data.append('action', 'ads_action_request_post');
            form_Data.append('ads_action', 'add_supplier_by_post_id');
            form_Data.append('args', JSON.stringify({
                post_id: $('[name="post_ID"]').val(),
                product: product,
            }));

            return new Promise((resolve) => {

                $.ajax({
                    url: ajaxurl,
                    data: form_Data,
                    contentType: false,
                    processData: false,
                    type: "POST",
                    success: function (e) {
                        return resolve(e)
                    }

                })
            })
        }


        return {
            init: function () {
                if ($this) return;
                $this = this;

                $('body').on('click', '.js-add_supplier', function (e) {
                    $('#modal-add-supplier').modal('show');
                    return false;
                });

                $('body').on('click', '.js-remove-supplier', function (e) {
                    deleteSupplierByID($(this).attr('data-id'))
                        .then(() => {
                            window.ADS.mainRequest($('[data-ads_action="callSupplier"]'));
                        })
                    return false;
                });


                $('body').on('click', '#js-add-product-supplier', function (e) {

                    const productUrl = $('#add-supplier-link-product').val();

                    if (!productUrl) {
                        return false;
                    }

                    getProduct(productUrl)
                        .then((product) => {
                            return addSupplierByPostID(product);
                        })
                        .then(() => {
                            $('#modal-add-supplier').modal('hide');
                            window.ADS.mainRequest($('[data-ads_action="callSupplier"]'));
                            window.ADS.mainRequest($('[data-ads_action="callVariation"]'));
                        })

                    return false;
                });


            }
        }
    })().init();


});
