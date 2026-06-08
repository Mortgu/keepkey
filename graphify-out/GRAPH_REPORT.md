# Graph Report - keepit  (2026-06-08)

## Corpus Check
- 249 files · ~37,469 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1478 nodes · 2854 edges · 120 communities (93 shown, 27 thin omitted)
- Extraction: 89% EXTRACTED · 11% INFERRED · 0% AMBIGUOUS · INFERRED: 303 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `9a28cd41`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Server Data Access Layer|Server Data Access Layer]]
- [[_COMMUNITY_Client Data & API Hooks|Client Data & API Hooks]]
- [[_COMMUNITY_Server Routes & Auth|Server Routes & Auth]]
- [[_COMMUNITY_Offer Pipeline & Tasks|Offer Pipeline & Tasks]]
- [[_COMMUNITY_Client Lib & Config|Client Lib & Config]]
- [[_COMMUNITY_Auth Context & Core Components|Auth Context & Core Components]]
- [[_COMMUNITY_Contract & Employee UI|Contract & Employee UI]]
- [[_COMMUNITY_Document Templates & Login|Document Templates & Login]]
- [[_COMMUNITY_Customer Offer Documents|Customer Offer Documents]]
- [[_COMMUNITY_UI Primitive Components|UI Primitive Components]]
- [[_COMMUNITY_Router Configuration|Router Configuration]]
- [[_COMMUNITY_Customer Management UI|Customer Management UI]]
- [[_COMMUNITY_Offer & Customer Components|Offer & Customer Components]]
- [[_COMMUNITY_Order & Queue Processing|Order & Queue Processing]]
- [[_COMMUNITY_Offer Modal Interface|Offer Modal Interface]]
- [[_COMMUNITY_Product & Contract Types|Product & Contract Types]]
- [[_COMMUNITY_Employee User Management|Employee User Management]]
- [[_COMMUNITY_Product & Supplier Hooks|Product & Supplier Hooks]]
- [[_COMMUNITY_Offer Data Types|Offer Data Types]]
- [[_COMMUNITY_Document & Task Types|Document & Task Types]]
- [[_COMMUNITY_Flat Rate Management|Flat Rate Management]]
- [[_COMMUNITY_OpenAPI Type Definitions|OpenAPI Type Definitions]]
- [[_COMMUNITY_Navigation Components|Navigation Components]]
- [[_COMMUNITY_Contract List UI|Contract List UI]]
- [[_COMMUNITY_Product Catalog UI|Product Catalog UI]]
- [[_COMMUNITY_Offer List UI|Offer List UI]]
- [[_COMMUNITY_Validation Schemas|Validation Schemas]]
- [[_COMMUNITY_Auth & Settings|Auth & Settings]]
- [[_COMMUNITY_Button & Dropdown UI|Button & Dropdown UI]]
- [[_COMMUNITY_Order List UI|Order List UI]]
- [[_COMMUNITY_Badge Component|Badge Component]]
- [[_COMMUNITY_Main Layout Route|Main Layout Route]]
- [[_COMMUNITY_Order Types|Order Types]]
- [[_COMMUNITY_Customer Types|Customer Types]]
- [[_COMMUNITY_User & Session Types|User & Session Types]]
- [[_COMMUNITY_Offer Pipeline Core|Offer Pipeline Core]]
- [[_COMMUNITY_Template Management|Template Management]]
- [[_COMMUNITY_Modal Component|Modal Component]]
- [[_COMMUNITY_Select Component|Select Component]]
- [[_COMMUNITY_Toggle Slider Component|Toggle Slider Component]]
- [[_COMMUNITY_Server Middleware Config|Server Middleware Config]]
- [[_COMMUNITY_App Entry Point|App Entry Point]]
- [[_COMMUNITY_Login Page|Login Page]]
- [[_COMMUNITY_Sort Dropdown|Sort Dropdown]]
- [[_COMMUNITY_Checkbox Component|Checkbox Component]]
- [[_COMMUNITY_Text Input Component|Text Input Component]]
- [[_COMMUNITY_Offer Validation Schemas|Offer Validation Schemas]]
- [[_COMMUNITY_Root Route|Root Route]]
- [[_COMMUNITY_Document Status Component|Document Status Component]]
- [[_COMMUNITY_Filter Tab Bar|Filter Tab Bar]]
- [[_COMMUNITY_Single Dropdown|Single Dropdown]]
- [[_COMMUNITY_Search Bar|Search Bar]]
- [[_COMMUNITY_Collapsable Component|Collapsable Component]]
- [[_COMMUNITY_Format Utilities|Format Utilities]]
- [[_COMMUNITY_API Response Helpers|API Response Helpers]]
- [[_COMMUNITY_Order Schemas|Order Schemas]]
- [[_COMMUNITY_Supplier Schemas|Supplier Schemas]]
- [[_COMMUNITY_Product Schemas|Product Schemas]]
- [[_COMMUNITY_Frontend Config Files|Frontend Config Files]]
- [[_COMMUNITY_Customers Route|Customers Route]]
- [[_COMMUNITY_Products Route|Products Route]]
- [[_COMMUNITY_Orders Route|Orders Route]]
- [[_COMMUNITY_Main Layout Component|Main Layout Component]]
- [[_COMMUNITY_Filter Chip|Filter Chip]]
- [[_COMMUNITY_Offer Flat Rate Form|Offer Flat Rate Form]]
- [[_COMMUNITY_Database Migrations & Seed|Database Migrations & Seed]]
- [[_COMMUNITY_Key Naming Utility|Key Naming Utility]]
- [[_COMMUNITY_Checkout Schema|Checkout Schema]]
- [[_COMMUNITY_Pricing Schema|Pricing Schema]]
- [[_COMMUNITY_Flat Rate Schema|Flat Rate Schema]]
- [[_COMMUNITY_OpenAPI Route|OpenAPI Route]]
- [[_COMMUNITY_CSS Utility|CSS Utility]]
- [[_COMMUNITY_Session Guard|Session Guard]]
- [[_COMMUNITY_Task Item Component|Task Item Component]]
- [[_COMMUNITY_Supplier Item Component|Supplier Item Component]]
- [[_COMMUNITY_Select Types|Select Types]]
- [[_COMMUNITY_Prisma Config|Prisma Config]]
- [[_COMMUNITY_Vite Config|Vite Config]]
- [[_COMMUNITY_Hooks Index|Hooks Index]]
- [[_COMMUNITY_Components Index|Components Index]]
- [[_COMMUNITY_Prisma Config Alt|Prisma Config Alt]]
- [[_COMMUNITY_Key Name Helper|Key Name Helper]]
- [[_COMMUNITY_Contracts Route|Contracts Route]]
- [[_COMMUNITY_Customers Route|Customers Route]]
- [[_COMMUNITY_Community 108|Community 108]]
- [[_COMMUNITY_Community 109|Community 109]]
- [[_COMMUNITY_Community 110|Community 110]]
- [[_COMMUNITY_Community 111|Community 111]]
- [[_COMMUNITY_Community 112|Community 112]]
- [[_COMMUNITY_Community 113|Community 113]]
- [[_COMMUNITY_Community 114|Community 114]]
- [[_COMMUNITY_Community 115|Community 115]]
- [[_COMMUNITY_Community 116|Community 116]]
- [[_COMMUNITY_Community 117|Community 117]]
- [[_COMMUNITY_Community 118|Community 118]]
- [[_COMMUNITY_Community 119|Community 119]]

