# Graph Report - /Users/oskar/Programming/keepit  (2026-06-08)

## Corpus Check
- Corpus is ~49,401 words - fits in a single context window. You may not need a graph.

## Summary
- 1229 nodes · 1781 edges · 117 communities (95 shown, 22 thin omitted)
- Extraction: 91% EXTRACTED · 9% INFERRED · 0% AMBIGUOUS · INFERRED: 156 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Offer Actions Pipeline|Offer Actions Pipeline]]
- [[_COMMUNITY_Auth & Task Controllers|Auth & Task Controllers]]
- [[_COMMUNITY_UI Core Components|UI Core Components]]
- [[_COMMUNITY_Input & Filter Components|Input & Filter Components]]
- [[_COMMUNITY_OpenAPI & Document Pipeline|OpenAPI & Document Pipeline]]
- [[_COMMUNITY_Server Dependencies|Server Dependencies]]
- [[_COMMUNITY_Client Dependencies|Client Dependencies]]
- [[_COMMUNITY_Customer Controllers|Customer Controllers]]
- [[_COMMUNITY_Auth Context & Navigation|Auth Context & Navigation]]
- [[_COMMUNITY_Product Type Definitions|Product Type Definitions]]
- [[_COMMUNITY_Client TSConfig|Client TSConfig]]
- [[_COMMUNITY_Tariff Controllers|Tariff Controllers]]
- [[_COMMUNITY_Route Tree Generation|Route Tree Generation]]
- [[_COMMUNITY_Client Dev Dependencies|Client Dev Dependencies]]
- [[_COMMUNITY_Node TSConfig|Node TSConfig]]
- [[_COMMUNITY_Server Config & Middleware|Server Config & Middleware]]
- [[_COMMUNITY_Offer Modal Components|Offer Modal Components]]
- [[_COMMUNITY_Offer Card Components|Offer Card Components]]
- [[_COMMUNITY_Order Controllers|Order Controllers]]
- [[_COMMUNITY_Tariff Modal Components|Tariff Modal Components]]
- [[_COMMUNITY_Product Controllers|Product Controllers]]
- [[_COMMUNITY_Nextcloud & Exceptions|Nextcloud & Exceptions]]
- [[_COMMUNITY_Offer Data Access|Offer Data Access]]
- [[_COMMUNITY_Server TSConfig|Server TSConfig]]
- [[_COMMUNITY_Pricing Modal|Pricing Modal]]
- [[_COMMUNITY_Supplier List Components|Supplier List Components]]
- [[_COMMUNITY_Employee List Components|Employee List Components]]
- [[_COMMUNITY_Offer Delete & Download|Offer Delete & Download]]
- [[_COMMUNITY_Offer Type Definitions|Offer Type Definitions]]
- [[_COMMUNITY_Pricing & Settings Pages|Pricing & Settings Pages]]
- [[_COMMUNITY_Customer List Components|Customer List Components]]
- [[_COMMUNITY_Flatrate Components|Flatrate Components]]
- [[_COMMUNITY_Contract Controllers|Contract Controllers]]
- [[_COMMUNITY_Document Type Definitions|Document Type Definitions]]
- [[_COMMUNITY_Badge Component|Badge Component]]
- [[_COMMUNITY_Order Card Components|Order Card Components]]
- [[_COMMUNITY_Product List Components|Product List Components]]
- [[_COMMUNITY_Tariff Data Access|Tariff Data Access]]
- [[_COMMUNITY_Server Dev Dependencies|Server Dev Dependencies]]
- [[_COMMUNITY_Flatrate Controllers|Flatrate Controllers]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 47|Community 47]]
- [[_COMMUNITY_Community 48|Community 48]]
- [[_COMMUNITY_Community 49|Community 49]]
- [[_COMMUNITY_Community 50|Community 50]]
- [[_COMMUNITY_Community 51|Community 51]]
- [[_COMMUNITY_Community 52|Community 52]]
- [[_COMMUNITY_Community 53|Community 53]]
- [[_COMMUNITY_Community 54|Community 54]]
- [[_COMMUNITY_Community 55|Community 55]]
- [[_COMMUNITY_Community 56|Community 56]]
- [[_COMMUNITY_Community 57|Community 57]]
- [[_COMMUNITY_Community 58|Community 58]]
- [[_COMMUNITY_Community 59|Community 59]]
- [[_COMMUNITY_Community 60|Community 60]]
- [[_COMMUNITY_Community 61|Community 61]]
- [[_COMMUNITY_Community 62|Community 62]]
- [[_COMMUNITY_Community 63|Community 63]]
- [[_COMMUNITY_Community 64|Community 64]]
- [[_COMMUNITY_Community 65|Community 65]]
- [[_COMMUNITY_Community 66|Community 66]]
- [[_COMMUNITY_Community 67|Community 67]]
- [[_COMMUNITY_Community 68|Community 68]]
- [[_COMMUNITY_Community 69|Community 69]]
- [[_COMMUNITY_Community 70|Community 70]]
- [[_COMMUNITY_Community 71|Community 71]]
- [[_COMMUNITY_Community 72|Community 72]]
- [[_COMMUNITY_Community 73|Community 73]]
- [[_COMMUNITY_Community 74|Community 74]]
- [[_COMMUNITY_Community 75|Community 75]]
- [[_COMMUNITY_Community 76|Community 76]]
- [[_COMMUNITY_Community 77|Community 77]]
- [[_COMMUNITY_Community 78|Community 78]]
- [[_COMMUNITY_Community 79|Community 79]]
- [[_COMMUNITY_Community 80|Community 80]]
- [[_COMMUNITY_Community 81|Community 81]]
- [[_COMMUNITY_Community 82|Community 82]]
- [[_COMMUNITY_Community 83|Community 83]]
- [[_COMMUNITY_Community 84|Community 84]]
- [[_COMMUNITY_Community 85|Community 85]]
- [[_COMMUNITY_Community 87|Community 87]]
- [[_COMMUNITY_Community 88|Community 88]]
- [[_COMMUNITY_Community 89|Community 89]]
- [[_COMMUNITY_Community 90|Community 90]]
- [[_COMMUNITY_Community 91|Community 91]]
- [[_COMMUNITY_Community 92|Community 92]]
- [[_COMMUNITY_Community 94|Community 94]]
- [[_COMMUNITY_Community 95|Community 95]]
- [[_COMMUNITY_Community 96|Community 96]]
- [[_COMMUNITY_Community 98|Community 98]]
- [[_COMMUNITY_Community 99|Community 99]]
- [[_COMMUNITY_Community 100|Community 100]]
- [[_COMMUNITY_Community 101|Community 101]]
- [[_COMMUNITY_Community 102|Community 102]]
- [[_COMMUNITY_Community 103|Community 103]]
- [[_COMMUNITY_Community 105|Community 105]]
- [[_COMMUNITY_Community 106|Community 106]]
- [[_COMMUNITY_Community 107|Community 107]]
- [[_COMMUNITY_Community 111|Community 111]]
- [[_COMMUNITY_Community 115|Community 115]]

