import { OrderRoom } from "./order";
export interface CreateReviewRequest {
  email: string;
  content: string;
  star: number;
}

export interface Review {
  created_at: string | number | Date;
  id: number;
  orderRoomId: number;
  email: string;
  star: number;
  content: string;
  createdAt: string;
  updatedAt: string;

  orderRoom: OrderRoom[];
}

export type ReviewPaginationQuery = {
  page?: number;
  limit?: number;
  sort?: string;
  order?: "asc" | "desc";
  filter?: string;
  from?: string;
  to?: string;
};
