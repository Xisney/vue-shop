// 导入组件
import Vue from 'vue';
import VueRouter from 'vue-router';

// 安装组件
Vue.use(VueRouter)

// 导入组件
const Login = () => import('components/login/Login');
const Home = () => import('components/home/Home');

const routes = [
  {path:'/',redirect:'/login'},
  {path:'/login',component: Login},
  {path:'/home',component: Home}
]

const router = new VueRouter({
  routes,
  mode:'history'
});

// 设置全局导航守卫，监听用户是否登录
router.beforeEach((to,from,next)=>{
  // 访问登录页面直接放行
  if (to.path==='/login') return next()
  const tokenStr = window.sessionStorage.getItem('token')
  if(!tokenStr) return next('/login')
  next()
})

export default router;