<template>
    <el-date-picker
            v-model="value"
            type="daterange"
            format="MMM dd,yyyy"
            :picker-options="pickerOptions"
            range-separator="-"
            start-placeholder="Start date"
            end-placeholder="End date"
            align="right">
    </el-date-picker>
</template>

<script>

    Date.prototype.addDays = function(days) {
        var date = new Date(this.valueOf());
        date.setDate(date.getDate() + days);
        return date;
    }

    export default {
        name: 'app',
        props: ["date", "lifetime"],
        data() {
            return {
                pickerOptions: {
                    disabledDate(time) {
                        return time.getTime() > Date.now();
                    },
                    shortcuts: [
                        {
                            text: 'Lifetime',
                            onClick:(picker)=>{
                                this.type = 'Lifetime';
                                picker.$emit('pick', [new Date(this.lifetime), new Date()]);
                            }
                        },
                        {
                            text: 'Today',
                            onClick(picker) {
                                this.type = 'Today';
                                const end = new Date();
                                const start = new Date();
                                picker.$emit('pick', [start, end]);
                            }
                        },
                        {
                            text: 'Yesterday',
                            onClick(picker) {
                                this.type = 'Yesterday';
                                const start = new Date();
                                start.setTime(start.getTime() - 3600 * 1000 * 24);
                                picker.$emit('pick', [start, start]);
                            }
                        },
                        {
                            text: 'Last 7 days',
                            onClick(picker) {
                                this.type = 'last7days';
                                const end = new Date();
                                const start = new Date();
                                start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
                                picker.$emit('pick', [start, end]);
                            }
                        }, {
                            text: 'Last 14 days',
                            onClick(picker) {
                                this.type = 'last14days';
                                const end = new Date();
                                const start = new Date();
                                start.setTime(start.getTime() - 3600 * 1000 * 24 * 14);
                                picker.$emit('pick', [start, end]);
                            }
                        }, {
                            text: 'Last 30 days',
                            onClick(picker) {
                                this.type = 'last30days';
                                const end = new Date();
                                const start = new Date();
                                start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
                                picker.$emit('pick', [start, end]);
                            }
                        }, {
                            text: 'This week',
                            onClick(picker) {
                                this.type = 'ThisWeek';
                                let curr = new Date;
                                let first = curr.getDate() - curr.getDay();

                                let firstday = new Date(curr.setDate(first));
                                let lastday = firstday.addDays(6);
                                picker.$emit('pick', [firstday, lastday]);
                            }
                        }
                        , {
                            text: 'This month',
                            onClick(picker) {
                                this.type = 'ThisMonth';
                                let date = new Date(), y = date.getFullYear(), m = date.getMonth();
                                let firstDay = new Date(y, m, 1);
                                let lastDay = new Date(y, m + 1, 0);
                                picker.$emit('pick', [firstDay, lastDay]);
                            }
                        }
                        , {
                            text: 'Last month',
                            onClick(picker) {
                                this.type = 'ThisMonth';
                                let date = new Date(), y = date.getFullYear(), m = date.getMonth();
                                let firstDay = new Date(y, m - 1, 1);
                                let lastDay = new Date(y, m, 0);
                                picker.$emit('pick', [firstDay, lastDay]);
                            }
                        }]
                },
                type: 'Lifetime'
            }
        },
        computed: {
            value: {
                set(v) {
                    this.$emit('selectDate', v);
                },
                get() {
                    return this.date;
                }
            }
        },

    }
</script>

<style>
    #app {
        font-family: 'Avenir', Helvetica, Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        text-align: center;
        color: #2c3e50;
        margin-top: 60px;
    }
</style>
