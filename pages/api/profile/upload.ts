import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "5mb", // jangan terlalu besar
    },
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ message: "Method not allowed" });
    }

    const { userId, image } = req.body;

    if (!userId || !image) {
      return res.status(400).json({ message: "Missing data" });
    }

    const id = parseInt(userId);

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: {
        avatar: image,
      },
    });

    return res.status(200).json(updated);

  } catch (err: any) {
    console.error("UPLOAD ERROR:", err);

    return res.status(500).json({
      message: err.message,
    });
  }
}