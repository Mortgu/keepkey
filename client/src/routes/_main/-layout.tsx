import React from "react";
import { Outlet } from "@tanstack/react-router";
import { ToastContainer } from "react-toastify";

import { Navigation } from "@/components";

export function MainLayoutComponent() {
    return (
        <React.Fragment>
            <Navigation />
            <div id="app" className="bg-white rounded-lg m-1 p-6 max-h-screen overflow-y-scroll">
                <Outlet />
                <ToastContainer />
            </div>
        </React.Fragment>
    );
}
