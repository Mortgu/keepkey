import { lazy } from "react";
import type { ComponentProps } from "react";

/**
 * Zentrale Registry aller global öffenbaren Modals.
 * `lazy` hält die Modals aus dem Root-Chunk heraus.
 */
export const MODAL_REGISTRY = {
    offer: lazy(() => import("@/routes/_main/offers/-components/modals/offer-modal")),
    contacts: lazy(() => import("@/routes/_main/customers/-components/contact/contacts-modal")),
    contact: lazy(() => import("@/routes/_main/customers/-components/contact/contact-modal")),
} as const;

export type ModalId = keyof typeof MODAL_REGISTRY;

/** Props, die der Aufrufer übergibt — `closeFn` injiziert der Modal-Host. */
export type ModalPropsFor<T extends ModalId> = Omit<
    ComponentProps<(typeof MODAL_REGISTRY)[T]>,
    "closeFn"
>;
