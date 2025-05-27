import { v4 as uuidv4 } from 'uuid'

export interface User {
  id: number
  name: string
  email: string
}

export interface FormUser {
  id: string
  name: string
}

export function createFormUser(name: string): FormUser {
  return {
    id: uuidv4(),
    name
  }
}

export interface UserState {
  user: User | null
  loading: boolean
}