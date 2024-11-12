import { createRouter, createWebHistory } from "vue-router"
import { useUserStore } from "../stores/user.store"
const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: "/",
            name: "Home",
            component: () => import("../views/Home.vue")
        },
        {
            path: "/auth/login",
            name: "Login",
            component: () => import("../views/Login.vue")
        },
        {
            path: "/auth/register",
            name: "Register",
            component: () => import("../views/Register.vue")
        }
    ]
})
router.beforeEach((to, from, next) => {
    const { isAuthenticated } = useUserStore()
    if (!isAuthenticated && to.name !== "Register") {
        next('/auth/register')
    } else {
        next()
    }
})

export default router;