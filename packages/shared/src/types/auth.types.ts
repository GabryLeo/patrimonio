export interface User {
  id: string
  name: string
  email: string
  createdAt: string
}

export interface AuthPayload {
  userId: string
  email: string
}

export interface LoginResponse {
  user: User
}
