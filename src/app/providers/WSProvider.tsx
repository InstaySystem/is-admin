"use client";

import React, { createContext, useContext, useEffect, useRef } from "react";
import { message } from "antd";
import { useMessageStore } from "@/stores/useMessageStore";

interface WSContextProps {
  sendWS: (event: string, data: any) => void;
  isConnected: boolean;
}

const WSContext = createContext<WSContextProps | null>(null);

export const useWS = () => {
  const ctx = useContext(WSContext);
  if (!ctx) throw new Error("useWS must be used inside WSProvider");
  return ctx;
};

export const WSProvider = ({ children }: { children: React.ReactNode }) => {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const [isConnected, setIsConnected] = React.useState(false);

  const store = useMessageStore();
  const [msgApi, contextHolder] = message.useMessage();

  const connectWS = () => {
    try {
      const url = "http://localhost:8080/api/v1/ws";
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("WS Connected");
        setIsConnected(true);
        reconnectAttemptsRef.current = 0;
      };

      ws.onmessage = (ev) => {
        try {
          const res = JSON.parse(ev.data);
          handleWSMessage(res);
        } catch (err) {
          console.error("WS parse error:", err);
        }
      };

      ws.onerror = (e) => {
        console.error("WS Error", e);
        setIsConnected(false);
      };

      ws.onclose = () => {
        console.log("WS Closed");
        setIsConnected(false);
        if (reconnectAttemptsRef.current < 5) {
          reconnectAttemptsRef.current++;
          setTimeout(connectWS, 3000);
        }
      };
    } catch (err) {
      console.error("Failed to create WS:", err);
    }
  };

  const handleWSMessage = (res: any) => {
    switch (res.event) {
      case "message_created":
        if (res.data) {
          store.addMessage(res.data.chatId, res.data);
        }
        break;

      case "new_message":
        if (res.data) {
          store.addMessage(res.data.chatId || res.data.chat_id, res.data);
          if (res.data.chatId || res.data.chat_id) {
            store.addOrUpdateChat({
              id: res.data.chatId || res.data.chat_id,
              last_message: res.data.content,
              updated_at: res.data.created_at || new Date().toISOString(),
            });
          }
        }
        break;

      case "chat_created":
        if (res.data) {
          store.addOrUpdateChat(res.data);
        }
        break;

      case "chat_updated":
        if (res.data) {
          store.addOrUpdateChat(res.data);
        }
        break;

      case "mark_read":
        if (res.data?.chatId && res.data?.userId) {
          store.markRead(res.data.chatId, res.data.userId);
        }
        break;

      case "error":
        msgApi.error(res.data?.message || "Lỗi không xác định");
        break;

      default:
        console.warn("⚠️ Unknown WS event:", res.event);
        break;
    }
  };

  useEffect(() => {
    connectWS();
    return () => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.close();
      }
    };
  }, []);

  const sendWS = (event: string, data: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      const payload = { event, data, timestamp: Date.now() };
      wsRef.current.send(JSON.stringify(payload));
      console.log("📤 WS Sent:", event, data);
    } else {
      msgApi.error("Mất kết nối WebSocket. Đang kết nối lại...");
      console.warn("WS not ready, current state:", wsRef.current?.readyState);
    }
  };

  return (
    <WSContext.Provider value={{ sendWS, isConnected }}>
      {contextHolder}
      {children}
    </WSContext.Provider>
  );
};
