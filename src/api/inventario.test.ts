import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { API } from "./config";
import {
    getBranches,
    getBranch,
    createBranch,
    updateBranch,
    deleteBranch,
    getWarehouses,
    createWarehouse,
    getProducts,
    createProduct,
    updateProduct,
    deleteProduct,
} from "./inventario";

function mockFetchOnce(body: unknown, ok = true) {
    return vi.fn().mockResolvedValue({
        ok,
        json: () => Promise.resolve(body),
    });
}

describe("api/inventario", () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("getBranches fetches the branches endpoint and parses JSON", async () => {
        const branches = [{ id: 1, name: "Central", direccion: "Main St" }];
        const fetchMock = mockFetchOnce(branches);
        vi.stubGlobal("fetch", fetchMock);

        const result = await getBranches();

        expect(fetchMock).toHaveBeenCalledWith(`${API}/branches`);
        expect(result).toEqual(branches);
    });

    it("getBranch fetches a single branch by id", async () => {
        const branch = { id: 5, name: "Norte", direccion: "Av. Norte 1" };
        const fetchMock = mockFetchOnce(branch);
        vi.stubGlobal("fetch", fetchMock);

        const result = await getBranch(5);

        expect(fetchMock).toHaveBeenCalledWith(`${API}/branches/5`);
        expect(result).toEqual(branch);
    });

    it("createBranch posts JSON with the right headers", async () => {
        const created = { id: 1, name: "Sur", direccion: "Av. Sur 1" };
        const fetchMock = mockFetchOnce(created);
        vi.stubGlobal("fetch", fetchMock);

        const result = await createBranch({ name: "Sur", direccion: "Av. Sur 1" });

        expect(fetchMock).toHaveBeenCalledWith(`${API}/branches`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: "Sur", direccion: "Av. Sur 1" }),
        });
        expect(result).toEqual(created);
    });

    it("updateBranch sends a PUT request to the branch id endpoint", async () => {
        const updated = { id: 1, name: "Sur Editado", direccion: "Av. Sur 1" };
        const fetchMock = mockFetchOnce(updated);
        vi.stubGlobal("fetch", fetchMock);

        const result = await updateBranch(1, { name: "Sur Editado", direccion: "Av. Sur 1" });

        expect(fetchMock).toHaveBeenCalledWith(`${API}/branches/1`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: "Sur Editado", direccion: "Av. Sur 1" }),
        });
        expect(result).toEqual(updated);
    });

    it("deleteBranch sends a DELETE request and resolves to undefined", async () => {
        const fetchMock = vi.fn().mockResolvedValue({ ok: true });
        vi.stubGlobal("fetch", fetchMock);

        const result = await deleteBranch(1);

        expect(fetchMock).toHaveBeenCalledWith(`${API}/branches/1`, { method: "DELETE" });
        expect(result).toBeUndefined();
    });

    it("getWarehouses fetches the warehouses endpoint", async () => {
        const warehouses = [{ id: 1, name: "Bodega Central" }];
        const fetchMock = mockFetchOnce(warehouses);
        vi.stubGlobal("fetch", fetchMock);

        const result = await getWarehouses();

        expect(fetchMock).toHaveBeenCalledWith(`${API}/warehouses`);
        expect(result).toEqual(warehouses);
    });

    it("createWarehouse posts the warehouse payload including branch ref", async () => {
        const created = { id: 1, name: "Bodega Norte", inBranch: { id: 2 } };
        const fetchMock = mockFetchOnce(created);
        vi.stubGlobal("fetch", fetchMock);

        const result = await createWarehouse({ name: "Bodega Norte", inBranch: { id: 2 } });

        expect(fetchMock).toHaveBeenCalledWith(`${API}/warehouses`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: "Bodega Norte", inBranch: { id: 2 } }),
        });
        expect(result).toEqual(created);
    });

    it("getProducts fetches the products endpoint", async () => {
        const products = [{ id: 1, name: "Notebook", sku: "SKU-1", stock: 10 }];
        const fetchMock = mockFetchOnce(products);
        vi.stubGlobal("fetch", fetchMock);

        const result = await getProducts();

        expect(fetchMock).toHaveBeenCalledWith(`${API}/products`);
        expect(result).toEqual(products);
    });

    it("createProduct posts the product payload", async () => {
        const created = { id: 2, name: "Mouse", sku: "SKU-2", stock: 5 };
        const fetchMock = mockFetchOnce(created);
        vi.stubGlobal("fetch", fetchMock);

        const result = await createProduct({ name: "Mouse", sku: "SKU-2", stock: 5 });

        expect(fetchMock).toHaveBeenCalledWith(`${API}/products`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: "Mouse", sku: "SKU-2", stock: 5 }),
        });
        expect(result).toEqual(created);
    });

    it("updateProduct sends a PUT to the product id endpoint", async () => {
        const updated = { id: 2, name: "Mouse Pro", sku: "SKU-2", stock: 8 };
        const fetchMock = mockFetchOnce(updated);
        vi.stubGlobal("fetch", fetchMock);

        const result = await updateProduct(2, { name: "Mouse Pro", sku: "SKU-2", stock: 8 });

        expect(fetchMock).toHaveBeenCalledWith(`${API}/products/2`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: "Mouse Pro", sku: "SKU-2", stock: 8 }),
        });
        expect(result).toEqual(updated);
    });

    it("deleteProduct sends a DELETE request and resolves to undefined", async () => {
        const fetchMock = vi.fn().mockResolvedValue({ ok: true });
        vi.stubGlobal("fetch", fetchMock);

        const result = await deleteProduct(2);

        expect(fetchMock).toHaveBeenCalledWith(`${API}/products/2`, { method: "DELETE" });
        expect(result).toBeUndefined();
    });
});
