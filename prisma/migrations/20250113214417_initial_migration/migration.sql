/*
  Warnings:

  - You are about to drop the column `material` on the `Asignatura` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Asignatura" DROP COLUMN "material";

-- CreateTable
CREATE TABLE "Material" (
    "id" SERIAL NOT NULL,
    "nombreArchivo" TEXT NOT NULL,
    "tipoArchivo" TEXT NOT NULL,
    "datos" BYTEA NOT NULL,
    "asignaturaId" INTEGER NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Material_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Material" ADD CONSTRAINT "Material_asignaturaId_fkey" FOREIGN KEY ("asignaturaId") REFERENCES "Asignatura"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
