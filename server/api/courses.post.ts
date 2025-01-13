// server/api/courses.post.ts
import { PrismaClient } from "@prisma/client";
import { defineEventHandler, readBody, createError } from 'h3';

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { name } = body;

  // You should get the teacher's ID from the authenticated user
  const teacherId: number = 1; // Placeholder, replace with actual teacher ID

  try {
    const course = await prisma.asignatura.create({
      data: {
        nombre: name,
        idDocente: teacherId,
      },
    });

    return { message: "Course created successfully", courseId: course.id };
  } catch (error) {
    console.error("Error creating course:", error);
    return createError({
      statusCode: 500,
      message: "Internal server error",
    });
  }
});