## God Nodes (most connected - your core abstractions)
1. `api()` - 59 edges
2. `compilerOptions` - 21 edges
3. `useLocale()` - 18 edges
4. `compilerOptions` - 18 edges
5. `FileRoutesByPath` - 17 edges
6. `useModal()` - 16 edges
7. `compilerOptions` - 12 edges
8. `useCustomerHook()` - 11 edges
9. `validate()` - 11 edges
10. `section` - 10 edges

## Surprising Connections (you probably didn't know these)
- `getContractsAction()` --calls--> `api()`  [INFERRED]
  client/src/data/contracts.ts → client/src/lib/api-client.ts
- `createContractAction()` --calls--> `api()`  [INFERRED]
  client/src/data/contracts.ts → client/src/lib/api-client.ts
- `updateContractAction()` --calls--> `api()`  [INFERRED]
  client/src/data/contracts.ts → client/src/lib/api-client.ts
- `deleteContractAction()` --calls--> `api()`  [INFERRED]
  client/src/data/contracts.ts → client/src/lib/api-client.ts
- `getAllCustomersAction()` --calls--> `api()`  [INFERRED]
  client/src/data/customers.ts → client/src/lib/api-client.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Offer-to-Order Conversion Flow** —  [INFERRED 0.95]
- **Async Document Generation Pipeline** —  [INFERRED 0.85]
- **Tariff-Based Pricing Structure** —  [INFERRED 0.85]

## Communities (117 total, 22 thin omitted)

### Community 0 - "Offer Actions Pipeline"
Cohesion: 0.06
Nodes (52): converteAction(), fetchOfferAction(), fetchOfferData(), formatFetchedDataAction(), formatOfferData(), generateAction(), postProcessingAction(), prepareAction() (+44 more)

### Community 1 - "Auth & Task Controllers"
Cohesion: 0.05
Nodes (40): getAllTasks(), getTaskById(), auth, Request, requireSession(), PermissionOptions, requirePermission(), canCreateUsers (+32 more)

