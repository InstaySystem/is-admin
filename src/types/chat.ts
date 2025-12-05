/* eslint-disable @typescript-eslint/no-explicit-any */
export interface Chat {
  order_room?: any;
  id: string;
  code?: string | undefined;
  name?: string;
  department_id?: number;
  last_message?: any;
  last_message_time?: string;
  unread_count?: number;
  receiver_id?: number;
  updated_at?: string;
  department?: any;
}

export interface ChatMessage {
  reader_type: any;
  read_at: any;
  id: string;
  chat_id: string;
  sender_id: string;
  sender_name: string;
  sender_type: "guest" | "staff" | "department";
  content: string;
  image_key?: string;
  created_at: string;
  read_by: string[];
}
