import { API } from "./config";
import type { Order, OrderStatus } from "../types";

export const getOrders = (): Promise<Order[]> =>
  fetch(`${API}/orders`).then((r) => r.json());

export const getOrder = (id: number): Promise<Order> =>
  fetch(`${API}/orders/${id}`).then((r) => r.json());

export const createOrder = (data: Omit<Order, "id" | "createdAt" | "updatedAt">): Promise<Order> =>
  fetch(`${API}/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then((r) => r.json());

export const updateOrderStatus = (id: number, status: OrderStatus): Promise<Order> =>
  fetch(`${API}/orders/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  }).then((r) => r.json());

export const updateOrder = (id: number, data: Partial<Order>): Promise<Order> =>
  fetch(`${API}/orders/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then((r) => r.json());

export const deleteOrder = (id: number): Promise<void> =>
  fetch(`${API}/orders/${id}`, { method: "DELETE" }).then(() => undefined);
