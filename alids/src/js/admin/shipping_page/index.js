import App from './Page.vue';
import Vue from 'vue';
import VueResource from 'vue-resource';
import './global.scss';

import { Progress,
    Select,
    Input,
    Button,
    Row,
    Option,
    Notification,
    Tooltip,
    Switch,
    Pagination,
    Dialog,
    Image,
    Col,
    Checkbox,
    CheckboxGroup,
} from 'element-ui';

Vue.use(VueResource);
Vue.http.options.emulateJSON = true;

Vue.component(Progress.name, Progress);
Vue.component(Select.name, Select);
Vue.component(Option.name, Option);
Vue.component(Input.name, Input);
Vue.component(Button.name, Button);
Vue.component(Row.name, Row);
Vue.component(Col.name, Col);
Vue.component(Tooltip.name, Tooltip);
Vue.component(Switch.name, Switch);
Vue.component(Pagination.name, Pagination);
Vue.component(Dialog.name, Dialog);
Vue.component(Image.name, Image);
Vue.component(Checkbox.name, Checkbox);
Vue.component(CheckboxGroup.name, CheckboxGroup);


Vue.prototype.$notify = function({message, title = '', type='success'}){
    return Notification({
        title: title,
        message: message,
        type: type,
        offset : 40
    })
} ;

new Vue({
    el: '#alids-shipping-list',
    render: h => h(App)
});
