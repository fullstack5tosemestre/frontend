import { useEffect, useState } from "react";
import type { User, Role } from "../types";
import {
    getUsers,
    createUser,
    updateUser,
    deleteUser,
    searchUsers,
    getRoles,
    type CreateUserDTO,
} from "../api/usuarios";

const emptyForm: CreateUserDTO = {
    nombre: "",
    apellido: "",
    rut: "",
    email: "",
    password: "",
    fechaNacimiento: "",
    direccion: "",
    roleId: 0,
};

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [form, setForm] = useState<CreateUserDTO>(emptyForm);
    const [editId, setEditId] = useState<number | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [saving, setSaving] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
    const [search, setSearch] = useState("");
    const [searching, setSearching] = useState(false);

    const load = (withLoading = true) => {
        if (withLoading) setLoading(true);
        Promise.all([getUsers(), getRoles()])
            .then(([u, r]) => {
                setUsers(u);
                setRoles(r);
            })
            .catch(() => setError("No se pudo cargar los datos"))
            .finally(() => setLoading(false));
    };
    useEffect(() => {
        const timer = setTimeout(() => load(true), 0);
        return () => clearTimeout(timer);
    }, []);

    const handleSearch = async () => {
        if (!search.trim()) {
            load(true);
            return;
        }
        setSearching(true);
        try {
            setUsers(await searchUsers(search));
        } catch {
            setError("Error al buscar usuarios");
        } finally {
            setSearching(false);
        }
    };
    const clearSearch = () => {
        setSearch("");
        load(true);
    };

    const openCreate = () => {
        setForm({ ...emptyForm, roleId: roles[0]?.id ?? 0 });
        setEditId(null);
        setShowModal(true);
    };
    const openEdit = (u: User) => {
        setForm({
            nombre: u.nombre,
            apellido: u.apellido,
            rut: u.rut,
            email: u.email,
            password: "",
            fechaNacimiento: u.fechaNacimiento ?? "",
            direccion: u.direccion ?? "",
            roleId: u.role.id,
        });
        setEditId(u.id);
        setShowModal(true);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            if (editId !== null) {
                const payload = { ...form };
                if (!payload.password)
                    delete (payload as Partial<CreateUserDTO>).password;
                await updateUser(editId, payload);
            } else {
                await createUser(form);
            }
            setShowModal(false);
            load(true);
        } catch {
            setError("Error al guardar el usuario");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        try {
            await deleteUser(deleteTarget.id);
            setDeleteTarget(null);
            load(true);
        } catch {
            setError("Error al eliminar el usuario");
        }
    };

    const roleColor = (nombre: string) => {
        if (nombre.toUpperCase().includes("ADMIN")) return "danger";
        if (nombre.toUpperCase().includes("VENDEDOR")) return "primary";
        return "secondary";
    };

    return (
        <div>
            <div className="d-flex align-items-center justify-content-between mb-4">
                <div>
                    <h3 className="fw-bold mb-0 text-dark">Usuarios</h3>
                    <p className="text-muted mb-0 small">
                        Administración de usuarios del sistema
                    </p>
                </div>
                <button
                    className="btn btn-primary d-flex align-items-center gap-2"
                    onClick={openCreate}
                >
                    <i className="bi bi-person-plus"></i> Nuevo usuario
                </button>
            </div>

            {error && (
                <div className="alert alert-danger alert-dismissible">
                    <span>{error}</span>
                    <button
                        className="btn-close"
                        onClick={() => setError("")}
                    />
                </div>
            )}

            <div className="card border-0 shadow-sm mb-3">
                <div className="card-body py-2">
                    <div className="d-flex gap-2">
                        <div className="input-group flex-grow-1">
                            <span className="input-group-text bg-white border-end-0">
                                <i className="bi bi-search text-muted"></i>
                            </span>
                            <input
                                type="text"
                                className="form-control border-start-0 ps-0"
                                placeholder="Buscar por nombre, apellido o RUT..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) =>
                                    e.key === "Enter" && handleSearch()
                                }
                            />
                        </div>
                        <button
                            className="btn btn-outline-primary"
                            onClick={handleSearch}
                            disabled={searching}
                        >
                            {searching ? (
                                <span className="spinner-border spinner-border-sm" />
                            ) : (
                                "Buscar"
                            )}
                        </button>
                        {search && (
                            <button
                                className="btn btn-outline-secondary"
                                onClick={clearSearch}
                            >
                                <i className="bi bi-x-lg"></i>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="card border-0 shadow-sm">
                <div className="card-body p-0">
                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" />
                        </div>
                    ) : users.length === 0 ? (
                        <div className="text-center py-5 text-muted">
                            <i className="bi bi-people fs-1 d-block mb-2"></i>
                            {search
                                ? "Sin resultados"
                                : "No hay usuarios registrados"}
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover mb-0 align-middle">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Nombre</th>
                                        <th>RUT</th>
                                        <th>Email</th>
                                        <th>Rol</th>
                                        <th>Dirección</th>
                                        <th className="text-end">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((u) => (
                                        <tr key={u.id}>
                                            <td className="text-muted small">
                                                {u.id}
                                            </td>
                                            <td>
                                                <div className="d-flex align-items-center gap-2">
                                                    <div
                                                        className="rounded-circle bg-primary-subtle d-flex align-items-center justify-content-center text-primary fw-bold"
                                                        style={{
                                                            width: 32,
                                                            height: 32,
                                                            fontSize: "0.75rem",
                                                            minWidth: 32,
                                                        }}
                                                    >
                                                        {u.nombre[0]}
                                                        {u.apellido[0]}
                                                    </div>
                                                    <div>
                                                        <div className="fw-semibold small">
                                                            {u.nombre}{" "}
                                                            {u.apellido}
                                                        </div>
                                                        {u.fechaNacimiento && (
                                                            <div
                                                                className="text-muted"
                                                                style={{
                                                                    fontSize:
                                                                        "0.7rem",
                                                                }}
                                                            >
                                                                Nac:{" "}
                                                                {
                                                                    u.fechaNacimiento
                                                                }
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <code className="bg-light px-2 py-1 rounded small">
                                                    {u.rut}
                                                </code>
                                            </td>
                                            <td className="text-muted small">
                                                {u.email}
                                            </td>
                                            <td>
                                                <span
                                                    className={`badge bg-${roleColor(u.role.nombre)}-subtle text-${roleColor(u.role.nombre)} rounded-pill`}
                                                >
                                                    {u.role.nombre}
                                                </span>
                                            </td>
                                            <td className="text-muted small">
                                                {u.direccion ?? "–"}
                                            </td>
                                            <td className="text-end">
                                                <button
                                                    className="btn btn-sm btn-outline-primary me-2"
                                                    onClick={() => openEdit(u)}
                                                >
                                                    <i className="bi bi-pencil"></i>
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-outline-danger"
                                                    onClick={() =>
                                                        setDeleteTarget(u)
                                                    }
                                                >
                                                    <i className="bi bi-trash"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
                {!loading && users.length > 0 && (
                    <div className="card-footer bg-white border-top text-muted small py-2 px-3">
                        {users.length} usuario{users.length !== 1 ? "s" : ""}
                    </div>
                )}
            </div>

            {showModal && (
                <div
                    className="modal show d-block"
                    style={{ background: "rgba(0,0,0,0.4)" }}
                >
                    <div className="modal-dialog modal-dialog-centered modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title fw-semibold">
                                    <i className="bi bi-person-badge me-2 text-primary"></i>
                                    {editId !== null
                                        ? "Editar usuario"
                                        : "Nuevo usuario"}
                                </h5>
                                <button
                                    className="btn-close"
                                    onClick={() => setShowModal(false)}
                                />
                            </div>
                            <div className="modal-body">
                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <label className="form-label fw-semibold small">
                                            Nombre *
                                        </label>
                                        <input
                                            className="form-control"
                                            value={form.nombre}
                                            onChange={(e) =>
                                                setForm({
                                                    ...form,
                                                    nombre: e.target.value,
                                                })
                                            }
                                            placeholder="Ej: Juan"
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label fw-semibold small">
                                            Apellido *
                                        </label>
                                        <input
                                            className="form-control"
                                            value={form.apellido}
                                            onChange={(e) =>
                                                setForm({
                                                    ...form,
                                                    apellido: e.target.value,
                                                })
                                            }
                                            placeholder="Ej: Pérez"
                                        />
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label fw-semibold small">
                                            RUT *
                                        </label>
                                        <input
                                            className="form-control"
                                            value={form.rut}
                                            onChange={(e) =>
                                                setForm({
                                                    ...form,
                                                    rut: e.target.value,
                                                })
                                            }
                                            placeholder="Ej: 12345678-9"
                                        />
                                    </div>
                                    <div className="col-md-8">
                                        <label className="form-label fw-semibold small">
                                            Email *
                                        </label>
                                        <input
                                            type="email"
                                            className="form-control"
                                            value={form.email}
                                            onChange={(e) =>
                                                setForm({
                                                    ...form,
                                                    email: e.target.value,
                                                })
                                            }
                                            placeholder="Ej: juan@ejemplo.com"
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label fw-semibold small">
                                            {editId !== null
                                                ? "Nueva contraseña (dejar vacío para no cambiar)"
                                                : "Contraseña *"}
                                        </label>
                                        <input
                                            type="password"
                                            className="form-control"
                                            value={form.password}
                                            onChange={(e) =>
                                                setForm({
                                                    ...form,
                                                    password: e.target.value,
                                                })
                                            }
                                            placeholder={
                                                editId !== null
                                                    ? "Dejar vacío para mantener"
                                                    : "Mínimo 6 caracteres"
                                            }
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label fw-semibold small">
                                            Rol *
                                        </label>
                                        <select
                                            className="form-select"
                                            value={form.roleId}
                                            onChange={(e) =>
                                                setForm({
                                                    ...form,
                                                    roleId: Number(
                                                        e.target.value,
                                                    ),
                                                })
                                            }
                                        >
                                            <option value={0} disabled>
                                                Seleccionar rol...
                                            </option>
                                            {roles.map((r) => (
                                                <option key={r.id} value={r.id}>
                                                    {r.nombre}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label fw-semibold small">
                                            Fecha de nacimiento
                                        </label>
                                        <input
                                            type="date"
                                            className="form-control"
                                            value={form.fechaNacimiento ?? ""}
                                            onChange={(e) =>
                                                setForm({
                                                    ...form,
                                                    fechaNacimiento:
                                                        e.target.value,
                                                })
                                            }
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label fw-semibold small">
                                            Dirección
                                        </label>
                                        <input
                                            className="form-control"
                                            value={form.direccion ?? ""}
                                            onChange={(e) =>
                                                setForm({
                                                    ...form,
                                                    direccion: e.target.value,
                                                })
                                            }
                                            placeholder="Ej: Av. Las Condes 1234, Santiago"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => setShowModal(false)}
                                >
                                    Cancelar
                                </button>
                                <button
                                    className="btn btn-primary"
                                    onClick={handleSave}
                                    disabled={
                                        saving ||
                                        !form.nombre ||
                                        !form.apellido ||
                                        !form.rut ||
                                        !form.email ||
                                        !form.roleId
                                    }
                                >
                                    {saving && (
                                        <span className="spinner-border spinner-border-sm me-2" />
                                    )}
                                    {editId !== null
                                        ? "Guardar cambios"
                                        : "Crear usuario"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {deleteTarget && (
                <div
                    className="modal show d-block"
                    style={{ background: "rgba(0,0,0,0.4)" }}
                >
                    <div className="modal-dialog modal-dialog-centered modal-sm">
                        <div className="modal-content">
                            <div className="modal-header border-0">
                                <h5 className="modal-title fw-semibold text-danger">
                                    <i className="bi bi-exclamation-triangle me-2"></i>
                                    Eliminar
                                </h5>
                                <button
                                    className="btn-close"
                                    onClick={() => setDeleteTarget(null)}
                                />
                            </div>
                            <div className="modal-body pt-0">
                                ¿Eliminar a{" "}
                                <strong>
                                    {deleteTarget.nombre}{" "}
                                    {deleteTarget.apellido}
                                </strong>
                                ? Esta acción no se puede deshacer.
                            </div>
                            <div className="modal-footer border-0">
                                <button
                                    className="btn btn-secondary btn-sm"
                                    onClick={() => setDeleteTarget(null)}
                                >
                                    Cancelar
                                </button>
                                <button
                                    className="btn btn-danger btn-sm"
                                    onClick={handleDelete}
                                >
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
