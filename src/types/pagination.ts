export interface Pagination {
  total: number;
  page: number;
  limit: number;
  total_pages: number;
  has_prev: boolean;
  has_next: boolean;
}
