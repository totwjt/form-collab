export interface User {
  id: number
  name: string
  email: string
}

export interface FormUser {
  id: string
  name: string
}

export interface UserState {
  user: User | null
  loading: boolean
}