// Simple auth utilities without external dependencies
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export function generateToken(user: any) {
  // Simple token generation using base64 encoding
  const payload = {
    userId: user._id,
    email: user.email,
    role: user.role,
    name: user.name,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
  }

  const token = btoa(JSON.stringify(payload))
  console.log("Generated token for user:", user.email, "role:", user.role)
  return token
}

export function verifyToken(token: string) {
  try {
    const payload = JSON.parse(atob(token))
    console.log("Verifying token for user:", payload.email, "exp:", new Date(payload.exp))

    // Check if token is expired
    if (payload.exp < Date.now()) {
      console.log("Token expired")
      return null
    }

    console.log("Token valid for user:", payload.email, "role:", payload.role)
    return payload
  } catch (error) {
    console.log("Token verification failed:", error)
    return null
  }
}

export async function hashPassword(password: string) {
  // Simple hash for demo - in production use proper hashing
  return btoa(password)
}

export async function comparePassword(password: string, hashedPassword: string) {
  return btoa(password) === hashedPassword
}
