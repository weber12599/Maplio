import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const HomeView = () => import('../views/HomeView.vue')
const TripPlannerView = () => import('../views/TripPlannerView.vue')
const LoginView = () => import('../views/LoginView.vue')

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'home',
            component: HomeView,
            meta: { requiresAuth: true }
        },
        {
            path: '/trip/:id',
            name: 'trip',
            component: TripPlannerView,
            meta: { requiresAuth: true }
        },
        {
            path: '/login',
            name: 'login',
            component: LoginView
        }
    ]
})

router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStore()

    if (!authStore.isAuthReady) {
        await authStore.initAuthListener()
    }

    const isAuthenticated = !!authStore.user || authStore.isDemoMode

    if (to.meta.requiresAuth && !isAuthenticated) {
        next({
            name: 'login',
            query: { redirect: to.fullPath }
        })
    } else if (to.name === 'login' && isAuthenticated) {
        const redirectPath = to.query.redirect || '/'
        next(redirectPath)
    } else {
        next()
    }
})

export default router
