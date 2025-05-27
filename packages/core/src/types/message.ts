import { FormUser } from './user'

export type { FormUser }

export interface FormMessage {
  type: 'update' | 'lock' | 'unlock' | 'error' | 'ping' | 'pong'
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

export interface FormStore {
  updateField(field: string, value: any): void
  lockField(field: string): void
  unlockField(field: string): void
  getField(field: string): any
  isFieldLocked(field: string): boolean
  isFieldLockedByMe(field: string): boolean
  getFieldLocker(field: string): FormUser | undefined
  getUsers(): FormUser[]
  onChange(callback: (field: string, value: any) => void): () => void
  onUsersChange(callback: (users: FormUser[]) => void): () => void
  handleFieldFocus(field: string): void
  handleFieldBlur(field: string): void
  handleFieldChange(field: string, value: any): void
  disconnect(): void
}