/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect, useRef, useState } from "react";
import { Button, Input, List, Modal, message, Select, Empty } from "antd";
import { useWS } from "@/app/providers/WSProvider";
import { useMessageStore } from "@/stores/useMessageStore";
import { getChatsForGuest, getChatByIdForGuest } from "@/apis/chat";
import { getDepartmentsFilter } from "@/apis/department";
import { Department } from "@/types/user";
import { Chat } from "@/types/chat";

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

  useEffect(() => {
    if (selectedChatId && messagesMap[selectedChatId]) {
      const messages = messagesMap[selectedChatId];
      if (messages.length > 0) {
        const lastMsg = messages[messages.length - 1];
        const currentChat = chats.find((c) => c.id === selectedChatId);
        if (currentChat) {
          addOrUpdateChat({
            ...currentChat,
            last_message: {
              id: lastMsg.id,
              content: lastMsg.content,
              sender_type: lastMsg.sender_type,
              created_at: lastMsg.created_at,
              is_read:
                lastMsg.read_by?.includes("guest") ||
                lastMsg.sender_type === "guest",
            },
          });
        }
      }
    }
  }, [messagesMap, selectedChatId]);

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

    const currentChatId = selectedChatId || newReceiverID?.toString();
    if (currentChatId) {
      const currentChat = chats.find((c) => c.id === currentChatId);
      if (currentChat) {
        addOrUpdateChat({
          ...currentChat,
          last_message: {
            id: Date.now().toString(),
            content: messageContent,
            sender_type: "guest",
            created_at: new Date().toISOString(),
            is_read: true,
          },
        });
      }
    }

    setMessageContent("");

    if (!selectedChatId && newReceiverID) {
      const dep = departments.find((d) => d.id === newReceiverID);
      const tempChatId = newReceiverID.toString();

      const newChat: Chat = {
        id: tempChatId,
        name: dep?.display_name || "Phòng mới",
        department_id: dep?.id,
        receiver_id: dep?.id,
        code: `${newReceiverID}`,
        last_message: {
          id: Date.now().toString(),
          content: messageContent,
          sender_type: "guest",
          created_at: new Date().toISOString(),
          is_read: true,
        },
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

  const loadMessagesForChat = async (
    chatCode: string | undefined,
    chatId: string
  ) => {
    try {
      const res = await getChatByIdForGuest(chatCode);
      if (res.data?.data?.chat.messages) {
        const messages = res.data.data.chat.messages;
        messages.forEach((msg: any) => {
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
            read_at: msg.read_at,
            reader_type: msg.reader_type,
          });
        });

        if (messages.length > 0) {
          const lastMsg = messages[messages.length - 1];
          const currentChat = chats.find((c) => c.id === chatId);
          if (currentChat) {
            addOrUpdateChat({
              ...currentChat,
              last_message: {
                id: lastMsg.id,
                content: lastMsg.content,
                sender_type: lastMsg.sender_type,
                created_at: lastMsg.created_at,
                is_read: lastMsg.is_read,
              },
            });
          }
        }
      }

      if (isConnected) {
        sendWS("mark_read", { chat_id: chatId });
      }
    } catch (err) {
      console.error("❌ Lỗi tải tin nhắn:", err);
      message.error("Không tải được tin nhắn cũ");
    }
  };

  const handleSelectChat = async (chatId: string, code: string | undefined) => {
    setSelectedChatId(chatId);

    await loadMessagesForChat(code, chatId);
    if (isConnected) {
      sendWS("mark_read", {
        chat_id: chatId,
      });
    }

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
          <div className="flex items-center justify-center h-full">
            <Empty
              description={
                <span className="text-gray-400">
                  Chưa có cuộc trò chuyện nào
                </span>
              }
            />
          </div>
        ) : (
          <div className="py-2">
            {chats.map((chat) => {
              const isSelected = selectedChatId === chat.id;
              const hasUnread =
                chat.last_message &&
                !chat.last_message.is_read &&
                chat.last_message.sender_type !== "guest";

              return (
                <div
                  key={chat.id}
                  className={`
            px-3 py-2 mx-2 mb-1 rounded-lg cursor-pointer transition-all duration-200
            ${isSelected ? "bg-blue-50 shadow-sm" : "hover:bg-gray-50"}
          `}
                  onClick={() => handleSelectChat(chat.id, chat.code)}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`
              w-12 h-12 rounded-full flex items-center justify-center shrink-0 text-white font-bold text-sm
              ${
                isSelected
                  ? "bg-blue-500"
                  : "bg-linear-to-br from-blue-400 to-blue-600"
              }
            `}
                    >
                      {chat.department?.display_name
                        ?.charAt(0)
                        ?.toUpperCase() || "?"}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3
                          className={`
                  font-semibold truncate
                  ${isSelected ? "text-blue-600" : "text-gray-900"}
                  ${hasUnread ? "font-bold" : ""}
                `}
                        >
                          {chat.department?.display_name}
                        </h3>
                        {hasUnread && (
                          <div className="w-2.5 h-2.5 bg-blue-500 rounded-full shrink-0 ml-2"></div>
                        )}
                      </div>

                      {chat.last_message && (
                        <div className="flex items-center gap-1">
                          <p
                            className={`
                    text-sm truncate flex-1
                    ${hasUnread ? "text-gray-900 font-medium" : "text-gray-500"}
                  `}
                          >
                            {chat.last_message.sender_type === "guest" && (
                              <span className="text-gray-400">Bạn: </span>
                            )}
                            {chat.last_message.content}
                          </p>
                        </div>
                      )}

                      {/* Timestamp */}
                      {chat.last_message && (
                        <div className="text-xs text-gray-400 mt-1">
                          {new Date(
                            chat.last_message.created_at
                          ).toLocaleTimeString("vi-VN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col p-4 bg-white">
        <div className="flex-1 border border-gray-200 rounded-lg p-4 mb-4 overflow-y-auto bg-gray-50">
          {selectedChatId ? (
            selectedMessages.length === 0 ? (
              <Empty description="Chưa có tin nhắn nào" />
            ) : (
              selectedMessages.map((msg, index) => {
                const isGuest = msg.sender_type === "guest";

                return (
                  <div
                    key={index}
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
                      <div className="text-sm text-gray-900 px-2">
                        {msg.content}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(msg.created_at).toLocaleTimeString("vi-VN")}
                      </div>
                      {msg.read_at && (
                        <span className="text-xs text-gray-400">
                          Đã xem lúc{" "}
                          {new Date(msg.read_at).toLocaleTimeString("vi-VN")}
                        </span>
                      )}
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
