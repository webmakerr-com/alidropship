import Vue from 'vue';
import VueResource from 'vue-resource';

import App from './App';
import { DatePicker } from 'element-ui';
import '../../../theme/index.css';

Vue.component(DatePicker.name, DatePicker);

Vue.use(VueResource);

//Vue.http.options.root = window.ajaxurl;
Vue.http.options.emulateJSON = true;

function alidsDateRangePicker(el, options, cb) {

   let v = new Vue({
        data() {
            return {
                date : [moment(options.date[0], 'YYYY-MM-DD'), moment(options.date[1], 'YYYY-MM-DD')],
                lifetime : options.lifetime,
            }
        },
        create(){

        },
        render(createElement) {
            let self = this;
            return (createElement(App, {
                props: {
                    date : this.date,
                    lifetime : this.lifetime,
                },
                on: {
                    selectDate: function (selectDate) {
                        self.date = selectDate;
                        cb([moment(selectDate[0], 'YYYY-MM-DD').format('YYYY-MM-DD'), moment(selectDate[1], 'YYYY-MM-DD').format('YYYY-MM-DD')]);
                    },
                }
            }))
        }
    }).$mount(el);

    jQuery(document).on('datepicker:update', function(e){
        v.date = [moment(e.from, 'YYYY-MM-DD'), moment(e.to, 'YYYY-MM-DD')];
    });

    return {
        updateDate(date){
            v.date = [moment(date[0], 'YYYY-MM-DD'), moment(date[1], 'YYYY-MM-DD')];
        }
    }

}

window.alidsDateRangePicker = alidsDateRangePicker;
