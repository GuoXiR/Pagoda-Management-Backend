import { createApp } from 'vue'
import ElementPlus from 'element-plus' //引入 Element-plus
import 'element-plus/dist/index.css' //引入 Element-plus
import App from './App.vue'
import router from "./router"
//引入 axios
import axios from "axios"
import VueAxios from "vue-axios"
// 如果您正在使用 CDN 引入，请删除下面一行。
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
//富文本编辑器
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css';

const app=createApp(App)
app.component('QuillEditor', QuillEditor)
// 注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
app.component(key, component)
}

app.use(VueAxios,axios)
app.provide("axios",app.config.globalProperties.axios)
app.use(router).use(ElementPlus).mount('#app')