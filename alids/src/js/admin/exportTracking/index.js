import App from './exportTracking.vue';
import Vue from 'vue';

const index = function () {

    return {
        init(){
            jQuery('body').append('<div id="exportTracking"/>');
            new Vue({
                el: '#exportTracking',
                ...App
            });
        }
    }
};


export default index();
