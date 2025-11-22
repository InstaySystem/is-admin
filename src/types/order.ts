import { Room } from "./room";
import { Service } from "./service";
import { User } from "./user";
import { Booking } from "./booking";

export interface OrderService {
  id: number;
  orderRoomId: number;
  serviceId: number;
  quantity: number;
  totalPrice: number;
  status: "pending" | "accepted" | "rejected" | "canceled";
  createdAt: string;
  updatedAt: string;
  guestNote?: string;
  staffNote?: string;
  cancelReason?: string;
  updatedById?: number;

  service?: Service;
  orderRoom?: OrderRoom;
  updatedBy?: User;
}

export interface OrderRoom {
  id: number;
  createdAt: string;
  updatedAt: string;
  createdById: number;
  updatedById: number;
  roomId: number;
  bookingId: number;

  room?: Room;
  booking?: Booking;
  createdBy?: User;
  updatedBy?: User;
  orderServices?: OrderService[];
}
