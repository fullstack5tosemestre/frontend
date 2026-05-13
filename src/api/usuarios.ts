import { API } from "./config";
import type { User, Role } from "../types";

// ── Roles ─────────────────────────────────────────────────────
export const getRoles = (): Promise<Role[]> =>
  fetch(`${API}/roles`).then((r) => r.json());

export const getRole = (id: number): Promise<Role> =>
  fetch(`${API}/roles/${id}`).then((r) => r.json());

export const createRole = (data: Omit<Role, "id">): Promise<Role> =>
  fetch(`${API}/roles`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then((r) => r.json());

export const updateRole = (id: number, data: Omit<Role, "id">): Promise<Role> =>
  fetch(`${API}/roles/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then((r) => r.json());

export const deleteRole = (id: number): Promise<void> =>
  fetch(`${API}/roles/${id}`, { method: "DELETE" }).then(() => undefined);

// ── Usuarios ──────────────────────────────────────────────────
export const getUsers = (): Promise<User[]> =>
  fetch(`${API}/usuarios`).then((r) => r.json());

export const getUser = (id: number): Promise<User> =>
  fetch(`${API}/usuarios/${id}`).then((r) => r.json());

export const getUserByRut = (rut: string): Promise<User> =>
  fetch(`${API}/usuarios/by-rut/${rut}`).then((r) => r.json());

export const searchUsers = (q: string): Promise<User[]> =>
  fetch(`${API}/usuarios/buscar?q=${encodeURIComponent(q)}`).then((r) => r.json());

export interface CreateUserDTO {
  nombre: string;
  apellido: string;
  rut: string;
  email: string;
  password: string;
  fechaNacimiento?: string;
  direccion?: string;
  roleId: number;
}

export const createUser = (data: CreateUserDTO): Promise<User> =>
  fetch(`${API}/usuarios`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then((r) => r.json());

export const updateUser = (id: number, data: Partial<CreateUserDTO>): Promise<User> =>
  fetch(`${API}/usuarios/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then((r) => r.json());

export const deleteUser = (id: number): Promise<void> =>
  fetch(`${API}/usuarios/${id}`, { method: "DELETE" }).then(() => undefined);
