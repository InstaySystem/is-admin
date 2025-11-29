/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { createContext, useContext, useEffect, useRef } from "react";
import { useMessageStore } from "@/stores/useMessageStore";
import { message } from "antd";

interface WSContextProps {
  sendMessage: (data: any) => void;
}

const WSContext = createContext<WSContextProps | null>(null);

export const useWS = () => {
  const context = useContext(WSContext);
  if (!context) throw new Error("useWS must be used within WSProvider");
  return context;
};

interface WSProviderProps {
  children: React.ReactNode;
}

export const WSProvider: React.FC<WSProviderProps> = ({ children }) => {
  const addMessage = useMessageStore((s) => s.addMessage);
  const wsRef = useRef<WebSocket | null>(null);
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    const ws = new WebSocket(`${process.env.NEXT_PUBLIC_API_URL}/ws`);
    wsRef.current = ws;

    ws.onopen = () => console.log("WebSocket connected");
    ws.onclose = () => console.log("WebSocket closed");
    ws.onerror = (err) => console.error("WebSocket error:", err);

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        addMessage(data);
        messageApi.info(data.content, 10);
      } catch (err) {
        console.error("Failed to parse WS message:", err);
      }
    };

    return () => {
      ws.close();
    };
  }, [addMessage, messageApi]);

  const sendMessage = (data: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    } else {
      console.warn("WebSocket is not open");
    }
  };

  return (
    <WSContext.Provider value={{ sendMessage }}>
      {contextHolder}
      {children}
    </WSContext.Provider>
  );
};
