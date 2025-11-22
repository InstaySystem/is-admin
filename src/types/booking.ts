import { OrderRoom } from "./order";

export interface Booking {
  id: number;
  booking_number: string;
  guest_full_name: string;
  guest_email?: string;
  guest_phone?: string;
  check_in: string;
  check_out: string;
  room_type: string;
  room_number: number;
  guest_number: string;
  booked_on: string;
  source: string;
  total_net_price?: number;
  total_sell_price: number;
  promotion_name?: string;
  meal_plan?: string;
  booking_references?: string;
  booking_conditions?: string;
  order_rooms?: OrderRoom[];
}