## God Nodes (most connected - your core abstractions)
1. `api()` - 73 edges
2. `offer-controller` - 47 edges
3. `prisma` - 31 edges
4. `validate()` - 25 edges
5. `upload-worker` - 25 edges
6. `OrderController` - 25 edges
7. `useLocale()` - 22 edges
8. `api() HTTP Client` - 22 edges
9. `useModal()` - 21 edges
10. `UserController` - 20 edges

## Surprising Connections (you probably didn't know these)
- `UserListItem Component` --shares_data_with--> `OpenAPI Schema: User`  [INFERRED]
  client/src/routes/_main/employees/-components/user-list-item.tsx → server/prisma/schema/openapi/openapi.yaml
- `LoginFormComponent` --shares_data_with--> `OpenAPI Schema: Session`  [INFERRED]
  client/src/routes/login/-components/login-form.tsx → server/prisma/schema/openapi/openapi.yaml
- `api()` --calls--> `fetch`  [INFERRED]
  client/src/lib/api-client.ts → server/src/pipelines/offer/stages.ts
- `ContactPersonForm component` --shares_data_with--> `OpenAPI Schema: ContactPerson`  [INFERRED]
  client/src/routes/_main/customers/-components/contact-person-form.tsx → server/prisma/schema/openapi/openapi.yaml
