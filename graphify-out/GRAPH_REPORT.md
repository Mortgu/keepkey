# Graph Report - keepit  (2026-05-11)

## Corpus Check
- 179 files · ~29,118 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 992 nodes · 1439 edges · 115 communities (76 shown, 39 thin omitted)
- Extraction: 90% EXTRACTED · 10% INFERRED · 0% AMBIGUOUS · INFERRED: 150 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `915cc914`
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
- [[_COMMUNITY_Contract Schemas|Contract Schemas]]
- [[_COMMUNITY_Frontend Config Files|Frontend Config Files]]
- [[_COMMUNITY_Customers Route|Customers Route]]
- [[_COMMUNITY_Products Route|Products Route]]
- [[_COMMUNITY_Orders Route|Orders Route]]
- [[_COMMUNITY_Main Layout Component|Main Layout Component]]
- [[_COMMUNITY_Filter Chip|Filter Chip]]
- [[_COMMUNITY_Offer Flat Rate Form|Offer Flat Rate Form]]
- [[_COMMUNITY_Database Migrations & Seed|Database Migrations & Seed]]
- [[_COMMUNITY_Key Naming Utility|Key Naming Utility]]
- [[_COMMUNITY_Pricing Schema|Pricing Schema]]
- [[_COMMUNITY_OpenAPI Route|OpenAPI Route]]
- [[_COMMUNITY_CSS Utility|CSS Utility]]
- [[_COMMUNITY_Session Guard|Session Guard]]
- [[_COMMUNITY_Task Item Component|Task Item Component]]
- [[_COMMUNITY_Supplier Item Component|Supplier Item Component]]
- [[_COMMUNITY_Select Types|Select Types]]
- [[_COMMUNITY_Brand Assets|Brand Assets]]
- [[_COMMUNITY_Prisma Config|Prisma Config]]
- [[_COMMUNITY_Tailwind Config|Tailwind Config]]
- [[_COMMUNITY_Vite Config|Vite Config]]
- [[_COMMUNITY_Hooks Index|Hooks Index]]
- [[_COMMUNITY_Components Index|Components Index]]
- [[_COMMUNITY_Schemas Index|Schemas Index]]
- [[_COMMUNITY_Prisma Config Alt|Prisma Config Alt]]
- [[_COMMUNITY_Key Name Helper|Key Name Helper]]
- [[_COMMUNITY_Employees Route|Employees Route]]
- [[_COMMUNITY_Offers Route|Offers Route]]
- [[_COMMUNITY_Community 101|Community 101]]
- [[_COMMUNITY_Community 102|Community 102]]
- [[_COMMUNITY_Community 103|Community 103]]
- [[_COMMUNITY_Community 104|Community 104]]
- [[_COMMUNITY_Community 105|Community 105]]
- [[_COMMUNITY_Community 106|Community 106]]
- [[_COMMUNITY_Community 107|Community 107]]
- [[_COMMUNITY_Community 108|Community 108]]
- [[_COMMUNITY_Community 109|Community 109]]
- [[_COMMUNITY_Community 110|Community 110]]
- [[_COMMUNITY_Community 111|Community 111]]
- [[_COMMUNITY_Community 112|Community 112]]
- [[_COMMUNITY_Community 113|Community 113]]
- [[_COMMUNITY_Community 114|Community 114]]

## God Nodes (most connected - your core abstractions)
1. `api()` - 52 edges
2. `prisma` - 20 edges
3. `api() HTTP Client` - 17 edges
4. `schemas/index` - 16 edges
5. `MainRouter` - 13 edges
6. `FlatRate: dignum Dienstleistung Onboarding (300 EUR einmalig)` - 11 edges
7. `validate()` - 10 edges
8. `OpenAPI Schema: Offer` - 10 edges
9. `components` - 9 edges
10. `useContractHook()` - 9 edges

## Surprising Connections (you probably didn't know these)
- `ContactPersonForm component` --shares_data_with--> `OpenAPI Schema: ContactPerson`  [INFERRED]
  client/src/routes/_main/customers/-components/contact-person-form.tsx → server/prisma/schema/openapi/openapi.yaml
- `UserListItem Component` --shares_data_with--> `OpenAPI Schema: User`  [INFERRED]
  client/src/routes/_main/employees/-components/user-list-item.tsx → server/prisma/schema/openapi/openapi.yaml
