import { FormMessage, FormState, FormUser } from '../../types/message'

export class WebSocketClient {
  private ws: WebSocket | null = null
  private messageQueue: FormMessage[] = []
  private isConnected = false
  private changeCallbacks: ((field: string, value: any) => void)[] = []

  constructor(private url: string, private user: FormUser) {
    this.connect()
  }

  private connect() {
    this.ws = new WebSocket(this.url)

    this.ws.onopen = () => {
      this.isConnected = true
      this.sendUserJoin()
      this.flushMessageQueue()
    }

    this.ws.onmessage = (event) => {
      const message: FormMessage = JSON.parse(event.data)
      this.handleMessage(message)
    }

    this.ws.onclose = () => {
      this.isConnected = false
      setTimeout(() => this.connect(), 1000)
    }

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error)
    }
  }

  private sendUserJoin() {
    this.sendMessage({
      type: 'update',
      data: {
        user: this.user
      }
    })
  }

  private sendMessage(message: FormMessage) {
    if (!this.isConnected) {
      this.messageQueue.push(message)
      return
    }

    this.ws?.send(JSON.stringify(message))
  }

  private flushMessageQueue() {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift()
      if (message) {
        this.sendMessage(message)
      }
    }
  }

  private handleMessage(message: FormMessage) {
    switch (message.type) {
      case 'update':
        if (message.data.field && message.data.value !== undefined) {
          this.notifyChange(message.data.field, message.data.value)
        }
        break
    }
  }

  public sendUpdate(field: string, value: any) {
    this.sendMessage({
      type: 'update',
      data: { field, value }
    })
  }

  public sendLock(field: string) {
    this.sendMessage({
      type: 'lock',
      data: { field, user: this.user }
    })
  }

  public sendUnlock(field: string) {
    this.sendMessage({
      type: 'unlock',
      data: { field }
    })
  }

  public onChange(callback: (field: string, value: any) => void) {
    this.changeCallbacks.push(callback)
    return () => {
      const index = this.changeCallbacks.indexOf(callback)
      if (index !== -1) {
        this.changeCallbacks.splice(index, 1)
      }
    }
  }

  private notifyChange(field: string, value: any) {
    this.changeCallbacks.forEach(callback => callback(field, value))
  }

  public disconnect() {
    this.ws?.close()
  }
}