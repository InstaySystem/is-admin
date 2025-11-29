/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { Button, Input, List, Modal, message, Select } from "antd";
import { useWS } from "@/app/providers/WSProvider";
import { useMessageStore } from "@/stores/useMessageStore";
import { getChatsForGuest } from "@/apis/chat";
import { getDepartmentsFilter } from "@/apis/department";
import { Department } from "@/types/user";

interface Chat {
  id: number;
  name: string;
  last_message?: string;
}

export default function GuestChat() {
  const { sendMessage } = useWS();
  const messages = useMessageStore((s) => s.messages);
  const addMessage = useMessageStore((s) => s.addMessage);

  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [newChatModalOpen, setNewChatModalOpen] = useState(false);
  const [newReceiverID, setNewReceiverID] = useState<number | null>(null);
  const [messageContent, setMessageContent] = useState("");

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const res = await getChatsForGuest();
        setChats(res.data.data.chats);
      } catch (err) {
        console.error(err);
        message.error("Không tải được phòng chat cũ");
      }
    };
    fetchChats();
  }, []);

  const handleNewChat = async () => {
    try {
      const res = await getDepartmentsFilter();
      setDepartments(res.data.data.departments);
      setNewChatModalOpen(true);
    } catch (err) {
      console.error(err);
      message.error("Không tải được phòng ban");
    }
  };

  const handleSendMessage = () => {
    if (!messageContent.trim())
      return message.warning("Nội dung không được để trống");

    const payload: any = { content: messageContent };
    if (selectedChat) payload.chat_id = selectedChat.id;
    else if (newReceiverID) payload.receiver_id = newReceiverID;

    sendMessage(payload);

    addMessage({
      ...payload,
      created_at: new Date().toISOString(),
      chat_name: selectedChat?.name || "Phòng mới",
    });

    setMessageContent("");

    if (!selectedChat && newReceiverID) {
      setChats((prev) => [
        ...prev,
        {
          id: Math.random(),
          name:
            departments.find((d) => d.id === newReceiverID)?.display_name ||
            "Phòng mới",
        },
      ]);
      setSelectedChat(chats[chats.length - 1] || null);
      setNewChatModalOpen(false);
      setNewReceiverID(null);
    }
  };

  return (
    <div className="flex h-screen">
      <div className="w-80 bg-white border-r p-4 flex flex-col overflow-auto">
        <Button type="primary" className="mb-4" onClick={handleNewChat}>
          New Chat
        </Button>
        <List
          dataSource={chats}
          renderItem={(chat) => (
            <List.Item
              className={`cursor-pointer ${
                selectedChat?.id === chat.id ? "bg-gray-100" : ""
              }`}
              onClick={() => setSelectedChat(chat)}
            >
              <div>
                <div className="font-semibold">{chat.name}</div>
                {chat.last_message && (
                  <div className="text-sm text-gray-500">
                    {chat.last_message}
                  </div>
                )}
              </div>
            </List.Item>
          )}
        />
      </div>

      <div className="flex-1 flex flex-col p-4">
        <div className="flex-1 border rounded p-2 mb-2 overflow-auto">
          {selectedChat || newReceiverID ? (
            messages
              .filter((msg) =>
                selectedChat
                  ? msg.chat_id === selectedChat.id
                  : msg.receiver_id === newReceiverID
              )
              .map((msg, i) => (
                <div key={i} className="mb-2">
                  <div className="text-sm text-gray-700">{msg.content}</div>
                  <div className="text-xs text-gray-400">
                    {new Date(msg.created_at).toLocaleTimeString()}
                  </div>
                </div>
              ))
          ) : (
            <div>Chọn phòng chat hoặc tạo mới</div>
          )}
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Nhập tin nhắn..."
            value={messageContent}
            onChange={(e) => setMessageContent(e.target.value)}
            onPressEnter={handleSendMessage}
          />
          <Button type="primary" onClick={handleSendMessage}>
            Gửi
          </Button>
        </div>
      </div>

      <Modal
        open={newChatModalOpen}
        title="Chọn phòng ban"
        onCancel={() => setNewChatModalOpen(false)}
        footer={[
          <Button key="cancel" onClick={() => setNewChatModalOpen(false)}>
            Hủy
          </Button>,
          <Button key="send" type="primary" onClick={handleSendMessage}>
            Gửi
          </Button>,
        ]}
      >
        <Select
          style={{ width: "100%" }}
          placeholder="Chọn phòng ban..."
          options={departments.map((d) => ({
            value: d.id,
            label: d.display_name,
          }))}
          onChange={(value) => setNewReceiverID(value)}
        />
        <Input.TextArea
          className="mt-4"
          placeholder="Nội dung tin nhắn"
          value={messageContent}
          onChange={(e) => setMessageContent(e.target.value)}
          rows={4}
        />
      </Modal>
    </div>
  );
}
