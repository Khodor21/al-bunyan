export type UserRole = 'user' | 'publisher' | 'admin'

export interface AuthUser {
  id: string
  name: string
  phone: string
  countryCode: string
  fullPhone: string
  location: string
  role: UserRole
  createdAt: string
}

export interface SessionPayload {
  sub: string        // user id
  role: UserRole
  iat: number
  exp: number
}

// Shape returned by /api/auth/me, /signup, /login
export interface AuthResponse {
  user: AuthUser
}

export interface AuthError {
  error: string
  code?: string
}
