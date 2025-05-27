import { FormStore } from '../message/store'

export class FieldEvents {
  private store: FormStore
  private pendingLocks: Set<string> = new Set()
  private lockTimeouts: Map<string, NodeJS.Timeout> = new Map()
  private readonly LOCK_DELAY = 500 // 延迟锁定时间（毫秒）

  constructor(store: FormStore) {
    this.store = store
  }

  /**
   * 处理字段获得焦点事件
   * @param field 字段名
   */
  public handleFocus(field: string) {
    // 如果字段已经被锁定，不做任何处理
    if (this.store.isFieldLocked(field)) {
      return
    }

    // 如果已经有待处理的锁定，清除之前的定时器
    if (this.lockTimeouts.has(field)) {
      clearTimeout(this.lockTimeouts.get(field))
      this.lockTimeouts.delete(field)
    }

    // 设置新的定时器，延迟锁定
    const timeout = setTimeout(() => {
      this.store.lockField(field)
      this.pendingLocks.add(field)
      this.lockTimeouts.delete(field)
    }, this.LOCK_DELAY)

    this.lockTimeouts.set(field, timeout)
  }

  /**
   * 处理字段失去焦点事件
   * @param field 字段名
   */
  public handleBlur(field: string) {
    // 清除待处理的锁定
    if (this.lockTimeouts.has(field)) {
      clearTimeout(this.lockTimeouts.get(field))
      this.lockTimeouts.delete(field)
    }

    // 如果字段被当前用户锁定，则解锁
    if (this.store.isFieldLockedByMe(field)) {
      this.store.unlockField(field)
      this.pendingLocks.delete(field)
    }
  }

  /**
   * 处理字段值变化事件
   * @param field 字段名
   * @param value 新值
   */
  public handleChange(field: string, value: any) {
    // 如果字段没有被锁定，且有待处理的锁定，立即锁定
    if (!this.store.isFieldLocked(field) && this.pendingLocks.has(field)) {
      this.store.lockField(field)
    }

    // 更新字段值
    this.store.updateField(field, value)
  }

  /**
   * 清理资源
   */
  public dispose() {
    // 清除所有待处理的锁定定时器
    this.lockTimeouts.forEach(timeout => clearTimeout(timeout))
    this.lockTimeouts.clear()
    this.pendingLocks.clear()
  }
}