import Vue from 'vue'
import App from './App.vue'
import router from './router'
// 应用element ui
// 导入整个文件？
import element from 'components/el.js'

import ZkTable from 'vue-table-with-tree-grid'

Vue.component('tree-table', ZkTable)

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')