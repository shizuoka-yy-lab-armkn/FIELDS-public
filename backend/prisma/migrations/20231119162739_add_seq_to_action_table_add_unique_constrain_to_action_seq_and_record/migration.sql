/*
  Warnings:

  - The primary key for the `Action` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `user_wise_seq` on the `Record` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[subject_id,seq]` on the table `Action` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[subject_id,user_id,seq]` on the table `Record` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `seq` to the `Action` table without a default value. This is not possible if the table is not empty.
  - Added the required column `seq` to the `Record` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "RecordSegment" DROP CONSTRAINT "RecordSegment_action_id_fkey";

-- AlterTable
ALTER TABLE "Action" DROP CONSTRAINT "Action_pkey",
ADD COLUMN     "seq" INTEGER NOT NULL,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Action_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Record" DROP COLUMN "user_wise_seq",
ADD COLUMN     "seq" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "RecordSegment" ALTER COLUMN "action_id" SET DATA TYPE TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Action_subject_id_seq_key" ON "Action"("subject_id", "seq");

-- CreateIndex
CREATE UNIQUE INDEX "Record_subject_id_user_id_seq_key" ON "Record"("subject_id", "user_id", "seq");

-- AddForeignKey
ALTER TABLE "RecordSegment" ADD CONSTRAINT "RecordSegment_action_id_fkey" FOREIGN KEY ("action_id") REFERENCES "Action"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
