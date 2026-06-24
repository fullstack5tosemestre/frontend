import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { API } from "./config";
import {
    getOrders,
    getOrder,
    createOrder,
    updateOrderStatus,
    deleteOrder,
} from "./pedidos";

describe("api/pedidos", () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("getOrders maps the backend DTOs into Order objects", async () => {
        const dto = [
            {
                id: 1,
                customerName: "Juan Perez",
                status: "PENDIENTE",
                createdAt: "2026-06-01T10:00:00",
                productList: [{ productId: 5, quantity: 2 }],
            },
        ];
        const fetchMock = vi.fn().mockResolvedValue({
            ok: true,
            json: () => Promise.resolve(dto),
        });
        vi.stubGlobal("fetch", fetchMock);

        const result = await getOrders();

        expect(fetchMock).toHaveBeenCalledWith(`${API}/orders`);
        expect(result).toEqual([
            {
                id: 1,
                customerName: "Juan Perez",
                status: "PENDIENTE",
                createdAt: "2026-06-01T10:00:00",
                items: [{ productId: 5, quantity: 2 }],
            },
        ]);
    });

    it("getOrders returns an empty array when the backend doesn't return an array", async () => {
        const fetchMock = vi.fn().mockResolvedValue({
            ok: true,
            json: () => Promise.resolve(null),
        });
        vi.stubGlobal("fetch", fetchMock);

        const result = await getOrders();

        expect(result).toEqual([]);
    });

    it("getOrders throws with the backend error message when the response is not ok", async () => {
        const fetchMock = vi.fn().mockResolvedValue({
            ok: false,
            status: 500,
            json: () => Promise.resolve({ message: "fallo interno" }),
        });
        vi.stubGlobal("fetch", fetchMock);

        await expect(getOrders()).rejects.toThrow("fallo interno");
    });

    it("getOrders falls back to a generic error message when the body isn't JSON", async () => {
        const fetchMock = vi.fn().mockResolvedValue({
            ok: false,
            status: 404,
            json: () => Promise.reject(new Error("not json")),
            text: () => Promise.resolve("Not Found"),
        });
        vi.stubGlobal("fetch", fetchMock);

        await expect(getOrders()).rejects.toThrow("Not Found");
    });

    it("getOrder fetches and maps a single order", async () => {
        const dto = { id: 7, customerName: "Ana", status: "ENVIADO", createdAt: "2026-06-01T10:00:00" };
        const fetchMock = vi.fn().mockResolvedValue({
            ok: true,
            json: () => Promise.resolve(dto),
        });
        vi.stubGlobal("fetch", fetchMock);

        const result = await getOrder(7);

        expect(fetchMock).toHaveBeenCalledWith(`${API}/orders/7`);
        expect(result.id).toBe(7);
        expect(result.status).toBe("ENVIADO");
    });

    it("createOrder builds the payload with createdAt and productList from items", async () => {
        const saved = { id: 10, customerName: "Nuevo Cliente", status: "PENDIENTE" };
        const fetchMock = vi.fn().mockResolvedValue({
            ok: true,
            json: () => Promise.resolve(saved),
        });
        vi.stubGlobal("fetch", fetchMock);

        await createOrder({
            customerName: "Nuevo Cliente",
            status: "PENDIENTE",
            items: [{ productId: 1, quantity: 3 }],
        });

        expect(fetchMock).toHaveBeenCalledTimes(1);
        const [url, options] = fetchMock.mock.calls[0];
        expect(url).toBe(`${API}/orders`);
        expect(options.method).toBe("POST");
        const body = JSON.parse(options.body);
        expect(body.customerName).toBe("Nuevo Cliente");
        expect(body.status).toBe("PENDIENTE");
        expect(body.productList).toEqual([{ productId: 1, quantity: 3 }]);
        expect(typeof body.createdAt).toBe("string");
    });

    it("updateOrderStatus sends a PATCH with the status as a query param", async () => {
        const fetchMock = vi.fn().mockResolvedValue({ ok: true });
        vi.stubGlobal("fetch", fetchMock);

        const result = await updateOrderStatus(1, "ENTREGADO");

        expect(fetchMock).toHaveBeenCalledWith(
            `${API}/orders/1/status?status=ENTREGADO`,
            { method: "PATCH" },
        );
        expect(result).toBeUndefined();
    });

    it("deleteOrder sends a DELETE request", async () => {
        const fetchMock = vi.fn().mockResolvedValue({ ok: true });
        vi.stubGlobal("fetch", fetchMock);

        const result = await deleteOrder(1);

        expect(fetchMock).toHaveBeenCalledWith(`${API}/orders/1`, { method: "DELETE" });
        expect(result).toBeUndefined();
    });

    it("deleteOrder throws when the backend responds with an error", async () => {
        const fetchMock = vi.fn().mockResolvedValue({
            ok: false,
            status: 404,
            json: () => Promise.resolve({ error: "Pedido no encontrado" }),
        });
        vi.stubGlobal("fetch", fetchMock);

        await expect(deleteOrder(99)).rejects.toThrow("Pedido no encontrado");
    });
});
