<template>
    <div class="">
        <div class="product" v-for="product in products" :key="product.id">
            <div class="images">
                <el-image :src="product.image" :fit="'cover'"></el-image>
            </div>
            <div class="meta">
                <div class="title"><a :href="product.link" target="_blank">{{product.title}}</a></div>
                <div class="rate">
                    <i v-if="product.rate" class="el-icon-star-on" v-for="i in (1, product.rate)" :key="`on-${i}`"/>
                    <i class="el-icon-star-off" v-for="i in ( 1, rr(product.rate))" :key="`off-${i}`"/>
                </div>
            </div>
            <div class="meta-price">
                <div class="">
                    <span class="price" v-html="product.salePrice"/> / {{product.unit}}
                </div>
                <div class="" v-if="product.price">{{product.price}} <span v-if="product.discount">(-{{product.discount}}% off)</span></div>
            </div>
            <div class="action">
                <a :href="product.linkEdit" target="_blank"><el-button size="medium"  icon="el-icon-edit"/></a>
                <el-button size="medium" @click="deleteItem(product)" icon="el-icon-delete"/>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        name: "ProductList",
        props: ['products_id', 'point_actions'],
        data() {
            return {
                isLoading: false,
                products: []
            }
        },

        mounted() {
            this.loading()
        },
        watch: {
            products_id() {
                this.loading();
            }
        },
        methods: {
            rr(r){return 5-r},
            loading() {

                if (!this.products_id.length) {
                    this.links = [];
                    this.products = [];
                    return;
                }

                this.isLoading = true;
                return this.$http.post(window.ajaxurl, {
                    action: this.point_actions,
                    ads_action: 'products_list',
                    list: this.products_id,
                }).then((response) => {
                    this.isLoading = false;
                    this.links = response.body.links;
                    this.products = response.body.products;
                });
            },
            deleteItem(product) {
                this.$emit('delete', {
                    product: {
                        id: product.id
                    }
                })
            }
        }
    }
</script>

<style scoped lang="scss">
.product{
    display: flex;
    margin: 0 0 20px 0;
    align-items: center;
    .images{
        width: 100px;
        height: 100px;
    }
    .meta{
        line-height: 20px;
        padding: 20px;
        flex: 1;
    }

    .action{
        .el-button{
            margin-left: 8px;
        }
    }

    .title{
        a{
            text-decoration: none;
            font-size: 13px;
            line-height: 20px;
            color: #333333;
        }
    }

    .rate{
        margin-top: 5px;
        margin-left: -2px;
        font-size: 18px;
        .el-icon-star-on{
            color: #FF9900;
        }
        .el-icon-star-off{
            color: #DADADA;
        }
    }

    .meta-price{
        line-height: 20px;
        padding: 20px;
    }
}
</style>