- `LoginFormComponent` --shares_data_with--> `OpenAPI Schema: User`  [INFERRED]
  client/src/routes/login/-components/login-form.tsx → server/prisma/schema/openapi/openapi.yaml

## Communities (120 total, 27 thin omitted)

### Community 0 - "Server Data Access Layer"
Cohesion: 0.05
Nodes (72): AdminRoute, Auth lib (better-auth), calculatePrice utility, contract-controller, createContract(), deleteContract(), getAllContracts(), updateContract() (+64 more)

### Community 1 - "Client Data & API Hooks"
Cohesion: 0.06
Nodes (35): Button, Button, styles, ButtonComponentProps, ButtonComponentProps, Collapsable, CollapsableComponentProps, CollapsableComponentProps (+27 more)

### Community 2 - "Server Routes & Auth"
Cohesion: 0.06
Nodes (48): authClient (better-auth), dignum GmbH, Test AG, ContactPersonForm component, Customer: Dignum GmbH (Herr Armin Sammet, Starnberg), CustomerModal component, Customer: Test AG (Herr Müller Milch), Invoice Copy Document Template (invoice copy.docx) (+40 more)

### Community 3 - "Offer Pipeline & Tasks"
Cohesion: 0.06
Nodes (22): DocumentStatusProps, deleteDocument(), renameDocument(), uploadDocument(), DocumentService, IDRegistry, LocationConfig, NextCloudLocation (+14 more)

### Community 4 - "Client Lib & Config"
Cohesion: 0.07
Nodes (46): requireSession middleware, ContractListItem Component, ContractList Component, ContractModal Component, ContractsRoute, CustomersRoute, Employees Route, FlatRateList Component (+38 more)

### Community 5 - "Auth Context & Core Components"
Cohesion: 0.08
Nodes (29): contactPersonSchema, contract-schemas, customer-schemas, auth, authClient, ac, admin, employee (+21 more)

### Community 6 - "Contract & Employee UI"
Cohesion: 0.09
Nodes (40): lib/auth-client.ts, context/auth.tsx - AuthProvider, useAuth, components/index.ts, data/orders.ts - getTasksAction, data/user.ts - getSessionUser, components/document-status.tsx, components/filters/filter-tab-bar.tsx - FilterTabBar, client/src/main.tsx (+32 more)

### Community 7 - "Document Templates & Login"
Cohesion: 0.09
Nodes (33): converteAction(), converting(), fetchOfferAction(), fetchOfferData(), formatFetchedData(), formatFetchedDataAction(), formatOfferData(), generateAction() (+25 more)

### Community 8 - "Customer Offer Documents"
Cohesion: 0.1
Nodes (23): OfferFlatRateForm(), Props, OfferModalProps, DURATIONS, OfferProductInput, Props, Props, Props (+15 more)

### Community 9 - "UI Primitive Components"
Cohesion: 0.1
Nodes (25): ConfigRow, emptyRow(), pricingFormSchema, PricingModal(), PricingModalProps, ProductItem(), productPricingSchema, TariffConfigModal() (+17 more)

