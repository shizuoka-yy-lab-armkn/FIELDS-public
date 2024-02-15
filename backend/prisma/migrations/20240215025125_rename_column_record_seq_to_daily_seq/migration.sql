/*
  Warnings:

  - You are about to drop the column `seq` on the `Record` table. All the data in the column will be lost.
  - Added the required column `daily_seq` to the `Record` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Record_subject_id_user_id_seq_key";

-- AlterTable
ALTER TABLE "Record" RENAME COLUMN "seq" to "daily_seq";
