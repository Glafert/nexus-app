import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "5mb",
    },
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ message: "Method not allowed" });
    }

    const { userId, image } = req.body;

    // VALIDASI BASIC
    if (!userId || !image) {
      return res.status(400).json({ message: "Missing data" });
    }

    const id = Number(userId);

    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid userId" });
    }

    // VALIDASI IMAGE BASE64
    if (typeof image !== "string" || !image.startsWith("data:image")) {
      return res.status(400).json({ message: "Invalid image format" });
    }

    // LIMIT SIZE (±1MB base64)
    if (image.length > 1_000_000) {
      return res.status(400).json({ message: "Image too large (max ~1MB)" });
    }

    // CEK USER
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // UPDATE
    const updated = await prisma.user.update({
      where: { id },
      data: {
        avatar: image,
      },
    });

    return res.status(200).json(updated);

  } catch (err: any) {
    console.error("🔥 UPLOAD ERROR FULL:", err);

    return res.status(500).json({
      message: err.message,
      stack: err.stack,
    });
  }
}