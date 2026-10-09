import type { FocusEvent } from "react";

/**
 * Markiert den kompletten Feldinhalt, sobald ein Zahlenfeld den Fokus bekommt —
 * die erste getippte Ziffer ersetzt den alten Wert, statt sich an ihn anzuhängen.
 *
 * Die Auswahl passiert bewusst erst im Microtask: base-ui merged Event-Handler
 * von rechts nach links, externe Handler laufen also *vor* den internen. Der
 * `NumberField`-Input setzt beim ersten Fokus selbst den Cursor ans Ende
 * (`setSelectionRange(length, length)`) und würde eine synchrone Auswahl wieder
 * verwerfen. `event.preventBaseUIHandler()` wäre die Alternative, unterdrückt
 * aber auch den internen Fokus-State.
 *
 * `queueMicrotask` statt `requestAnimationFrame`, weil Frames in einem nicht
 * sichtbaren Tab ausbleiben — die Auswahl käme dort nie an.
 */
export function selectOnFocus(event: FocusEvent<HTMLInputElement>): void {
    const element = event.currentTarget;
    queueMicrotask(() => element.select());
}
