"use client";
import { useEffect, useRef, useState } from "react";
import { Button, Input, List, Modal, message, Select, Empty } from "antd";
import { useWS } from "@/app/providers/WSProvider";
import { useMessageStore } from "@/stores/useMessageStore";
import { getChatsForGuest, getChatByIdForGuest } from "@/apis/chat";
import { getDepartmentsFilter } from "@/apis/department";
import { Department } from "@/types/user";

export default function GuestChat() {
  const { sendWS, isConnected } = useWS();
  const chats = useMessageStore((s) => s.chats);
  const messagesMap = useMessageStore((s) => s.messages);
  const addOrUpdateChat = useMessageStore((s) => s.addOrUpdateChat);
  const addMessage = useMessageStore((s) => s.addMessage);
  const markRead = useMessageStore((s) => s.markRead);
  const setCurrentUser = useMessageStore((s) => s.setCurrentUser);

  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [newChatModalOpen, setNewChatModalOpen] = useState(false);
  const [newReceiverID, setNewReceiverID] = useState<number | null>(null);
  const [messageContent, setMessageContent] = useState("");
  const [loading, setLoading] = useState(false);

  const messageEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messagesMap, selectedChatId]);

  useEffect(() => {
    setCurrentUser("guest-user", "guest");
  }, [setCurrentUser]);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const res = await getChatsForGuest();
        if (res.data?.data?.chats) {
          res.data.data.chats.forEach((c: any) => addOrUpdateChat(c));
        }
      } catch (err) {
        console.error("Lỗi tải chat:", err);
        message.error("Không tải được phòng chat cũ");
      }
    };
    fetchChats();
  }, [addOrUpdateChat]);

  const handleNewChat = async () => {
    try {
      setLoading(true);
      const res = await getDepartmentsFilter();
      if (res.data?.data?.departments) {
        setDepartments(res.data.data.departments);
        setNewChatModalOpen(true);
      }
    } catch (err) {
      console.error("Lỗi tải phòng ban:", err);
      message.error("Không tải được phòng ban");
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = () => {
    if (!isConnected) {
      message.warning("Đang kết nối WebSocket...");
      return;
    }

    if (!messageContent.trim()) {
      message.warning("Nội dung không được để trống");
      return;
    }

    if (!selectedChatId && !newReceiverID) {
      message.warning("Chọn phòng ban để gửi tin nhắn");
      return;
    }

    const payload: any = {
      content: messageContent,
    };

    if (selectedChatId) {
      payload.chat_id = selectedChatId;
    } else if (newReceiverID) {
      payload.receiver_id = newReceiverID;
    }

    sendWS("send_message", payload);

    setMessageContent("");

    if (!selectedChatId && newReceiverID) {
      const dep = departments.find((d) => d.id === newReceiverID);
      const tempChatId = `temp-chat-${newReceiverID}`;

      const newChat = {
        id: tempChatId,
        name: dep?.display_name || "Phòng mới",
        department_id: dep?.id,
        receiver_id: dep?.id,
        code: `${newReceiverID}`,
      };

      addOrUpdateChat(newChat);
      setSelectedChatId(tempChatId);
      setNewChatModalOpen(false);
      setNewReceiverID(null);
    }
  };

  const selectedMessages = selectedChatId
    ? messagesMap[selectedChatId] || []
    : [];

  const loadMessagesForChat = async (chatCode: string, chatId: string) => {
    try {
      console.log("🔍 Loading messages for code:", chatCode);
      const res = await getChatByIdForGuest(chatCode);
      console.log("📨 API Response:", res.data);

      if (res.data?.data?.chat.messages) {
        console.log("✅ Messages found:", res.data.data.chat.messages.length);

        res.data.data.chat.messages.forEach((msg: any) => {
          addMessage(chatId, {
            id: msg.id,
            chat_id: chatId,
            sender_id: msg.sender_type === "guest" ? "guest" : "staff",
            sender_name: msg.sender_type === "guest" ? "Bạn" : "Nhân viên",
            sender_type: msg.sender_type,
            content: msg.content,
            created_at: msg.created_at,
            read_by: msg.is_read ? [msg.sender_type] : [],
            image_key: msg.image_key,
          });
        });
      }

      markRead(chatId, "guest");
    } catch (err) {
      console.error("❌ Lỗi tải tin nhắn:", err);
      message.error("Không tải được tin nhắn cũ");
    }
  };

  const handleSelectChat = async (chatId: string, code: string) => {
    setSelectedChatId(chatId);

    await loadMessagesForChat(code, chatId);
    if (isConnected) {
      sendWS("mark_read", {
        chat_id: chatId,
      });
    }

    markRead(chatId, "guest");
  };

  return (
    <div className="flex h-[550px] bg-gray-50">
      <div className="w-80 bg-white border-r border-gray-200 p-4 flex flex-col overflow-hidden">
        <Button
          type="primary"
          className="mb-4 w-full"
          onClick={handleNewChat}
          loading={loading}
        >
          Tạo cuộc trò chuyện mới
        </Button>

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
                onClick={() => handleSelectChat(chat.id, chat.code)}
              >
                <div className="w-full">
                  <div className="font-semibold text-gray-900">{chat.name}</div>
                  {chat.last_message && (
                    <div className="text-sm text-gray-500 truncate mt-1">
                      {chat.last_message?.content}
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
              selectedMessages.map((msg) => {
                const isGuest = msg.sender_type === "guest";

                return (
                  <div
                    key={msg.id}
                    className={`mb-4 p-3 rounded-lg max-w-xs flex ${
                      isGuest
                        ? "ml-auto bg-blue-100 flex-row-reverse"
                        : "bg-white border border-gray-200"
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-xs font-bold text-white mr-2">
                      {isGuest ? "GU" : "ST"}
                    </div>

                    <div>
                      {!isGuest && (
                        <div className="text-xs font-semibold text-gray-600 mb-1">
                          {msg.sender_name || "Nhân viên"}
                        </div>
                      )}
                      <div className="text-sm text-gray-900">{msg.content}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(msg.created_at).toLocaleTimeString("vi-VN")}
                      </div>
                    </div>
                  </div>
                );
              })
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
            disabled={!isConnected}
            className="flex-1"
          />
          <Button
            type="primary"
            onClick={handleSendMessage}
            disabled={!isConnected}
          >
            Gửi
          </Button>
        </div>
      </div>

      <Modal
        open={newChatModalOpen}
        title="Tạo cuộc trò chuyện mới"
        onCancel={() => {
          setNewChatModalOpen(false);
          setNewReceiverID(null);
        }}
        footer={[
          <Button
            key="cancel"
            onClick={() => {
              setNewChatModalOpen(false);
              setNewReceiverID(null);
            }}
          >
            Hủy
          </Button>,
          <Button
            key="send"
            type="primary"
            onClick={handleSendMessage}
            disabled={!newReceiverID || !messageContent.trim()}
          >
            Gửi
          </Button>,
        ]}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">
              Chọn phòng ban
            </label>
            <Select
              style={{ width: "100%" }}
              placeholder="Chọn phòng ban..."
              options={departments.map((d) => ({
                value: d.id,
                label: d.display_name,
              }))}
              onChange={(value) => setNewReceiverID(value)}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Tin nhắn</label>
            <Input.TextArea
              placeholder="Nội dung tin nhắn"
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              rows={4}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
