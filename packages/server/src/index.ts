import express from 'express';
import { WebSocketServer, WebSocket } from 'ws';
import { v4 as uuidv4 } from 'uuid';

// 定义类型
interface User {
  id: string;
  name: string;
}

interface Lock {
  key: string;
  user: User;
  timestamp: number;
}

interface Message {
  type: 'lock' | 'unlock' | 'error';
  data: {
    key: string;
    user?: User;
    error?: string;
  };
}

export class CollabServer {
  private app: express.Application;
  private wss: WebSocketServer;
  private locks: Map<string, Lock>;
  private clients: Map<string, WebSocket>;

  constructor(port: number = 3000) {
    this.app = express();
    this.wss = new WebSocketServer({ port: port + 1 });
    this.locks = new Map();
    this.clients = new Map();

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
        // 清理该用户的所有锁
        for (const [key, lock] of this.locks.entries()) {
          if (lock.user.id === clientId) {
            this.locks.delete(key);
            this.broadcast({
              type: 'unlock',
              data: { key }
            });
          }
        }
      });
    });
  }

  private handleMessage(message: Message, clientId: string) {
    const { type, data } = message;
    const { key, user } = data;

    switch (type) {
      case 'lock':
        if (!this.locks.has(key)) {
          const lock: Lock = {
            key,
            user: { ...user!, id: clientId },
            timestamp: Date.now()
          };
          this.locks.set(key, lock);
          this.broadcast({
            type: 'lock',
            data: { key, user: lock.user }
          });
        } else {
          const existingLock = this.locks.get(key)!;
          this.sendToClient(clientId, {
            type: 'error',
            data: {
              key,
              error: `Element is locked by ${existingLock.user.name}`
            }
          });
        }
        break;

      case 'unlock':
        if (this.locks.has(key) && this.locks.get(key)!.user.id === clientId) {
          this.locks.delete(key);
          this.broadcast({
            type: 'unlock',
            data: { key }
          });
        }
        break;
    }
  }

  private broadcast(message: Message) {
    const messageStr = JSON.stringify(message);
    this.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(messageStr);
      }
    });
  }

  private sendToClient(clientId: string, message: Message) {
    const client = this.clients.get(clientId);
    if (client && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  }

  public start() {
    this.app.listen(3000, () => {
      console.log('HTTP server started on port 3000');
    });
    console.log('WebSocket server started on port 3001');
  }
}

// 导出默认实例
export default new CollabServer();