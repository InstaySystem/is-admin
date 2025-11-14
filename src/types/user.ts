export interface Department {
  id: number;
  name?: string;
  display_name?: string;
  description?: string;
  staff_count?: number;
}

export interface User {
  id: number;
  username?: string;
  email?: string;
  phone?: string;
  role?: string;
  is_active?: boolean;
  first_name?: string;
  last_name?: string;
  created_at?: string;
  department?: Department;
}

export interface UpdateInforRequest {
  first_name?: string;
  last_name?: string;
  phone?: string;
  email?: string;
}

export interface UpdateUserRequest {
  username?: string;
  email?: string;
  phone?: string;
  first_name?: string;
  last_name?: string;
  role?: "staff" | "admin";
  is_active?: boolean;
  department_id?: number;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  phone: string;
  password: string;
  role: "staff" | "admin";
  is_active: boolean;
  first_name: string;
  last_name: string;
  department_id?: number | null;
}
