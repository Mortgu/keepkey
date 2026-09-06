-- CreateIndex
CREATE INDEX "invoice_customerId_idx" ON "invoice"("customerId");

-- CreateIndex
CREATE INDEX "invoice_orderId_idx" ON "invoice"("orderId");

-- CreateIndex
CREATE INDEX "invoice_supplierId_idx" ON "invoice"("supplierId");

-- CreateIndex
CREATE INDEX "offer_customerId_idx" ON "offer"("customerId");

-- CreateIndex
CREATE INDEX "offer_contactPersonId_idx" ON "offer"("contactPersonId");

-- CreateIndex
CREATE INDEX "offer_userId_idx" ON "offer"("userId");

-- CreateIndex
CREATE INDEX "offer_contractId_idx" ON "offer"("contractId");

-- CreateIndex
CREATE INDEX "offer_supplierId_idx" ON "offer"("supplierId");

-- CreateIndex
CREATE INDEX "offer_renewedFromOfferId_idx" ON "offer"("renewedFromOfferId");

-- CreateIndex
CREATE INDEX "offer_discount_offerId_idx" ON "offer_discount"("offerId");

-- CreateIndex
CREATE INDEX "offer_flat_rate_offerId_idx" ON "offer_flat_rate"("offerId");

-- CreateIndex
CREATE INDEX "offer_flat_rate_flatRateId_idx" ON "offer_flat_rate"("flatRateId");

-- CreateIndex
CREATE INDEX "offer_position_offerId_idx" ON "offer_position"("offerId");

-- CreateIndex
CREATE INDEX "offer_position_productId_idx" ON "offer_position"("productId");

-- CreateIndex
CREATE INDEX "offer_position_tariffVersionId_idx" ON "offer_position"("tariffVersionId");

-- CreateIndex
CREATE INDEX "offer_revision_changedById_idx" ON "offer_revision"("changedById");

-- CreateIndex
CREATE INDEX "order_customerId_idx" ON "order"("customerId");

-- CreateIndex
CREATE INDEX "order_contactPersonId_idx" ON "order"("contactPersonId");

-- CreateIndex
CREATE INDEX "order_employeeId_idx" ON "order"("employeeId");

-- CreateIndex
CREATE INDEX "order_contractId_idx" ON "order"("contractId");

-- CreateIndex
CREATE INDEX "order_supplierId_idx" ON "order"("supplierId");

-- CreateIndex
CREATE INDEX "order_flat_rate_orderId_idx" ON "order_flat_rate"("orderId");

-- CreateIndex
CREATE INDEX "order_flat_rate_flatRateId_idx" ON "order_flat_rate"("flatRateId");

-- CreateIndex
CREATE INDEX "order_position_orderId_idx" ON "order_position"("orderId");

-- CreateIndex
CREATE INDEX "order_position_productId_idx" ON "order_position"("productId");

-- CreateIndex
CREATE INDEX "order_revision_changedById_idx" ON "order_revision"("changedById");

-- CreateIndex
CREATE INDEX "tariff_contractId_idx" ON "tariff"("contractId");

-- CreateIndex
CREATE INDEX "tariff_customer_price_customerId_idx" ON "tariff_customer_price"("customerId");

-- CreateIndex
CREATE INDEX "tariff_customer_price_productId_idx" ON "tariff_customer_price"("productId");

-- CreateIndex
CREATE INDEX "tariff_group_product_tariffGroupId_idx" ON "tariff_group_product"("tariffGroupId");

-- CreateIndex
CREATE INDEX "tariff_version_createdById_idx" ON "tariff_version"("createdById");

-- CreateIndex
CREATE INDEX "user_customerId_idx" ON "user"("customerId");
