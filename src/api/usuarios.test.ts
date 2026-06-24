import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { API } from "./config";
import {
    getRoles,
    getRole,
    createRole,
    updateRole,
    deleteRole,
    getUsers,
    getUser,
    getUserByRut,
    searchUsers,
    createUser,
    updateUser,
    deleteUser,
} from "./usuarios";

function mockFetchOnce(body: unknown) {
    return vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(body),
    });
}

describe("api/usuarios", () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("getRoles fetches the roles endpoint", async () => {
        const roles = [{ id: 1, nombre: "ADMIN" }];
        const fetchMock = mockFetchOnce(roles);
        vi.stubGlobal("fetch", fetchMock);

        const result = await getRoles();

        expect(fetchMock).toHaveBeenCalledWith(`${API}/roles`);
        expect(result).toEqual(roles);
    });

    it("getRole fetches a single role by id", async () => {
        const role = { id: 1, nombre: "ADMIN" };
        const fetchMock = mockFetchOnce(role);
        vi.stubGlobal("fetch", fetchMock);

        const result = await getRole(1);

        expect(fetchMock).toHaveBeenCalledWith(`${API}/roles/1`);
        expect(result).toEqual(role);
    });

    it("createRole posts the role payload", async () => {
        const created = { id: 3, nombre: "VENDEDOR" };
        const fetchMock = mockFetchOnce(created);
        vi.stubGlobal("fetch", fetchMock);

        const result = await createRole({ nombre: "VENDEDOR" });

        expect(fetchMock).toHaveBeenCalledWith(`${API}/roles`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nombre: "VENDEDOR" }),
        });
        expect(result).toEqual(created);
    });

    it("updateRole sends a PUT to the role id endpoint", async () => {
        const updated = { id: 1, nombre: "ADMIN", descripcion: "Editado" };
        const fetchMock = mockFetchOnce(updated);
        vi.stubGlobal("fetch", fetchMock);

        const result = await updateRole(1, { nombre: "ADMIN", descripcion: "Editado" });

        expect(fetchMock).toHaveBeenCalledWith(`${API}/roles/1`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nombre: "ADMIN", descripcion: "Editado" }),
        });
        expect(result).toEqual(updated);
    });

    it("deleteRole sends a DELETE request", async () => {
        const fetchMock = vi.fn().mockResolvedValue({ ok: true });
        vi.stubGlobal("fetch", fetchMock);

        const result = await deleteRole(1);

        expect(fetchMock).toHaveBeenCalledWith(`${API}/roles/1`, { method: "DELETE" });
        expect(result).toBeUndefined();
    });

    it("getUsers fetches the users endpoint", async () => {
        const users = [{ id: 1, nombre: "Ana" }];
        const fetchMock = mockFetchOnce(users);
        vi.stubGlobal("fetch", fetchMock);

        const result = await getUsers();

        expect(fetchMock).toHaveBeenCalledWith(`${API}/users`);
        expect(result).toEqual(users);
    });

    it("getUser fetches a single user by id", async () => {
        const user = { id: 1, nombre: "Ana" };
        const fetchMock = mockFetchOnce(user);
        vi.stubGlobal("fetch", fetchMock);

        const result = await getUser(1);

        expect(fetchMock).toHaveBeenCalledWith(`${API}/users/1`);
        expect(result).toEqual(user);
    });

    it("getUserByRut fetches a user by RUT", async () => {
        const user = { id: 1, rut: "11111111-1" };
        const fetchMock = mockFetchOnce(user);
        vi.stubGlobal("fetch", fetchMock);

        const result = await getUserByRut("11111111-1");

        expect(fetchMock).toHaveBeenCalledWith(`${API}/users/by-rut/11111111-1`);
        expect(result).toEqual(user);
    });

    it("searchUsers encodes the query string", async () => {
        const users = [{ id: 1, nombre: "Ana Maria" }];
        const fetchMock = mockFetchOnce(users);
        vi.stubGlobal("fetch", fetchMock);

        const result = await searchUsers("ana maria");

        expect(fetchMock).toHaveBeenCalledWith(`${API}/users/buscar?q=ana%20maria`);
        expect(result).toEqual(users);
    });

    it("createUser posts the new user payload", async () => {
        const created = { id: 5, nombre: "Luis" };
        const fetchMock = mockFetchOnce(created);
        vi.stubGlobal("fetch", fetchMock);

        const payload = {
            nombre: "Luis",
            apellido: "Perez",
            rut: "33333333-3",
            email: "luis@test.cl",
            password: "secret",
            roleId: 2,
        };
        const result = await createUser(payload);

        expect(fetchMock).toHaveBeenCalledWith(`${API}/users`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
        expect(result).toEqual(created);
    });

    it("updateUser sends a PUT with partial data to the user id endpoint", async () => {
        const updated = { id: 1, nombre: "Ana", apellido: "Torres Editado" };
        const fetchMock = mockFetchOnce(updated);
        vi.stubGlobal("fetch", fetchMock);

        const result = await updateUser(1, { apellido: "Torres Editado" });

        expect(fetchMock).toHaveBeenCalledWith(`${API}/users/1`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ apellido: "Torres Editado" }),
        });
        expect(result).toEqual(updated);
    });

    it("deleteUser sends a DELETE request", async () => {
        const fetchMock = vi.fn().mockResolvedValue({ ok: true });
        vi.stubGlobal("fetch", fetchMock);

        const result = await deleteUser(1);

        expect(fetchMock).toHaveBeenCalledWith(`${API}/users/1`, { method: "DELETE" });
        expect(result).toBeUndefined();
    });
});
