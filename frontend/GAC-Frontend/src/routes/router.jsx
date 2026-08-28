import Landingpage from '../modulos/landing/pages/Landingpage'
import Dashboard from '../modulos/dashboard/pages/Dashboard'
import { AccessGuard } from '../auth/guards/AccessGuard';
import { Authprovider } from '../auth/context/AuthContext';
import Login from '../modulos/login/pages/LoginPage'

import {
    createRootRoute,
    createRoute,
    createRouter,
    Outlet
} from '@tanstack/react-router';
import LoginPage from '../modulos/login/pages/LoginPage';


const rootRoute = createRootRoute({
    component:()=> 
     <Authprovider>
     <Outlet/>
     </Authprovider>
})

const landingRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: Landingpage,
})

const loginRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/login',
    component: LoginPage
});
const dashboardRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/dashboard',
    component: Dashboard,
})




export const router = createRouter({
    routeTree: rootRoute.addChildren([
        landingRoute,
        loginRoute,
        dashboardRoute,
       

    ])
})