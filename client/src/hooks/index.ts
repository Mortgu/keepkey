/*
 * Öffentliche Hook-API: je Domain sind `*-keys`, `*-hooks` und `*-mutations`
 * exportiert. `*-api`- und `*-queries`-Dateien bleiben intern — die Rohfunktionen
 * und queryOptions leaken nicht nach außen. Bewusste Ausnahmen:
 * `documentDownloadUrl`/`templateDownloadUrl` (reine URL-Helper, kein Fetch),
 * `getTemplateContent` (imperativer Abruf beim Editieren, kein Query) und
 * `pricingQueries` (Batch-`useQueries` braucht die queryOptions-Objekte direkt).
 */
export * from './use-block-file-drop';
export * from './use-modal';
export * from './use-locale';
export * from './use-debounce';

export * from './contracts/contract-keys';
export * from './contracts/contract-hooks';
export * from './contracts/contract-mutations';
export * from './customers/customer-keys';
export * from './customers/customer-hooks';
export * from './customers/customer-mutations';
export * from './dashboard/dashboard-keys';
export * from './dashboard/dashboard-hooks';
export * from './documents/document-keys';
export * from './documents/document-capabilities';
export * from './documents/document-mutations';
export * from './documents/document-task';
export { documentDownloadUrl } from './documents/document-api';export * from './flatrates/flatrate-keys';
export * from './flatrates/flatrate-hooks';
export * from './flatrates/flatrate-mutations';
export * from './integrations/integration-keys';
export * from './integrations/integration-hooks';
export * from './offers/offer-keys';
export * from './offers/offer-hooks';
export * from './offers/offer-mutations';
export * from './orders/order-keys';
export * from './orders/order-hooks';
export * from './orders/order-mutations';
export * from './pricing/pricing-keys';
export * from './pricing/pricing-hooks';
export * from './pricing/pricing-mutations';
export { pricingQueries } from './pricing/pricing-queries';
export * from './products/product-keys';
export * from './products/product-hooks';
export * from './products/product-mutations';
export * from './search/search-keys';
export * from './search/search-hooks';
export * from './suppliers/supplier-keys';
export * from './suppliers/supplier-hooks';
export * from './suppliers/supplier-mutations';
export * from './tariffs/tariff-keys';
export * from './tariffs/tariff-hooks';
export * from './tariffs/tariff-mutations';
export * from './templates/template-keys';
export * from './templates/template-hooks';
export * from './templates/template-mutations';
export { getTemplateContent, templateDownloadUrl } from './templates/template-api';
export * from './users/user-keys';
export * from './users/user-hooks';
export * from './users/user-mutations';
