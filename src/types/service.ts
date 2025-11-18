import { OmitProps } from "antd/es/transfer/ListBody";
import { User } from "./user";
import { Department } from "./user";

export interface ServiceType {
  id: number;
  name: string;
  slug: string;
  created_at: string;
  updated_at: string;
  created_by_id: number;
  updated_by_id?: number;
  department_id: number;

  department?: Department;
  created_by?: User;
  updated_by?: User;
  services?: Service[];
  service_count: number;
}

export interface Service {
  id: number;
  name: string;
  slug: string;
  price: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;

  created_by_id: number;
  updated_by_id: number;
  service_type_id: number;

  service_type: ServiceType;
  created_by?: User;
  updated_by?: User;
  service_images?: ServiceImage[];
}

export interface ServiceImage {
  id: number;
  service_id: number;
  key: string;
  is_thumbnail: boolean;
  sort_order: number;

  service?: Service;
}

export interface CreateServiceImageRequest {
  key: string;
  is_thumbnail: boolean;
  sort_order: number;
}

export interface CreateServiceRequest
  extends Pick<Service, "name" | "price" | "is_active" | "service_type_id"> {
  images?: CreateServiceImageRequest[];
}
