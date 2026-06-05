import { useState } from "react";

// undefined = closed, null = open for create, TData = open for edit
export function useModal<TData = null>() {
  const [state, setState] = useState<TData | null | undefined>(undefined);

  return {
    isOpen: state !== undefined,
    data: state,
    open: (data: TData | null = null) => setState(data),
    close: () => setState(undefined),
    key: state == null ? "create" : String((state as any).id ?? JSON.stringify(state)),
  };
}
