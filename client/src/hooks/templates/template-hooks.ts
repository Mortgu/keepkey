import { useQuery } from "@tanstack/react-query";

import { templateQueries } from "./template-queries";

export function useTemplates() {
    return useQuery(templateQueries.list());
}
