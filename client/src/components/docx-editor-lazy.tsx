import { Suspense, lazy } from "react";
import type { ComponentProps } from "react";
import { Skeleton } from "./skeleton";

/**
 * Nachgeladener DOCX-Editor.
 *
 * `@docx-editor.dev` wiegt über 2 MB. Da per Konvention alles aus dem
 * `@/components`-Barrel importiert wird, würde ein direkter Re-Export von
 * `./docx-editor` dieses Paket in den Start-Chunk jeder Seite ziehen. Der
 * Barrel exportiert deshalb diese Hülle; der eigentliche Editor liegt in
 * einem eigenen Chunk und wird erst geladen, wenn jemand ihn öffnet.
 */
const LazyEditor = lazy(() => import("./docx-editor"));

type Props = ComponentProps<typeof LazyEditor>;

function EditorFallback() {
    return (
        <div className="h-full w-full bg-(--page-bg) p-4" aria-busy>
            <Skeleton shape="rect" className="h-full" />
        </div>
    );
}

export default function DocumentDocxEditor(props: Props) {
    return (
        <Suspense fallback={<EditorFallback />}>
            <LazyEditor {...props} />
        </Suspense>
    );
}
