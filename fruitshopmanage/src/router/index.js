import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Main from '../views/Main.vue'
import Index from '../views/index/Index.vue'
import Category from '../views/product/Category.vue'
import ProductList from '../views/product/ProductList.vue'
import UserList from '../views/user/UserList.vue'
import AddProduct from '../views/product/AddProduct.vue'
import UpdateProduct from '../views/product/UpdateProduct.vue'

import UpdateUser from '../views/user/UpdateUser.vue'
import { ElMessage } from 'element-plus'
const routes = [
  { path: '/login', name: 'Login', component: Login },
  {
    path: '/',
    redirect: '/login' // 根路径重定向到登录页面
  },
  {
    path: '/admin',
    component: Main,
    children: [
      { path: 'index', component: Index },
      { path: 'category', component: Category },
      { path: 'product-list', component: ProductList },
      { path: 'user-list', component: UserList },

      { path: 'update-user/:id', component: UpdateUser },
      { path: 'add-product', component: AddProduct },
      { path: 'update-product/:id', component: UpdateProduct }
    ]
  }
]
const router = createRouter({
  history: createWebHistory(),
  routes
})

// 添加路由导航守卫
router.beforeEach((to, from, next) => {
  // 获取token
  const token = localStorage.getItem('token')

  // 如果是登录页面，直接放行
  if (to.path === '/login') {
    next()
    return
  }

  // 如果访问的是需要权限的页面，检查是否有token
  if (to.path.startsWith('/admin/')) {
    if (token) {
      // 有token，放行
      next()
    } else {
      // 没有token，重定向到登录页面
      ElMessage.error('请先登录')
      next('/login')
    }
  } else {
    // 其他页面，默认放行
    next()
  }
})

export default router
