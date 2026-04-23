import jwt from "jsonwebtoken";

const SECRET = "SECRET_KEY";

export function signToken(user: any) {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      role: user.role,
    },
    SECRET,
    { expiresIn: "1d" }
  );
}

export function verifyToken(token: string) {
  return jwt.verify(token, SECRET);
}