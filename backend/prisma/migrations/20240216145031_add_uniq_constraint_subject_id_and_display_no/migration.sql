/*
  Warnings:

  - A unique constraint covering the columns `[subject_id,display_no]` on the table `Action` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Action" ALTER COLUMN "display_no" DROP DEFAULT;

-- CreateIndex
CREATE UNIQUE INDEX "Action_subject_id_display_no_key" ON "Action"("subject_id", "display_no");
