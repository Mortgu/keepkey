import { queryOptions } from "@tanstack/react-query";

import { getTemplates } from "./template-api";
import { templateKeys } from "./template-keys";

export const templateQueries = {
    list: () => queryOptions({
        queryKey: templateKeys.list(),
        queryFn: getTemplates,
        staleTime: 30_000,
    }),
};
