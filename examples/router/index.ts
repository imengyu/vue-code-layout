import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router'
import BasicUseage from '../views/BasicUseage.vue'
import SplitLayout from '../views/SplitLayout.vue'
import DataSaveAndLoad from '../views/DataSaveAndLoad.vue'
import SlotsTest from '../views/SlotsTest.vue'
import EmptyTest from '../views/EmptyTest.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'BasicUseage',
    component: BasicUseage,
  },
  {
    path: '/SplitLayout',
    name: 'SplitLayout',
    component: SplitLayout,
  },
  {
    path: '/DataSaveAndLoad',
    name: 'DataSaveAndLoad',
    component: DataSaveAndLoad,
  },
  {
    path: '/SlotsTest',
    name: 'SlotsTest',
    component: SlotsTest,
  },
  {
    path: '/EmptyTest',
    name: 'EmptyTest',
    component: EmptyTest,
  },
]

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes
})

export default router
