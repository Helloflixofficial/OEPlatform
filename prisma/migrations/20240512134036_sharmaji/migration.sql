/*
  Warnings:

  - A unique constraint covering the columns `[id]` on the table `title` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "title_id_key" ON "title"("id");
