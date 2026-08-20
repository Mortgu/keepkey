import { Suspense, useCallback, useMemo, useState } from "react";

import { ModalContext } from "./modal-context";
import { MODAL_REGISTRY } from "./modal-registry";
import type { ComponentType, ReactNode } from "react";
import type { ModalId, ModalPropsFor } from "./modal-registry";

type ModalEntry = {
    instanceId: string;
    id: ModalId;
    props: Record<string, unknown>;
};

/**
 * Rendert alle offenen Modals an genau einer Stelle im Baum.
 * Die instanceId dient als React-key und garantiert bei jedem Öffnen frischen State.
 */
export function ModalProvider({ children }: { children: ReactNode }) {
    const [stack, setStack] = useState<Array<ModalEntry>>([]);

    const closeModal = useCallback((instanceId?: string) => {
        setStack((prev) =>
            instanceId ? prev.filter((e) => e.instanceId !== instanceId) : prev.slice(0, -1),
        );
    }, []);

    const openModal = useCallback(<T extends ModalId>(id: T, props?: ModalPropsFor<T>) => {
        const instanceId = crypto.randomUUID();
        setStack((prev) => [
            ...prev,
            { instanceId, id, props: props ?? {} },
        ]);
        return instanceId;
    }, []);

    const closeAllModals = useCallback(() => setStack([]), []);

    // Stabiler Value: Consumer rendern beim Öffnen/Schließen nicht neu.
    const value = useMemo(
        () => ({ openModal, closeModal, closeAllModals }),
        [openModal, closeModal, closeAllModals],
    );

    return (
        <ModalContext.Provider value={value}>
            {children}

            <Suspense fallback={null}>
                {stack.map((entry) => {
                    const Modal = MODAL_REGISTRY[entry.id] as ComponentType<
                        Record<string, unknown> & { closeFn: () => void }
                    >;
                    return (
                        <Modal
                            key={entry.instanceId}
                            {...entry.props}
                            closeFn={() => closeModal(entry.instanceId)}
                        />
                    );
                })}
            </Suspense>
        </ModalContext.Provider>
    );
}
