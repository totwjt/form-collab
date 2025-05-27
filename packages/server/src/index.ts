import express from 'express';
import { WebSocketServer, WebSocket } from 'ws';
import { v4 as uuidv4 } from 'uuid';

// 定义类型
interface User {
  id: string;
  name: string;
}

interface Message {
  type: 'update' | 'lock' | 'unlock' | 'error';
  data: {
    field?: string;
    value?: any;
    user?: User;
    error?: string;
  };
}

interface Lock {
  user: User;
  timestamp: number;
}

export class CollabServer {
  private app: express.Application;
  private wss: WebSocketServer;
  private locks: Map<string, Lock>;
  private clients: Map<string, WebSocket>;
  private users: Map<string, User>;

  constructor(port: number = 8088) {
    this.app = express();
    this.wss = new WebSocketServer({ port: port + 1 });
    this.locks = new Map();
    this.clients = new Map();
    this.users = new Map();

    this.setupExpress();
    this.setupWebSocket();
  }

  private setupExpress() {
    this.app.use(express.json());
    this.app.use(express.static('public'));

    // 健康检查
    this.app.get('/health', (req, res) => {
      res.json({ status: 'ok' });
    });
  }

  private setupWebSocket() {
    this.wss.on('connection', (ws) => {
      const clientId = uuidv4();
      this.clients.set(clientId, ws);

      ws.on('message', (data) => {
        try {
          const message: Message = JSON.parse(data.toString());
          this.handleMessage(message, clientId);
        } catch (error) {
          console.error('Error handling message:', error);
          ws.send(JSON.stringify({
            type: 'error',
            data: { error: 'Invalid message format' }
          }));
        }
      });

      ws.on('close', () => {
        this.clients.delete(clientId);
        const user = this.users.get(clientId);
        if (user) {
          this.users.delete(clientId);
          // 清理该用户的所有锁
          for (const [key, lock] of this.locks.entries()) {
            if (lock.user.id === clientId) {
              this.locks.delete(key);
              this.broadcast({
                type: 'unlock',
                data: { field: key }
              });
            }
          }
          // 广播用户离开消息
          this.broadcast({
            type: 'update',
            data: { user: { ...user, id: '' } } // 发送空 ID 表示用户离开
          });
        }
      });
    });
  }

  private handleMessage(message: Message, clientId: string) {
    console.log('Server handling message:', message, 'from client:', clientId)
    switch (message.type) {
      case 'update':
        if (message.data.user) {
          // 处理用户加入/更新
          const user = { ...message.data.user, id: clientId }
          console.log('Adding/updating user:', user)
          this.users.set(clientId, user)
          // 广播用户信息给所有客户端
          this.broadcast({
            type: 'update',
            data: { user }
          })
        }
        if (message.data.field && message.data.value !== undefined) {
          // 广播字段更新
          this.broadcast({
            type: 'update',
            data: {
              field: message.data.field,
              value: message.data.value
            }
          })
        }
        break

      case 'lock':
        if (message.data.field && message.data.user) {
          const user = this.users.get(clientId);
          if (user) {
            this.locks.set(message.data.field, {
              user: { ...user, id: clientId },
              timestamp: Date.now()
            });
            this.broadcast({
              type: 'lock',
              data: {
                field: message.data.field,
                user: { ...user, id: clientId }
              }
            });
          }
        }
        break;

      case 'unlock':
        if (message.data.field) {
          const lock = this.locks.get(message.data.field);
          if (lock && lock.user.id === clientId) {
            this.locks.delete(message.data.field);
            this.broadcast({
              type: 'unlock',
              data: { field: message.data.field }
            });
          }
        }
        break;
    }
  }

  private broadcast(message: Message) {
    console.log('Broadcasting message:', message)
    const messageStr = JSON.stringify(message)
    this.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(messageStr)
      }
    })
  }

  private sendToClient(clientId: string, message: Message) {
    const client = this.clients.get(clientId);
    if (client && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  }

  public start() {
    this.app.listen(8088, () => {
      console.log('HTTP server started on port 8088');
    });
    console.log('WebSocket server started on port 8089');
  }
}

// 启动服务器
const server = new CollabServer();
server.start();
export default server;