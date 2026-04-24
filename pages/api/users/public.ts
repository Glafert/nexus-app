import { prisma } from "../../../lib/prisma";

export default async function handler(req, res) {
  if (req.method === "GET") {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        avatar: true, // 🔥 TAMBAHKAN INI
      },
    });

    return res.status(200).json(users);
  }

  return res.status(405).end();
}