import { prisma } from "../../../lib/prisma";
import { verifyToken } from "../../../lib/auth";

export default async function handler(req, res) {
  try {
    const id = Number(req.query.id);

    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }

    // ======================
    // AUTH CHECK
    // ======================
    const auth = req.headers.authorization;

    if (!auth) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const token = auth.split(" ")[1];
    let userToken;

    try {
      userToken = verifyToken(token);
    } catch {
      return res.status(401).json({ message: "Invalid token" });
    }

    console.log("ROLE:", userToken.role); // 🔥 DEBUG

    // ======================
    // GET (semua user login boleh)
    // ======================
    if (req.method === "GET") {
      const user = await prisma.user.findUnique({
        where: { id },
      });

      return res.json(user);
    }

    // ======================
    // ADMIN ONLY
    // ======================
    if (userToken.role !== "ADMIN") {
      return res.status(403).json({ message: "Forbidden" });
    }

    // ======================
    // UPDATE USER (TERMASUK AVATAR)
    // ======================
    if (req.method === "PUT") {
      const { username, password, role, avatar } = req.body;

      const updated = await prisma.user.update({
        where: { id },
        data: {
          ...(username && { username }),
          ...(password && { password }),
          ...(role && { role }),
          ...(avatar && { avatar }),
        },
      });

      return res.json(updated);
    }

    // ======================
    // DELETE
    // ======================
    if (req.method === "DELETE") {
      await prisma.user.delete({
        where: { id },
      });

      return res.json({ message: "Deleted" });
    }

    return res.status(405).json({ message: "Method not allowed" });

  } catch (err) {
    console.error("ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
}