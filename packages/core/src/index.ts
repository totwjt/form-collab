
export * from './modules/user'
export * from './modules/message'

export { FormStore } from './store';
export type { FormUser } from './types';

export function greet(name: string): string {
  return `Hello, ${name}!`
}

export function HelloWorldCore(): string {
  return 'Core package loaded successfully!'
}
