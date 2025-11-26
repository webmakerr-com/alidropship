<template>
    <div class="">
        <el-select :value="category" @input="update" placeholder="Select Categories" multiple>
            <el-option
                    v-for="(item, key) in categories"
                    :key="key"
                    :label="item"
                    :value="key">
            </el-option>
        </el-select>
    </div>
</template>

<script>
    export default {
        name: "SelectCategory",
        props: ['category', 'point_actions'],
        data() {
            return {
                isLoading: false,
                categories: []
            }
        },
        mounted() {
            this.loading()
        },
        methods: {
            loading() {
                this.isLoading = true;
                return this.$http.post(window.ajaxurl, {
                    action: this.point_actions,
                    ads_action: 'categories',
                }).then((response) => {
                    this.isLoading = false;
                    this.categories = response.body.categories;
                });
            },
            update(value){
                this.$emit('change', value);
            }

        }
    }
</script>

<style scoped>

</style>
