import { useEffect } from "react";

/**
 * Verhindert, dass der Browser zu einer fallengelassenen Datei navigiert.
 *
 * Ohne diesen Guard ersetzt ein Drop, den keine Dropzone annimmt, die Seite
 * durch die Datei — und von einer https-Seite aus quittiert Firefox das mit
 * „Inhalt auf … darf file:/// nicht laden oder verlinken". Betroffen ist vor
 * allem der gesperrte Zustand: react-dropzone hängt bei `disabled` gar keine
 * Drag-Handler an, dann greift überall das Standardverhalten.
 *
 * Bewusst in der Bubble-Phase und ohne `stopPropagation`: Die Handler aktiver
 * Dropzones laufen vorher und bleiben unberührt.
 */
export function useBlockFileDrop() {
    useEffect(() => {
        const swallow = (event: DragEvent) => event.preventDefault();

        window.addEventListener("dragover", swallow);
        window.addEventListener("drop", swallow);

        return () => {
            window.removeEventListener("dragover", swallow);
            window.removeEventListener("drop", swallow);
        };
    }, []);
}