### Community 10 - "Router Configuration"
Cohesion: 0.11
Nodes (28): Route, RouteComponent(), Route, FileRoutesByFullPath, FileRoutesById, FileRoutesByPath, FileRoutesByTo, FileRouteTypes (+20 more)

### Community 11 - "Customer Management UI"
Cohesion: 0.11
Nodes (28): createOfferAction(), createReservationAction(), deleteOfferAction(), deleteOfferDocumentAction(), generateOfferDocumentAction(), getContactPersonsAction(), getOfferRevisionsAction(), getOffersAction() (+20 more)

### Community 12 - "Offer & Customer Components"
Cohesion: 0.1
Nodes (21): ContactListItem(), Props, ContactPersonData, ContactPersonForm(), contactPersonSchema, Props, ContactPersonModal(), ContactPersonModalProps (+13 more)

### Community 13 - "Order & Queue Processing"
Cohesion: 0.11
Nodes (27): api() HTTP Client, Document(), DocumentItem(), Props, styles, FlatRateItem(), getFormDefaults(), OfferModal() (+19 more)

### Community 14 - "Offer Modal Interface"
Cohesion: 0.15
Nodes (27): addTariffConfig(), addTariffCustomer(), createTariff(), deleteTariff(), deleteTariffConfig(), deleteTariffCustomer(), getAllTariffs(), getTariffById() (+19 more)

### Community 16 - "Employee User Management"
Cohesion: 0.11
Nodes (25): postprocessing(), postProcessingAction(), deepIterate(), expr, expressionParser, interpolate(), parser, ParserResult (+17 more)

### Community 17 - "Product & Supplier Hooks"
Cohesion: 0.1
Nodes (24): emptyData, langFields, ProductModal(), ProductModalProps, productScheme, seedLang(), getOfferTasks(), createDocumentForOrder() (+16 more)

### Community 18 - "Offer Data Types"
Cohesion: 0.11
Nodes (21): Checkbox, Checkbox, checkboxSizes, labelStyles, styles, CheckboxComponentProps, CheckboxComponentProps, Input (+13 more)

### Community 19 - "Document & Task Types"
Cohesion: 0.14
Nodes (20): emptyData, FlatRateModal(), FlatRateModalProps, flatRateSchema, langFields, seedLang(), createFlatRate(), deleteFlatRate() (+12 more)

### Community 20 - "Flat Rate Management"
Cohesion: 0.17
Nodes (15): offerTaskHandler(), env, adapter, prisma, connection, logger, offerGenerateJob(), orderGenerateJob() (+7 more)

### Community 21 - "OpenAPI Type Definitions"
Cohesion: 0.11
Nodes (13): createContractAction(), deleteContractAction(), getContractsAction(), updateContractAction(), createContactAction(), createCustomerAction(), deleteContactAction(), deleteCustomerAction() (+5 more)

### Community 22 - "Navigation Components"
Cohesion: 0.13
Nodes (17): OfferRevisionHistory(), Props, OfferCard(), OfferFlatRateRow(), OfferListItemProps, OfferPositionRow(), Task, OfferListItemProps (+9 more)

### Community 23 - "Contract List UI"
Cohesion: 0.21
Nodes (20): createOffer(), createOfferTask(), deleteOffer(), deleteOfferDocument(), downloadOfferDocument(), enqueueDocumentGenerationJob(), enqueueOfferReservation(), enqueueQuoteReservationJob() (+12 more)

### Community 24 - "Product Catalog UI"
Cohesion: 0.09
Nodes (21): Contract, ContractTranslation, ContractTranslationInput, CreateFlatRateInput, CreateProductInput, CreateProductPricingInput, CreateTariffConfigInput, CreateTariffCustomerInput (+13 more)

### Community 25 - "Offer List UI"
Cohesion: 0.15
Nodes (14): OrderCard(), Props, OrderListItems(), Props, OrderListItems(), OrderList(), sort_options, OrderModal() (+6 more)

