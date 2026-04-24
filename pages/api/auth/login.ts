import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma";
import { signToken } from "../../../lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ message: "Method not allowed" });
    }

    const { username, password } = req.body;

    const user = await prisma.user.findFirst({
      where: {
        username,
        password,
      },
    });

    if (!user) {
      return res.status(401).json({ message: "Login gagal" });
    }

    const token = signToken(user);

    return res.status(200).json({
      user,
      token,
    });

  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
}