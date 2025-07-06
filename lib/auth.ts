import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import crypto from "crypto"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function generateToken(userId: string, rememberMe = false): string {
  const expiresIn = rememberMe ? "30d" : "7d"
  return jwt.sign(
    {
      userId,
      rememberMe,
      iat: Math.floor(Date.now() / 1000),
    },
    JWT_SECRET,
    { expiresIn },
  )
}

export function verifyToken(token: string): { userId: string; rememberMe?: boolean } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string
      rememberMe?: boolean
      iat: number
      exp: number
    }

    // Check if token is expired
    const now = Math.floor(Date.now() / 1000)
    if (decoded.exp < now) {
      return null
    }

    return {
      userId: decoded.userId,
      rememberMe: decoded.rememberMe,
    }
  } catch (error) {
    console.error("Token verification failed:", error)
    return null
  }
}

export function generateResetToken(): string {
  return crypto.randomBytes(32).toString("hex")
}

export function generateResetTokenExpiry(): Date {
  return new Date(Date.now() + 3600000) // 1 hour from now
}
