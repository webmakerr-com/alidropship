<template>
    <div class="">
        <div class="alids-page-row">
            <div class="alids-page-bulk">
                <el-select v-model="bulkAction" placeholder="Bulk Action">
                    <el-option
                            v-for="item in bulkOptions"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value">
                    </el-option>
                </el-select>
                <el-button @click="actionBulk">Apply</el-button>
            </div>
            <el-pagination v-if="limit < total"
                    @current-change="handleCurrentChange"
                    :current-page.sync="page"
                    :page-size="limit"
                    layout="total,prev, jumper, pager, next"
                    :total="total">
            </el-pagination>
        </div>

        <div class="alids-table-container">
            <el-row class="table-head">
                <el-col class="center" :span="2">
                    <el-checkbox :indeterminate="isIndeterminate" v-model="checkAll"
                                 @change="handleCheckAllChange"></el-checkbox>
                </el-col>
                <el-col :span="6" class="p-col">Title</el-col>
                <el-col :span="4" class="p-col">Applied to</el-col>
                <el-col :span="6" class="p-col">Delivery</el-col>
                <el-col :span="4" class="p-col">Cost</el-col>
                <el-col :span="2">Status</el-col>
            </el-row>
            <el-checkbox-group v-model="checkedBulk" @change="handleCheckedChange">
                <el-row class="table-item" v-for="(item, index) in list" :key="item.id">
                    <el-col class="center" :span="2">
                        <div class="alids-table-item-checkbox">
                            <el-checkbox :label="item.id"/>
                            <div class="item-number">{{index + 1 + (page -1) * limit}}</div>
                        </div>
                    </el-col>
                    <el-col :span="6" class="p-col">
                        <div class="title">{{item.title}}</div>
                        <div class="actions">
                            <div class="action" @click="toggleEdit(item.id)">Edit</div>
                            <div class="split"></div>
                            <div class="action" @click="deleteItem(item.id)">Delete</div>
                        </div>
                    </el-col>
                    <el-col :span="4" class="p-col">{{item.apply_to_display}}</el-col>
                    <el-col :span="6" class="p-col">
                        {{item.time}}
                    </el-col>
                    <el-col :span="4" class="p-col col-center">
                        {{item.cost}}
                    </el-col>
                    <el-col :span="2">
                        <el-switch :active-value="1" :inactive-value="0" v-model="item.enable" @change="(status)=>{changeStatus(item.id, status)}" />
                    </el-col>
                </el-row>
            </el-checkbox-group>
            <el-row class="table-head table-head-bottom">
                <el-col class="center" :span="2">
                    <el-checkbox :indeterminate="isIndeterminate" v-model="checkAll"
                                 @change="handleCheckAllChange"></el-checkbox>
                </el-col>
                <el-col :span="6" class="p-col">Title</el-col>
                <el-col :span="4" class="p-col">Applied to</el-col>
                <el-col :span="6" class="p-col">Delivery</el-col>
                <el-col :span="4" class="p-col">Cost</el-col>
                <el-col :span="2">Status</el-col>
            </el-row>
        </div>

        <div class="alids-page-row">
            <div class="alids-page-bulk">
                <el-select v-model="bulkAction" placeholder="Bulk Action">
                    <el-option
                            v-for="item in bulkOptions"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value">
                    </el-option>
                </el-select>
                <el-button @click="actionBulk">Apply</el-button>
            </div>
            <el-pagination v-if="limit < total"
                    @current-change="handleCurrentChange"
                    :current-page.sync="page"
                    :page-size="limit"
                    layout="total,prev, jumper, pager, next"
                    :total="total">
            </el-pagination>
        </div>
    </div>
</template>

