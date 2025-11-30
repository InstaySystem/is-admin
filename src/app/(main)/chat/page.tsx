/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect, useRef, useState } from "react";
import { List, Input, Button, message, Empty } from "antd";
import { useWS } from "@/app/providers/WSProvider";
import { useMessageStore } from "@/stores/useMessageStore";
import { getChatsForAdmin, getChatByIdForAdmin } from "@/apis/chat";

export default function AdminChatPage() {
  const { sendWS, isConnected } = useWS();
  const chats = useMessageStore((s) => s.chats);
  const messagesMap = useMessageStore((s) => s.messages);
  const addOrUpdateChat = useMessageStore((s) => s.addOrUpdateChat);
  const addMessage = useMessageStore((s) => s.addMessage);
  const markRead = useMessageStore((s) => s.markRead);
  const loadMessages = useMessageStore((s) => s.loadMessages);
  const setCurrentUser = useMessageStore((s) => s.setCurrentUser);

  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [messageContent, setMessageContent] = useState("");
  const messageEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messagesMap, selectedChatId]);

  useEffect(() => {
    setCurrentUser("staff-user", "staff");
  }, [setCurrentUser]);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const res = await getChatsForAdmin();
        if (res.data?.data?.chats) {
          res.data.data.chats.forEach((c: any) => addOrUpdateChat(c));
        }
      } catch (err) {
        console.error("Lỗi tải chat:", err);
        message.error("Không tải được danh sách phòng chat");
      }
    };
    fetchChats();
  }, [addOrUpdateChat]);

  const handleSelectChat = async (chatId: string) => {
    setSelectedChatId(chatId);

    try {
      const res = await getChatByIdForAdmin(chatId);
      if (res.data?.data?.chat?.messages) {
        loadMessages(chatId, res.data.data.chat.messages);
      }
      if (isConnected) {
        sendWS("mark_read", {
          chat_id: chatId,
        });
      }
      markRead(chatId, "staff");
    } catch (err) {
      console.error("Lỗi tải tin nhắn:", err);
      message.error("Không tải được tin nhắn");
    }
  };

  const handleSendMessage = () => {
    if (!isConnected) {
      message.warning("Đang kết nối WebSocket...");
      return;
    }

    if (!selectedChatId) {
      message.warning("Chọn phòng chat trước");
      return;
    }

    if (!messageContent.trim()) {
      message.warning("Nội dung không được để trống");
      return;
    }

    sendWS("send_message", {
      chat_id: selectedChatId,
      content: messageContent,
    });

    setMessageContent("");
  };

  const selectedMessages = selectedChatId
    ? messagesMap[selectedChatId] || []
    : [];

  return (
    <div className="flex h-[600px] bg-gray-50">
      <div className="w-80 bg-white border-r border-gray-200 p-4 flex flex-col overflow-hidden">
        <h2 className="font-bold text-lg mb-4 text-gray-900">
          Cuộc trò chuyện
        </h2>

        {chats.length === 0 ? (
          <Empty description="Không có phòng chat nào" />
        ) : (
          <List
            dataSource={chats}
            className="flex-1 overflow-auto"
            renderItem={(chat) => (
              <List.Item
                className={`cursor-pointer p-3 rounded transition-colors ${
                  selectedChatId === chat.id
                    ? "bg-blue-50 border-l-4 border-blue-500"
                    : "hover:bg-gray-50"
                }`}
                onClick={() => handleSelectChat(chat.id)}
              >
                <div className="w-full">
                  <div className="font-semibold text-gray-900">
                    {chat.order_room?.booking?.guest_name || chat.name}
                  </div>
                  {chat.last_message?.content && (
                    <div className="text-sm text-gray-500 truncate mt-1">
                      {chat.last_message.content}
                    </div>
                  )}
                </div>
              </List.Item>
            )}
          />
        )}
      </div>

      <div className="flex-1 flex flex-col p-4 bg-white">
        <div className="flex-1 border border-gray-200 rounded-lg p-4 mb-4 overflow-y-auto bg-gray-50">
          {selectedChatId ? (
            selectedMessages.length === 0 ? (
              <Empty description="Chưa có tin nhắn nào" />
            ) : (
              selectedMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`mb-4 p-3 rounded-lg max-w-xs flex ${
                    msg.sender_type === "staff"
                      ? "ml-auto bg-blue-100 flex-row-reverse"
                      : "bg-white border border-gray-200"
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-xs font-bold text-white mr-2">
                    {msg.sender_type === "staff" ? "ST" : "GU"}
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-gray-600 mb-1">
                      {msg.sender_name}
                    </div>
                    <div className="text-sm text-gray-900">{msg.content}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(msg.created_at).toLocaleTimeString("vi-VN")}
                    </div>
                  </div>
                </div>
              ))
            )
          ) : (
            <Empty description="Chọn phòng chat" />
          )}
          <div ref={messageEndRef} />
        </div>

        <div className="flex gap-2">
          <Input
            placeholder="Nhập tin nhắn..."
            value={messageContent}
            onChange={(e) => setMessageContent(e.target.value)}
            onPressEnter={handleSendMessage}
            disabled={!isConnected || !selectedChatId}
            className="flex-1"
          />
          <Button
            type="primary"
            onClick={handleSendMessage}
            disabled={!isConnected || !selectedChatId}
          >
            Gửi
          </Button>
        </div>
      </div>
    </div>
  );
}
