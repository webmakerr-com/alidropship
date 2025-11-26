<template>
    <div class="option-shipping">
        <div class="option-shipping-row"><el-switch @change="save" :active-value="1" :inactive-value="0" v-model="apply_each"/><span class="switch-label">Apply to each product</span> <el-tooltip class="item" effect="dark" content="Enabled: shipping cost is calculated per each item in your cart. Disabled: shipping cost is applied to the entire cart." placement="top-start">
            <i class="el-icon-question"></i>
        </el-tooltip></div>
        <div class="option-shipping-row"><el-switch @change="save" :active-value="1" :inactive-value="0" v-model="default_enable"/><span class="switch-label">Enable default shipping</span> <el-tooltip class="item" effect="dark" content="Use this 'Default Shipping' in case of any other shipping methods are not available. E.g.: All shipping methods have already attached to products or shipping zones, but there are still some products left without shipping method." placement="top-start">
          <i class="el-icon-question"></i>
        </el-tooltip></div>
        <div class="option-shipping-row">
          <el-input placeholder="Example: Free" v-model="default_title" @input="saveInput"></el-input>
          <div class="help">This title will be shown on checkout page.</div>
        </div>
        <div class="option-shipping-row">
            <el-input placeholder="Example: 0.00" v-model="default_cost" @input="saveInput"></el-input>
            <div class="help">Set the cost of delivery that will be added to your selling price for this shipping option.</div>
        </div>
        <div class="option-shipping-row">
          <el-input placeholder="Example: 15-50 days (ships out within 7 business days)" v-model="default_delivery_time" @input="saveInput"></el-input>
          <div class="help">Set the number of days required for this shipping option.</div>
        </div>
    </div>
</template>

<script>
    export default {
        name: "OptionShipping",
        data(){
            return {
                idTimer: null,
                apply_each : null,
                default_cost : null,
                default_enable : null,
                default_delivery_time : null,
                default_title : null,
            }
        },
        created() {
            this.loading();
        },
        methods:{
            loading(){
                this.$http.post(window.ajaxurl, {
                    action: 'ads_action_request',
                    ads_action: 'page_ads_shipping',
                    args: {

                    }

                }).then((response)=>{
                    this.apply_each = response.body.apply_each;
                    this.default_enable = response.body.default_enable;
                    this.default_delivery_time = response.body.default_delivery_time;
                    this.default_cost = response.body.default_cost;
                    this.default_title = response.body.default_title;
                })
            },
            save(){
                this.$http.post(window.ajaxurl, {
                    action: 'ads_action_request',
                    ads_action: 'save_page_ads_shipping',
                    args: {
                        apply_each : this.apply_each,
                        default_cost : this.default_cost,
                        default_delivery_time : this.default_delivery_time,
                        default_enable : this.default_enable,
                        default_title : this.default_title,
                    }

                }).then((response)=>{
                    this.$notify({message : response.body.message});
                })
            },
            saveInput(){
                clearTimeout(this.idTimer);
                this.idTimer=setTimeout(()=>{
                    this.save();
                }, 300)
            }
        }
    }
</script>

<style scoped lang="scss">
    .option-shipping{
        margin-top: 20px;
        margin-bottom: 20px;
    }
.option-shipping-row{
    margin-bottom: 10px;
    .help{
        display: block;
        font-size: 12px;
        margin-top: 7px;
        margin-bottom: 7px;
        color: #999;
    }
    .switch-label{
        display: inline-block;
        margin-left: 10px;
    }
}
</style>