### Community 2 - "UI Core Components"
Cohesion: 0.05
Nodes (31): Button, styles, ButtonComponentProps, CollapsableComponentProps, card, dot, IntegrationStatus, IntegrationStatusCard() (+23 more)

### Community 3 - "Input & Filter Components"
Cohesion: 0.05
Nodes (24): Checkbox, checkboxSizes, labelStyles, styles, CheckboxComponentProps, chipSizeStyles, FilterChipProps, xIconSizes (+16 more)

### Community 4 - "OpenAPI & Document Pipeline"
Cohesion: 0.08
Nodes (41): client/template.html, Document Generation Pipeline, cmq16uc1k0000ztw8ws3q4snq.pdf, cmq4yojf70000paw809sqnisn.pdf, cmq4yqp3n0000ahw8r9mm3mg2.pdf, cmq582fzr000054w8sebbkgul.pdf, Offer-to-Order Workflow, Account (+33 more)

### Community 5 - "Server Dependencies"
Cohesion: 0.07
Nodes (28): dependencies, @asteasolutions/zod-to-openapi, axios, better-auth, bullmq, cors, docxtemplater, dotenv (+20 more)

### Community 6 - "Client Dependencies"
Cohesion: 0.08
Nodes (26): dependencies, better-auth, @better-auth/mongo-adapter, clsx, i18next, i18next-browser-languagedetector, i18next-http-backend, lucide-react (+18 more)

### Community 7 - "Customer Controllers"
Cohesion: 0.12
Nodes (16): deleteContactById(), deleteCustomer(), getAllCustomerContacts(), getAllCustomers(), getCustomerById(), updateContact(), updateCustomerById(), createContact() (+8 more)

### Community 8 - "Auth Context & Navigation"
Cohesion: 0.09
Nodes (18): SettingsPage(), AuthContext, AuthContextType, useAuth(), badgeStyles, BasicLinkComponent, BasicLinkProps, CreatedLinkComponent (+10 more)

### Community 9 - "Product Type Definitions"
Cohesion: 0.08
Nodes (24): Contract, ContractTranslation, ContractTranslationInput, CreateContractInput, CreateFlatRateInput, CreateProductInput, CreateTariffConfigInput, CreateTariffCustomerInput (+16 more)

### Community 10 - "Client TSConfig"
Cohesion: 0.08
Nodes (23): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection, moduleResolution (+15 more)

### Community 11 - "Tariff Controllers"
Cohesion: 0.15
Nodes (21): addTariffConfig(), addTariffCustomer(), createTariff(), deleteTariff(), deleteTariffConfig(), deleteTariffCustomer(), getAllTariffs(), getTariffById() (+13 more)

### Community 12 - "Route Tree Generation"
Cohesion: 0.09
Nodes (21): FileRoutesByFullPath, FileRoutesByTo, FileRouteTypes, LoginIndexRoute, MainContractsIndexRoute, MainCustomersIndexRoute, MainEmployeesIndexRoute, MainIndexRoute (+13 more)

### Community 13 - "Client Dev Dependencies"
Cohesion: 0.10
Nodes (21): devDependencies, @babel/core, babel-plugin-react-compiler, eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals (+13 more)

### Community 14 - "Node TSConfig"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, moduleResolution, noEmit (+11 more)

### Community 15 - "Server Config & Middleware"
Cohesion: 0.13
Nodes (13): Config, env, initNextcloud(), errorMapProps, exceptionHandler(), prismaErrorMap, webDavErrorMap, logger (+5 more)

### Community 16 - "Offer Modal Components"
Cohesion: 0.15
Nodes (14): getFormDefaults(), OfferModal(), OfferModalProps, offerSchema, OfferFlatRateForm(), Props, DURATIONS, OfferProductInput (+6 more)

### Community 17 - "Offer Card Components"
Cohesion: 0.15
Nodes (12): Document(), Props, LineItemRow(), LineItemRowProps, OfferCard(), OfferFlatRateRow(), OfferListItemProps, OfferPositionRow() (+4 more)

### Community 18 - "Order Controllers"
Cohesion: 0.17
Nodes (10): deleteOrderById(), getAllOrders(), getOrderById(), createDocumentForOrder(), createOrder(), createOrderTask(), generateOrderDocument(), router (+2 more)

