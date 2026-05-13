// ── Inventario ──────────────────────────────────────────────
export interface Branch {
    id: number;
    name: string;
    direccion: string;
}

export interface BranchRef {
    id: number;
    name?: string;
    direccion?: string;
}

export interface Warehouse {
    id: number;
    name?: string;
    inBranch?: BranchRef;
}

export interface WarehouseInput {
    name: string;
    inBranch?: { id: number };
}

export interface Product {
    id: number;
    name: string;
    sku: string;
    stock: number;
    inWarehouse?: Warehouse;
}

export interface ProductInput {
    name: string;
    sku: string;
    stock: number;
    inWarehouse?: { id: number };
}

// ── Pedidos ──────────────────────────────────────────────────
export type OrderStatus =
    | "PENDIENTE"
    | "EN_PROCESO"
    | "ENVIADO"
    | "ENTREGADO"
    | "CANCELADO";

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
