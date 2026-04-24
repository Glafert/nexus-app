import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const userId = "demo-user";

  if (req.method === "GET") {
    const board = await prisma.board.findUnique({
      where: { userId },
    });

    if (!board) return res.json(null);

    return res.json(JSON.parse(board.data));
  }

  if (req.method === "POST") {
    const { data } = req.body;

    const existing = await prisma.board.findUnique({
      where: { userId },
    });

    if (existing) {
      await prisma.board.update({
        where: { userId },
        data: { data: JSON.stringify(data) },
      });
    } else {
      await prisma.board.create({
        data: {
          userId,
          data: JSON.stringify(data),
        },
      });
    }

    return res.json({ success: true });
  }

  res.status(405).end();
}