<template>
    <el-dialog
            :title="__('Select Products')"
            :visible.sync="open"
            :before-close="handleClose">
        <div class="">
            <div class="search-panel">
            <el-select v-model="category" placeholder="category">
                <el-option
                        v-for="(item, key) in params.categories"
                        :key="key"
                        :label="item"
                        :value="key">
                </el-option>
            </el-select>
            <el-input class="search-title" placeholder=""
                      v-model="search"/>
                <div class="search-actions">
                    <el-button type="primary" @click="searchProducts">{{__('Search')}}</el-button>
                </div>
            </div>
          <div class="actions-bulk">
            <el-select v-model="selectBulk" placeholder="">
              <el-option label="Bulk actions" value=""/>
              <el-option label="Add" value="add"/>
              <el-option label="Delete" value="delete"/>
            </el-select>
            <el-button @click="bulkAction">Apply</el-button>
          </div>
            <div class="product-select-head">
                <div class="">
                  <el-checkbox :indeterminate="isIndeterminate" v-model="checkAll" @change="handleCheckAllChange"/>
                </div>
                <div class="product-select-images"></div>
                <div class="product-select-meta">{{__('Product title')}}</div>
                <div class="product-select-actions">{{__('Actions')}}</div>
            </div>
            <div class="">
              <el-checkbox-group v-model="checkedItems" @change="handleCheckedChange">
            <div class="row-product-select" v-for="product in params.products" :key="product.id">
              <div class="">
                <el-checkbox :label="product.id"/>
              </div>
                <div class="product-select-images">
                    <el-image :src="product.img" :fit="'cover'"></el-image>
                </div>
                <div class="product-select-meta"><a target="_blank" :href="product.link">{{product.title}}</a></div>
                <div class="product-select-actions">
                    <el-button v-if="products_id.indexOf(product.id) ===-1" type="primary" @click="addProduct(product)">{{__('Add')}}</el-button>
                    <el-button v-else type="primary" @click="deleteProduct(product)">{{__('Delete')}}</el-button>
                </div>
            </div>
              </el-checkbox-group>
            </div>
        </div>

        <div class="pagination" v-if="params.limit < params.totalPage">
            <el-pagination
                    @current-change="handleCurrentChange"
                    background
                    :page-size="params.limit"
                    :current-page="params.page"
                    layout="prev, pager, next"
                    :total="params.totalPage">
            </el-pagination>
        </div>
    </el-dialog>
</template>

<script>


    export default {
        name: "SelectProduct",
        props: ['open', 'products_id', 'point_actions'],
        data() {
            return {
                search: "",
                category: "none",
                selectBulk: '',
                isIndeterminate: false,
                checkAll: false,
                checkedItems: [],
                params: {
                    page: 1,
                    limit: 20,
                    categories: [],
                    products: [],
                    result: false,
                    totalPage: 20,
                    lan : []
                }
            };
        },
        mounted() {
            this.get_products();
        },
        methods: {
            __(text){
                return this.params.lan[text] || '';
            },
            get_products(page = 1) {
                return this.$http.post(window.ajaxurl, {
                    action: this.point_actions,
                    ads_action: 'select_products',
                    args : {
                        page: page,
                        search: this.search,
                        category: this.category,
                    }
                }).then((response) => {
                    this.params = response.body;
                });

            },
            searchProducts(){
                this.get_products();
            },
            handleClose() {
                this.$emit('close');
            },
            close() {
                this.$emit('close');
            },
            addProduct(product) {
                this.$emit('select', { product });
            },
            deleteProduct(product) {
                this.$emit('delete', { product });
            },
            handleCurrentChange(page){
                this.get_products(page);
            },
            bulkAction(){
              if(this.selectBulk === 'add'){
                  this.checkedItems.map((id)=>{
                    let product = this.params.products.find(f => f.id ===id);
                    if(product){
                      this.addProduct(product);
                    }
                  })
                }

              if(this.selectBulk === 'delete'){
                this.checkedItems.map((id)=>{
                  let product = this.params.products.find(f => f.id ===id);
                  if(product){
                    this.deleteProduct(product);
                  }
                })
              }

              if(this.selectBulk === '') {
                return;
              }

              this.checkedItems = [];
              this.isIndeterminate = false;
              this.checkAll = false;
            },
          handleCheckAllChange(val) {
            this.checkedItems = val ? this.params.products.map(i=>i.id) : [];
            this.isIndeterminate = false;
          },
          handleCheckedChange(value) {
            let checkedCount = value.length;
            this.checkAll = checkedCount === this.params.products.length;
            this.isIndeterminate = checkedCount > 0 && checkedCount < this.params.products.length;
          }
        }
    }
</script>

<style scoped lang="scss">

    .product-select-head {
        border-bottom: 1px solid #bbb;
        padding-bottom: 5px;
        display: flex;
        align-items: center;
        font-size: 14px;
        font-weight: 500;
    }

    .row-product-select {
        border-top: 1px solid #e0e0e0;
        display: flex;
        align-items: center;


    }

    .product-select-images {
        width: 120px;
        padding: 10px;
        .el-image{
            width: 100px;
            height: 100px;
        }
    }

    .product-select-meta {
        flex: 1;
        margin-right: 10px;
        text-align: left;
        a{
            text-decoration: none;
            font-size: 13px;
            line-height: 20px;
            color: #333333;
        }
    }

    .product-select-actions {
        text-align: center;
        //min-width: 85px;
        button{
            width: 100%;
        }
    }
    .search-panel{
        display: flex;
        justify-content: space-between;
        margin-bottom: 20px;
    }
    .search-title{
        margin: 0 10px;
    }

    .search-actions{
        //min-width: 85px;
        button{
            width: 100%;
        }
    }

    .actions-bulk{
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      .el-button{
        margin-left: 10px;
      }
    }
</style>
