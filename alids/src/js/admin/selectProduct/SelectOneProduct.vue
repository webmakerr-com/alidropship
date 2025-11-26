<template>
    <div class="">
        <el-form-item>
            <el-button class="add-product" type="primary" @click="openSelectProduct">Select product to upsell</el-button>
            <div class="product-list">
                <ProductList :point_actions="point_actions" :products_id="apply" @delete="deleteProduct"/>
            </div>
            <SelectProduct :point_actions="point_actions" :products_id="apply" :open="isSelectProduct" @close="closeSelectProduct"
                           @select="setProduct" @delete="deleteProduct"/>
        </el-form-item>
    </div>
</template>

<script>
    import SelectProduct from "./SelectProduct";
    import ProductList from "./ProductList";

    export default {
        name: "SelectOneProduct",
        components: {SelectProduct, ProductList},
        props: ["apply"],
        data() {
            return {
                point_actions: "alids_select_product_request",
                isSelectProduct: false,
                count: 1,
            }
        },
        methods: {
            openSelectProduct() {
                this.isSelectProduct = true;
            },
            closeSelectProduct() {
                this.isSelectProduct = false;
            },
            setProduct(selectProduct) {
                let apply = this.apply;

                if(this.count ===1){
                    this.isSelectProduct = false;
                    apply = [selectProduct.product.id];
                }else{
                    apply.push(selectProduct.product.id)
                }

                this.updateApply(apply);
            },
            deleteProduct(selectProduct) {

                let apply = this.apply;

                let index = apply.indexOf(selectProduct.product.id.toString());

                if (index !== -1)
                    apply.splice(index, 1);

                this.updateApply(apply);

            },
            clearApplyTo() {
                this.updateApply([]);
            },
            updateApply(value) {
                this.$emit('update:apply', value);
            }
        }
    }
</script>

<style scoped>

</style>
