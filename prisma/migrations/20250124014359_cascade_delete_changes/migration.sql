-- DropForeignKey
ALTER TABLE "Estudiante" DROP CONSTRAINT "Estudiante_asignaturaId_fkey";

-- DropForeignKey
ALTER TABLE "Event" DROP CONSTRAINT "Event_asignaturaId_fkey";

-- DropForeignKey
ALTER TABLE "Material" DROP CONSTRAINT "Material_idAsignatura_fkey";

-- DropForeignKey
ALTER TABLE "Recordatorio" DROP CONSTRAINT "Recordatorio_asignaturaId_fkey";

-- AddForeignKey
ALTER TABLE "Estudiante" ADD CONSTRAINT "Estudiante_asignaturaId_fkey" FOREIGN KEY ("asignaturaId") REFERENCES "Asignatura"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Material" ADD CONSTRAINT "Material_idAsignatura_fkey" FOREIGN KEY ("idAsignatura") REFERENCES "Asignatura"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_asignaturaId_fkey" FOREIGN KEY ("asignaturaId") REFERENCES "Asignatura"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recordatorio" ADD CONSTRAINT "Recordatorio_asignaturaId_fkey" FOREIGN KEY ("asignaturaId") REFERENCES "Asignatura"("id") ON DELETE CASCADE ON UPDATE CASCADE;
