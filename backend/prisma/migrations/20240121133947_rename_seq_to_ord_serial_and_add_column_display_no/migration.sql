-- AlterTable
ALTER TABLE "Action" RENAME COLUMN "seq" TO "ord_serial";
ALTER TABLE "Action" ADD COLUMN "display_no" INTEGER NOT NULL DEFAULT 0;

-- RenameIndex
ALTER INDEX "Action_subject_id_seq_key" RENAME TO "Action_subject_id_ord_serial_key";