- `api()` --calls--> `fetch`  [INFERRED]
  client/src/lib/api-client.ts → server/src/pipelines/offer/stages.ts
- `LoginFormComponent` --shares_data_with--> `OpenAPI Schema: User`  [INFERRED]
  client/src/routes/login/-components/login-form.tsx → server/prisma/schema/openapi/openapi.yaml
- `LoginFormComponent` --shares_data_with--> `OpenAPI Schema: Session`  [INFERRED]
  client/src/routes/login/-components/login-form.tsx → server/prisma/schema/openapi/openapi.yaml

## Hyperedges (group relationships)
- **Offer Document Generation Pipeline** — pipeline_pipeline, pipeline_context, pipeline_stages, pipeline_actions, pipeline_utils [EXTRACTED 0.95]
- **Authentication & Authorization Middleware Group** — middleware_auth, middleware_permissions, permissions_user [INFERRED 0.85]
- **Database Schema Migrations** — migration_init, migration_address_contact [EXTRACTED 0.95]
- **Schema barrel export groups all domain schemas** — schemas_index, customer_schemas, contract_schemas, order_schemas, product_schemas, supplier_schemas, user_schemas, pricing_schemas, flatrate_schemas [EXTRACTED 1.00]
- **All lib modules consume env for configuration** — lib_env, lib_prisma, lib_nextcloud, lib_queues, lib_auth [EXTRACTED 1.00]
- **Controllers and workers use prisma for DB access** — lib_prisma, offer_controller, flatrate_controller, product_controller, contract_controller, contact_person_controller, document_worker [EXTRACTED 1.00]
- **BullMQ async document generation pipeline** — lib_queues, document_queue, upload_queue, offer_controller, document_worker, upload_worker [EXTRACTED 0.95]
- **Main router aggregates all sub-routers under /api with requireSession guard** — router, admin_route, products_route, supplier_route, user_route, contracts_route, pricing_route, orders_route, customers_route, offer_route, flatrates_route, task_route, contact_persons_route, auth_middleware [EXTRACTED 1.00]
- **All domain controllers perform CRUD via Prisma** — customer_controller, pricing_controller, supplier_controller, user_controller, task_controller, order_controller, prisma_lib [EXTRACTED 1.00]
- **All domain types derive from openapi-typescript generated api.ts** — type_api, type_supplier, type_customer, type_product, type_document, type_offers, type_order, type_user, type_task [EXTRACTED 1.00]
- **Offer domain: Offer, OfferPosition, OfferFlatRate, Customer, Supplier, User, Document, Task** — schema_offer, schema_offer_position, schema_offer_flat_rate, schema_customer, schema_supplier, schema_user, schema_document, schema_task [EXTRACTED 1.00]
- **Order domain: Order, OrderPosition, Customer, User, Document, Task** — schema_order, schema_order_position, schema_customer, schema_user, schema_document, schema_task [EXTRACTED 1.00]
- **TanStack Router file-based routes under _main layout** — route_tree_gen, route_contracts, route_customers, route_employees, route_offers, route_orders, route_products, route_user, route_login [EXTRACTED 1.00]
- **Filter UI Components** — multi_dropdown, single_dropdown, sort_dropdown, filter_chip, search_bar [INFERRED 0.95]
- **Input Primitive Components** — input, checkbox, toggle_slider [INFERRED 0.95]
- **Dropdown Open/Close Pattern** — multi_dropdown, single_dropdown, sort_dropdown [INFERRED 0.85]
- **Data Actions Layer - all domain data modules call api()** — customers_data, supplier_data, contracts_data, products_data, orders_data, flatrates_data, api_client [EXTRACTED 1.00]
- **React Query hooks wrapping data actions** — customer_hook, contract_hook, offer_hook, product_hook, flatrate_hook, user_hook, supplier_hook, order_hook [EXTRACTED 1.00]
- **Offer CRUD flow: list -> item -> modal -> data actions** — offer_list, offer_list_item, offer_modal, offer_data [INFERRED 0.90]
- **Customer CRUD flow: list -> item -> modal** — customer_list, customer_list_item, customer_modal, contact_person_form [INFERRED 0.90]
- **Offer product inline editing: modal section -> section item -> product form** — product_modal_section, product_section_item, offer_product_form [INFERRED 0.85]
- **Products Page Component Tree** — products_route, product_list, product_item, product_modal, flatrate_list, flatrate_item, flatrate_modal, supplier_list [EXTRACTED 1.00]
- **Contracts Page Component Tree** — contracts_route, contract_list, contract_item, contract_modal [EXTRACTED 1.00]
- **Orders Page Component Tree** — orders_route, order_list, order_list_items, order_modal [EXTRACTED 1.00]
- **Employees Page Component Tree** — employees_route, user_list, user_modal [EXTRACTED 1.00]
- **Modal Pattern - CRUD modals using ModalDialog** — product_modal, flatrate_modal, contract_modal, order_modal, user_modal [INFERRED 0.95]
- **Offer Generation Pipeline: Template + Products + Customer -> Document** — offer_template, product_keepit_m365, product_keepit_entraid, product_dignum_onboarding, openapi_offer, openapi_document [INFERRED 0.85]
- **All Offers for Test AG (Müller Milch)** — customer_test_ag, offer_doc_cmovy8v0m, offer_doc_cmovbm9qd, offer_doc_cmovbsbmf [EXTRACTED 1.00]
- **All Offers for Dignum GmbH (Armin Sammet)** — customer_dignum_gmbh, offer_doc_cmou0fvcy, offer_doc_cmou4ywce, offer_doc_cmotywjvr, offer_doc_cmowr9h1f, offer_doc_cmotz1j16, offer_doc_cmou52jg6 [EXTRACTED 1.00]
- **Employee Management UI Components** — user_list_item, contact_person_form, use_user_hook, openapi_user, openapi_contactperson [INFERRED 0.85]
- **All offers issued to Dignum GmbH / Armin Sammet** — offer_cmotz1j160003ppw8ldtj4to8, offer_cmou0fvcy000135w8clihlq7n, offer_cmotywjvr0001ppw8sn865umo, company_dignum_gmbh, person_armin_sammet [EXTRACTED 1.00]
- **Keepit backup product suite offered by dignum GmbH** — product_keepit_m365_backup, product_keepit_entraid_backup, product_dignum_onboarding [INFERRED 0.85]

