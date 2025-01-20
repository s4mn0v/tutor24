/*
  Warnings:

  - A unique constraint covering the columns `[enlaceRegistro]` on the table `Asignatura` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `carrera` to the `Asignatura` table without a default value. This is not possible if the table is not empty.
  - Added the required column `jornada` to the `Asignatura` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Asignatura" ADD COLUMN     "activo" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "carrera" TEXT NOT NULL,
ADD COLUMN     "enlaceRegistro" TEXT,
ADD COLUMN     "fechaExpiracion" TIMESTAMP(3),
ADD COLUMN     "jornada" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Asignatura_enlaceRegistro_key" ON "Asignatura"("enlaceRegistro");
