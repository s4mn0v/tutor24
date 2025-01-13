-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('ADMIN', 'DOCENTE', 'ESTUDIANTE');

-- CreateTable
CREATE TABLE "Usuario" (
    "id" SERIAL NOT NULL,
    "documentoIdentidad" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "rol" "Rol" NOT NULL,
    "correo" TEXT NOT NULL,
    "telefono" TEXT,
    "contrasena" TEXT NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Estudiante" (
    "id" SERIAL NOT NULL,
    "documentoIdentidad" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "carrera" TEXT NOT NULL,
    "correo" TEXT NOT NULL,
    "contrasena" TEXT NOT NULL,
    "asignaturaId" INTEGER NOT NULL,

    CONSTRAINT "Estudiante_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Asignatura" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "idDocente" INTEGER NOT NULL,
    "material" TEXT,

    CONSTRAINT "Asignatura_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_documentoIdentidad_key" ON "Usuario"("documentoIdentidad");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_correo_key" ON "Usuario"("correo");

-- CreateIndex
CREATE UNIQUE INDEX "Estudiante_documentoIdentidad_key" ON "Estudiante"("documentoIdentidad");

-- CreateIndex
CREATE UNIQUE INDEX "Estudiante_correo_key" ON "Estudiante"("correo");

-- AddForeignKey
ALTER TABLE "Estudiante" ADD CONSTRAINT "Estudiante_asignaturaId_fkey" FOREIGN KEY ("asignaturaId") REFERENCES "Asignatura"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asignatura" ADD CONSTRAINT "Asignatura_idDocente_fkey" FOREIGN KEY ("idDocente") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
