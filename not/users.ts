import { PrismaClient, Rol } from "@prisma/client"; // Import the Rol enum

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const page = parseInt(query.page as string) || 1;
  const limit = parseInt(query.limit as string) || 50;
  const search = (query.search as string) || "";

  const whereClause = {
    rol: Rol.DOCENTE, // Use the Rol enum instead of a string
    OR: [
      { nombre: { contains: search } },
      { correo: { contains: search } },
      { telefono: { contains: search } },
      { documentoIdentidad: { contains: search } },
    ],
  };

  const totalUsers = await prisma.usuario.count({ where: whereClause });
  const users = await prisma.usuario.findMany({
    where: whereClause,
    skip: (page - 1) * limit,
    take: limit,
  });

  return {
    users,
    total: totalUsers,
    page,
    totalPages: Math.ceil(totalUsers / limit),
  };
});
