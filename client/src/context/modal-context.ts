import { createContext, useContext } from "react";
import type { ModalId, ModalPropsFor } from "./modal-registry";

type ModalContextType = {
    /** Öffnet ein Modal aus der Registry und liefert dessen instanceId zurück. */
    openModal: <T extends ModalId>(id: T, props?: ModalPropsFor<T>) => string;
    /** Schließt das Modal mit der instanceId — ohne Argument das oberste. */
    closeModal: (instanceId?: string) => void;
    closeAllModals: () => void;
};

export const ModalContext = createContext<ModalContextType | null>(null);

export const useModals = () => {
    const ctx = useContext(ModalContext);
    if (!ctx) throw new Error("useModals muss innerhalb von <ModalProvider> verwendet werden");
    return ctx;
};
