/*
  Warnings:

  - Added the required column `user_wise_seq` to the `Record` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Record" ADD COLUMN     "user_wise_seq" INTEGER NOT NULL;
