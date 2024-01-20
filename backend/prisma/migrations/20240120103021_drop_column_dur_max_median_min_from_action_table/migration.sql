/*
  Warnings:

  - You are about to drop the column `master_dur_max` on the `Action` table. All the data in the column will be lost.
  - You are about to drop the column `master_dur_median` on the `Action` table. All the data in the column will be lost.
  - You are about to drop the column `master_dur_min` on the `Action` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Action" DROP COLUMN "master_dur_max",
DROP COLUMN "master_dur_median",
DROP COLUMN "master_dur_min";
