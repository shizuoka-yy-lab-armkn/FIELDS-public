/*
  Warnings:

  - You are about to drop the column `created_at` on the `Record` table. All the data in the column will be lost.
  - Added the required column `recording_finished_at` to the `Record` table without a default value. This is not possible if the table is not empty.
  - Added the required column `recording_started_at` to the `Record` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Record" DROP COLUMN "created_at",
ADD COLUMN     "recording_finished_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "recording_started_at" TIMESTAMP(3) NOT NULL;
