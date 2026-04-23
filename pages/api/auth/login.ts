import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ message: "Method not allowed" });
    }

    const { username, password } = req.body;

    console.log("LOGIN INPUT:", username, password);

    if (!username || !password) {
      return res.status(400).json({ message: "Missing username or password" });
    }

    const user = await prisma.user.findFirst({
      where: {
        username: username,
        password: password,
      },
    });

    console.log("USER FOUND:", user);

    if (!user) {
      return res.status(401).json({ message: "Login gagal" });
    }

    return res.status(200).json({
      message: "Login berhasil",
      user,
    });

  } catch (err: any) {
    console.error("LOGIN ERROR:", err);

    return res.status(500).json({
      message: err.message,
    });
  }
}