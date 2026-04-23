import { prisma } from "../../../lib/prisma";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { userId, image } = req.body;

  const updated = await prisma.user.update({
    where: { id: Number(userId) },
    data: { avatar: image },
  });

  res.json(updated);
}