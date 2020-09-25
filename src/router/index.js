// 导入组件
import Vue from 'vue';
import VueRouter from 'vue-router';

// 安装组件
Vue.use(VueRouter)

// 导入组件
const Login = () => import('components/login/Login');
const Home = () => import('components/home/Home');
const Welcome = () => import('components/home/Welcome')
const User = () => import('components/user/User')
const Right = () => import('components/power/Right')
const Role = () => import('components/power/Role')
const Cate = () => import('components/goods/Cate')
const Params = () => import('components/goods/Params')
const Goods = () => import('components/goods/Goods')
const Add = () => import('components/goods/Add') 
const Order = () => import('components/order/Order') 
const Report = () => import('components/report/Report') 

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  {
    path: '/home', component:Home,redirect:'/welcome', children: [
      {path: '/welcome',component:Welcome},
      {path:'/users',component:User},
      {path:'/rights',component:Right},
      {path: '/roles',component:Role},
      {path: '/categories',component:Cate},
      {path:'/params',component:Params},
      {path: '/goods',component:Goods},
      {path: '/goods/add',component:Add},
      {path:'/orders',component:Order},
      {path:'/reports',component:Report}
    ]
  }
]

const router = new VueRouter({
  routes,
  mode: 'history'
});

// 设置全局导航守卫，监听用户是否登录
router.beforeEach((to, from, next) => {
  // 访问登录页面直接放行
  if (to.path === '/login') return next()
  const tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr) return next('/login')
  next()
})

export default router;