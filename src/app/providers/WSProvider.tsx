/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { message } from "antd";
import { useMessageStore } from "@/stores/useMessageStore";
import { useAppStore } from "@/stores/useAppStore";

interface WSContextProps {
  sendWS: (event: string, data: any) => void;
  isConnected: boolean;
  reconnect: () => void;
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
  const shouldReconnect = useRef(true);
  const [isConnected, setIsConnected] = useState(false);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { chats, addMessage, addOrUpdateChat, markRead } = useMessageStore();
  const [msgApi, contextHolder] = message.useMessage();
  const role = useAppStore((s) => s._role);

  const reconnect = () => {
    if (!isConnected) {
      connectWS();
    }
  };

  const connectWS = () => {
    if (role === "admin") return;

    if (wsRef.current) {
      console.log("WS already exists, skip connect");
      return;
    }

    shouldReconnect.current = true;

    try {
      const url = "http://localhost:8080/api/v1/ws";
      const ws = new WebSocket(url);

      wsRef.current = ws;

      ws.onopen = () => {
        console.log("✅ WS Connected");
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
        console.error("❌ WS Error", e);
      };

      ws.onclose = () => {
        console.log("⚠️ WS Closed");
        setIsConnected(false);
        wsRef.current = null;

        if (shouldReconnect.current && reconnectAttemptsRef.current < 5) {
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
      case "new_message": {
        if (!res.data) return;

        const chatId = res.data.chatId || res.data.chat_id;

        addMessage(chatId, res.data);

        const currentChat = chats.find((c) => c.id === chatId);

        if (currentChat) {
          addOrUpdateChat({
            ...currentChat,
            last_message: {
              id: res.data.id,
              content: res.data.content,
              sender_type: res.data.sender_type,
              created_at: res.data.created_at,
              is_read:
                res.data.sender_type === "staff" ||
                res.data.read_by?.includes("staff"),
            },
          });
        }

        break;
      }

      case "chat_updated":
        if (res.data) addOrUpdateChat(res.data);
        break;

      case "mark_read": {
        console.log("✅ mark_read:", res.data);

        const { chat_id, reader_id, reader_type, read_at } = res.data || {};

        if (!chat_id || !reader_id) return;

        markRead(
          chat_id.toString(),
          reader_id.toString(),
          reader_type.toString(),
          read_at.toString()
        );

        const store = useMessageStore.getState();
        const chats = store.chats;
        const currentChat = chats.find((c) => c.id === chat_id.toString());

        if (currentChat?.last_message) {
          addOrUpdateChat({
            ...currentChat,
            last_message: {
              ...currentChat.last_message,
              is_read: true,
              read_at: read_at || currentChat.last_message.read_at,
              read_by: reader_type || "Anonymous",
            },
          });
        }

        break;
      }

      case "error":
        msgApi.error(res.data?.message || "Lỗi không xác định");
        break;

      default:
        console.warn("Unknown WS event:", res.event);
    }
  };

  useEffect(() => {
    connectWS();

    return () => {
      shouldReconnect.current = false;

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }

      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }

      setIsConnected(false);
    };
  }, [role]);

  const sendWS = (event: string, data: any) => {
    const ws = wsRef.current;

    if (!ws || ws.readyState !== WebSocket.OPEN) {
      console.warn("⚠️ WS chưa sẵn sàng, bỏ send:", event);
      return;
    }

    const payload = { event, data, timestamp: Date.now() };
    ws.send(JSON.stringify(payload));
    console.log("📤 WS Sent:", event, data);
  };

  return (
    <WSContext.Provider value={{ sendWS, isConnected, reconnect }}>
      {contextHolder}
      {children}
    </WSContext.Provider>
  );
};
