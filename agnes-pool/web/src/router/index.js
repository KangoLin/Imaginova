import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import Accounts from '../views/Accounts.vue'
import ApiKeys from '../views/ApiKeys.vue'
import Proxy from '../views/Proxy.vue'

const routes = [
  { path: '/', name: 'Dashboard', component: Dashboard, meta: { title: '概览' } },
  { path: '/accounts', name: 'Accounts', component: Accounts, meta: { title: '账号管理' } },
  { path: '/keys', name: 'ApiKeys', component: ApiKeys, meta: { title: 'API 密钥' } },
  { path: '/proxy', name: 'Proxy', component: Proxy, meta: { title: '代理状态' } },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
