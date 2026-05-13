// ── Inventario ──────────────────────────────────────────────
export interface Branch {
  id: number;
  name: string;
  address: string;
  city: string;
  phone?: string;
}

export interface Warehouse {
  id: number;
  name: string;
  location: string;
  capacity: number;
  branchId?: number;
}

export interface Product {
  id: number;
  name: string;
  sku: string;
  description?: string;
  price: number;
  stock: number;
  warehouseId?: number;
}

// ── Pedidos ──────────────────────────────────────────────────
export type OrderStatus = "PENDIENTE" | "EN_PROCESO" | "ENVIADO" | "ENTREGADO" | "CANCELADO";

export interface OrderItem {
  productId: number;
  quantity: number;
  unitPrice?: number;
}

export interface Order {
  id: number;
  customerId?: number;
  customerName?: string;
  status: OrderStatus;
  items?: OrderItem[];
  total?: number;
  createdAt?: string;
  updatedAt?: string;
}

// ── Usuarios ─────────────────────────────────────────────────
export interface Role {
  id: number;
  nombre: string;
  descripcion?: string;
}

export interface User {
  id: number;
  nombre: string;
  apellido: string;
  rut: string;
  email: string;
  password?: string;
  fechaNacimiento?: string;
  direccion?: string;
  fechaRegistro?: string;
  role: Role;
}
