/*
  Warnings:

  - A unique constraint covering the columns `[idempotencyKey,category]` on the table `transactions` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "transactions_idempotencyKey_key";

-- CreateIndex
CREATE UNIQUE INDEX "transactions_idempotencyKey_category_key" ON "transactions"("idempotencyKey", "category");
