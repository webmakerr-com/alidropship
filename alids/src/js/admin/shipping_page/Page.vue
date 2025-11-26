<template>
    <div class="alids-panel1">
        <div class="alids-panel-header">
            <div class="">
                <span>Shipping Options</span>
                <span class="action">
              <el-button v-if="pageActive === 'listPage'" @click="create">Create</el-button>
              <el-button v-if="pageActive === 'listPage'" @click="createDefault">Default</el-button>
                </span>
            </div>
<!--            <div class="how_works">
                <span class="status-mark border-light-green"/>
                <a href="https://alidropship.com/codex/shipping-options-settings-ver-1/" target="_blank">How it works</a>
            </div>-->
        </div>
        <div class="alids-panel-body">
            <OptionShipping v-if="pageActive === 'listPage'" />
            <template v-if="loading">
                <List v-if="pageActive==='listPage'" @onEdit="edit"/>
            </template>
            <Edit  v-if="pageActive==='editPage'" @onClose="openListPage" :editId="editId"/>
        </div>
    </div>
</template>

<script>
    import List from "./List";
    import Edit from "./Edit";
    import OptionShipping from "./OptionShipping";

    export default {
        name: "Page",
        components:{ List, Edit, OptionShipping },
        data() {
            return {
                loading: true,
                pageActive : 'listPage',
                editId : 0,
            }
        },
        mounted() {
        },
        computed: {
        },
        methods: {
            create(){
                this.editId = 0;
                this.pageActive = 'editPage'
            },
            createDefault(){
                this.$http.post(window.ajaxurl, {
                    action: 'ads_actions',
                    ads_controller: 'Shipping',
                    ads_action: 'create_default',
                    args: {
                        default: true,
                    }

                }).then((response)=>{
                    this.loading = false;
                    this.$nextTick(()=>{
                        this.loading = true;
                    })
                })
            },
            edit(idEdit){
                this.editId = idEdit;
                this.pageActive = 'editPage'
            },
            openListPage(){
                this.editId = null;
                this.pageActive = 'listPage'
            },
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


</style>


<style lang="scss">
    .alids-list-attribute-row {
        .el-checkbox__label {
            display: none;
        }
    }
</style>
