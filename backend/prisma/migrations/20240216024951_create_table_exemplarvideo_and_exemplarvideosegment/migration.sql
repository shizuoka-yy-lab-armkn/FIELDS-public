-- CreateTable
CREATE TABLE "ExemplarVideo" (
    "id" TEXT NOT NULL,
    "subject_id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "fps" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExemplarVideo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExemplarVideoSegment" (
    "id" SERIAL NOT NULL,
    "exemplar_video_id" TEXT NOT NULL,
    "opstep_id" TEXT NOT NULL,
    "begin_sec" DOUBLE PRECISION NOT NULL,
    "end_sec" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "ExemplarVideoSegment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ExemplarVideo_slug_key" ON "ExemplarVideo"("slug");

-- AddForeignKey
ALTER TABLE "ExemplarVideo" ADD CONSTRAINT "ExemplarVideo_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExemplarVideoSegment" ADD CONSTRAINT "ExemplarVideoSegment_exemplar_video_id_fkey" FOREIGN KEY ("exemplar_video_id") REFERENCES "ExemplarVideo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExemplarVideoSegment" ADD CONSTRAINT "ExemplarVideoSegment_opstep_id_fkey" FOREIGN KEY ("opstep_id") REFERENCES "Action"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
