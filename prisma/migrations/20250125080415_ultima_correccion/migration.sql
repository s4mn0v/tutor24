/*
  Warnings:

  - Added the required column `contenido` to the `Material` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Material" ADD COLUMN     "contenido" BYTEA NOT NULL;
