import { API } from "./config";
import type { Order, OrderItem, OrderStatus } from "../types";

interface OrderResponseDTO {
    id: number;
    customerName?: string;
    status: OrderStatus;
    createdAt?: string;
    productList?: Array<{ productId: number; quantity: number }>;
}

interface OrderCreateDTO {
    customerName: string;
    status: OrderStatus;
    productList: Array<{ productId: number; quantity: number }>;
}

const mapOrderResponse = (data: OrderResponseDTO): Order => ({
    id: data.id,
    customerName: data.customerName,
    status: data.status,
    createdAt: data.createdAt,
    items: data.productList?.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
    })),
});

const mapOrderList = (data: OrderResponseDTO[]): Order[] =>
    data.map(mapOrderResponse);

const toCreatePayload = (data: {
    customerName: string;
    status: OrderStatus;
    items: OrderItem[];
}): OrderCreateDTO => ({
    customerName: data.customerName,
    status: data.status,
    productList: data.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
    })),
});

export const getOrders = (): Promise<Order[]> =>
    fetch(`${API}/orders`)
        .then((r) => r.json())
        .then(mapOrderList);

export const getOrder = (id: number): Promise<Order> =>
    fetch(`${API}/orders/${id}`)
        .then((r) => r.json())
        .then(mapOrderResponse);

export const createOrder = (data: {
    customerName: string;
    status: OrderStatus;
    items: OrderItem[];
}): Promise<Order> =>
    fetch(`${API}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toCreatePayload(data)),
    })
        .then((r) => r.json())
        .then((response) => mapOrderResponse(response as OrderResponseDTO));

export const updateOrderStatus = (
    id: number,
    status: OrderStatus,
): Promise<void> =>
    fetch(`${API}/orders/${id}/status?status=${encodeURIComponent(status)}`, {
        method: "PATCH",
    }).then(() => undefined);

export const deleteOrder = (id: number): Promise<void> =>
    fetch(`${API}/orders/${id}`, { method: "DELETE" }).then(() => undefined);
