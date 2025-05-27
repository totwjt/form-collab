import { FormState, FormUser, FormStore as IFormStore } from '../../types/message'
import { WebSocketClient } from './websocket'
import { FieldEvents } from '../field/events'

export class FormStore implements IFormStore {
  private state: FormState
  private ws: WebSocketClient
  private fieldEvents: FieldEvents
  private usersChangeCallbacks: ((users: FormUser[]) => void)[] = []
  private fieldLockChangeCallbacks: ((field: string, isLocked: boolean) => void)[] = []
  private users: FormUser[] = []

  constructor(url: string, user: FormUser) {
    this.state = {
      data: {},
      lockedFields: new Map(),
      users: new Map()
    }
    this.ws = new WebSocketClient(url, user)
    this.fieldEvents = new FieldEvents(this)

    // 监听用户更新
    this.ws.onUserUpdate((user) => {
      console.log('User update received in store:', user)
      this.handleMessage({ type: 'user_update', user })
    })

    // 监听字段锁定状态变化
    this.ws.onLockChange((field, user) => {
      if (user) {
        this.state.lockedFields.set(field, user)
      } else {
        this.state.lockedFields.delete(field)
      }
      this.notifyFieldLockChange(field, !!user)
    })
  }

  public updateField(field: string, value: any) {
    this.state.data[field] = value
    this.ws.sendUpdate(field, value)
  }

  public lockField(field: string) {
    if (!this.isFieldLocked(field)) {
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
    const locker = this.getFieldLocker(field)
    // 如果字段被锁定，且锁定者不是当前用户，则字段被锁定
    return locker !== undefined && locker.id !== this.ws.user.id
  }

  public isFieldLockedByMe(field: string): boolean {
    const locker = this.getFieldLocker(field)
    return locker?.id === this.ws.user.id
  }

  public getFieldLocker(field: string): FormUser | undefined {
    return this.state.lockedFields.get(field)
  }

  public getUsers(): FormUser[] {
    // 返回去重后的用户列表
    return Array.from(new Map(this.users.map(user => [user.id, user])).values())
  }

  public onChange(callback: (field: string, value: any) => void) {
    return this.ws.onChange(callback)
  }

  public handleFieldFocus(field: string): void {
    this.fieldEvents.handleFocus(field)
  }

  public handleFieldBlur(field: string): void {
    this.fieldEvents.handleBlur(field)
  }

  public handleFieldChange(field: string, value: any): void {
    this.fieldEvents.handleChange(field, value)
  }

  public disconnect() {
    this.fieldEvents.dispose()
    this.ws.disconnect()
  }

  public onUsersChange(callback: (users: FormUser[]) => void) {
    this.usersChangeCallbacks.push(callback)
    // 立即触发一次回调，提供当前用户列表
    callback(this.getUsers())
    return () => {
      const index = this.usersChangeCallbacks.indexOf(callback)
      if (index !== -1) {
        this.usersChangeCallbacks.splice(index, 1)
      }
    }
  }

  private notifyUsersChange() {
    const users = this.getUsers()
    this.usersChangeCallbacks.forEach(callback => callback(users))
  }

  public onFieldLockChange(callback: (field: string, isLocked: boolean) => void) {
    this.fieldLockChangeCallbacks.push(callback)
    // 立即触发一次回调，提供当前锁定状态
    for (const [field] of this.state.lockedFields.entries()) {
      callback(field, true)
    }
    return () => {
      const index = this.fieldLockChangeCallbacks.indexOf(callback)
      if (index !== -1) {
        this.fieldLockChangeCallbacks.splice(index, 1)
      }
    }
  }

  private notifyFieldLockChange(field: string, isLocked: boolean) {
    if (isLocked && this.state.lockedFields.get(field)?.name === this.ws.currentUser.name) {
      return
    }
    this.fieldLockChangeCallbacks.forEach(callback => callback(field, isLocked))
  }

  public sendUpdate(field: string, value: any) {
    this.ws.send({
      type: 'update',
      data: { field, value, user: this.ws.currentUser }
    })
  }

  public sendLock(field: string) {
    this.ws.send({
      type: 'lock',
      data: { field, user: this.ws.currentUser }
    })
  }

  private handleMessage(message: FormMessage) {
    switch (message.type) {
      case 'user_update':
        // 检查用户是否已存在
        const existingUserIndex = this.users.findIndex(u => u.id === message.user.id)
        if (existingUserIndex === -1) {
          // 新用户，添加到列表
          this.users.push(message.user)
          this.notifyUserUpdate()
        } else if (JSON.stringify(this.users[existingUserIndex]) !== JSON.stringify(message.user)) {
          // 用户信息有变化，更新用户
          this.users[existingUserIndex] = message.user
          this.notifyUserUpdate()
        }
        break
      // ... existing code ...
    }
  }

  private notifyUserUpdate() {
    // 确保用户列表中没有重复
    this.users = Array.from(new Map(this.users.map(user => [user.id, user])).values())
    this.usersChangeCallbacks.forEach(callback => callback(this.users))
  }
}