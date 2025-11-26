<template>
    <div class="alids-panel">
        <div class="alids-panel-header">
            <div class="">Search 'Size Guide' Titles</div>
            <div class="how_works">
                <span class="status-mark border-light-green"/>
                <a href="https://help.alidropship.com/en/articles/5015488-manage-size-guide-titles" target="_blank">How it works</a>
            </div>
        </div>
        <div class="alids-panel-body">
            <div class="alids-search-attribute">
                <el-input class="alids-input" placeholder="Enter title" v-model="searchText"/>
                <button class="alids-btn-default" @click="startFetchAttributes">Fetch titles</button>
            </div>
            <div class="alids-tags">
                <div class="alids-tag" v-for="item in searchTags" @click="startFetchAttributesTag(item)">{{item}}</div>
            </div>

            <template v-if="searchAttr">
                <div class="alids-list-attribute">
                    <el-row type="flex" class="alids-list-attribute-row alids-list-attribute-row-header">
                        <div class="col-2">Current name</div>
                        <div class="col-3">Rename to</div>
                    </el-row>
                    <el-row type="flex"
                            class="alids-list-attribute-row alids-list-attribute-row-parent">
                        <div class="col-2">
                            <el-input disabled class="alids-input" placeholder="" :value="searchAttr"></el-input>
                        </div>
                        <div class="col-3">
                            <el-input class="alids-input" placeholder="" v-model="searchTagNewName"></el-input>
                        </div>
                    </el-row>
                    <el-row type="flex" class="alids-list-attribute-row alids-list-attribute-row-attr"
                            v-for="(item, index) in attributes" :key="item.value">
                        <div class="col-2">
                            <el-input disabled class="alids-input" placeholder="" :value="item.value"></el-input>
                        </div>
                        <div class="col-3">
                            <el-input class="alids-input" placeholder="" v-model="item.newValue"></el-input>
                        </div>
                    </el-row>

                </div>

                <div class="alids-progress-head">These title will be renamed:</div>
                <div class="alids-progress">
                    <el-progress :text-inside="true" :stroke-width="26" :percentage="percentage"></el-progress>
                </div>
                <div class="alids-update-action">
                    <el-button type="success" @click="update">Update titles</el-button>
                </div>
            </template>

        </div>
    </div>
</template>

<script>
    export default {
        name: "Page",
        data() {
            return {
                isActive: false,
                searchText: '',
                searchAttr: '',
                searchTagNewName: '',
                searchTags: [],
                bulkValue: '',
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
                checkAll: false,
                checkedBulk: [],
                isIndeterminate: false,
                attributes: [],
                position: 0,
                total: 0,
            }
        },
        mounted() {
          this.getSearchTags();
        },
        computed: {
            percentage: function () {
                return this.total ? Math.round(this.position / this.total * 100) : 0;
            },
        },
        methods: {
            handleCheckAllChange(val) {
                this.checkedBulk = val ? this.attributes.map(i => i.value) : [];
                this.isIndeterminate = false;
            },
            handleCheckedChange(value) {
                let checkedCount = value.length;
                this.checkAll = checkedCount === this.attributes.length;
                this.isIndeterminate = checkedCount > 0 && checkedCount < this.attributes.length;
            },
            startFetchAttributesTag(tag) {
                this.searchAttr = tag;
                this.fetchAttributes();
            },
            startFetchAttributes() {
                this.searchAttr = this.searchText;
                this.fetchAttributes();
            },
            fetchAttributes() {

                this.$http.post(window.ajaxurl, {
                    action: 'ads_actions',
                    ads_controller: 'adsManageSizeAttributes',
                    ads_action: 'fetchAttributes',
                    'args': {
                        searchTag: this.searchAttr,
                    }

                }).then((response) => {
                    this.searchText = '';
                    this.searchTagNewName = '';
                    this.attributes = response.body.attributes;
                });
            },
            update() {
                this.start_params().then(() => {
                    this.updateProgress();
                })

            },
            updateProgress() {

                if (!this.total || this.position >= this.total) {
                    this.isActive = false;
                    this.fetchAttributes();

                    this.$notify({
                        message: 'Changes successfully saved',
                    });

                    return;
                }

                this.active = true;

                this.getNextProduct().then((product) => {
                    this.updateProductAttributes().then(() => {
                        this.updateProgress();
                    });
                });

            },

            getNextProduct() {
                return this.$http.post(window.ajaxurl, {
                    action: 'ads_actions',
                    ads_controller: 'adsManageSizeAttributes',
                    ads_action: 'next_product',
                    args: {
                        searchTag: this.searchText,
                    }
                }).then((response) => {

                    this.product = response.body.product;

                    if (response.body.position_product)
                        this.position = response.body.position_product;

                    if (response.body.total_product)
                        this.total = response.body.total_product;


                    return null;
                });
            },

            updateProductAttributes() {
                return this.$http.post(window.ajaxurl, {
                    action: 'ads_actions',
                    ads_controller: 'adsManageSizeAttributes',
                    ads_action: 'updateProductAttributes',
                    args: {
                        searchTag: this.searchAttr,
                        searchTagNewName: this.searchTagNewName,
                        attributes: this.attributes,
                    }

                }).then((response) => {

                    this.product = response.body.product;

                    if (response.body.position_product)
                        this.position = response.body.position_product;

                    if (response.body.total_product)
                        this.total = response.body.total_product;


                    return null;
                });
            },

            start_params() {
                return this.$http.post(window.ajaxurl, {
                    action: 'ads_actions',
                    ads_controller: 'adsManageSizeAttributes',
                    ads_action: 'start_params',
                    args: {
                        searchTag: this.searchText,
                    }
                }).then((response) => {
                    this.position = response.body.position_product;
                    this.total = response.body.total_product;
                });
            } ,
            getSearchTags() {
                return this.$http.post(window.ajaxurl, {
                    action: 'ads_actions',
                    ads_controller: 'adsManageSizeAttributes',
                    ads_action: 'searchTags',
                    args: {}
                }).then((response) => {
                    this.searchTags = response.body.searchTags;
                });
            }
        }
    }
