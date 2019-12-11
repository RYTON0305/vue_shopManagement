import Vue from 'vue'
import VueRouter from 'vue-router'


Vue.use(VueRouter)

const routes = [
  {
    path: '/login',
    component: () => import('@/components/Login')
  },
  {
    path: '/home',
    component: () => import('@/components/Home'),
    children:[
      {
        path:'/welcome',
        component:()=>import('@/components/Welcome')
      },
      {
        path:'/users',
        component:()=>import('@/components/user/Users')
      },
      {
        path:'/rights',
        component:()=>import('@/components/authority/Rights')
      },
      {
        path:'/roles',
        component:()=>import('@/components/authority/Roles')
      },
      {
        path:'/categories',
        component:()=>import('@/components/goods/Category')
      }
    ],
    redirect: '/welcome'
  },
  {
    path: '*',
    redirect: '/login'
  }
]

const router = new VueRouter({
  routes
})
router.beforeEach((to, from, next) => {
  if (to.path === '/login') return next()
  const tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr) return next('/login')
  next()
})

export default router
