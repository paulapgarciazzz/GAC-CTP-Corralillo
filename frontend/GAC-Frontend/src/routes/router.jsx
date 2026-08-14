import Landingpage from '../modulos/landing/pages/Landingpage'
import Dashboard from '../modulos/dashboard/pages/Dashboard'

import {
    createRootRoute,
    createRoute,
    createRouter,
    Outlet
} from '@tanstack/react-router';

const rootRoute = createRootRoute({
    component:()=> <Outlet/>
})

const landingRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: Landingpage,
})
const dashboardRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/dashboard',
    component: Dashboard,
})


export const router = createRouter({
    routeTree: rootRoute.addChildren([
        landingRoute,
        dashboardRoute,

    ])
})