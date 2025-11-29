import React, { useEffect } from "react";
import { getChatsForAdmin, getChatByIdForAdmin } from "@/apis/chat";

export default function AdminChatPage() {
  useEffect(() => {
    try {
      const fetchChats = async () => {
        const res = await getChatsForAdmin();
        console.log("Chats for admin:", res.data.data.chats);
      };
      fetchChats();
    } catch (error) {
      console.error("Error fetching chats for admin:", error);
    }
  }, []);
  return <div>page</div>;
}
