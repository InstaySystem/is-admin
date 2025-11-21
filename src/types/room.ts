import { User } from "./user";

export interface Room {
  id: string;
  name: string;
  slug: string;
  created_at: string;
  updated_at: string;

  room_type_id: string;
  floor_id: string;

  room_type?: RoomType;
  floor?: Floor;
  created_by?: User;
  updated_by?: User;
}

export interface RoomType {
  id: string;
  name: string;
  slug: string;
  created_at: string;
  updated_at: string;
  created_by: User;
  updated_by: User;
  room_count: string;
  rooms: Room[];
}

export interface Floor {
  id: string;
  name: string;
  rooms?: Room[];
}

export interface CreateRoomRequest {
  name: string;
  floor: string;
  room_type_id: string;
}

export interface UpdateRoomRequest {
  name?: string;
  floor?: string;
  room_type_id?: string;
}

export interface CreateRoomTypeRequest {
  name: string;
}

export interface UpdateRoomTypeRequest {
  name: string;
}
