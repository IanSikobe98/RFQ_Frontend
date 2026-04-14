import SockJS from "sockjs-client";
import env from '../environment/environment.js'

class WebSocketService {
  socket = null;
  listeners = [];

  connect(user) {

    this.socket = new SockJS(env.websocketUrl.baseUrl);

    this.socket.onopen = () => {
      console.log("✅ WebSocket connected");

      // 🔥 SEND userId + departmentId (THIS triggers your backend handleTextMessage)
      this.socket.send(JSON.stringify({
        userId: user.user.userId,
        roleId: user.user.role.roleId
      }));
    };

    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("📨 Received:", data);

      this.listeners.forEach(cb => cb(data));
    };

    this.socket.onclose = () => {
      console.log("❌ WebSocket closed");
    };
  }

  subscribe(callback) {
    this.listeners.push(callback);
  }

  close() {
    console.log("🔌 Closing WebSocket....");

    if (this.socket) {
      try {
        this.socket.close();
      } catch (e) {
        console.warn("Error closing socket:", e);
      }

      this.socket = null;
    }

  }
}

export default new WebSocketService();
