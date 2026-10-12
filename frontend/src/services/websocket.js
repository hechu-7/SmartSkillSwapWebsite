import { Client } from '@stomp/stompjs';

// Convert HTTP URL to WebSocket protocol (ws:// or wss://)
const RAW_URL = import.meta.env.VITE_WS_BASE_URL || 'http://localhost:8080/ws';
const BROKER_URL = RAW_URL.replace(/^http:/, 'ws:').replace(/^https:/, 'wss:');

class WebSocketService {
  constructor() {
    this.client = null;
    this.connected = false;
    this.subscriptions = new Map();
  }

  connect(token, onConnectCallback, onErrorCallback) {
    if (this.client && this.connected) {
      if (onConnectCallback) onConnectCallback();
      return;
    }

    this.client = new Client({
      brokerURL: BROKER_URL,
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      debug: (str) => {
        // console.log('[STOMP]', str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
    });

    this.client.onConnect = (frame) => {
      this.connected = true;
      if (onConnectCallback) onConnectCallback(frame);
    };

    this.client.onStompError = (frame) => {
      this.connected = false;
      console.error('STOMP protocol error: ', frame.headers['message']);
      if (onErrorCallback) onErrorCallback(frame);
    };

    this.client.onWebSocketClose = () => {
      this.connected = false;
    };

    this.client.activate();
  }

  subscribe(destination, callback) {
    if (!this.client || !this.connected) {
      console.warn('Cannot subscribe, STOMP client is not connected');
      return null;
    }

    const sub = this.client.subscribe(destination, (message) => {
      try {
        const payload = JSON.parse(message.body);
        callback(payload);
      } catch (err) {
        callback(message.body);
      }
    });

    return sub;
  }

  sendMessage(destination, body) {
    if (!this.client || !this.connected) {
      console.warn('Cannot send message, STOMP client not connected');
      return;
    }

    this.client.publish({
      destination,
      body: JSON.stringify(body),
    });
  }

  disconnect() {
    if (this.client) {
      this.client.deactivate();
      this.connected = false;
      this.client = null;
    }
  }
}

export const wsService = new WebSocketService();
export default wsService;