### Community 19 - "Tariff Modal Components"
Cohesion: 0.15
Nodes (10): TariffConfigModal(), TariffConfigModalProps, TariffCustomerModal(), TariffCustomerModalProps, TariffProductsModal(), TariffProductsModalProps, useTariffHook(), OverrideTarget (+2 more)

### Community 20 - "Product Controllers"
Cohesion: 0.17
Nodes (9): deleteProduct(), getProduct(), getProducts(), updateProduct(), createProduct(), router, createProductSchema, productTranslationSchema (+1 more)

### Community 21 - "Nextcloud & Exceptions"
Cohesion: 0.25
Nodes (10): getNextcloudStatus(), AppException, fileExists(), getNextCloudClient(), getNextcloudInitError(), isNextcloudConfigured(), reserveFile(), ReserveFileResult (+2 more)

### Community 22 - "Offer Data Access"
Cohesion: 0.24
Nodes (14): createOfferAction(), createReservationAction(), deleteOfferAction(), deleteOfferDocumentAction(), generateOfferDocumentAction(), getContactPersonsAction(), getOfferRevisionsAction(), getOffersAction() (+6 more)

### Community 23 - "Server TSConfig"
Cohesion: 0.13
Nodes (14): compilerOptions, declaration, declarationMap, esModuleInterop, module, moduleResolution, outDir, rootDir (+6 more)

### Community 24 - "Pricing Modal"
Cohesion: 0.18
Nodes (7): ConfigRow, PricingModal(), PricingModalProps, useContractHook(), useProductHook(), OfferProductForm(), ProductModalSection()

### Community 25 - "Supplier List Components"
Cohesion: 0.18
Nodes (8): Props, SupplierListItem(), SupplierList(), SupplierModal(), SupplierModalProps, supplierSchema, useSupplierHook(), Route

### Community 26 - "Employee List Components"
Cohesion: 0.19
Nodes (9): UserList(), UserListItem(), UserListItemProps, createUserSchema, editUserSchema, emptyUser, UserModal(), UserModalProps (+1 more)

### Community 27 - "Offer Delete & Download"
Cohesion: 0.23
Nodes (9): deleteOffer(), deleteOfferDocument(), downloadOfferDocument(), getNextQuoteId(), getOfferById(), getOfferRevisions(), getOffers(), createReservation() (+1 more)

### Community 28 - "Offer Type Definitions"
Cohesion: 0.15
Nodes (12): CreateOfferFlatRatesInput, CreateOfferInput, CreateOfferPositionInput, Language, Offer, OfferDocument, OfferFlatRate, OfferPosition (+4 more)

### Community 29 - "Pricing & Settings Pages"
Cohesion: 0.17
Nodes (8): Route, RouteComponent(), Route, RouteComponent(), Route, FileRoutesById, FileRoutesByPath, Route

### Community 30 - "Customer List Components"
Cohesion: 0.20
Nodes (8): CustomerList(), CustomerListItem(), CustomerListItemProps, CustomerModal(), CustomerModalProps, customerSchema, Route, useModal()

### Community 31 - "Flatrate Components"
Cohesion: 0.21
Nodes (8): FlatRateItem(), FlatRateList(), FlatRateModal(), FlatRateModalProps, flatRateSchema, langFields, seedLang(), useFlatRateHook()

### Community 32 - "Contract Controllers"
Cohesion: 0.21
Nodes (6): deleteContract(), getAllContracts(), updateContract(), createContract(), adapter, globalForPrisma

### Community 33 - "Document Type Definitions"
Cohesion: 0.20
Nodes (9): CreateDocumentInput, CreateTaskInput, Document, DocumentStatus, UpdateDocumentInput, UpdateTaskInput, Task, TaskStatus (+1 more)

### Community 34 - "Badge Component"
Cohesion: 0.27
Nodes (9): Badge(), badgeSizeStyles, countSizeStyles, countStyles, formatSizeStyles, formatStyles, styles, BadgeComponentProps (+1 more)

### Community 35 - "Order Card Components"
Cohesion: 0.22
Nodes (7): OrderCard(), Props, OrderList(), sort_options, OrderModal(), OrderModalProps, useOrderHook()

### Community 36 - "Product List Components"
Cohesion: 0.20
Nodes (7): ProductItem(), Props, langFields, ProductModal(), ProductModalProps, productScheme, seedLang()

### Community 37 - "Tariff Data Access"
Cohesion: 0.18
Nodes (10): addTariffConfigAction(), addTariffCustomerAction(), createTariffAction(), deleteTariffAction(), deleteTariffConfigAction(), deleteTariffCustomerAction(), getAllTariffsAction(), updateTariffAction() (+2 more)

