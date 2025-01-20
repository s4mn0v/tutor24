/*
  Warnings:

  - You are about to drop the column `asignaturaId` on the `Material` table. All the data in the column will be lost.
  - You are about to drop the column `datos` on the `Material` table. All the data in the column will be lost.
  - You are about to drop the column `nombreArchivo` on the `Material` table. All the data in the column will be lost.
  - You are about to drop the column `tipoArchivo` on the `Material` table. All the data in the column will be lost.
  - Added the required column `usuarioId` to the `Estudiante` table without a default value. This is not possible if the table is not empty.
  - Added the required column `idAsignatura` to the `Material` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nombre` to the `Material` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tipo` to the `Material` table without a default value. This is not possible if the table is not empty.
  - Added the required column `url` to the `Material` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Material" DROP CONSTRAINT "Material_asignaturaId_fkey";

-- AlterTable
ALTER TABLE "Estudiante" ADD COLUMN     "usuarioId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Material" DROP COLUMN "asignaturaId",
DROP COLUMN "datos",
DROP COLUMN "nombreArchivo",
DROP COLUMN "tipoArchivo",
ADD COLUMN     "idAsignatura" INTEGER NOT NULL,
ADD COLUMN     "nombre" TEXT NOT NULL,
ADD COLUMN     "tipo" TEXT NOT NULL,
ADD COLUMN     "url" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Event" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "description" TEXT NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "asignaturaId" INTEGER NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Recordatorio" (
    "id" SERIAL NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "importancia" TEXT NOT NULL,
    "asignaturaId" INTEGER NOT NULL,
    "creadoPorId" INTEGER NOT NULL,

    CONSTRAINT "Recordatorio_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Estudiante" ADD CONSTRAINT "Estudiante_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Material" ADD CONSTRAINT "Material_idAsignatura_fkey" FOREIGN KEY ("idAsignatura") REFERENCES "Asignatura"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_asignaturaId_fkey" FOREIGN KEY ("asignaturaId") REFERENCES "Asignatura"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recordatorio" ADD CONSTRAINT "Recordatorio_asignaturaId_fkey" FOREIGN KEY ("asignaturaId") REFERENCES "Asignatura"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recordatorio" ADD CONSTRAINT "Recordatorio_creadoPorId_fkey" FOREIGN KEY ("creadoPorId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