## Communities (115 total, 39 thin omitted)

### Community 0 - "Server Data Access Layer"
Cohesion: 0.06
Nodes (57): AdminRoute, Auth lib (better-auth), requireSession middleware, calculatePrice utility, contact-person-controller, contactPersonSchema, ContactPersonsRoute, contract-controller (+49 more)

### Community 1 - "Client Data & API Hooks"
Cohesion: 0.06
Nodes (39): OfferFile(), getAllTasks(), getTaskById(), env, converting(), fetchOfferData(), formatFetchedData(), generating() (+31 more)

### Community 2 - "Server Routes & Auth"
Cohesion: 0.05
Nodes (31): ContactPersonData, ContactPersonForm(), contactPersonSchema, Props, CustomerList(), CustomerListItem(), CustomerListItemProps, CustomerModal() (+23 more)

### Community 3 - "Offer Pipeline & Tasks"
Cohesion: 0.07
Nodes (31): Config, createContactPersons(), createUser(), deleteAccount(), deleteUser(), getAllUsers(), getSessionUser(), getUserById() (+23 more)

### Community 4 - "Client Lib & Config"
Cohesion: 0.08
Nodes (41): lib/auth-client.ts, context/auth.tsx - AuthProvider, useAuth, components/index.ts, data/orders.ts - getTasksAction, data/user.ts - getSessionUser, components/document-status.tsx, components/filters/filter-tab-bar.tsx - FilterTabBar, client/src/main.tsx (+33 more)

### Community 5 - "Auth Context & Core Components"
Cohesion: 0.08
Nodes (23): Route, FileRoutesByFullPath, FileRoutesById, FileRoutesByPath, FileRoutesByTo, FileRouteTypes, LoginIndexRoute, MainContractsIndexRoute (+15 more)

### Community 6 - "Contract & Employee UI"
Cohesion: 0.12
Nodes (25): ContractListItem Component, ContractList Component, ContractModal Component, Employees Route, FlatRateItem Component, FlatRateList Component, FlatRateModal Component, Format Utilities (+17 more)

### Community 7 - "Document Templates & Login"
Cohesion: 0.11
Nodes (25): Invoice Copy Document Template (invoice copy.docx), Invoice Document Template (invoice.docx), LoginFormComponent, Login Route, Offer Document Template (offer.docx), OpenAPI Schema: Account, OpenAPI Schema: ContactPerson, OpenAPI Schema: Contract (+17 more)

