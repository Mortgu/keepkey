import React from "react";
import { Outlet } from "@tanstack/react-router";
import { Navigation, ToastContainer } from "@/components";
import { ModalProvider } from "@/context/modal-provider";

export function MainLayoutComponent() {
    return (
        <React.Fragment>
            <Navigation />
            <div id="app" className="">
                <ModalProvider>
                    <Outlet />
                    <ToastContainer />
                </ModalProvider>
            </div>
        </React.Fragment>
    );
}
