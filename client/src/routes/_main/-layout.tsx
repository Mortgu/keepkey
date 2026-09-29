import React from "react";
import { Outlet } from "@tanstack/react-router";
import Navigation from "./-components/navigation";
import { ToastContainer } from "@/components";

export function MainLayoutComponent() {
    return (
        <React.Fragment>
            <Navigation />
            <div id="app" className="">
                <Outlet />
                <ToastContainer />
            </div>
        </React.Fragment>
    );
}
