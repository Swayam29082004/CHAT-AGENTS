// src/lib/auth/jwt.ts
import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";

const SECRET = process.env.JWT_SECRET || "default-super-secret-key-for-dev";

export interface UserPayload {
  userId: string;
  username: string;
}

/**
 * Verifies a JWT and returns the payload or null if invalid.
 */
export function verifyToken(token: string): UserPayload | null {
  try {
    return jwt.verify(token, SECRET) as UserPayload;
  } catch (err) {
    console.error("Invalid token:", err instanceof Error ? err.message : String(err));
    return null;
  }
}

/**
 * Extracts userId from the Authorization header of a request.
 * Falls back to "guest" if the token is missing or invalid.
 */
export function getUserIdFromRequest(req: NextRequest): string {
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.split(" ")[1];
  if (token) {
    const decoded = verifyToken(token);
    if (decoded) return decoded.userId;
  }
  return "guest";
}
