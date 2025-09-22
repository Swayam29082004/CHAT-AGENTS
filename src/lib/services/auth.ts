// src/lib/services/auth.ts
import { jwtDecode } from "jwt-decode";

interface TokenPayload {
  userId: string;
  username: string;
  exp: number;
  iat: number;
}

export function getUserIdFromToken(): string | null {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const decoded: TokenPayload = jwtDecode(token);
    return decoded.userId;
  } catch (err) {
    console.error("Invalid token:", err);
    return null;
  }
}
