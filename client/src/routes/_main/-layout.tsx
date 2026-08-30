import React from "react";
import { Outlet } from "@tanstack/react-router";

export function MainLayoutComponent() {
    return (
        <React.Fragment>
            <div id="app">
                <Outlet />
            </div>
        </React.Fragment>
    );
}
