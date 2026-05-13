import { API } from "./config";
import type { Order, OrderItem, OrderStatus } from "../types";

// ── Tipos internos alineados al schema pedidos.json ──────────────────────

interface ProductQuantity {
    productId: number;
    quantity: number;
}

interface OrderCreatePayload {
    customerName: string;
    status: string;
    productList: ProductQuantity[];
}

interface OrderProductDTO {
    productId: number;
    quantity: number;
    product?: {
        id: number;
        name?: string;
        sku?: string;
        stock?: number;
    };
}

interface OrderResponseDTO {
    id: number;
    customerName?: string;
    status: string;
    createdAt?: string;
    productList?: OrderProductDTO[];
}

// ── Helpers ───────────────────────────────────────────────────────────────

const mapOrder = (d: OrderResponseDTO): Order => ({
    id: d.id,
    customerName: d.customerName,
    status: d.status as OrderStatus,
    createdAt: d.createdAt,
    items: d.productList?.map(i => ({ productId: i.productId, quantity: i.quantity })),
});

/** Lanza un error con el mensaje del backend si la respuesta no es OK */
const checkOk = async (r: Response): Promise<Response> => {
    if (r.ok) return r;
    let msg = `Error ${r.status}`;
    try {
        const body = await r.json();
        msg = body?.message ?? body?.error ?? JSON.stringify(body) ?? msg;
    } catch {
        try { msg = await r.text(); } catch { /* ignore */ }
    }
    throw new Error(msg);
};

// ── Endpoints ─────────────────────────────────────────────────────────────

export const getOrders = (): Promise<Order[]> =>
    fetch(`${API}/orders`)
        .then(checkOk)
        .then(r => r.json())
        .then((data: OrderResponseDTO[]) =>
            Array.isArray(data) ? data.map(mapOrder) : []
        );

export const getOrder = (id: number): Promise<Order> =>
    fetch(`${API}/orders/${id}`)
        .then(checkOk)
        .then(r => r.json())
        .then(mapOrder);

export const createOrder = (data: {
    customerName: string;
    status: OrderStatus;
    items: OrderItem[];
}): Promise<Order> => {
    // Payload exacto según schema pedidos.json → Order / ProductQuantity
    const payload: OrderCreatePayload = {
        customerName: data.customerName,
        status: data.status,
        productList: data.items.map(i => ({
            productId: i.productId,
            quantity: i.quantity,
        })),
    };

    console.log("[createOrder] payload →", JSON.stringify(payload, null, 2));

    return fetch(`${API}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    })
        .then(checkOk)
        .then(r => r.json())
        .then(mapOrder);
};

export const updateOrderStatus = (id: number, status: OrderStatus): Promise<void> =>
    fetch(`${API}/orders/${id}/status?status=${encodeURIComponent(status)}`, {
        method: "PATCH",
    })
        .then(checkOk)
        .then(() => undefined);

export const deleteOrder = (id: number): Promise<void> =>
    fetch(`${API}/orders/${id}`, { method: "DELETE" })
        .then(checkOk)
        .then(() => undefined);
