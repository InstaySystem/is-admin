export interface Room {
  id: number;
  name: string;
  type: "single" | "double" | "suite";
  price: number;
  capacity: number;
  amenities: string[];
  available: boolean;
}