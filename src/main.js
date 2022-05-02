/*
 * @Author: qin
 * @Date: 2022-05-01 12:46:22
 * @LastEditTime: 2022-05-01 13:14:05
 * @FilePath: \vueProject\p-demo\src\main.js
 *  -> The best way to explain it is to do it
 */
import { createApp } from 'vue';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import App from './App.vue';
import router from './router';
import store from './store';

createApp(App).use(ElementPlus).use(store).use(router).mount('#app');