### Community 38 - "Server Dev Dependencies"
Cohesion: 0.18
Nodes (11): devDependencies, angular-expressions, nodemon, prisma-openapi, tsx, @types/cors, @types/express, @types/morgan (+3 more)

### Community 39 - "Flatrate Controllers"
Cohesion: 0.31
Nodes (8): createFlatRate(), deleteFlatRate(), getFlatRate(), getFlatRates(), updateFlatRate(), router, createFlatRateSchema, updateFlatRateSchema

### Community 40 - "Community 40"
Cohesion: 0.31
Nodes (7): createSupplier(), deleteSupplier(), getSuppliers(), updateSupplier(), router, createSupplierSchema, updateSupplierSchema

### Community 41 - "Community 41"
Cohesion: 0.20
Nodes (10): section, contracts, customers, employees, flatRates, offers, orders, pricing (+2 more)

### Community 42 - "Community 42"
Cohesion: 0.20
Nodes (10): section, contracts, customers, employees, flatRates, offers, orders, pricing (+2 more)

### Community 43 - "Community 43"
Cohesion: 0.24
Nodes (6): updateOffer(), createOffer(), calculatePrice(), findMatchingTier(), PriceCalculatorProps, Tier

### Community 44 - "Community 44"
Cohesion: 0.22
Nodes (8): components, $defs, operations, paths, webhooks, CreateSupplierInput, Supplier, UpdateSupplierInput

### Community 45 - "Community 45"
Cohesion: 0.25
Nodes (7): ContractListItem(), ContractListItemProps, ContractModal(), ContractModalProps, contractSchema, langFields, seedLang()

### Community 46 - "Community 46"
Cohesion: 0.22
Nodes (8): createContactAction(), createCustomerAction(), deleteContactAction(), deleteCustomerAction(), getAllCustomersAction(), getCustomerByIdAction(), updateContactAction(), updateCustomerByIdAction()

### Community 47 - "Community 47"
Cohesion: 0.22
Nodes (8): author, description, keywords, license, main, name, type, version

### Community 48 - "Community 48"
Cohesion: 0.29
Nodes (6): OfferRevisionHistory(), Props, OfferQueryParams, useDocumentTask(), useOfferRevisionsHook(), useReservationTask()

### Community 49 - "Community 49"
Cohesion: 0.29
Nodes (5): ContactListItem(), Props, ContactPersonModal(), ContactPersonModalProps, useCustomerHook()

### Community 50 - "Community 50"
Cohesion: 0.36
Nodes (3): connection, TaskJobData, taskQueue

### Community 51 - "Community 51"
Cohesion: 0.32
Nodes (5): validate(), router, contractTranslationSchema, createContractSchema, updateContractSchema

### Community 52 - "Community 52"
Cohesion: 0.25
Nodes (7): CreateOrderInput, CreateOrderPositionInput, Order, OrderDocument, OrderPosition, UpdateOrderInput, UpdateOrderPositionInput

### Community 53 - "Community 53"
Cohesion: 0.29
Nodes (7): scripts, build, dev, generate:types, lint, prebuild, preview

### Community 54 - "Community 54"
Cohesion: 0.33
Nodes (5): Collapsable(), Props, localized(), pickTranslation(), Translatable

### Community 55 - "Community 55"
Cohesion: 0.43
Nodes (4): deleteDocument(), renameDocument(), router, renameDocumentSchema

### Community 56 - "Community 56"
Cohesion: 0.29
Nodes (6): createProductAction(), deleteProductAction(), getProductAction(), getProductsAction(), updateProductAction(), getTariffPrice()

### Community 57 - "Community 57"
Cohesion: 0.29
Nodes (7): button, cancel, close, create, delete, edit, save

### Community 58 - "Community 58"
Cohesion: 0.29
Nodes (7): common, export, filter, import, loading, noResults, search

### Community 59 - "Community 59"
Cohesion: 0.29
Nodes (7): button, cancel, close, create, delete, edit, save

### Community 60 - "Community 60"
Cohesion: 0.29
Nodes (7): common, export, filter, import, loading, noResults, search

### Community 61 - "Community 61"
Cohesion: 0.48
Nodes (4): generateDocument(), uploadDocument(), enqueueGeneration(), uploadOfferDocument()

### Community 62 - "Community 62"
Cohesion: 0.29
Nodes (6): ContactPerson, CreateContactPersonInput, CreateCustomerInput, Customer, UpdateContactPersonInput, UpdateCustomerInput

