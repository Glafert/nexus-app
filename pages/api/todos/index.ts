import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  if (method === "GET") {
    const { userId } = req.query;

    const todos = await prisma.todo.findMany({
      where: { userId: String(userId) },
      orderBy: { createdAt: "asc" },
    });

    return res.json(todos);
  }

  if (method === "POST") {
    const { title, column, color, userId } = req.body;

    const todo = await prisma.todo.create({
      data: { title, column, color, userId },
    });

    return res.json(todo);
  }

  if (method === "PUT") {
    const { id, column } = req.body;

    const todo = await prisma.todo.update({
      where: { id },
      data: { column },
    });

    return res.json(todo);
  }

  if (method === "DELETE") {
    const { id } = req.body;

    await prisma.todo.delete({
      where: { id },
    });

    return res.json({ success: true });
  }

  res.status(405).end();
}