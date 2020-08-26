// 应用element UI
import Vue from 'vue';
import { Button, Select } from 'element-ui';
import { Form, FormItem } from 'element-ui';
import { Input,Message } from 'element-ui';

Vue.use(Button);
Vue.use(Select);
Vue.use(Form);
Vue.use(FormItem);
Vue.use(Input);

Vue.prototype.$message = Message;



