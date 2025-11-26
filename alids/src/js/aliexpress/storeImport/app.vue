<template>
    <div class="app">
      <el-dialog
            title=" "
            :visible.sync="dialogVisibleAuth"
            width="30%"
            >
          <span>Something went wrong. Please, follow the link on AliExpress.</span>
        <a :href="dialogVisibleAuthURL" target="_blank">{{dialogVisibleAuthURL}}</a>
          <span slot="footer" class="dialog-footer">
      <el-button @click="dialogVisibleAuth = false">Close</el-button>
    </span>
        </el-dialog>
        <el-card class="box-card" v-if="isSelectStore">
            <el-form label-position="left" label-width="150px" ref="storeForm" :model="storeForm">
                <el-form-item label="Your suppliers">
                    <el-select v-model="supplier" @change="setSupplier" placeholder="Select">
                        <el-option
                                v-for="item in suppliers"
                                :key="item.value"
                                :label="item.title"
                                :value="item.value"/>
                    </el-select>
                </el-form-item>
                <el-form-item label="Supplier store ID">
                    <el-input placeholder="Enter supplier ID" v-model="storeForm.storeId"/>
                    <div class="help-text">Select your supplier or find a supplier using its AliExpress store ID.</div>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" :loading="loading" @click="storeInfo()">Apply</el-button>
                </el-form-item>
            </el-form>
        </el-card>

        <div class="box-import" v-if="!isSelectStore">

            <el-card class="box-card-category">

                <div class="back" @click="isSelectStore = true"><i class="el-icon-arrow-left"/>Back</div>

                <div v-if="Object.keys(categories).length">
                    <el-checkbox-group v-model="selectLink" @change="handleCheckedCitiesChange">
                        <ul class="list">
                            <li><span class="head">Store Categories ({{countAllProduct}} items)</span></li>
                            <li>
                                <el-checkbox :indeterminate="isIndeterminate" v-model="checkAll"
                                             @change="handleCheckAllChange">Check all
                                </el-checkbox>
                            </li>
                            <li>
                                <el-checkbox :label="urls.topProducts">Top Selling</el-checkbox>
                                <a class="view" target="_blank" :href="urls.topProducts"><i class="el-icon-view"/></a>
                                <span class="select-category" v-if="selectLink.indexOf(urls.topProducts) !==-1"
                                      @click="selectToCategory(urls.topProducts)"><i class="el-icon-right"/>{{nameToCategory(urls.topProducts)}}...</span>
                            </li>
                            <li>
                                <el-checkbox :label="urls.newArrivals">New Arrivals</el-checkbox>
                                <a class="view" target="_blank" :href="urls.newArrivals"><i class="el-icon-view"/></a>
                                <span class="select-category" v-if="selectLink.indexOf(urls.newArrivals) !==-1"
                                      @click="selectToCategory(urls.newArrivals)"><i class="el-icon-right"/>{{nameToCategory(urls.newArrivals)}}...</span>
                            </li>
                            <li v-for="category in categories.groups">
                                <el-checkbox :label="category.url">{{category.name}}</el-checkbox>
                                <a class="view" target="_blank" :href="category.url"><i class="el-icon-view"/></a>
                                <span class="select-category"
                                      v-if="selectLink.indexOf(category.url) !==-1"
                                      @click="selectToCategory(category.url)"><i class="el-icon-right"/>{{nameToCategory(category.url)}}...</span>
                                <ul v-if="category.subGroupList">
                                    <li v-for="sub in category.subGroupList">
                                        <el-checkbox :label="sub.url">{{sub.name}} </el-checkbox>
                                        <a class="view" target="_blank" :href="sub.url"><i class="el-icon-view"/></a>
                                        <span class="select-category" v-if="selectLink.indexOf(sub.url) !==-1"
                                              @click="selectToCategory(sub.url)"><i class="el-icon-right"/>{{nameToCategory(sub.url)}}...</span>
                                    </li>
                                </ul>
                            </li>
                        </ul>
                    </el-checkbox-group>
                </div>

                <div v-else class="">
                    <el-checkbox-group v-model="selectLink" @change="handleCheckedCitiesChange">
                        <ul class="list">
                            <li><span class="head">Store Categories ({{countAllProduct}} items)</span></li>
                            <li>
                                <el-checkbox :label="urls.allProducts">All Products</el-checkbox>
                                <a class="view" target="_blank" :href="urls.allProducts"><i class="el-icon-view"/></a>
                                <span class="select-category" v-if="selectLink.indexOf(urls.allProducts) !==-1"
                                      @click="selectToCategory(urls.allProducts)"><i class="el-icon-right"/>{{nameToCategory(urls.allProducts)}}...</span>
                            </li>
                            <li>
                                <el-checkbox :label="urls.topProducts">Top Selling</el-checkbox>
                                <a class="view" target="_blank" :href="urls.topProducts"><i class="el-icon-view"/></a>
                                <span class="select-category" v-if="selectLink.indexOf(urls.topProducts) !==-1"
                                      @click="selectToCategory(urls.topProducts)"><i class="el-icon-right"/>{{nameToCategory(urls.topProducts)}}...</span>
                            </li>
                        </ul>
                    </el-checkbox-group>
                </div>
            </el-card>

            <el-card class="box-card-import">

                <div v-if="urlStore">

                    <div class="filler-import">
                        <el-form label-position="right" label-width="150px" ref="filterForm" :model="filterForm"
                                 :disabled="loading && !stop">
                            <el-form-item label="">
                                <el-checkbox v-model="filterForm.publish">Publish products</el-checkbox>
                            </el-form-item>
                            <el-form-item label="">
                                <el-checkbox v-model="filterForm.clearText">Remove text in description</el-checkbox>
                                <el-checkbox v-model="filterForm.clearImages">Remove images in description</el-checkbox>
                            </el-form-item>
                            <el-form-item label="Product cost">
                                <div class="input-group-rate">
                                    <el-input placeholder="$ min" type="number" min="0" v-model="filterForm.Price"/>
                                    <span class="line">–</span>
                                    <el-input placeholder="$ max" type="number" min="0" v-model="filterForm.PriceMax"/>
                                </div>
                            </el-form-item>
                            <el-form-item label="Product stock">
                                <div class="input-group-rate">
                                    <el-input placeholder="min" type="number" min="0" v-model="filterForm.Quantity"/>
                                    <span class="line">–</span>
                                    <el-input placeholder="max" type="number" min="0" v-model="filterForm.QuantityMax"/>
                                </div>

                            </el-form-item>
                            <el-form-item label="Total orders">
                                <div class="input-group-rate">
                                    <el-input placeholder="min" type="number" min="0" v-model="filterForm.Orders"/>
                                    <span class="line">–</span>
                                    <el-input placeholder="max" type="number" min="0" v-model="filterForm.OrdersMax"/>
                                </div>

                            </el-form-item>
                            <el-form-item label="Product rating">
                                <div class="input-group-rate">
                                    <el-input placeholder="0 min" type="number" min="0" max="5" step="0.1"
                                              v-model="filterForm.Rate"/>
                                    <span class="line">–</span>
                                    <el-input placeholder="5 max" type="number" min="0" max="5" step="0.1"
                                              v-model="filterForm.RateMax"/>
                                </div>
                            </el-form-item>
                        </el-form>
                    </div>

                    <div class="status-import" v-if="countNameCategoryImport">
                        <div class="progress-scan"><span class="name">Category</span> <span class="value">{{countNameCategoryImport}}</span>
                        </div>
                        <div class="progress-scan"><span
                                class="name">Scanning ({{linksProduct.length}} items)</span><span class="value"><el-progress
                                :text-inside="true" :stroke-width="26" :percentage="percentScan"></el-progress></span>
                        </div>
                        <div class="progress-scan"><span
                                class="name">Importing ({{countCurrentImportProducts}} items)</span><span class="value"><el-progress
                                :text-inside="true" :stroke-width="26" :percentage="percentImport"
                                status="success"></el-progress></span></div>
                    </div>

                    <el-button type="primary" :loading="loading" @click="importProduct()">Import <span
                            v-if="countSendError">({{countSendError}})</span></el-button>
                    <template>
                        <el-button v-if="!stop" type="primary" @click="stop = true" :disabled="!loading">Stop
                        </el-button>
                        <el-button v-else type="primary" @click="stop = false">Continue</el-button>
                    </template>
                    <div class="info-text">When you import supplier, all product images will NOT be saved on your server (even if the option ‘save images on your server’ is enabled in AliDropship settings). If you need to save images on your server after import, go to AliDropship -> Settings -> General -> Product Images and click ‘Upload Images’.</div>
                </div>
            </el-card>

        </div>

        <el-dialog
                title="Select category to import product"
                :visible.sync="dialogVisible"
                width="30%">

            <el-select v-model="selectTerm" placeholder="Select">
                <el-option label="Uncategorized" value=""/>
                <el-option label="Supplier category" value="current_ali"/>
                <el-option
                        v-for="item in terms"
                        :key="item.value"
                        :label="item.title"
                        :value="item.value"/>
            </el-select>

            <span slot="footer" class="dialog-footer">
    <el-button @click="dialogVisible = false">Cancel</el-button>
    <el-button type="primary" @click="setToCategory">Confirm</el-button>
  </span>
        </el-dialog>
    </div>
