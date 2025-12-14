/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useMessageStore } from "@/stores/useMessageStore";
import { useAppStore } from "@/stores/useAppStore";
import { getChatsForGuest } from "@/apis/chat";
import { getChatsForAdmin } from "@/apis/chat";

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

  const { chats, addMessage, addOrUpdateChat, markRead, setIsHaveNewMessage } =
    useMessageStore();
  const role = useAppStore((s) => s._role);
  console.log("role: ", role);

  const reconnect = () => {
    if (!isConnected) {
      connectWS();
    }
  };

  const connectWS = () => {
    if (wsRef.current) {
      return;
    }

    shouldReconnect.current = true;

    try {
      const url = `${process.env.NEXT_PUBLIC_API_URL}/ws`;
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
      };

      ws.onclose = () => {
        console.log("WS Closed");
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

  const handleWSMessage = async (res: any) => {
    const currentRole = useAppStore.getState()._role;

    switch (res.event) {
      case "new_message": {
        if (!res.data) return;

        setIsHaveNewMessage(true);

        console.log("new message data:", res);

        const chatId = res.data.chat_id;

        addMessage(chatId, res.data);

        const currentChat = chats.find((c) => c.id === chatId);
        const selectedChatId = useMessageStore.getState().selectedChatId;

        if (role?.startsWith("staff")) {
          try {
            const resChats = await getChatsForAdmin();
            if (resChats.data?.data?.chats) {
              resChats.data.data.chats.forEach((c: any) => addOrUpdateChat(c));
            }
          } catch (err) {
            console.error(err);
          }
        } else {
          try {
            const resChats = await getChatsForGuest();
            if (resChats.data?.data?.chats) {
              resChats.data.data.chats.forEach((c: any) => addOrUpdateChat(c));
            }
          } catch (err) {
            console.error(err);
          }
        }

        const isAdminOpeningThisRoom = selectedChatId === chatId;

        const isRead =
          res.data.sender_type === currentRole ||
          res.data.read_by?.includes(currentRole) ||
          isAdminOpeningThisRoom;

        if (!currentChat) {
          const newChat = {
            id: chatId,
            name: res.data.sender_type || "",
            last_message: {
              id: res.data.id,
              content: res.data.content,
              sender_type: res.data.sender_type,
              created_at: res.data.created_at,
              is_read: isRead,
            },
          };

          addOrUpdateChat(newChat);
        } else {
          addOrUpdateChat({
            ...currentChat,
            last_message: {
              id: res.data.id,
              content: res.data.content,
              sender_type: res.data.sender_type,
              created_at: res.data.created_at,
              is_read: isRead,
            },
          });
        }

        if (isAdminOpeningThisRoom && wsRef.current) {
          const payload = {
            event: "mark_read",
            data: {
              chat_id: chatId,
            },
            timestamp: Date.now(),
          };

          wsRef.current.send(JSON.stringify(payload));
        }

        break;
      }

      case "mark_read": {
        const { chat_id, reader_id, reader_type, read_at } = res.data || {};

        if (!chat_id) return;

        markRead(
          chat_id,
          reader_id,
          reader_type,
          read_at || new Date().toISOString()
        );

        break;
      }

      case "error":
        console.log(res);
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
      console.warn("WS not ready, exclude send:", event);
      return;
    }

    const payload = { event, data, timestamp: Date.now() };
    ws.send(JSON.stringify(payload));
    console.log("WS Sent:", event, data);
  };

  return (
    <WSContext.Provider value={{ sendWS, isConnected, reconnect }}>
      {children}
    </WSContext.Provider>
  );
};
