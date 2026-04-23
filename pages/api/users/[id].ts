import { prisma } from "../../../lib/prisma";

export default async function handler(req, res) {
  const id = Number(req.query.id);

  if (req.method === "GET") {
    const user = await prisma.user.findUnique({ where: { id } });
    return res.json(user);
  }

  if (req.method === "PUT") {
    const { username, password, role } = req.body;

    const updated = await prisma.user.update({
      where: { id },
      data: { username, password, role },
    });

    return res.json(updated);
  }

  if (req.method === "DELETE") {
    await prisma.user.delete({ where: { id } });
    return res.json({ message: "Deleted" });
  }

  res.status(405).end();
}