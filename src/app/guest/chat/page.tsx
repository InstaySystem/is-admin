/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect, useRef, useState } from "react";
import { Button, Input, Modal, message, Select, Empty } from "antd";
import { useWS } from "@/app/providers/WSProvider";
import { useMessageStore } from "@/stores/useMessageStore";
import { getChatsForGuest, getChatByIdForGuest } from "@/apis/chat";
import { getDepartmentsFilter } from "@/apis/department";
import { Department } from "@/types/user";
import { Chat } from "@/types/chat";
import { useAppStore } from "@/stores/useAppStore";

export default function GuestChat() {
  const { sendWS, isConnected } = useWS();
  const chats = useMessageStore((s) => s.chats);
  const messagesMap = useMessageStore((s) => s.messages);
  const addOrUpdateChat = useMessageStore((s) => s.addOrUpdateChat);
  const addMessage = useMessageStore((s) => s.addMessage);
  const setCurrentUser = useMessageStore((s) => s.setCurrentUser);
  const { _role, setRole } = useAppStore();

  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [newChatModalOpen, setNewChatModalOpen] = useState(false);
  const [newReceiverID, setNewReceiverID] = useState<number | null>(null);
  const [messageContent, setMessageContent] = useState("");
  const [loading, setLoading] = useState(false);

  const messageEndRef = useRef<HTMLDivElement>(null);
  const hasInitialized = useRef(false);
  const [showSidebar, setShowSidebar] = useState(true);

  useEffect(() => {
    setRole("guest");
  }, []);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messagesMap, selectedChatId]);

  useEffect(() => {
    setCurrentUser("guest-user", "guest");
  }, [setCurrentUser]);

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

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    fetchChats();
  }, []);

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

    if (!selectedChatId && newReceiverID) {
      const dep = departments.find((d) => d.id === newReceiverID);
      const tempChatId = `temp_${newReceiverID}_${Date.now()}`;
      const chatId = `${newReceiverID.toString()}`;
      const now = new Date().toISOString();

      const newMessageData = {
        id: Date.now().toString(),
        chat_id: tempChatId,
        sender_id: "guest",
        sender_name: "Bạn",
        sender_type: "guest",
        content: messageContent,
        created_at: now,
        read_by: ["guest"],
        read_at: "null",
        reader_type: "staff",
        last_reader_type: "staff",
        is_read: false,
      };

      sendWS("new_message", {
        id: tempChatId,
        name: dep?.display_name || "Phòng mới",
        code: `${newReceiverID}`,
        department_id: dep?.id,
        receiver_id: dep?.id,
        department: dep,
        order_room: null,
        last_message: {
          id: newMessageData.id,
          sender_id: "guest",
          sender_name: "Bạn",
          sender_type: "guest",
          content: messageContent,
          created_at: now,
          read_by: ["guest"],
        },
        staff_read: {
          read_at: null,
        },
        last_reader_type: null,
        is_read: false,
      });

      setSelectedChatId(chatId);
      setNewChatModalOpen(false);
      setNewReceiverID(null);
    } else if (selectedChatId) {
      const currentChat = chats.find((c) => c.id === selectedChatId);
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
            last_reader_type: msg.last_reader_type,
            is_read: msg.is_read,
          });
        });

        if (messages.length > 0) {
          const lastMsg = messages[messages.length - 1];
          const currentChat = chats.find((c) => c.id === chatId);
          if (currentChat) {
            const isRead =
              lastMsg.sender_type === "guest" ||
              lastMsg.is_read ||
              lastMsg.reader_type === "guest";

            addOrUpdateChat({
              ...currentChat,
              last_message: {
                id: lastMsg.id,
                content: lastMsg.content,
                sender_type: lastMsg.sender_type,
                created_at: lastMsg.created_at,
                is_read: isRead,
                read_at: lastMsg.read_at,
                reader_type: lastMsg.reader_type,
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
  };

  return (
    <div className="flex h-[580px] bg-gray-50">
      <div
        className={`
    ${showSidebar ? "w-full" : "hidden"} 
    md:w-80 md:block
    bg-white border-r border-gray-200 p-4 flex flex-col overflow-hidden
  `}
      >
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
          <div className="py-2 overflow-y-auto">
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
                  onClick={() => {
                    handleSelectChat(chat.id, chat.code);
                    setShowSidebar(false);
                  }}
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
                          ${
                            hasUnread
                              ? "text-gray-900 font-medium"
                              : "text-gray-500"
                          }
                        `}
                          >
                            {chat.last_message.sender_type === "guest" && (
                              <span className="text-gray-400">Bạn: </span>
                            )}
                            {chat.last_message.content}
                          </p>
                        </div>
                      )}

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

      <div
        className={`
    ${!showSidebar ? "w-full" : "hidden"} 
    md:flex-1 md:flex
    flex flex-col bg-white 
  `}
      >
        {selectedChatId && (
          <div className="md:hidden flex items-center gap-3 p-4 border-b border-gray-200 bg-white">
            <button
              onClick={() => setShowSidebar(true)}
              className="text-blue-500 font-semibold"
            >
              ← Quay lại
            </button>
            <div className="font-semibold text-gray-900">
              {
                chats.find((c) => c.id === selectedChatId)?.department
                  ?.display_name
              }
            </div>
          </div>
        )}

        <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
          {selectedChatId ? (
            selectedMessages.length === 0 ? (
              <Empty description="Chưa có tin nhắn nào" />
            ) : (
              selectedMessages.map((msg) => {
                const isGuest = msg.sender_type === "guest";
                const isReadByStaff =
                  isGuest && (msg.is_read || msg.read_by?.includes("staff"));

                return (
                  <div
                    key={msg.id}
                    className={`mb-4 flex ${
                      msg.sender_type === "guest"
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`
                    p-3 rounded-lg max-w-[75%] sm:max-w-xs flex gap-2
                    ${
                      msg.sender_type === "guest"
                        ? "bg-blue-100 flex-row-reverse"
                        : "bg-white border border-gray-200"
                    }
                  `}
                    >
                      <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-xs font-bold text-white shrink-0">
                        {msg.sender_type === "guest" ? "GU" : "ST"}
                      </div>

                      <div className="flex-1">
                        <div className="text-sm text-gray-900 break-words">
                          {msg.content}
                        </div>
                        <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                          <span>
                            {new Date(msg.created_at).toLocaleTimeString(
                              "vi-VN"
                            )}
                          </span>

                          {msg.sender_type === "guest" && (
                            <>
                              {isReadByStaff ? (
                                <span className="text-blue-500 font-medium">
                                  ✔✔ Đã xem
                                </span>
                              ) : (
                                <span className="text-gray-400">✔ Đã gửi</span>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )
          ) : (
            <div className="h-full flex items-center justify-center">
              <Empty description="Chọn phòng chat" />
            </div>
          )}
          <div ref={messageEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-gray-200">
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
