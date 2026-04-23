import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma";
import { signToken } from "../../../lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ message: "Method not allowed" });
    }

    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Missing username or password" });
    }

    const user = await prisma.user.findFirst({
      where: { username, password },
    });

    if (!user) {
      return res.status(401).json({ message: "Login gagal" });
    }

    return res.status(200).json({
      message: "Login berhasil",
      user,
      token: signToken(user),
    });

  } catch (err: any) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
}