</script>

<style scoped lang="scss">
    .alids-panel {
        max-width: 830px;
        padding: 15px;
        background: #FFFFFF;
        border-radius: 2px;
        border-top: 2px solid #46AB88;
        margin-top: 10px;
    }

    .alids-panel-header {
        font-weight: 600;
        font-size: 16px;
        line-height: 18px;
        color: #333333;
        display: flex;
        justify-content: space-between;
        align-items: center;

        .how_works{
            font-weight: normal;
            font-size: 13px;
            a{
                text-decoration: none;
            }
        }
    }

    .alids-btn-default {
        font-size: 13px;
        line-height: 16px;
        text-align: center;
        color: #0071A1;
        background: #F3F5F6;
        border: 1px solid #0071A1;
        box-sizing: border-box;
        border-radius: 3px;
        padding: 7px 10px;
        display: flex;
        align-items: center;
    }

    .alids-btn-green {
        font-size: 14px;
        line-height: 19px;
        text-align: center;

        color: #FFFFFF;
        background: #46AB88;
        border-radius: 1px;
        padding: 7px 10px;
        display: flex;
        align-items: center;
    }


    .alids-search-attribute {
        margin-top: 20px;
        display: flex;

        .alids-input {
            flex: 1;
        }

        .alids-btn-default {
            margin-left: 10px;
        }
    }

    .alids-tags {
        margin: 14px -6px;

        .alids-tag {
            cursor: pointer;
            display: inline-block;
            margin: 6px 5px;
            padding: 6px 10px;
            background: #409EFF;
            border-radius: 1px;

            font-size: 14px;
            line-height: 20px;
            color: #FFFFFF;
        }
    }

    .alids-search-attr {
        display: flex;
        font-weight: 600;
        font-size: 16px;
        line-height: 18px;
        color: #333333;
        margin-top: 10px;
        margin-bottom: 20px;
        align-items: center;

        .value-search-attr {
            margin-right: 15px;
        }

        .el-input {
            flex: 1;
        }
    }

    .alids-bulk-row {
        display: flex;

        .el-button {
            margin-left: 10px;
        }
    }

    .alids-list-attribute {
        margin-top: 8px;

        .el-col {
            padding-left: 6.5px;
            padding-right: 6.5px;
        }
    }

    .alids-list-attribute-row-header {
        border-bottom: 1px solid #C4C4C4;
        margin-bottom: 20px;
        padding: 15px 0;
    }

    .alids-list-attribute-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;

        .el-checkbox {
            margin-bottom: 0px;
        }

        .el-checkbox__label {
            display: none;
        }
    }

    .alids-list-attribute-row-attr {
        .col-2 .alids-input {
            padding-left: 20px;
        }
    }

    .alids-list-attribute-row-parent {
        .alids-input {
            font-weight: 600;
        }

    }

    .alids-update-info {
        display: inline-block;
        margin: 20px 0;

        .alids-info-text {
            font-weight: 600;
            font-size: 13px;
            line-height: 18px;
            color: #333333;
        }

        .alids-update-tag {
            margin-left: 10px;

            .el-icon-close {
                margin-left: 1px;
                background: #C4C4C4;
                width: 13px;
                height: 13px;
                border-radius: 50%;
                color: #fff;
                font-size: 10px;
                text-align: center;
                line-height: 13px;
            }
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

    .wrap-alids-list-attribute-row {
        //  padding: 6px;
    }

    .col-1,
    .col-2,
    .col-3,
    .col-4 {
        padding-right: 6px;
        padding-left: 6px;
    }

    .col-2,
    .col-3 {
        flex: 1;
    }

    .col-4 {
        width: 44px;
    }
.alids-progress-head{
  font-weight: bold;
  margin: 20px 0 5px 0;
}
</style>


<style lang="scss">
    .alids-list-attribute-row {
        .el-checkbox__label {
            display: none;
        }
    }
</style>
