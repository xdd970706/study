// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'

Vue.config.productionTip = false
// 引入公共样式
import './assets/style/style.css'
// 引入字体图标
import './assets/font/iconfont.css'

import http from './htpp'

Vue.prototype.$http = http;
/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
