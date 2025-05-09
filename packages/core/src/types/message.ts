import { FormUser } from './user'

export type { FormUser }

export interface FormMessage {
  type: 'update' | 'lock' | 'unlock' | 'error'
  data: {
    field?: string
    value?: any
    user?: FormUser
    error?: string
  }
}

export interface FormData {
  [key: string]: any
}

export interface FormState {
  data: FormData
  lockedFields: Map<string, FormUser>
  users: Map<string, FormUser>
}