### Community 26 - "Validation Schemas"
Cohesion: 0.2
Nodes (11): CompactLanguageToggle(), DEFAULT_LANGUAGE_OPTIONS, LanguageOption, LanguageToggleProps, PillLanguageToggle(), SegmentedLanguageToggle(), SegmentedToggle(), SegmentedToggleOption (+3 more)

### Community 27 - "Auth & Settings"
Cohesion: 0.16
Nodes (13): UserList(), FlatRateList(), UserListItem(), UserListItemProps, UserList(), createUserSchema, editUserSchema, emptyUser (+5 more)

### Community 28 - "Button & Dropdown UI"
Cohesion: 0.14
Nodes (13): OfferList(), sort_options, DropdownOption, filters/index, SearchBarProps, DropdownOption, SingleDropdownProps, MultiDropdown (+5 more)

### Community 29 - "Order List UI"
Cohesion: 0.16
Nodes (15): documentQueue (BullMQ), document-worker, connection, uploadQueue, offer pipeline (generateOfferDocument), OfferPipelineContext, generateOfferDocument(), Result (+7 more)

### Community 30 - "Badge Component"
Cohesion: 0.23
Nodes (12): getNextcloudStatus(), updateNextcloudPathsHandler(), getNextcloudStatusAction(), NextcloudPaths, NextcloudStatus, getNextcloudInitError(), getNextcloudPaths(), isNextcloudConfigured() (+4 more)

### Community 31 - "Main Layout Route"
Cohesion: 0.21
Nodes (10): replaceFlatRates(), replacePositions(), updateOffer(), createOffer(), calculatePrice(), findMatchingTier(), PriceCalculatorProps, Tier (+2 more)

### Community 32 - "Order Types"
Cohesion: 0.14
Nodes (10): Config, initNextcloud(), errorMapProps, exceptionHandler(), prismaErrorMap, webDavErrorMap, morganMiddleware, app (+2 more)

### Community 33 - "Customer Types"
Cohesion: 0.18
Nodes (10): Props, SupplierListItem(), SupplierList(), SupplierModal(), SupplierModalProps, supplierSchema, useSupplierHook(), createSupplierSchema (+2 more)

### Community 34 - "User & Session Types"
Cohesion: 0.14
Nodes (9): createPricingAction(), createProductAction(), deletePricingAction(), deleteProductAction(), getPrice(), getProductAction(), getProductsAction(), updatePricingAction() (+1 more)

### Community 35 - "Offer Pipeline Core"
Cohesion: 0.22
Nodes (10): ContractListItem(), ContractListItemProps, ContractList(), ContractModal(), ContractModalProps, contractSchema, emptyContract, langFields (+2 more)

### Community 36 - "Template Management"
Cohesion: 0.17
Nodes (8): reserveQuoteIdForOffer(), reserveQuoteIdInNextCloud(), uploadQueue (BullMQ), upload-worker, uploadJob(), UploadWorkerInterface, UploadJobData, UploadWorkerInterface

### Community 37 - "Modal Component"
Cohesion: 0.23
Nodes (10): OrderPipelineContext, generateOrderDocument(), Result, runOrderPipeline(), createDocumentForOrder(), createOrderTask(), generateOrderDocument(), orderStages (+2 more)

### Community 38 - "Select Component"
Cohesion: 0.26
Nodes (6): reserveId(), fileExists(), getNextCloudClient(), reserveFile(), uploadFile(), NextCloudRepository

### Community 39 - "Toggle Slider Component"
Cohesion: 0.33
Nodes (7): offerReservationJob(), Constructor, nextCloudRepository, repository, webDavRepository, AddNextCloudRepository(), AddWebDavRepository()

### Community 40 - "Server Middleware Config"
Cohesion: 0.24
Nodes (9): checkNextcloudConnection(), getClient(), getLatestQuoteId(), NextCloudError, NextcloudStatus, QuoteIdAlreadyReservedError, ReserveFileResult, reserveQuoteIdInNextCloud() (+1 more)

