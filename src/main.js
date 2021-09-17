import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
import './assets/css/global.css'
import './assets/fonts/iconfont.css'

// 导入Nprogress库
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

import axios from 'axios'
axios.defaults.baseURL = 'http://www.tangxiaoyang.vip:8888/api/v2/'
//axios可以拦截每一次请求，为请求头添加身份认证（token）
axios.interceptors.request.use(config => {
  NProgress.start()
	const userInfo = JSON.parse(sessionStorage.getItem('userInfo'))
	config.headers.Authorization = userInfo ? userInfo.token : ''
	
	//返回配置好的对象
	return config
})

// 请求拦截，结束进度条
axios.interceptors.response.use(config=>{
  NProgress.done()
  return config
})
// 树形插件
import ZkTable from 'vue-table-with-tree-grid'
Vue.component('Tree-table', ZkTable)

// 富文本库
import VueQuillEditor from 'vue-quill-editor'

// require styles
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'

Vue.use(VueQuillEditor, /* { default global options } */)

// 日期处理库
import moment from 'moment'
Vue.prototype.$moment = moment
moment.locale('zh-cn')  //设置区域为中国

Vue.prototype.$http = axios



Vue.config.productionTip = false

new Vue({
	router,
	render: h => h(App),
	mounted() {
		console.log(this)
	},
}).$mount('#app')