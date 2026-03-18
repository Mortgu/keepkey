import { createRootRoute, Outlet } from '@tanstack/react-router'
import React from 'react';
import { NavLink } from './-components/nav-link';

export const Route = createRootRoute({
    component: RootComponent,
});

function RootComponent() {
    return (
        <React.Fragment>
            <NavLink to="/">Main Page</NavLink>
            <NavLink to="/about">About Page</NavLink>
            <Outlet />
        </React.Fragment>
    )
}