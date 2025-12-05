/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect, useRef, useState } from "react";
import { Input, Button, message, Empty } from "antd";
import { useWS } from "@/app/providers/WSProvider";
import { useMessageStore } from "@/stores/useMessageStore";
import { getChatsForAdmin, getChatByIdForAdmin } from "@/apis/chat";

export default function AdminChatPage() {
  const { sendWS, isConnected, reconnect } = useWS();
  const chats = useMessageStore((s) => s.chats);
  const messagesMap = useMessageStore((s) => s.messages);
  const addOrUpdateChat = useMessageStore((s) => s.addOrUpdateChat);
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

  useEffect(() => {
    if (selectedChatId && messagesMap[selectedChatId]) {
      const messages = messagesMap[selectedChatId];
      if (messages.length > 0) {
        const lastMsg = messages[messages.length - 1];
        const currentChat = chats.find((c) => c.id === selectedChatId);

        if (currentChat && currentChat.last_message?.id !== lastMsg.id) {
          addOrUpdateChat({
            ...currentChat,
            last_message: {
              id: lastMsg.id,
              content: lastMsg.content,
              sender_type: lastMsg.sender_type,
              created_at: lastMsg.created_at,
              is_read:
                lastMsg.read_by?.includes("staff") ||
                lastMsg.sender_type === "staff",
            },
          });
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messagesMap, selectedChatId]);

  const handleSelectChat = async (chatId: string) => {
    setSelectedChatId(chatId);

    try {
      const res = await getChatByIdForAdmin(chatId);
      if (res.data?.data?.chat?.messages) {
        const messages = res.data.data.chat.messages;
        loadMessages(chatId, messages);

        // Update last_message cho chat
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
                is_read:
                  lastMsg.sender_type === "staff" || !!lastMsg.staff_read,
              },
            });
          }
        }
      }

      if (isConnected) {
        sendWS("mark_read", {
          chat_id: chatId,
        });
      }
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

    const payload = {
      chat_id: selectedChatId,
      content: messageContent,
    };

    sendWS("send_message", payload);

    // Update last_message cho chat hiện tại
    const currentChat = chats.find((c) => c.id === selectedChatId);
    if (currentChat) {
      addOrUpdateChat({
        ...currentChat,
        last_message: {
          id: Date.now().toString(),
          content: messageContent,
          sender_type: "staff",
          created_at: new Date().toISOString(),
          is_read: true,
        },
      });
    }

    setMessageContent("");
  };

  const handleSelectChatSafe = (chatId: string) => {
    if (!isConnected) {
      message.warning("Đang kết nối lại máy chủ...");
      console.log("Đang kết nối lại máy chủ");
      reconnect();
      return;
    }

    handleSelectChat(chatId);
  };

  const selectedMessages = selectedChatId
    ? messagesMap[selectedChatId] || []
    : [];

  return (
    <div className="flex h-[600px] bg-gray-50">
      <div className="w-72 bg-white border-r border-gray-200 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">Cuộc trò chuyện</h2>
        </div>

        <div className="flex-1 overflow-y-auto">
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
                  chat.last_message.sender_type !== "staff";
                const displayName =
                  chat.order_room?.booking?.booking_number ||
                  chat.name ||
                  "Khách";
                const roomName = chat.order_room?.room?.name;

                return (
                  <div
                    key={chat.id}
                    className={`
                      px-3 py-2 mx-2 mb-1 rounded-lg cursor-pointer transition-all duration-200
                      ${
                        isSelected ? "bg-blue-50 shadow-sm" : "hover:bg-gray-50"
                      }
                    `}
                    onClick={() => handleSelectChatSafe(chat.id)}
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
                        {typeof roomName === "string" && roomName.length > 0
                          ? roomName.toUpperCase()
                          : "?"}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3
                            className={`
                            font-semibold text-sm truncate
                            ${isSelected ? "text-blue-600" : "text-gray-900"}
                            ${hasUnread ? "font-bold" : ""}
                          `}
                          >
                            {displayName}
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
                              {chat.last_message.sender_type === "staff" && (
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
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col p-4 bg-white">
        <div className="flex-1 border border-gray-200 rounded-lg p-4 mb-4 overflow-y-auto bg-gray-50">
          {selectedChatId ? (
            selectedMessages.length === 0 ? (
              <Empty description="Chưa có tin nhắn nào" />
            ) : (
              selectedMessages.map((msg) => {
                const isStaff = msg.sender_type === "staff";

                return (
                  <div
                    key={msg.id}
                    className={`mb-4 p-3 rounded-lg max-w-xs flex ${
                      isStaff
                        ? "ml-auto bg-blue-100 flex-row-reverse"
                        : "bg-white border border-gray-200"
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-xs font-bold text-white mr-2">
                      {isStaff ? "ST" : "GU"}
                    </div>

                    <div>
                      {!isStaff && (
                        <div className="text-xs font-semibold text-gray-600 mb-1">
                          {msg.sender_name || "Khách"}
                        </div>
                      )}
                      <div className="text-sm text-gray-900">{msg.content}</div>
                      <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                        <span>
                          {new Date(msg.created_at).toLocaleTimeString("vi-VN")}
                        </span>

                        {msg.sender_type === "staff" &&
                          msg.reader_type === "guest" &&
                          msg.read_at && (
                            <span className="text-blue-500 font-medium">
                              ✔ Đã xem
                            </span>
                          )}
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
