import { createRouter, createWebHistory } from "vue-router"

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


export default router;