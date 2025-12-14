/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Input, Button, message, Empty } from "antd";
import { SearchOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { useWS } from "@/app/providers/WSProvider";
import { useMessageStore } from "@/stores/useMessageStore";
import { getChatsForAdmin, getChatByIdForAdmin } from "@/apis/chat";

export default function AdminChatPage() {
  const { sendWS, isConnected, reconnect } = useWS();
  const messagesMap = useMessageStore((s) => s.messages);
  const loadMessages = useMessageStore((s) => s.loadMessages);
  const setCurrentUser = useMessageStore((s) => s.setCurrentUser);
  const { selectedChatId, setSelectedChatId, chats, addOrUpdateChat } =
    useMessageStore();
  const [messageContent, setMessageContent] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const messageEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messagesMap, selectedChatId]);

  useEffect(() => {
    setCurrentUser("staff-user", "staff");
  }, [setCurrentUser]);

  const fetchChats = useCallback(async () => {
    try {
      const res = await getChatsForAdmin({});
      if (res.data?.data?.chats) {
        res.data.data.chats.forEach((c: any) => addOrUpdateChat(c));
      }
    } catch (err) {
      console.error("Lỗi tải chat:", err);
      message.error("Không tải được danh sách phòng chat");
    }
  }, [addOrUpdateChat]);

  useEffect(() => {
    fetchChats();
  }, []);

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const res = await getChatsForAdmin({ search: searchQuery });
        if (res.data?.data?.chats) {
          setSearchResults(res.data.data.chats);
        } else {
          setSearchResults([]);
        }
      } catch (err) {
        console.error("Lỗi tìm kiếm:", err);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    if (selectedChatId && messagesMap[selectedChatId]) {
      const messages = messagesMap[selectedChatId];
      if (messages.length > 0) {
        const lastMsg = messages[messages.length - 1];
        const currentChat = chats.find((c) => c.id === selectedChatId);

        if (currentChat && currentChat.last_message?.id !== lastMsg.id) {
          const isRead =
            lastMsg.sender_type === "staff" ||
            lastMsg.read_by?.includes("staff") ||
            lastMsg.reader_type === "staff";

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
  }, [messagesMap, selectedChatId, chats, addOrUpdateChat]);

  const handleSelectChat = async (chatId: string) => {
    setSelectedChatId(chatId);

    try {
      const res = await getChatByIdForAdmin(chatId);
      const messages = res.data?.data?.chat?.messages || [];

      loadMessages(chatId, messages);

      if (messages.length === 0) return;

      const lastMsg = messages[messages.length - 1];
      const currentChat = chats.find((c) => c.id === chatId);
      if (!currentChat) return;

      addOrUpdateChat({
        ...currentChat,
        last_message: {
          id: lastMsg.id,
          content: lastMsg.content,
          sender_type: lastMsg.sender_type,
          created_at: lastMsg.created_at,
          is_read: lastMsg.is_read,
          read_at: lastMsg.read_at,
          reader_type: lastMsg.reader_type,
        },
      });

      if (isConnected && lastMsg.sender_type !== "staff" && !lastMsg.is_read) {
        sendWS("mark_read", { chat_id: chatId });
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
      reconnect();
      return;
    }

    handleSelectChat(chatId);
  };

  const handleSearchResultClick = (chatId: string) => {
    setIsSearchMode(false);
    setSearchQuery("");
    setSearchResults([]);

    handleSelectChatSafe(chatId);
  };

  const handleBackToChats = () => {
    setIsSearchMode(false);
    setSearchQuery("");
    setSearchResults([]);
  };

  const selectedMessages = selectedChatId
    ? messagesMap[selectedChatId] || []
    : [];

  const renderChatItem = (chat: any, onClick: (id: string) => void) => {
    const isSelected = selectedChatId === chat.id;
    const hasUnread =
      chat.last_message &&
      !chat.last_message.is_read &&
      chat.last_message.sender_type !== "staff";
    const displayName = chat.order_room?.booking?.booking_number || chat.name;
    const roomName = chat.order_room?.room?.name;

    return (
      <div
        key={chat.id}
        className={`
          px-3 py-2 mx-2 mb-1 rounded-lg cursor-pointer transition-all duration-200
          ${isSelected ? "bg-blue-50 shadow-sm" : "hover:bg-gray-50"}
        `}
        onClick={() => onClick(chat.id)}
      >
        <div className="flex items-start gap-3">
          <div
            className={`
            w-12 h-12 rounded-full flex items-center justify-center shrink-0 text-white font-bold text-sm
            ${
              isSelected
                ? "bg-blue-500"
                : "bg-gradient-to-br from-blue-400 to-blue-600"
            }
          `}
          >
            {typeof roomName === "string" && roomName.length > 0
              ? roomName.substring(0, 3).toUpperCase()
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

            {chat.last_message ? (
              <div className="flex items-center gap-1">
                <p
                  className={`
                  text-sm truncate flex-1
                  ${hasUnread ? "text-gray-900 font-medium" : "text-gray-500"}
                `}
                >
                  {chat.last_message.sender_type === "staff" && (
                    <span className="text-gray-400">Bạn: </span>
                  )}
                  {chat.last_message.content}
                </p>
              </div>
            ) : (
              <div className="text-sm text-gray-900">Chưa có tin nhắn</div>
            )}

            {chat.last_message && (
              <div className="text-xs text-gray-400 mt-1">
                {new Date(chat.last_message.created_at).toLocaleTimeString(
                  "vi-VN",
                  {
                    hour: "2-digit",
                    minute: "2-digit",
                  }
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-[600px] bg-gray-50">
      <div className="w-72 bg-white border-r border-gray-200 flex flex-col overflow-hidden">
        {!isSearchMode ? (
          <>
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800 mb-3">
                Cuộc trò chuyện
              </h2>

              <Input
                placeholder="Tìm kiếm..."
                prefix={<SearchOutlined className="text-gray-400" />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchMode(true)}
                allowClear
                className="rounded-lg"
              />
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
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                </div>
              ) : (
                <div className="py-2">
                  {chats.map((chat) =>
                    renderChatItem(chat, handleSelectChatSafe)
                  )}
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center gap-3 mb-3">
                <Button
                  type="text"
                  icon={<ArrowLeftOutlined />}
                  onClick={handleBackToChats}
                  className="flex items-center justify-center"
                />
                <h2 className="text-xl font-bold text-gray-800">Tìm kiếm</h2>
              </div>

              <Input
                placeholder="Tìm kiếm..."
                prefix={<SearchOutlined className="text-gray-400" />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                allowClear
                autoFocus
                className="rounded-lg"
              />
            </div>

            <div className="flex-1 overflow-y-auto">
              {isSearching ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                    <span className="text-gray-400 text-sm">
                      Đang tìm kiếm...
                    </span>
                  </div>
                </div>
              ) : !searchQuery.trim() ? (
                <div className="flex items-center justify-center h-full">
                  <Empty
                    description={
                      <span className="text-gray-400">
                        Nhập từ khóa để tìm kiếm
                      </span>
                    }
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                </div>
              ) : searchResults.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <Empty
                    description={
                      <span className="text-gray-400">
                        Không tìm thấy kết quả
                      </span>
                    }
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                </div>
              ) : (
                <div className="py-2">
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">
                    Kết quả tìm kiếm ({searchResults.length})
                  </div>
                  {searchResults.map((chat) =>
                    renderChatItem(chat, handleSearchResultClick)
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <div className="flex-1 flex flex-col p-4 bg-white">
        <div className="flex-1 overflow-y-auto px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 mb-4">
          {selectedChatId ? (
            selectedMessages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <Empty
                  description="Chưa có tin nhắn nào"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              </div>
            ) : (
              <div className="space-y-2">
                {selectedMessages.map((msg, index) => {
                  const isStaff = msg.sender_type === "staff";
                  const isReadByGuest =
                    isStaff && (msg.is_read || msg.read_by?.includes("guest"));

                  const showTime =
                    index === 0 ||
                    Math.abs(
                      new Date(msg.created_at).getTime() -
                        new Date(
                          selectedMessages[index - 1].created_at
                        ).getTime()
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
                          isStaff ? "flex-row-reverse" : "flex-row"
                        }`}
                      >
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-medium shadow-sm flex-shrink-0 ${
                            isStaff
                              ? "bg-gradient-to-br from-blue-500 to-indigo-600"
                              : "bg-gradient-to-br from-gray-400 to-gray-500"
                          }`}
                        >
                          {isStaff
                            ? `${msg.sender?.first_name?.trim()[0] ?? ""}${
                                msg.sender?.last_name?.trim()[0] ?? ""
                              }`.toUpperCase()
                            : "GU"}
                        </div>

                        <div
                          className={`max-w-[75%] rounded-2xl px-4 py-2 shadow-sm ${
                            isStaff
                              ? "bg-blue-500 text-white rounded-br-sm"
                              : "bg-white text-gray-900 border border-gray-100 rounded-bl-sm"
                          }`}
                        >
                          <p className="text-sm leading-relaxed break-words">
                            {msg.content}
                          </p>
                        </div>
                      </div>

                      {isStaff && (
                        <div className="flex justify-end mt-0.5 mr-1">
                          <span
                            className={`text-[10px] ${
                              isReadByGuest
                                ? "text-blue-500 font-medium"
                                : "text-gray-400"
                            }`}
                          >
                            {isReadByGuest ? "Đã xem" : "Đã gửi"}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
                <div ref={messageEndRef} />
              </div>
            )
          ) : (
            <div className="flex items-center justify-center h-full">
              <Empty
                description="Chọn phòng chat"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            </div>
          )}
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
