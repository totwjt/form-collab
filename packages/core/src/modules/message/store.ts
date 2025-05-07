import { FormState, FormUser } from '../../types/message'
import { WebSocketClient } from './websocket'

export class FormStore {
  private state: FormState
  private ws: WebSocketClient

  constructor(url: string, user: FormUser) {
    this.state = {
      data: {},
      lockedFields: new Map(),
      users: new Map()
    }
    this.ws = new WebSocketClient(url, user)
  }

  public updateField(field: string, value: any) {
    this.state.data[field] = value
    this.ws.sendUpdate(field, value)
  }

  public lockField(field: string) {
    if (!this.state.lockedFields.has(field)) {
      this.ws.sendLock(field)
    }
  }

  public unlockField(field: string) {
    if (this.isFieldLockedByMe(field)) {
      this.ws.sendUnlock(field)
    }
  }

  public getField(field: string): any {
    return this.state.data[field]
  }

  public isFieldLocked(field: string): boolean {
    return this.state.lockedFields.has(field)
  }

  public isFieldLockedByMe(field: string): boolean {
    const locker = this.state.lockedFields.get(field)
    return locker?.id === this.ws.user.id
  }

  public getFieldLocker(field: string): FormUser | undefined {
    return this.state.lockedFields.get(field)
  }

  public getUsers(): FormUser[] {
    return Array.from(this.state.users.values())
  }

  public onChange(callback: (field: string, value: any) => void) {
    return this.ws.onChange(callback)
  }

  public disconnect() {
    this.ws.disconnect()
  }
}