<script>
    export default {
        name: "List",

        data() {
            return {
                bulkAction: '',
                bulkOptions: [
                    {
                        value: '',
                        label: 'Bulk action'
                    },
                    {
                        value: 'delete',
                        label: 'Delete'
                    }
                ],
                list : [],
                limit: 20,
                checkAll: false,
                checkedBulk: [],
                isIndeterminate: false,
                position: 0,
                total: 0,
                page: 1,
            }
        },
        created() {
            this.loading();
        },
        methods:{
            loading(page = 1){
                this.$http.post(window.ajaxurl, {
                    action: 'ads_actions',
                    ads_controller: 'Shipping',
                    ads_action: 'list',
                    args: {
                        page: page,
                    }

                }).then((response)=>{
                    this.list = response.body.list;
                    this.limit = response.body.limit;
                    this.page = response.body.page;
                    this.total = response.body.total;
                })
            },
            handleCheckAllChange(val) {
                this.checkedBulk = val ? this.list.map(i => i.id) : [];
                this.isIndeterminate = false;
            },
            handleCheckedChange(value) {
                let checkedCount = value.length;
                this.checkAll = checkedCount === this.list.length;
                this.isIndeterminate = checkedCount > 0 && checkedCount < this.list.length;
            },
            handleCurrentChange(page) {
                this.loading(page);
            },
            toggleEdit(id){
                this.$emit('onEdit', id)
            },
            deleteItem(id){
                this.$http.post(window.ajaxurl, {
                    action: 'ads_actions',
                    ads_controller: 'Shipping',
                    ads_action: 'delete',
                    args: {
                        id: id,
                    }

                }).then((response)=>{
                   this.loading(1);
                })
            },
            actionBulk(){

              if(this.bulkAction === 'delete'){
                this.$http.post(window.ajaxurl, {
                  action: 'ads_actions',
                  ads_controller: 'Shipping',
                  ads_action: 'delete_bulk',
                  args: {
                    ids: this.checkedBulk,
                  }

                }).then((response)=>{
                  this.checkAll = false;
                  this.checkedBulk = [];
                  this.loading(1);
                })
              }

            },
            changeStatus(id, status) {
                return this.$http.post(window.ajaxurl, {
                    action: 'ads_actions',
                    ads_controller: 'Shipping',
                    ads_action: 'set_status_upsell',
                    args: {
                        id,
                        status
                    }
                }).then((response) => {
                    this.loading(this.page);
                    this.$notify({
                        title: response.body.message,
                        type: 'success'
                    });
                });
            },
        }
    }
</script>

<style scoped lang="scss">
    .alids-bulk-row {
        display: flex;

        .el-button {
            margin-left: 10px;
        }
    }

    .alids-list-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;

        .el-checkbox {
            margin-bottom: 0;
        }

        .el-checkbox__label {
            display: none;
        }
    }

    .alids-update-action {
        display: flex;
        justify-content: flex-end;

        .el-button {
            margin-left: 10px;
        }
    }

    .alids-btn-remote {
        width: 32px;
        height: 32px;
    }

    .alids-update-action {
        margin-top: 20px;
    }

    .col-1,
    .col-2,
    .col-3,
    .col-4,
    .col-5,
    .col-6 {
        padding-right: 6px;
        padding-left: 6px;
    }

    .col-2,
    .col-3 {
        flex: 1;
    }


</style>

<style scoped lang="scss">
    .alids-page-row{
        margin: 9px 0;
        display: flex;
        justify-content: space-between;
        align-items: self-start;
    }
    .alids-page-bulk{
        display: flex;
        align-items: center;
        .el-button{
            margin-left: 10px;
        }
    }
    .alids-table-container{
        background: #FFFFFF;
        border: 1px solid #C8CCD0;
        box-sizing: border-box;
        box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.15);

    .table-head{
        background: #FFFFFF;
        border-bottom: 1px solid #C8CCD0;
        box-sizing: border-box;
        padding: 10px;
        font-size: 14px;
        line-height: 20px;
        color: #32373C;
    }

    .table-head-bottom{
        border-top: 1px solid #C8CCD0;
    }
    }

    .table-item{
        display: flex;
        align-items: flex-start;
        padding: 10px 10px;
        min-height: 100px;

    &:nth-child(odd){
         background: #F9F9F9;
     }

    .title{
        font-size: 13px;
        line-height: 20px;
        color: #333333;
    }

    .actions{
        display: none;
        margin-top: 10px;
        font-size: 13px;
        line-height: 17px;
        color: #0073AA;
    .action{
        cursor: pointer;
        display: inline-block;
    }
    .split{
        display: inline-block;
        border-left: 1px solid #0073AA;
        margin: 0 3px;
        height: 10px;
    }
    }

    &:hover{
    .actions{
        display: inline-block;
    }
    }


    }

    .alids-table-item-checkbox{
        display: flex;
        align-items: flex-start;
    .item-number{
        margin-left: 15px;
    }
    }

    .row-product + .row-product{
        margin-top: 10px;
    }
    .p-col{
        font-size: 14px;
        padding-right: 50px;
    }

    .item-number{
        font-size: 14px;
    }
</style>

<style>
    .el-checkbox__label{
        display: none;
    }
    .el-checkbox{
        margin: 0;
    }
</style>
