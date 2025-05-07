import { FormMessage, FormState, FormUser } from './types';

export interface User {
  id: number
  name: string
  email: string
}

export interface Store {
  user: User | null
  loading: boolean
}

let store: Store = {
  user: null,
  loading: false
}

export const getStore = () => store

export const setUser = (newUser: User) => {
  store.user = newUser
}

export const setLoading = (loading: boolean) => {
  store.loading = loading
}

export const useStore = () => ({
  getUser: () => store.user,
  isLoading: () => store.loading,
  setUser,
  setLoading
})

export class FormStore {
  private state: FormState;
  private ws: WebSocket | null = null;
  private messageQueue: FormMessage[] = [];
  private isConnected = false;
  private changeCallbacks: ((field: string, value: any) => void)[] = [];

  constructor(private url: string, private user: FormUser) {
    this.state = {
      data: {},
      lockedFields: new Map(),
      users: new Map()
    };
    this.connect();
  }

  private connect() {
    this.ws = new WebSocket(this.url);

    this.ws.onopen = () => {
      this.isConnected = true;
      this.sendUserJoin();
      this.flushMessageQueue();
    };

    this.ws.onmessage = (event) => {
      const message: FormMessage = JSON.parse(event.data);
      this.handleMessage(message);
    };

    this.ws.onclose = () => {
      this.isConnected = false;
      setTimeout(() => this.connect(), 1000);
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  private sendUserJoin() {
    this.sendMessage({
      type: 'update',
      data: {
        user: this.user
      }
    });
  }

  private sendMessage(message: FormMessage) {
    if (!this.isConnected) {
      this.messageQueue.push(message);
      return;
    }

    this.ws?.send(JSON.stringify(message));
  }

  private flushMessageQueue() {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      if (message) {
        this.sendMessage(message);
      }
    }
  }

  private handleMessage(message: FormMessage) {
    switch (message.type) {
      case 'update':
        if (message.data.field && message.data.value !== undefined) {
          this.state.data[message.data.field] = message.data.value;
          this.notifyChange(message.data.field, message.data.value);
        }
        if (message.data.user) {
          this.state.users.set(message.data.user.id, message.data.user);
        }
        break;

      case 'lock':
        if (message.data.field && message.data.user) {
          this.state.lockedFields.set(message.data.field, message.data.user);
        }
        break;

      case 'unlock':
        if (message.data.field) {
          this.state.lockedFields.delete(message.data.field);
        }
        break;
    }
  }

  public updateField(field: string, value: any) {
    this.state.data[field] = value;
    this.sendMessage({
      type: 'update',
      data: { field, value }
    });
  }

  public lockField(field: string) {
    if (!this.state.lockedFields.has(field)) {
      this.sendMessage({
        type: 'lock',
        data: { field, user: this.user }
      });
    }
  }

  public unlockField(field: string) {
    if (this.isFieldLockedByMe(field)) {
      this.sendMessage({
        type: 'unlock',
        data: { field }
      });
    }
  }

  public getField(field: string): any {
    return this.state.data[field];
  }

  public isFieldLocked(field: string): boolean {
    return this.state.lockedFields.has(field);
  }

  public isFieldLockedByMe(field: string): boolean {
    const locker = this.state.lockedFields.get(field);
    return locker?.id === this.user.id;
  }

  public getFieldLocker(field: string): FormUser | undefined {
    return this.state.lockedFields.get(field);
  }

  public getUsers(): FormUser[] {
    return Array.from(this.state.users.values());
  }

  public onChange(callback: (field: string, value: any) => void) {
    this.changeCallbacks.push(callback);
    return () => {
      const index = this.changeCallbacks.indexOf(callback);
      if (index !== -1) {
        this.changeCallbacks.splice(index, 1);
      }
    };
  }

  private notifyChange(field: string, value: any) {
    this.changeCallbacks.forEach(callback => callback(field, value));
  }

  public disconnect() {
    this.ws?.close();
  }
}