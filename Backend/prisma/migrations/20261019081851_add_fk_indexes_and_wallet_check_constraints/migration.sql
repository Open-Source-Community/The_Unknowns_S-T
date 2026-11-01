-- CreateIndex
CREATE INDEX "notifications_user_id_idx" ON "notifications"("user_id");

-- CreateIndex
CREATE INDEX "order_items_order_id_idx" ON "order_items"("order_id");

-- CreateIndex
CREATE INDEX "order_items_product_id_idx" ON "order_items"("product_id");

-- CreateIndex
CREATE INDEX "orders_buyer_id_idx" ON "orders"("buyer_id");

-- CreateIndex
CREATE INDEX "products_seller_id_idx" ON "products"("seller_id");

-- CreateIndex
CREATE INDEX "transactions_wallet_id_idx" ON "transactions"("wallet_id");

-- Wallet CHECK Constraints
ALTER TABLE "wallets" ADD CONSTRAINT "real_balance_non_negative" CHECK ("real_balance" >= 0);
ALTER TABLE "wallets" ADD CONSTRAINT "promo_balance_non_negative" CHECK ("promo_balance" >= 0);
