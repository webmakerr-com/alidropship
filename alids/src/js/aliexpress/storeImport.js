import Vue from 'vue';
import VueResource from 'vue-resource';

import app from './storeImport/app';
import { Button, Input, Dialog, Select, Option, Card, Form, FormItem, Checkbox, CheckboxGroup, Progress, MessageBox, Message, InputNumber } from 'element-ui';

Vue.component(Select.name, Select);
Vue.component(Dialog.name, Dialog);
//Vue.component(Row.name, Row);
//Vue.component(Col.name, Col);
Vue.component(Option.name, Option);
Vue.component(Button.name, Button);
Vue.component(Input.name, Input);
Vue.component(InputNumber.name, InputNumber);
Vue.component(Card.name, Card);
Vue.component(Form.name, Form);
Vue.component(FormItem.name, FormItem);
Vue.component(Checkbox.name, Checkbox);
Vue.component(CheckboxGroup.name, CheckboxGroup);
Vue.component(Progress.name, Progress);

Vue.prototype.$confirm = MessageBox.confirm;
Vue.prototype.$alert = MessageBox.alert;
Vue.prototype.$message = Message;

Vue.use(VueResource);

//Vue.http.options.root = window.ajaxurl;
Vue.http.options.emulateJSON = true;

new Vue({
    el: '#import-store-block',
    render: h => h(app),
});