### Community 8 - "Customer Offer Documents"
Cohesion: 0.17
Nodes (25): dignum GmbH, Test AG, Customer: Dignum GmbH (Herr Armin Sammet, Starnberg), Customer: Test AG (Herr Müller Milch), Angebot 202600 - Keepit M365 & EntraID Backup (Dignum GmbH / Armin Sammet), Angebot 202600 - Keepit M365 Backup (Dignum GmbH / Armin Sammet), Angebot dwadwa - Keepit M365 Backup test (Dignum GmbH / Armin Sammet), Angebot dawdad - Keepit M365 & EntraID Backup (Test AG / Müller Milch) (+17 more)

### Community 9 - "UI Primitive Components"
Cohesion: 0.15
Nodes (21): addTariffConfig(), addTariffCustomer(), createTariff(), deleteTariff(), deleteTariffConfig(), deleteTariffCustomer(), getAllTariffs(), getTariffById() (+13 more)

### Community 10 - "Router Configuration"
Cohesion: 0.11
Nodes (16): badgeStyles, BasicLinkComponent, BasicLinkProps, CreatedLinkComponent, iconStyles, itemStyles, NavButton, NavButtonProps (+8 more)

### Community 11 - "Customer Management UI"
Cohesion: 0.16
Nodes (21): createPricingAction(), createProductAction(), deletePricingAction(), deleteProductAction(), getPrice(), getProductAction(), getProductsAction(), updatePricingAction() (+13 more)

### Community 12 - "Offer & Customer Components"
Cohesion: 0.09
Nodes (21): Contract, CreateContractInput, CreateFlatRateInput, CreateProductInput, CreateProductPricingInput, CreateTariffConfigInput, CreateTariffCustomerInput, CreateTariffInput (+13 more)

### Community 13 - "Order & Queue Processing"
Cohesion: 0.11
Nodes (14): ConfigRow, pricingFormSchema, PricingModal(), PricingModalProps, TariffConfigModal(), TariffConfigModalProps, TariffCustomerModal(), TariffCustomerModalProps (+6 more)

### Community 14 - "Offer Modal Interface"
Cohesion: 0.16
Nodes (18): api() HTTP Client, authClient (better-auth), useContractHook, Contract Data Actions, useCustomerHook, Customer Data Actions, useFlatRateHook, FlatRate Data Actions (+10 more)

### Community 15 - "Product & Contract Types"
Cohesion: 0.15
Nodes (12): Props, OfferModalProps, offerSchema, DURATIONS, OfferProductInput, Props, OfferProduct, ProductSectionItem() (+4 more)

### Community 16 - "Employee User Management"
Cohesion: 0.16
Nodes (16): Button, ButtonComponentProps, Collapsable, CollapsableComponentProps, sort_options, DropdownOption, FilterChip, filters/index (+8 more)

### Community 17 - "Product & Supplier Hooks"
Cohesion: 0.18
Nodes (17): ContactPersonForm component, CustomerList component, CustomerListItem component, CustomerModal component, DocumentItem component with polling, offer data actions, OfferFile component, OfferFlatRateForm component (+9 more)

### Community 18 - "Offer Data Types"
Cohesion: 0.17
Nodes (9): deleteOrderById(), getAllOrders(), getOrderById(), getOrderTasks(), connection, documentQueue, uploadQueue, router (+1 more)

### Community 19 - "Document & Task Types"
Cohesion: 0.16
Nodes (7): FlatRateItem(), FlatRateList(), emptyData, FlatRateModalProps, flatRateSchema, useFlatRateHook(), Route

### Community 20 - "Flat Rate Management"
Cohesion: 0.18
Nodes (8): OfferProductForm(), ProductItem(), productPricingSchema, ProductList(), emptyData, ProductModalProps, productScheme, useProductHook()

### Community 21 - "OpenAPI Type Definitions"
Cohesion: 0.26
Nodes (9): createPricing(), deletePricing(), getPrice(), updatePricing(), router, calculatePrice(), findMatchingTier(), PriceCalculatorProps (+1 more)

### Community 22 - "Navigation Components"
Cohesion: 0.3
Nodes (10): createOffer(), createOfferTask(), deleteOffer(), downloadOfferDocument(), getOfferById(), getOffers(), getOfferTaskById(), getOfferTasks() (+2 more)

### Community 23 - "Contract List UI"
Cohesion: 0.2
Nodes (7): ContractListItemProps, ContractList(), ContractModal(), ContractModalProps, contractSchema, emptyContract, useContractHook()