### Community 63 - "Community 63"
Cohesion: 0.29
Nodes (6): Account, CreateUserInput, Session, UpdateUserInput, User, Verification

### Community 64 - "Community 64"
Cohesion: 0.33
Nodes (5): createUserAction(), deleteUserAction(), getAllUsersAction(), getSessionUser(), updateUserByIdAction()

### Community 65 - "Community 65"
Cohesion: 0.33
Nodes (6): nav, catalog, management, overview, sales, settings

### Community 66 - "Community 66"
Cohesion: 0.33
Nodes (6): nav, catalog, management, overview, sales, settings

### Community 67 - "Community 67"
Cohesion: 0.40
Nodes (4): Route, DEFAULT_MODE_OPTIONS, PricingMode, ProductDetailPage()

### Community 68 - "Community 68"
Cohesion: 0.50
Nodes (5): AGENTS.md, CLAUDE.md, Knowledge Graph (graphify), server/prisma/schema/openapi/openapi.yaml, Prisma ORM

### Community 69 - "Community 69"
Cohesion: 0.40
Nodes (4): name, private, type, version

### Community 70 - "Community 70"
Cohesion: 0.40
Nodes (4): ac, admin, employee, statement

### Community 71 - "Community 71"
Cohesion: 0.40
Nodes (3): contactPersonSchema, Props, ContactPersonData

### Community 72 - "Community 72"
Cohesion: 0.60
Nodes (3): LoginFormComponent(), loginSearchSchema, Route

### Community 73 - "Community 73"
Cohesion: 0.40
Nodes (4): createContractAction(), deleteContractAction(), getContractsAction(), updateContractAction()

### Community 74 - "Community 74"
Cohesion: 0.40
Nodes (4): createFlatRateAction(), deleteFlatRateAction(), getFlatRatesAction(), updateFlatRateAction()

### Community 75 - "Community 75"
Cohesion: 0.40
Nodes (4): createOrderAction(), deleteOrderAction(), generateOrderDocumentAction(), getOrdersAction()

### Community 76 - "Community 76"
Cohesion: 0.40
Nodes (4): createSupplierAction(), deleteSupplierAction(), getSuppliersAction(), UpdateSupplierAction()

### Community 77 - "Community 77"
Cohesion: 0.40
Nodes (3): useNextcloudStatus(), Route, RouteComponent()

### Community 78 - "Community 78"
Cohesion: 0.40
Nodes (5): scripts, build, dev, seed, start

### Community 79 - "Community 79"
Cohesion: 0.40
Nodes (4): ac, admin, employee, statement

### Community 83 - "Community 83"
Cohesion: 0.67
Nodes (3): PricingListItem(), Props, tariffTitle()

### Community 90 - "Community 90"
Cohesion: 0.50
Nodes (3): createOfferSchema, offerFlatRateSchema, offerPositionSchema

### Community 91 - "Community 91"
Cohesion: 0.50
Nodes (3): Register, router, routeTree

### Community 92 - "Community 92"
Cohesion: 0.67
Nodes (3): client/index.html, client/public/favicon.svg, client/public/icons.svg

## Knowledge Gaps
- **498 isolated node(s):** `save`, `cancel`, `create`, `delete`, `edit` (+493 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **22 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useAuth()` connect `Auth Context & Navigation` to `Offer Modal Components`?**
  _High betweenness centrality (0.067) - this node is a cross-community bridge._
- **Why does `OfferModal()` connect `Offer Modal Components` to `Auth Context & Navigation`, `Community 49`, `Offer Card Components`, `Supplier List Components`, `Employee List Components`, `Flatrate Components`?**
  _High betweenness centrality (0.065) - this node is a cross-community bridge._
- **Are the 58 inferred relationships involving `api()` (e.g. with `createContractAction()` and `deleteContractAction()`) actually correct?**
  _`api()` has 58 INFERRED edges - model-reasoned connections that need verification._
- **What connects `save`, `cancel`, `create` to the rest of the system?**
  _498 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Offer Actions Pipeline` be split into smaller, more focused modules?**
  _Cohesion score 0.05920745920745921 - nodes in this community are weakly interconnected._
- **Should `Auth & Task Controllers` be split into smaller, more focused modules?**
  _Cohesion score 0.05263157894736842 - nodes in this community are weakly interconnected._
- **Should `UI Core Components` be split into smaller, more focused modules?**
  _Cohesion score 0.05454545454545454 - nodes in this community are weakly interconnected._