# Graph Report - server  (2026-05-11)

## Corpus Check
- 60 files · ~8,512 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 230 nodes · 407 edges · 20 communities (13 shown, 7 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `3d917713`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]

## God Nodes (most connected - your core abstractions)
1. `prisma` - 17 edges
2. `validate()` - 9 edges
3. `calculatePrice()` - 5 edges
4. `auth` - 5 edges
5. `OfferPipelineContext` - 4 edges
6. `deepIterate()` - 4 edges
7. `formatFetchedData()` - 4 edges
8. `runPipeline()` - 3 edges
9. `generateOfferDocument()` - 3 edges
10. `interpolate()` - 3 edges

## Surprising Connections (you probably didn't know these)
- `getTariffPrice()` --calls--> `calculatePrice()`  [EXTRACTED]
  controllers/tariff-controller.ts → utils/products.ts
- `formatFetchedData()` --calls--> `formatDate()`  [EXTRACTED]
  pipelines/offer/actions.ts → utils/utils.ts
- `createOffer()` --calls--> `calculatePrice()`  [EXTRACTED]
  controllers/offer-controller.ts → utils/products.ts
- `updateOffer()` --calls--> `calculatePrice()`  [EXTRACTED]
  controllers/offer-controller.ts → utils/products.ts
- `postprocessing()` --calls--> `deepIterate()`  [EXTRACTED]
  pipelines/offer/actions.ts → pipelines/offer/utils.ts

## Communities (20 total, 7 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.1
Nodes (27): converting(), fetchOfferData(), formatFetchedData(), generating(), postprocessing(), OfferFetchData, OfferFormatedData, PipelineContext (+19 more)

### Community 1 - "Community 1"
Cohesion: 0.12
Nodes (16): getAllContactPersons(), getAllTasks(), getTaskById(), adapter, prisma, connection, documentQueue, uploadQueue (+8 more)

### Community 2 - "Community 2"
Cohesion: 0.14
Nodes (19): createContactPersons(), createUser(), deleteAccount(), deleteUser(), getAllUsers(), getSessionUser(), updateUserById(), auth (+11 more)

### Community 3 - "Community 3"
Cohesion: 0.14
Nodes (17): createContract(), deleteContract(), getAllContracts(), updateContract(), createCustomer(), deleteCustomer(), getAllCustomers(), getCustomerById() (+9 more)

### Community 4 - "Community 4"
Cohesion: 0.14
Nodes (16): deleteOrderById(), getAllOrders(), getOrderById(), getOrderTasks(), createProduct(), deleteProduct(), getProduct(), getProducts() (+8 more)

### Community 5 - "Community 5"
Cohesion: 0.17
Nodes (18): addTariffCustomer(), addTariffProduct(), createTariff(), deleteTariff(), deleteTariffCustomer(), deleteTariffProduct(), getAllTariffs(), getTariffById() (+10 more)

### Community 6 - "Community 6"
Cohesion: 0.21
Nodes (14): createOffer(), createOfferTask(), deleteOffer(), downloadOfferDocument(), getOfferById(), getOffers(), getOfferTaskById(), getOfferTasks() (+6 more)

### Community 7 - "Community 7"
Cohesion: 0.13
Nodes (8): Config, env, AppError, errorHandler(), app, documentWorker, options, swaggerSpec

### Community 8 - "Community 8"
Cohesion: 0.25
Nodes (7): contactPersonSchema, createCustomerSchema, updateCustomerSchema, createContactPersonsSchema, createUserSchema, updateUserSchema, upsertAddressSchema

### Community 9 - "Community 9"
Cohesion: 0.43
Nodes (6): createFlatRate(), deleteFlatRate(), getFlatRate(), getFlatRates(), updateFlatRate(), router

### Community 10 - "Community 10"
Cohesion: 0.5
Nodes (3): createOfferSchema, offerFlatRateSchema, offerPositionSchema

## Knowledge Gaps
- **62 isolated node(s):** `options`, `swaggerSpec`, `app`, `documentWorker`, `Config` (+57 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `prisma` connect `Community 1` to `Community 0`, `Community 2`, `Community 3`, `Community 4`, `Community 5`, `Community 6`, `Community 9`?**
  _High betweenness centrality (0.135) - this node is a cross-community bridge._
- **Why does `validate()` connect `Community 3` to `Community 2`, `Community 4`, `Community 5`, `Community 6`, `Community 9`?**
  _High betweenness centrality (0.027) - this node is a cross-community bridge._
- **Why does `auth` connect `Community 2` to `Community 4`, `Community 7`?**
  _High betweenness centrality (0.004) - this node is a cross-community bridge._
- **What connects `options`, `swaggerSpec`, `app` to the rest of the system?**
  _62 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.12 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.14 - nodes in this community are weakly interconnected._