### Community 41 - "App Entry Point"
Cohesion: 0.26
Nodes (10): Badge(), badgeSizeStyles, countSizeStyles, countStyles, formatSizeStyles, formatStyles, styles, BadgeComponentProps (+2 more)

### Community 42 - "Login Page"
Cohesion: 0.18
Nodes (9): formSchema, NextCloudSettingsModal(), Props, useNextcloudPaths(), useNextcloudStatus(), Props, RouteComponent(), TEMPLATES (+1 more)

### Community 43 - "Sort Dropdown"
Cohesion: 0.27
Nodes (12): DocumentItem component with polling, offer data actions, OfferFile component, OfferFlatRateForm component, offer-items barrel export, OfferList component, OfferListItem component, OfferModal component (+4 more)

### Community 44 - "Checkbox Component"
Cohesion: 0.25
Nodes (9): container, generateDocument(), uploadDocument(), enqueueDocumentGenerationJob(), enqueueGeneration(), enqueueOfferReservation(), enqueueQuoteReservationJob(), uploadOfferDocument() (+1 more)

### Community 45 - "Text Input Component"
Cohesion: 0.18
Nodes (10): CreateOfferFlatRatesInput, CreateOfferInput, CreateOfferPositionInput, Language, Offer, OfferDocument, OfferTask, UpdateOfferFlatRatesInput (+2 more)

### Community 46 - "Offer Validation Schemas"
Cohesion: 0.27
Nodes (8): AppException, NextCloudException, NextCloudReservationFailedException, AppError, errorHandler(), errorMapProps, prismaErrorMap, webDavErrorMap

### Community 47 - "Root Route"
Cohesion: 0.22
Nodes (7): ComponentSize, components, $defs, operations, paths, webhooks, CreateSupplierInput

### Community 48 - "Document Status Component"
Cohesion: 0.22
Nodes (8): CreateDocumentInput, CreateTaskInput, Document, UpdateDocumentInput, UpdateTaskInput, Task, TaskStatus, TaskType

### Community 49 - "Filter Tab Bar"
Cohesion: 0.2
Nodes (9): addTariffCustomerAction(), createTariffAction(), deleteTariffAction(), deleteTariffConfigAction(), deleteTariffCustomerAction(), getAllTariffsAction(), getTariffPrice(), updateTariffAction() (+1 more)

### Community 50 - "Single Dropdown"
Cohesion: 0.22
Nodes (5): supplierSchema, Route, SupplierListItem Component, Route, Supplier

### Community 51 - "Search Bar"
Cohesion: 0.33
Nodes (8): card, dot, IntegrationStatus, IntegrationStatusCard(), logo, pill, Props, STATUS_LABELS

### Community 52 - "Collapsable Component"
Cohesion: 0.25
Nodes (6): useSettingsHook(), formSchema, OfferNextCloudSettingsModal(), Props, RouteComponent(), OfferPage()

### Community 53 - "Format Utilities"
Cohesion: 0.28
Nodes (7): Select, SelectOption, Select, styles, SelectComponentProps, SelectOption, SelectComponentProps

### Community 54 - "API Response Helpers"
Cohesion: 0.29
Nodes (6): Account, CreateUserInput, Session, UpdateUserInput, User, Verification

### Community 55 - "Order Schemas"
Cohesion: 0.43
Nodes (7): actions.ts / fetchOfferData, formatFetchedData, postprocessing, generating, converting, context.ts / OfferPipelineContext, pipeline.ts / runPipeline & generateOfferDocument, stages.ts / offerStages, utils.ts / interpolate, deepIterate, customParser, products.ts / calculatePrice, utils.ts / formatDate, formatEur, formatDuration, toDate

### Community 56 - "Supplier Schemas"
Cohesion: 0.29
Nodes (7): CustomerList component, Route, Route, main layout route with navigation, Route, root route component, user data actions

### Community 57 - "Product Schemas"
Cohesion: 0.43
Nodes (5): PricingListItem(), Props, tariffTitle(), Route, RouteComponent()