### Community 24 - "Product Catalog UI"
Cohesion: 0.2
Nodes (9): CreateDocumentInput, CreateTaskInput, Document, DocumentStatus, UpdateDocumentInput, UpdateTaskInput, Task, TaskStatus (+1 more)

### Community 25 - "Offer List UI"
Cohesion: 0.18
Nodes (10): CreateOfferFlatRatesInput, CreateOfferInput, CreateOfferPositionInput, Offer, OfferFlatRate, OfferPosition, OfferTask, UpdateOfferFlatRatesInput (+2 more)

### Community 26 - "Validation Schemas"
Cohesion: 0.22
Nodes (8): components, $defs, operations, paths, webhooks, CreateSupplierInput, Supplier, UpdateSupplierInput

### Community 27 - "Auth & Settings"
Cohesion: 0.25
Nodes (7): contactPersonSchema, createCustomerSchema, updateCustomerSchema, createContactPersonsSchema, createUserSchema, updateUserSchema, upsertAddressSchema

### Community 28 - "Button & Dropdown UI"
Cohesion: 0.36
Nodes (6): createContract(), deleteContract(), getAllContracts(), updateContract(), validate(), router

### Community 29 - "Order List UI"
Cohesion: 0.22
Nodes (4): SupplierList(), supplierSchema, Route, Route

### Community 30 - "Badge Component"
Cohesion: 0.28
Nodes (5): Button, styles, ButtonComponentProps, DropdownOption, MultiDropdownProps

### Community 31 - "Main Layout Route"
Cohesion: 0.43
Nodes (6): createCustomer(), deleteCustomer(), getAllCustomers(), getCustomerById(), updateCustomerById(), router

### Community 32 - "Order Types"
Cohesion: 0.43
Nodes (6): createProduct(), deleteProduct(), getProduct(), getProducts(), updateProduct(), router

### Community 33 - "Customer Types"
Cohesion: 0.43
Nodes (6): createFlatRate(), deleteFlatRate(), getFlatRate(), getFlatRates(), updateFlatRate(), router

### Community 34 - "User & Session Types"
Cohesion: 0.39
Nodes (5): createSupplier(), deleteSupplier(), getSuppliers(), updateSupplier(), router

### Community 35 - "Offer Pipeline Core"
Cohesion: 0.25
Nodes (5): Route, Route, main layout route with navigation, Route, root route component

### Community 36 - "Template Management"
Cohesion: 0.43
Nodes (6): Badge(), countStyles, formatStyles, styles, BadgeComponentProps, VARIANT_LABELS

### Community 37 - "Modal Component"
Cohesion: 0.29
Nodes (8): Checkbox, CheckboxComponentProps, Input, InputComponentProps, inputs/index, SearchBar, ToggleSlider, ToggleSliderComponentProps

### Community 38 - "Select Component"
Cohesion: 0.38
Nodes (4): getAllContactPersons(), adapter, prisma, router

### Community 39 - "Toggle Slider Component"
Cohesion: 0.29
Nodes (6): Account, CreateUserInput, Session, UpdateUserInput, User, Verification

### Community 40 - "Server Middleware Config"
Cohesion: 0.29
Nodes (6): ContactPerson, CreateContactPersonInput, CreateCustomerInput, Customer, UpdateContactPersonInput, UpdateCustomerInput

### Community 41 - "App Entry Point"
Cohesion: 0.29
Nodes (6): CreateOrderInput, CreateOrderPositionInput, Order, OrderPosition, UpdateOrderInput, UpdateOrderPositionInput

### Community 42 - "Login Page"
Cohesion: 0.29
Nodes (6): createOfferAction(), deleteOfferAction(), getContactPersonsAction(), getOffersAction(), GetOffersParams, updateOfferAction()

### Community 43 - "Sort Dropdown"
Cohesion: 0.29
Nodes (4): SettingsPage(), AuthContext, AuthContextType, useAuth()

### Community 44 - "Checkbox Component"
Cohesion: 0.43
Nodes (7): actions.ts / fetchOfferData, formatFetchedData, postprocessing, generating, converting, context.ts / OfferPipelineContext, pipeline.ts / runPipeline & generateOfferDocument, stages.ts / offerStages, utils.ts / interpolate, deepIterate, customParser, products.ts / calculatePrice, utils.ts / formatDate, formatEur, formatDuration, toDate

