import { FormMessage, FormUser } from '../../types/message'

export class WebSocketClient {
  private ws: WebSocket | null = null
  private url: string
  private user: FormUser
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000
  private reconnectTimer: NodeJS.Timeout | null = null
  private heartbeatTimer: NodeJS.Timeout | null = null
  private heartbeatInterval = 30000 // 30 seconds
  private onMessageCallback: ((message: FormMessage) => void) | null = null
  private onErrorCallback: ((error: Error) => void) | null = null
  private messageQueue: FormMessage[] = []
  private isConnected = false
  private maxReconnectDelay = 30000 // 最大延迟30秒
  private changeCallbacks: ((field: string, value: any) => void)[] = []
  private userUpdateCallbacks: ((user: FormUser) => void)[] = []
  private lockChangeCallbacks: ((field: string, user: FormUser | null) => void)[] = []

  constructor(url: string, user: FormUser) {
    this.url = url
    this.user = user
    this.connect()
  }

  connect() {
    try {
      this.ws = new WebSocket(this.url)

      this.ws.onopen = () => {
        console.log('WebSocket connected')
        this.isConnected = true
        this.reconnectAttempts = 0
        this.startHeartbeat()
        this.sendUserJoin()
        this.flushMessageQueue()
      }

      this.ws.onclose = () => {
        console.log('WebSocket disconnected')
        this.isConnected = false
        this.handleReconnect()
        this.stopHeartbeat()
      }

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error)
        this.onErrorCallback?.(new Error('WebSocket connection error'))
      }

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data) as FormMessage

          // Handle heartbeat messages
          if (message.type === 'ping') {
            this.send({ type: 'pong', data: {} })
            return
          }

          if (message.type === 'pong') {
            return
          }

          switch (message.type) {
            case 'update':
              if (message.data.field && message.data.value !== undefined) {
                this.notifyChange(message.data.field, message.data.value)
              }
              break
            case 'lock':
              if (message.data.field && message.data.user) {
                this.notifyLockChange(message.data.field, message.data.user)
              }
              break
            case 'unlock':
              if (message.data.field) {
                this.notifyLockChange(message.data.field, null)
              }
              break
            case 'error':
              console.error('WebSocket error:', message.data.error)
              this.handleError(message.data.error ?? '')
              break
          }

          // 处理用户更新
          if (message.data.user) {
            this.notifyUserUpdate(message.data.user)
          }

          this.onMessageCallback?.(message)
        } catch (error) {
          console.error('Error parsing message:', error)
          this.onErrorCallback?.(new Error('Invalid message format'))
        }
      }
    } catch (error) {
      console.error('Error connecting to WebSocket:', error)
      this.onErrorCallback?.(new Error('Failed to connect to WebSocket'))
      this.handleReconnect()
    }
  }

  private handleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached')
      this.onErrorCallback?.(new Error('Max reconnection attempts reached'))
      return
    }

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
    }

    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts)
    this.reconnectTimer = setTimeout(() => {
      this.reconnectAttempts++
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`)
      this.connect()
    }, delay)
  }

  private startHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
    }

    this.heartbeatTimer = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.send({ type: 'ping', data: {} })
      }
    }, this.heartbeatInterval)
  }

  private stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
  }

  private handleError(error: string) {
    // 通知错误回调
    this.errorCallbacks.forEach(callback => callback(error))
  }

  private errorCallbacks: ((error: string) => void)[] = []

  public onError(callback: (error: Error) => void) {
    this.onErrorCallback = callback
  }

  private sendUserJoin() {
    this.send({
      type: 'update',
      data: {
        user: this.user,
        field: undefined,
        value: undefined,
        error: undefined
      }
    })
  }

  private sendMessage(message: FormMessage) {
    if (!this.isConnected) {
      console.log('Queueing message:', message)
      this.messageQueue.push(message)
      return
    }

    console.log('Sending message:', message)
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

  public onChange(callback: (field: string, value: any) => void) {
    this.changeCallbacks.push(callback)
    return () => {
      const index = this.changeCallbacks.indexOf(callback)
      if (index !== -1) {
        this.changeCallbacks.splice(index, 1)
      }
    }
  }

  public onUserUpdate(callback: (user: FormUser) => void) {
    this.userUpdateCallbacks.push(callback)
    return () => {
      const index = this.userUpdateCallbacks.indexOf(callback)
      if (index !== -1) {
        this.userUpdateCallbacks.splice(index, 1)
      }
    }
  }

  public onLockChange(callback: (field: string, user: FormUser | null) => void) {
    this.lockChangeCallbacks.push(callback)
    return () => {
      const index = this.lockChangeCallbacks.indexOf(callback)
      if (index !== -1) {
        this.lockChangeCallbacks.splice(index, 1)
      }
    }
  }

  private notifyChange(field: string, value: any) {
    console.log('Notifying change:', field, value)
    this.changeCallbacks.forEach(callback => callback(field, value))
  }

  private notifyUserUpdate(user: FormUser) {
    this.userUpdateCallbacks.forEach(callback => callback(user))
  }

  private notifyLockChange(field: string, user: FormUser | null) {
    if (user && user.name === this.user.name) {
      return
    }
    this.lockChangeCallbacks.forEach(callback => callback(field, user))
  }

  public sendUpdate(field: string, value: any) {
    this.send({
      type: 'update',
      data: { field, value, user: this.user }
    })
  }

  public sendLock(field: string) {
    this.send({
      type: 'lock',
      data: { field, user: this.user }
    })
  }

  public sendUnlock(field: string) {
    this.send({
      type: 'unlock',
      data: { field, user: this.user }
    })
  }

  public send(message: FormMessage) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message))
    } else {
      console.error('WebSocket is not connected')
      this.onErrorCallback?.(new Error('WebSocket is not connected'))
      this.messageQueue.push(message)
    }
  }

  public disconnect() {
    this.stopHeartbeat()
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
    }
    this.ws?.close()
  }

  onMessage(callback: (message: FormMessage) => void) {
    this.onMessageCallback = callback
  }

  public get currentUser(): FormUser {
    return this.user;
  }
}