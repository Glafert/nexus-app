import { prisma } from "../../../lib/prisma";
import { verifyToken } from "../../../lib/auth";

export default async function handler(req, res) {
  const auth = req.headers.authorization;

  if (!auth) return res.status(401).json({ message: "Unauthorized" });

  const token = auth.split(" ")[1];
  const user = verifyToken(token) as any;

  if (user.role !== "ADMIN") {
    return res.status(403).json({ message: "Admin only" });
  }

  if (req.method === "GET") {
    return res.json(await prisma.user.findMany());
  }

  if (req.method === "POST") {
    const { username, password, role } = req.body;

    return res.json(await prisma.user.create({
      data: { username, password, role },
    }));
  }
}