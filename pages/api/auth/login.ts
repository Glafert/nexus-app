// pages/api/auth/login.ts
import { prisma } from "../../../lib/prisma";
import { signToken } from "../../../lib/auth";

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).end();
    }

    const { username, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // SIMPLE LOGIN (no bcrypt dulu)
    if (password !== user.password) {
      return res.status(401).json({ message: "Wrong password" });
    }

    const token = signToken(user);

    res.json({ token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}