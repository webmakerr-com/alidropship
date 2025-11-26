<template>
    <div>
        <el-select class="upsell_type" :value="type" @input="updateType" placeholder="Apply to" @change="clearApplyTo">
            <el-option label="Products" value="product"></el-option>
            <el-option label="Category" value="category"></el-option>
        </el-select>
        <el-button class="add-product" v-if="type === 'product'" type="primary" @click="openSelectProduct">Add</el-button>
        <div class="" v-if="type === 'product'">
            <div class="product-list">
                <ProductList :point_actions="point_actions" :products_id="apply" @delete="deleteProduct"/>
            </div>
            <SelectProduct v-if="type === 'product'" :point_actions="point_actions" :products_id="apply" :open="isSelectProduct" @close="closeSelectProduct"
                           @select="setProduct" @delete="deleteProduct"/>
        </div>
        <SelectCategory v-else :point_actions="point_actions"  :category="apply" @change="updateApply"/>
    </div>
</template>

<script>
    import SelectProduct from './SelectProduct.vue';
    import ProductList from './ProductList.vue';
    import SelectCategory from './SelectCategory.vue';

    export default {
        name: "SelectApply",
        components: {SelectProduct, ProductList, SelectCategory},
        props: ["type", "apply"],
        data() {
            return {
                point_actions: "alids_select_product_request",
                isSelectProduct: false,
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

                apply.push(selectProduct.product.id);

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
            updateType(value) {
                this.$emit('update:type', value);
            },
            updateApply(value) {
                this.$emit('update:apply', value);
            }
        }
    }
</script>

<style scoped lang="scss">
    .add-product{
        margin-left: 8px;
    }
    .upsell_type{
        margin-bottom: 20px;
    }
</style>
