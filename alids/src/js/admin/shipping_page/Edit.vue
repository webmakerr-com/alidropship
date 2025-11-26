<template>
    <div class="alids-page-row">
        <div class="alids-page-wrap">
            <div class="alids-page-panel">
                <div class="alids-page-panel-head">
                    <div class="alids-page-panel-head-action">
                    </div>
                </div>
                <div class="alids-page-panel-main">
                    <div class="">
                        <el-switch :active-value="1" :inactive-value="0" v-model="item.enable"/>
                      <div class="alids-page-panel-row">
                        <div class="alids-page-panel-label">Shipping ID</div>
                        <el-input placeholder="Example: super_savings" v-model="item.code"></el-input>
                        <div class="alids-page-panel-help">For internal use only.</div>
                      </div>

                        <div class="alids-page-panel-row">
                            <div class="alids-page-panel-label">Title</div>
                            <el-input placeholder="Example: Free" v-model="item.title"></el-input>
                            <div class="alids-page-panel-help">This title will be shown on checkout page.</div>
                        </div>

                      <div class="alids-page-panel-row">
                        <div class="alids-page-panel-label">Minimum order price</div>
                        <el-input placeholder="Example: 70" v-model="item.min_cost_enabled"></el-input>
                        <div class="alids-page-panel-help">Set a minimum order amount required for that shipping method to be available.</div>
                      </div>

                        <div class="alids-page-panel-row">
                            <div class="alids-page-panel-label">Delivery time</div>
                            <el-input placeholder="Example: 15-50 days (ships out within 7 business days)" v-model="item.time"></el-input>
                            <div class="alids-page-panel-help">Set the number of days required for this shipping option.</div>
                        </div>

                        <div class="alids-page-panel-row">
                            <div class="alids-page-panel-label">Comment</div>
                            <el-input placeholder="comment" v-model="item.comment"></el-input>
                        </div>

                        <div class="alids-page-panel-row">
                            <div class="alids-page-panel-label">Shipping cost</div>
                            <el-input placeholder="Example: 4.5" v-model="item.cost"></el-input>
                            <div class="alids-page-panel-help">Set the cost of delivery that will be added to your selling price for this shipping option.</div>
                        </div>

                        <div class="alids-page-panel-row">
                            <div class="alids-page-panel-label">Shipping zone</div>
                            <el-select @change="changeCountry" placeholder="All" class="country" v-model="item.country" multiple>
                                <el-option v-for="i in country" :key="i.value" :label="i.title" :value="i.value"/>
                            </el-select>
                            <div class="" v-if="item.country.length === 1 && state.length > 0">
                                <el-select  placeholder="All" class="region" v-model="item.region" multiple>
                                    <el-option v-for="i in state" :key="i.value" :label="i.title" :value="i.value"/>
                                </el-select>
                            </div>
                        </div>

                        <div class="alids-page-panel-row">
                            <div class="alids-page-panel-label">Apply to</div>
                            <SelectApply :type.sync="item.type" :apply.sync="item.applyto"/>
                        </div>
                    </div>
                </div>
            </div>

            <div class="alids-page-action">
                <el-button type="primary" @click="save">Save</el-button>
                <el-button @click="cancel">Back</el-button>
            </div>
        </div>
    </div>

</template>

<script>
    import SelectApply from '../selectProduct/SelectApply'
    export default {
        name: "Edit",
        components: {SelectApply},
        props: ["editId"],
        data(){
            return{
                item:{
                    id : 0,
                    enable : 0,
                    title : '',
                    time : '',
                    min_cost_enabled : '',
                    cost : '',
                    code : '',
                    comment : '',
                    applyto: [],
                    type: 'product',
                    country: [],
                    region: [],
                },
                country : [],
                state : [],
            }
        },
        created() {
            this.find_edit();
        },
        methods:{
            find_edit(){
                this.$http.post(window.ajaxurl, {
                    action: 'ads_actions',
                    ads_controller: 'Shipping',
                    ads_action: 'find_edit',
                    args: {
                        id: this.editId
                    }

                }).then((response)=>{
                    this.item = response.body.item;
                    this.country = response.body.country;
                    this.state = response.body.state;
                })
            },
            save(){
                this.$http.post(window.ajaxurl, {
                    action: 'ads_actions',
                    ads_controller: 'Shipping',
                    ads_action: 'save',
                    args: {
                        id : this.editId,
                        item : this.item,
                    }

                }).then((response)=>{
                    this.$notify({
                        message: response.body.message,
                    });
                })
            },
            cancel(){
                this.$emit('onClose');
            },
            find_state(){
                this.$http.post(window.ajaxurl, {
                    action: 'ads_actions',
                    ads_controller: 'Shipping',
                    ads_action: 'find_state',
                    args: {
                        country: this.item.country
                    }

                }).then((response)=>{
                    this.state = response.body.state;

                })
            },
            changeCountry(){
                this.item.region = [];
                this.state = [];
                this.find_state();
            }
        }
    }
</script>

<style scoped lang="scss">
    .alids-page-row {
        display: flex;
        margin: 20px -20px;

        .alids-page-wrap {
            display: inline-block;
            width: 100%;
            vertical-align: top;

            .alids-page-panel {
                margin: 0 20px;
            }
        }
    }

    .alids-panel-body{
        margin-top: 25px;
    }

    .alids-page-panel {
        background: #FFFFFF;
        border: 1px solid #C8CCD0;
        box-sizing: border-box;
    }

    .alids-page-panel-head {
        display: flex;
        justify-content: space-between;
        padding: 9px 15px 9px 20px;
        border-bottom: 1px solid #C8CCD0;
        min-height: 35px;
    }

    .alids-page-panel-head-action {
        display: flex;

        .add_upsell {
            font-weight: 900;
            font-size: 14px;
            line-height: 20px;
            color: #409EFF;
            margin-right: 25px;
            display: flex;
            align-items: center;
        }

        .head-text {
            margin-right: 20px;
            font-size: 14px;
            line-height: 19px;
            color: #333333;
            display: flex;
            align-items: center;
            cursor: pointer;
            &.active{
                cursor: default;
            }
        }

        .head-text--bold {
            font-weight: 600;
        }

        i {
            font-size: 16px;
            margin-left: 6px;
        }
    }

    .alids-page-panel-main {
        padding: 20px;
    }

    .alids-page-action{
        margin-top: 25px;
        margin-left: 20px;
        margin-bottom: 25px;
    }

    .alids-page-panel-row{
        margin: 10px 0;
    }

    .alids-page-panel-help{
        display: block;
        font-size: 12px;
        margin-top: 7px;
        margin-bottom: 7px;
        color: #999;
    }
    .alids-page-panel-label{
        margin-bottom: 7px;
    }
</style>
