/*
  Warnings:

  - The values [WALLET] on the enum `WalletType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."WalletType_new" AS ENUM ('BANK', 'CASH', 'UPI');
ALTER TABLE "public"."wallets" ALTER COLUMN "type" TYPE "public"."WalletType_new" USING ("type"::text::"public"."WalletType_new");
ALTER TYPE "public"."WalletType" RENAME TO "WalletType_old";
ALTER TYPE "public"."WalletType_new" RENAME TO "WalletType";
DROP TYPE "public"."WalletType_old";
COMMIT;