</template>

<script>

    function getUrl(domain, storeId) {
        return {
            //aliexpress.com/store/all-wholesale-products/${storeId}.html
            allProducts: `/${domain}/all-wholesale-products/${storeId}.html`,
            newArrivals: `/${domain}/new-arrivals/${storeId}.html`,
            topProducts: `/${domain}/top-rated-products/${storeId}.html`,
            categoryMenu: `https:${domain}/productGroupsAjax.htm?storeId=${storeId}&shopVersion=3.0`
        };
    }

    export default {
        name: "app",
        data() {
            return {
                dialogVisibleAuth: false,
                dialogVisibleAuthURL : '',
                supplier: '',
                isSelectStore: true,
                dialogVisible: false,
                selectTerm: '',
                editDialogUrl: '',
                storeForm: {
                    storeId: '',
                },
                filterForm: {
                    publish: false,
                    clearImages: false,
                    clearText: false,
                    Orders: '',
                    OrdersMax: '',
                    Rate: '',
                    RateMax: '',
                    Price: '',
                    PriceMax: '',
                    Quantity: '',
                    QuantityMax: '',
                },
                terms: [],
                suppliers: [],
                isIndeterminate: true,
                checkAll: false,
                urlStore: '',
                categories: {},
                selectLink: [],
                loading: false,

                urls: {},
                linksProduct: [],

                pageNum: 0,
                countImport: 0,

                countCurrentImportProducts: 0,
                countCurrentImportProgressProducts: 0,
                countCurrentProducts: 0,
                countNameCategoryImport: '',

                countAllProduct: 0,
                allLink: [],
                allLinkInfo: {},

                categoryImportProduct: {},
                stop: false,

                countSendError: 0,
            }
        },
        created() {

            this.$http.post(window.ajaxurl, {
                action: 'ads_story_category',
            }).then((response) => {
                this.terms = response.body;
            });

            this.$http.post(window.ajaxurl, {
                action: 'ads_suppliers_category',
            }).then((response) => {
                this.suppliers = response.body;
            });
        },
        computed: {
            percentImport() {
                return this.linksProduct.length ? Math.round(this.countCurrentImportProgressProducts / this.linksProduct.length * 100) : 0;
            },
            percentScan() {
                return this.countCurrentProducts ? Math.round((this.linksProduct.length / this.countCurrentProducts * 100)) : 0;
            },
        },
        methods: {
            handleCheckAllChange(val) {
                this.selectLink = val ? this.allLink : [];
                this.isIndeterminate = false;
            },
            handleCheckedCitiesChange(value) {
                let checkedCount = value.length;
                this.checkAll = checkedCount === this.allLink.length;
                this.isIndeterminate = checkedCount > 0 && checkedCount < this.allLink.length;
            },
            selectCategory(url) {
                let index = this.selectLink.indexOf(url);
                if (index === -1) {
                    this.selectLink.push(url)
                } else {
                    this.selectLink.splice(index, 1);
                }
            },
            setSupplier(val) {
                this.storeForm.storeId = val;
            },
            async storeInfo() {

                this.loading = true;

                let url = `https://aliexpress.com/store/all-wholesale-products/${this.storeForm.storeId}.html`;
                this.dialogVisibleAuthURL = url;
                let value = await this.getPage(url);

              if(!value){
                    return false;
                }

                this.loading = false;

                let store = this.parseStore(value.obj);
                this.countAllProduct = this.parseCountProducts(value.obj);

                this.urlStore = store.pageUrl;

                let domain = this.urlStore.match(/https:\/\/(.*\/store)/);
                if (domain) {
                    this.domain = domain[1].replace(/\/{3,}/g, '//');
                }
                this.urls = getUrl(this.domain, this.storeForm.storeId);

              let categoryAli = await this.storeCategory();


                if(!Object.keys(categoryAli).length){
                    this.allLink.push(this.urls.allProducts);
                    this.allLink.push(this.urls.topProducts);
                    this.allLinkInfo[this.urls.allProducts] = {name: 'All Products', toCategory: '', sub: []};
                    this.allLinkInfo[this.urls.topProducts] = {name: 'Top Products', toCategory: '', sub: []};
                    this.isSelectStore = false;
                    return;
                }

                this.categories = categoryAli;

                this.allLink.push(this.urls.newArrivals);
                this.allLink.push(this.urls.topProducts);
                for (let category of this.categories.groups) {

                    let subLink = [];
                    this.allLink.push(category.url);
                    if (category.subGroupList) {
                        for (let sub of category.subGroupList) {
                            this.allLink.push(sub.url);
                            this.allLinkInfo[sub.url] = {
                                name: sub.name,
                                toCategory: '',
                                parent: category.name,
                                sub: []
                            };
                            subLink.push(sub.url);
                        }
                    }
                    this.allLinkInfo[category.url] = {name: category.name, toCategory: '', parent: 0, sub: subLink};
                }

                this.allLinkInfo[this.urls.newArrivals] = {name: 'New Arrivals', toCategory: '', sub: []};
                this.allLinkInfo[this.urls.topProducts] = {name: 'Top Products', toCategory: '', sub: []};

                this.isSelectStore = false;
            },

           storeCategory() {
              window.ADS.aliExtension.enableAjax();
              return window.ADS.aliExtension.getPage(this.urls.categoryMenu).then((value)=>{
                let objDate = value.html.match(/(\{"groups.*\})/im );
                return objDate ? JSON.parse(objDate[1]): [];
              }).catch((e) => {
                console.log(e);
                return false;
              });

            },

            parsePageNum($obj) {
                let page = $obj.find('.ui-pagination-active').text();

                return parseInt(page);
            },

            parseStore($obj) {

                let pageParams = $obj.find('#list-params').val();

                if(!pageParams){
                  this.dialogVisibleAuth = true;
                }

                pageParams = JSON.parse(pageParams.replace(/'/g, '"').replace(/\r?\n/g, ""));

                let pageUrl = 'https://' + pageParams.goUsedURL;
                let allCount = pageParams.allCount;

                return {
                    pageUrl: pageUrl,
                    allCount: allCount
                }
            },
            parseCountProducts($obj) {
                let $root = $obj.find('.result-info');

                if (!$root) {
                    return false;
                }

                return $root.text().replace(/[^\d]/g, '').trim()
            },
            getNameCategory(url) {

                if (this.allLinkInfo[url]) {
                    return this.allLinkInfo[url]['name']
                }

                return '';
            },
            async checkStop() {
                return new Promise((resolve) => {

                    if (!this.stop) {
                        return resolve(true);
                    }

                    let id = setInterval(() => {
                        if (!this.stop) {
                            clearInterval(id);
                            return resolve(true);
                        }
                    }, 500);
                });
            },
            async importProduct() {

                let selectLink = this.selectLink;

                if (!selectLink.length) {
                    this.$alert('No select Category', 'Error', {
                        confirmButtonText: 'OK',
                    });

                    return false
                }

                this.loading = true;

                for (let link of selectLink) {

                    this.countCurrentImportProducts = 0;
                    this.countCurrentImportProgressProducts = 0;
                    this.countCurrentProducts = 0;
                    this.countNameCategoryImport = this.getNameCategory(link);
                    this.linksProduct = [];
                    this.pageNum = 1;

                    this.categoryImportProduct = this.getCategory(link);

                    let url = `https:${link}`;

                    await this.searchProductsPage(url);

                    for (let linkProduct of this.linksProduct) {

                        await this.checkStop();

                        let result = await this.importProductStore(linkProduct.replace(/\/{3,}/g, '//'));

                        this.countCurrentImportProgressProducts += 1;
                        if (result) {
                            this.countCurrentImportProducts += 1;
                            this.countImport += 1;
                        }
                    }
                }

                this.loading = false;

            },
            async getPage(url){
                window.ADS.aliExtension.enableAjax();
                url = url.replace(/\/{3,}/g, '//');
                return (async ()=> {

                    let i = 0;
                    while(true) {
                        let value = await window.ADS.aliExtension.getPage(url, 5000).catch((e) => {
                            return false;
                        });

                        if (value) {
                            return value;
                        }

                        this.countSendError = i;
                        await sleep(5000);
                    }

                })();
            },
            async searchProductsPage(url) {

                await this.checkStop();

               let  value = await this.getPage(url);

               if(!value){
                   return false;
               }

                await this.checkStop();

                if (!this.countCurrentProducts) {
                    this.countCurrentProducts = this.parseCountProducts(value.obj)
                }

                this.linksProduct.push(...this.parseProducts(value.obj));

                let linkNextPage = this.parseNextPage(value.obj);

                if (!linkNextPage) {
                    return true;
                }

                this.pageNum += 1;

                await this.searchProductsPage(linkNextPage)

            },
            parseNextPage($obj) {

                let $root = $obj.find('a.ui-pagination-next');

                if (!$root.length) {
                    return false;
                }

                let link = $root.attr('href');

                if (!link) {
                    return false;
                }

                return 'https:' + link;
            },
            parseProducts($obj) {
                let links = [];
                $obj.find('.items-list .pic-rind').each((i, e) => {
                    let link = 'https://' + jQuery(e).attr('href');
                    links.push(link.replace(/\/{3,}/g, '//'));
                });

                return links;
            },
            async productAli(url) {

                let isLoadDesc = this.filterForm.clearImages && this.filterForm.clearText;

                return (async ()=> {

                    let i = 0;
                    while(true) {
                        i++;
                        if (i === 5) {
                            i = 0;
                            this.countSendError = 0;
                            this.stop = true;
                            await this.checkStop();
                        }

                        const response = await window.ADS.aliExtension.productAli(url, isLoadDesc, 5000).catch(async () => {
                            return {
                                product: null,
                                code: 500
                            }
                        });

                        let product = response.product;
                        let code = response.code;

                        if (200 === code) {
                            this.countSendError = 0;
                            return {
                                code,
                                product
                            }
                        }

                        this.countSendError = i;
                        await sleep(5000);
                    }
                })();

            },
            async importProductStore(url) {

                const response = await this.productAli(url);

                if (!response){
                    return false;
                }

                let product = response.product;

                if (!this.ImportFiller(product)) {
                    return false;
                }

                return (async ()=> {

                    let i = 0;
                    while(true) {
                        i++;
                        if (i === 5) {
                            i = 0;
                            this.countSendError = 0;
                            this.stop = true;
                            await this.checkStop();
                        }

                        const response = await window.ADS.aliExtension.importProduct(product, false).catch(() => {
                            return false;
                        });

                        if (!response) {
                            this.countSendError = i;
                            await sleep(5000);
                        } else if (response.success) {
                            this.countSendError = 0;
                            return true;
                        } else if (response.error) { //"Product already imported"
                            this.countSendError = 0;
                            return false;
                        }
                    }
                })();

            },

            ImportFiller(product) {

                let filter = this.filterForm;

                if (!isRate(product.orders, filter.Orders, filter.OrdersMax)) {
                    return false;
                }

                if (!isRate(product.quantity, filter.Quantity, filter.QuantityMax)) {
                    return false;
                }

                if (!isRate(product.minPrice, filter.Price, filter.PriceMax)) {
                    return false;
                }

                if (!isRate(product.starOrder.percent, filter.Rate, filter.RateMax)) {
                    return false;
                }

                if (filter.publish) {
                    product.post_status = 'publish';
                }

                product.description = clearDescription(product, filter);

                if (this.categoryImportProduct) {
                    product.categories = this.categoryImportProduct.name;
                    product.parents_category = this.categoryImportProduct.parent;
                }

                return true;
            },

            getCategory(url) {

                let cat = this.allLinkInfo[url];

                if (!cat || "" === cat.toCategory) {
                    return {
                        name: [],
                        parent: {}
                    };
                }

                if ("current_ali" === cat.toCategory) {
                    return {
                        name: [cat.name],
                        parent: {
                            [cat.name]: [cat.parent]
                        }
                    };
                }

                return {
                    name: [cat.toCategory],
                    parent: {
                        [cat.toCategory]: cat.parent
                    }
                };

            },
            selectToCategory(url) {
                this.dialogVisible = true;
                this.selectTerm = this.allLinkInfo[url] ? this.allLinkInfo[url]['toCategory'] : '';
                this.editDialogUrl = url;
            },
            setToCategory() {
                this.dialogVisible = false;
                this.allLinkInfo[this.editDialogUrl]['toCategory'] = this.selectTerm;
            },
            nameToCategory(url) {
                let cat = this.allLinkInfo[url];

                if (!cat || "" === cat.toCategory) {
                    return 'Uncategorized';
                }

                if ("current_ali" === cat.toCategory) {
                    return 'Supplier category';
                }

                let term = this.terms.find(i => i.value === cat.toCategory);

                return term ? term.title : 'Uncategorized';
            },
        }
    }

    function clearDescription(product, {clearText, clearImages}) {
        let description = product.description;

        if (clearText) {
            let img = description.match(/<img[^<>]*src="([^<>]*)"[^<>]*>/ig);
            description = product.video + img.join(' ');
        }

        if (clearImages) {
            let text = description.replace(/<img[^<>]*src="([^<>]*)"[^<>]*>/ig, '');
            text = text.replace(/<a[^<>]*>\s*<\/a>/ig, '');
            text = text.replace(/<video.*<\/video>/ig, '');
            description = text;
        }

        /*очистим описание если оба отключены*/
        description = clearImages && clearText ? '' : description;

        return description;

    }

    function isRate(value, min, max) {

        value = value ? parseFloat(value) : 0;
        min = min ? parseFloat(min) : 0;
        max = max ? parseFloat(max) : 0;

        return value >= min && !max || value >= min && value <= max
    }

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }


</script>

<style scoped lang="scss">
    .app {
        margin: 0 0 20px -20px;
        padding: 15px 20px 15px;
    }

    .box-card {
        width: 640px;
    }

    .list {
        font-size: 14px;
        margin-left: 20px;

        ul {
            margin-left: 20px;
        }

        li {
            line-height: 30px;
            margin: 0;
            padding: 0;

            .head {
                cursor: default;
                color: #000;
                font-weight: bold;
            }
        }

        .view {
            display: inline-block;
            margin-right: 10px;
        }
    }


    .back {
        cursor: pointer;
    }

    .box-import {
        display: flex;
        align-items: flex-start;

        .box-card-category {
            margin-right: 20px;
        }

        .box-card-import {
            flex: 1;
        }
    }

    .progress-scan {
        display: flex;
        margin: 15px 0;

        .name {
            width: 150px;
            text-align: right;
            vertical-align: middle;
            float: left;
            font-size: 14px;
            color: #606266;
            padding: 0 12px 0 0;
            -webkit-box-sizing: border-box;
            box-sizing: border-box;
        }

        .value {
            font-size: 14px;
            color: #606266;
            flex: 1;
        }
    }

    .input-group-rate {
        display: flex;
        width: 300px;
        align-items: center;

        .line {
            margin: 0 10px;
        }
    }

    .select-category {
        cursor: pointer;
    }

    .help-text {
        font-size: 12px;
        color: #606266;
        margin-top: -9px;
        padding-left: 3px;
    }
    .info-text{
        margin-top: 10px;
    }
</style>
