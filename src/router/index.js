import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login'


Vue.use(VueRouter)

const routes = [{
		path: '/',
		redirect: '/login'
	},
	{
		//登录路由
		path: '/login',
		name: 'Login',
		component: Login
	},
	{
		//主页路由
		path: '/home',
		name: 'Home',
		redirect: 'welcome',
		component: () => import('../components/Home.vue'),
		children: [{
				//欢迎路由
				path: '/welcome',
				name: 'Welcome',
				component: () => import('../components/Welcome.vue')
			},
			{
				path: '/users',
				name: 'User',
				component: () => import('../components/userManage/User.vue')

			},
			{
				path: '/rights',
				name: 'Rights',
				component: () => import('../components/rightManage/Rights.vue')

			},
			{
				path: '/roles',
				name: 'Roles',
				component: () => import('../components/rightManage/Roles.vue')

			},
			{
				path: '/categories',
				name: 'Categories',
				component: () => import('../components/goodsManage/Categories.vue')

			},
			{
				path: '/params',
				name: 'Params',
				component: () => import('../components/goodsManage/Params.vue')

			},
			{
				path: '/goods',
				name: 'Goods',
				component: () => import('../components/goodsManage/Goods.vue')

			},
			{
				path: '/goods/add',
				name: 'AddGoods',
				component: () => import('../components/goodsManage/AddGoods.vue')

			},
      {
				path: '/goods/edit',
				name: 'EditGoods',
				component: () => import('../components/goodsManage//EditGoods.vue')

			},
      {
				path: '/orders',
				name: 'Orders',
				component: () => import('../components/orderManage/Orders.vue')

			},
		]
	},

]

const router = new VueRouter({
	routes
})

//配置路由守卫

router.beforeEach((to, from, next) => {
	//如果访问的是登录页面，直接放行
	if (to.path === '/login') {
		return next()
	}
	//如果用户没有登录，跳转到登录页面/login

	const userInfo = JSON.parse(sessionStorage.getItem('userInfo'));
	if (!userInfo) {
		return next('/login')
	}
	next()

})



export default router