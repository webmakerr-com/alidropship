import App from './addonsPage.vue';
import Vue from 'vue';
import VueResource from 'vue-resource';

Vue.use(VueResource);
Vue.http.options.emulateJSON = true;

const index = function () {

    return {
        init(){
            new Vue({
                el: '#ads-page-addons',
                ...App
            });
        }
    }
};


export default index();
