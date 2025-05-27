export * from './types/user'
export * from './types/message'
export * from './modules/message/store'
export * from './modules/message/websocket'
export * from './modules/field/events'

// 显式导出 FormStore
export { FormStore } from './modules/message/store'

export function greet(name: string): string {
  return `Hello, ${name}!`
}

export function HelloWorldCore(): string {
  return 'Core package loaded successfully!'
}