### Community 45 - "Text Input Component"
Cohesion: 0.33
Nodes (3): Props, TEMPLATES, TemplateType

### Community 47 - "Root Route"
Cohesion: 0.4
Nodes (4): Select, styles, SelectComponentProps, SelectOption

### Community 48 - "Document Status Component"
Cohesion: 0.4
Nodes (4): { container, wrapper, track, thumb, input }, styles, ToggleSlider, ToggleSliderComponentProps

### Community 49 - "Filter Tab Bar"
Cohesion: 0.33
Nodes (5): createUserAction(), deleteUserAction(), getAllUsersAction(), getSessionUser(), updateUserByIdAction()

### Community 50 - "Single Dropdown"
Cohesion: 0.33
Nodes (5): createCustomerAction(), deleteCustomerAction(), getAllCustomersAction(), getCustomerByIdAction(), updateCustomerByIdAction()

### Community 51 - "Search Bar"
Cohesion: 0.4
Nodes (6): config.ts / Config, auth.ts / requireSession, errorHandler.ts / errorHandler, permissions.ts / requirePermission, user.ts / canViewUsers, canCreateUsers, canUpdateUsers, canDeleteUsers, server.ts / Express App

### Community 52 - "Collapsable Component"
Cohesion: 0.5
Nodes (3): Request, requireSession(), router

### Community 53 - "Format Utilities"
Cohesion: 0.4
Nodes (4): Register, root, router, routeTree

### Community 54 - "API Response Helpers"
Cohesion: 0.6
Nodes (3): LoginFormComponent(), loginSearchSchema, Route

### Community 56 - "Supplier Schemas"
Cohesion: 0.5
Nodes (3): Checkbox, styles, CheckboxComponentProps

### Community 57 - "Product Schemas"
Cohesion: 0.5
Nodes (3): Input, styles, InputComponentProps

### Community 58 - "Contract Schemas"
Cohesion: 0.4
Nodes (4): createFlatRateAction(), deleteFlatRateAction(), getFlatRatesAction(), updateFlatRateAction()

### Community 59 - "Frontend Config Files"
Cohesion: 0.4
Nodes (4): createContractAction(), deleteContractAction(), getContractsAction(), updateContractAction()

### Community 60 - "Customers Route"
Cohesion: 0.4
Nodes (4): createSupplierAction(), deleteSupplierAction(), getSuppliersAction(), UpdateSupplierAction()

### Community 61 - "Products Route"
Cohesion: 0.5
Nodes (3): createOfferSchema, offerFlatRateSchema, offerPositionSchema

### Community 69 - "Pricing Schema"
Cohesion: 0.5
Nodes (3): deleteOrderAction(), getOrdersAction(), getTasksAction()

## Ambiguous Edges - Review These
- `Collapsable` → `Navigation`  [AMBIGUOUS]
  client/src/components/navigation/navigation.tsx · relation: conceptually_related_to

## Knowledge Gaps
- **308 isolated node(s):** `options`, `swaggerSpec`, `app`, `documentWorker`, `Config` (+303 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **39 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Collapsable` and `Navigation`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `api() HTTP Client` connect `Offer Modal Interface` to `Pricing Schema`, `Login Page`, `Customer Management UI`, `Product & Contract Types`, `Tailwind Config`, `Filter Tab Bar`, `Single Dropdown`, `Customers Route`?**
  _High betweenness centrality (0.206) - this node is a cross-community bridge._
- **Why does `api()` connect `Customer Management UI` to `Client Data & API Hooks`, `Offer Pipeline & Tasks`, `Pricing Schema`, `Login Page`, `Filter Tab Bar`, `Single Dropdown`, `Contract Schemas`, `Frontend Config Files`, `Customers Route`?**
  _High betweenness centrality (0.179) - this node is a cross-community bridge._
- **Why does `fetch` connect `Client Data & API Hooks` to `Customer Management UI`?**
  _High betweenness centrality (0.152) - this node is a cross-community bridge._
- **Are the 51 inferred relationships involving `api()` (e.g. with `getAllCustomersAction()` and `getCustomerByIdAction()`) actually correct?**
  _`api()` has 51 INFERRED edges - model-reasoned connections that need verification._
- **What connects `options`, `swaggerSpec`, `app` to the rest of the system?**
  _308 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Server Data Access Layer` be split into smaller, more focused modules?**
  _Cohesion score 0.06 - nodes in this community are weakly interconnected._