### Community 60 - "Customers Route"
Cohesion: 0.4
Nodes (6): lib/auth, lib/env, lib/nextcloud, lib/permissions, lib/prisma, lib/queues

### Community 61 - "Products Route"
Cohesion: 0.33
Nodes (5): CreateOrderPositionInput, Order, OrderPosition, UpdateOrderInput, UpdateOrderPositionInput

### Community 63 - "Main Layout Component"
Cohesion: 0.47
Nodes (4): FilterChip, chipSizeStyles, FilterChipProps, xIconSizes

### Community 64 - "Filter Chip"
Cohesion: 0.4
Nodes (6): config.ts / Config, auth.ts / requireSession, errorHandler.ts / errorHandler, permissions.ts / requirePermission, user.ts / canViewUsers, canCreateUsers, canUpdateUsers, canDeleteUsers, server.ts / Express App

### Community 65 - "Offer Flat Rate Form"
Cohesion: 0.4
Nodes (4): Route, DEFAULT_MODE_OPTIONS, PricingMode, ProductDetailPage()

### Community 66 - "Database Migrations & Seed"
Cohesion: 0.4
Nodes (3): PipelineContext, PipelineStage, PipelineStageError

### Community 67 - "Key Naming Utility"
Cohesion: 0.4
Nodes (4): CreateContactPersonInput, CreateCustomerInput, UpdateContactPersonInput, UpdateCustomerInput

### Community 69 - "Pricing Schema"
Cohesion: 0.6
Nodes (4): offerSchema, createOfferSchema, offerFlatRateSchema, offerPositionSchema

### Community 71 - "OpenAPI Route"
Cohesion: 0.4
Nodes (4): Register, root, router, routeTree

### Community 74 - "Task Item Component"
Cohesion: 0.6
Nodes (3): ProductList(), Props, Route

### Community 75 - "Supplier Item Component"
Cohesion: 0.6
Nodes (3): LoginFormComponent(), loginSearchSchema, Route

### Community 78 - "Prisma Config"
Cohesion: 0.67
Nodes (3): ReservationBadge(), ReservationBadgeProps, STATUS_CONFIG

## Ambiguous Edges - Review These
- `Collapsable` → `Navigation`  [AMBIGUOUS]
  client/src/components/navigation/navigation.tsx · relation: conceptually_related_to

## Knowledge Gaps
- **322 isolated node(s):** `options`, `swaggerSpec`, `app`, `Config`, `PermissionOptions` (+317 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **27 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Collapsable` and `Navigation`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `MainRouter` connect `Client Lib & Config` to `Server Data Access Layer`, `Router Configuration`, `Offer & Customer Components`?**
  _High betweenness centrality (0.144) - this node is a cross-community bridge._
- **Why does `MultiDropdown` connect `Button & Dropdown UI` to `UI Primitive Components`, `Offer List UI`, `Client Data & API Hooks`?**
  _High betweenness centrality (0.105) - this node is a cross-community bridge._
- **Why does `api() HTTP Client` connect `Order & Queue Processing` to `Offer Flat Rate Form`, `User & Session Types`, `Server Routes & Auth`, `Customer Offer Documents`, `UI Primitive Components`, `Customer Management UI`, `Filter Tab Bar`, `OpenAPI Type Definitions`, `Offer List UI`, `Badge Component`?**
  _High betweenness centrality (0.102) - this node is a cross-community bridge._
- **Are the 72 inferred relationships involving `api()` (e.g. with `getAllCustomersAction()` and `getCustomerByIdAction()`) actually correct?**
  _`api()` has 72 INFERRED edges - model-reasoned connections that need verification._
- **Are the 2 inferred relationships involving `offer-controller` (e.g. with `offer pipeline (generateOfferDocument)` and `product-controller`) actually correct?**
  _`offer-controller` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Are the 2 inferred relationships involving `upload-worker` (e.g. with `lib/nextcloud` and `lib/queues`) actually correct?**
  _`upload-worker` has 2 INFERRED edges - model-reasoned connections that need verification._