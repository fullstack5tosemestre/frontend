import { API } from "./config";
import type { Branch, Warehouse, Product } from "../types";

// ── Sucursales ────────────────────────────────────────────────
export const getBranches = (): Promise<Branch[]> =>
  fetch(`${API}/branches`).then((r) => r.json());

export const getBranch = (id: number): Promise<Branch> =>
  fetch(`${API}/branches/${id}`).then((r) => r.json());

export const createBranch = (data: Omit<Branch, "id">): Promise<Branch> =>
  fetch(`${API}/branches`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then((r) => r.json());

export const updateBranch = (id: number, data: Omit<Branch, "id">): Promise<Branch> =>
  fetch(`${API}/branches/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then((r) => r.json());

export const deleteBranch = (id: number): Promise<void> =>
  fetch(`${API}/branches/${id}`, { method: "DELETE" }).then(() => undefined);

// ── Bodegas ───────────────────────────────────────────────────
export const getWarehouses = (): Promise<Warehouse[]> =>
  fetch(`${API}/warehouses`).then((r) => r.json());

export const getWarehouse = (id: number): Promise<Warehouse> =>
  fetch(`${API}/warehouses/${id}`).then((r) => r.json());

export const createWarehouse = (data: Omit<Warehouse, "id">): Promise<Warehouse> =>
  fetch(`${API}/warehouses`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then((r) => r.json());

export const updateWarehouse = (id: number, data: Omit<Warehouse, "id">): Promise<Warehouse> =>
  fetch(`${API}/warehouses/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then((r) => r.json());

export const deleteWarehouse = (id: number): Promise<void> =>
  fetch(`${API}/warehouses/${id}`, { method: "DELETE" }).then(() => undefined);

// ── Productos ─────────────────────────────────────────────────
export const getProducts = (): Promise<Product[]> =>
  fetch(`${API}/products`).then((r) => r.json());

export const getProduct = (id: number): Promise<Product> =>
  fetch(`${API}/products/${id}`).then((r) => r.json());

export const createProduct = (data: Omit<Product, "id">): Promise<Product> =>
  fetch(`${API}/products`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then((r) => r.json());

export const updateProduct = (id: number, data: Omit<Product, "id">): Promise<Product> =>
  fetch(`${API}/products/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then((r) => r.json());

export const deleteProduct = (id: number): Promise<void> =>
  fetch(`${API}/products/${id}`, { method: "DELETE" }).then(() => undefined);
