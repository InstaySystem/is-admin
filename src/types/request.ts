export interface RequestType {
  id: number;
  name: string;
  slug: string;
  department_id: number;
  created_at: string;
  updated_at: string;
  created_by_id: number;
  updated_by_id: number;
}

export interface CreateRequestTypeRequest {
  name: string;
  department_id: number;
}

export interface UpdateRequestTypeRequest {
  name?: string;
  department_id?: number;
}
