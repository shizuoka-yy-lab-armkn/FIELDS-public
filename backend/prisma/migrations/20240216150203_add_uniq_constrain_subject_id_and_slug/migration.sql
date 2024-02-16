/*
  Warnings:

  - A unique constraint covering the columns `[subject_id,slug]` on the table `ExemplarVideo` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "ExemplarVideo_slug_key";

-- CreateIndex
CREATE UNIQUE INDEX "ExemplarVideo_subject_id_slug_key" ON "ExemplarVideo"("subject_id", "slug");
