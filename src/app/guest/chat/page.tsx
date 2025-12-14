/* eslint-disable react-hooks/immutability */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Input, Empty, message } from "antd";
import { useWS } from "@/app/providers/WSProvider";
import { useMessageStore } from "@/stores/useMessageStore";
import { getChatsForGuest } from "@/apis/chat";
import { useAppStore } from "@/stores/useAppStore";
import { SendOutlined } from "@ant-design/icons";

export default function GuestChat() {
  const { sendWS, isConnected } = useWS();
  const { setRole } = useAppStore();

  const addOrUpdateChat = useMessageStore((s) => s.addOrUpdateChat);
  const addMessage = useMessageStore((s) => s.addMessage);
  const setCurrentUser = useMessageStore((s) => s.setCurrentUser);
  const messagesMap = useMessageStore((s) => s.messages);

  const [chatId, setChatId] = useState<string | null>(null);
  const [chatCode, setChatCode] = useState<string | undefined>();
  const [messageContent, setMessageContent] = useState("");

  const messageEndRef = useRef<HTMLDivElement>(null);
  const hasInitialized = useRef(false);

  useEffect(() => {
    setRole("guest");
    setCurrentUser("guest-user", "guest");
  }, [setRole, setCurrentUser]);

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;
    fetchChat();
  }, []);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messagesMap, chatId]);

  const messages = useMemo(() => {
    if (!chatId) return [];
    return messagesMap[chatId] || [];
  }, [messagesMap, chatId]);

  const fetchChat = async () => {
    try {
      const res = await getChatsForGuest();
      const chat = res.data?.data?.chat;

      if (!chat) {
        message.warning("Chưa có phòng chat");
        return;
      }

      addOrUpdateChat(chat);
      setChatId(chat.id);
      setChatCode(chat.code);

      await loadMessages(chat.code, chat.id);
    } catch (err) {
      console.error(err);
      message.error("Không tải được phòng chat");
    }
  };

  const loadMessages = async (code: string | undefined, id: string) => {
    try {
      const res = await getChatsForGuest();
      const msgs = res.data?.data?.chat?.messages || [];

      msgs.forEach((msg: any) => {
        addMessage(id, {
          id: msg.id,
          chat_id: id,
          sender_type: msg.sender_type,
          sender_id: msg.sender_type === "guest" ? "guest" : "staff",
          sender_name: msg.sender_type === "guest" ? "Bạn" : "Nhân viên",
          content: msg.content,
          created_at: msg.created_at,
          is_read: msg.is_read,
          read_by: msg.is_read ? [msg.sender_type] : [],
          read_at: msg.read_at,
          reader_type: msg.reader_type,
          last_reader_type: msg.last_reader_type,
        });
      });

      if (isConnected) {
        sendWS("mark_read", { chat_id: id });
      }
    } catch (err) {
      console.error(err);
      message.error("Không tải được tin nhắn");
    }
  };

  const handleSendMessage = () => {
    if (!isConnected) {
      message.warning("Đang kết nối...");
      return;
    }

    if (!chatId) {
      message.warning("Chưa có chat ID");
      return;
    }

    if (!messageContent.trim()) {
      return;
    }

    try {
      sendWS("send_message", {
        chat_id: chatId,
        content: messageContent,
      });

      setMessageContent("");
    } catch (err) {
      console.error("Error sending message:", err);
      message.error("Lỗi gửi tin nhắn");
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] bg-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold shadow-md">
            CS
          </div>
          <div className="flex-1">
            <h2 className="text-base font-semibold text-gray-900">
              Hỗ trợ khách hàng
            </h2>
            <p className="text-xs text-gray-500">
              {isConnected ? (
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  Đang hoạt động
                </span>
              ) : (
                <span className="text-gray-400">Đang kết nối...</span>
              )}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 bg-gray-50">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <Empty
              description="Chưa có tin nhắn"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          </div>
        ) : (
          <div className="space-y-2">
            {messages.map((msg, index) => {
              const isGuest = msg.sender_type === "guest";
              const isReadByStaff =
                isGuest && (msg.is_read || msg.read_by?.includes("staff"));
              const showTime =
                index === 0 ||
                Math.abs(
                  new Date(msg.created_at).getTime() -
                    new Date(messages[index - 1].created_at).getTime()
                ) >=
                  10 * 60 * 1000;
              return (
                <div key={msg.id}>
                  {showTime && (
                    <div className="text-center my-4">
                      <span className="text-xs text-gray-400 bg-white px-3 py-1 rounded-full shadow-sm">
                        {new Date(msg.created_at).toLocaleString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  )}

                  <div
                    className={`flex items-end gap-2 ${
                      isGuest ? "flex-row-reverse" : "flex-row"
                    }`}
                  >
                    {!isGuest && (
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-xs font-medium shadow-sm flex-shrink-0">
                        NV
                      </div>
                    )}

                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-2 shadow-sm ${
                        isGuest
                          ? "bg-blue-500 text-white rounded-br-sm"
                          : "bg-white text-gray-900 border border-gray-100 rounded-bl-sm"
                      }`}
                    >
                      <p className="text-sm leading-relaxed break-words">
                        {msg.content}
                      </p>
                    </div>
                  </div>

                  {/* Read Status for Guest Messages */}
                  {isGuest && (
                    <div className="flex justify-end mt-0.5 mr-1">
                      <span
                        className={`text-[10px] ${
                          isReadByStaff
                            ? "text-blue-500 font-medium"
                            : "text-gray-400"
                        }`}
                      >
                        {isReadByStaff ? "Đã xem" : "Đã gửi"}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
            <div ref={messageEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 px-3 py-2 shadow-lg">
        <div className="flex items-end gap-2">
          <div className="flex-1 bg-gray-100 rounded-full px-4 py-2 flex items-center">
            <Input
              placeholder="Aa"
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              onPressEnter={handleSendMessage}
              disabled={!isConnected}
              bordered={false}
              className="bg-transparent text-sm placeholder:text-gray-400"
              style={{ padding: 0 }}
            />
          </div>

          <button
            onClick={handleSendMessage}
            disabled={!isConnected || !messageContent.trim()}
            className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
              isConnected && messageContent.trim()
                ? "bg-blue-500 text-white shadow-md active:scale-95"
                : "bg-gray-200 text-gray-400"
            }`}
          >
            <SendOutlined className="text-base" />
          </button>
        </div>
      </div>
    </div>
  );
}
