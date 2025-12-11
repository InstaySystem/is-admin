"use client";

import React, { createContext, useContext } from "react";
import { message } from "antd";

interface MessageContextProps {
  success: (msg: string) => void;
  error: (msg: string) => void;
  info: (msg: string) => void;
  warning: (msg: string) => void;
  loading: (msg: string) => void;
}

const MessageContext = createContext<MessageContextProps | null>(null);

export const useMessage = () => {
  const ctx = useContext(MessageContext);
  if (!ctx) throw new Error("useMessage must be used inside MessageProvider");
  return ctx;
};

export default function MessageProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [messageApi, contextHolder] = message.useMessage();

  const api = {
    success: (msg: string) => messageApi.success(msg),
    error: (msg: string) => messageApi.error(msg),
    info: (msg: string) => messageApi.info(msg),
    warning: (msg: string) => messageApi.warning(msg),
    loading: (msg: string) => messageApi.loading(msg),
  };

  return (
    <MessageContext.Provider value={api}>
      {contextHolder}
      {children}
    </MessageContext.Provider>
  );
}
