import { useEffect, useState } from "react";
import type { Role } from "../types";
import { getRoles, createRole, updateRole, deleteRole } from "../api/usuarios";

const emptyRole: Omit<Role, "id"> = { nombre: "", descripcion: "" };

export default function RolesPage() {
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [form, setForm] = useState<Omit<Role, "id">>(emptyRole);
    const [editId, setEditId] = useState<number | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [saving, setSaving] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<Role | null>(null);

    const load = (withLoading = true) => {
        if (withLoading) setLoading(true);
        getRoles()
            .then(setRoles)
            .catch(() => setError("No se pudo cargar los roles"))
            .finally(() => setLoading(false));
    };
    useEffect(() => {
        const timer = setTimeout(() => load(true), 0);
        return () => clearTimeout(timer);
    }, []);

    const openCreate = () => {
        setForm(emptyRole);
        setEditId(null);
        setShowModal(true);
    };
    const openEdit = (r: Role) => {
        setForm({ nombre: r.nombre, descripcion: r.descripcion ?? "" });
        setEditId(r.id);
        setShowModal(true);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            if (editId !== null) {
                await updateRole(editId, form);
            } else {
                await createRole(form);
            }
            setShowModal(false);
            load(true);
        } catch {
            setError("Error al guardar el rol");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        try {
            await deleteRole(deleteTarget.id);
            setDeleteTarget(null);
            load(true);
        } catch {
            setError("Error al eliminar el rol");
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
                    <h3 className="fw-bold mb-0 text-dark">Roles</h3>
                    <p className="text-muted mb-0 small">
                        Roles de acceso del sistema
                    </p>
                </div>
                <button
                    className="btn btn-primary d-flex align-items-center gap-2"
                    onClick={openCreate}
                >
                    <i className="bi bi-plus-lg"></i> Nuevo rol
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

            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" />
                </div>
            ) : (
                <div className="row g-3">
                    {roles.length === 0 ? (
                        <div className="col-12 text-center py-5 text-muted">
                            <i className="bi bi-shield-check fs-1 d-block mb-2"></i>
                            No hay roles registrados
                        </div>
                    ) : (
                        roles.map((r) => (
                            <div
                                className="col-12 col-md-6 col-lg-4"
                                key={r.id}
                            >
                                <div className="card border-0 shadow-sm h-100">
                                    <div className="card-body">
                                        <div className="d-flex align-items-center justify-content-between mb-2">
                                            <span
                                                className={`badge bg-${roleColor(r.nombre)}-subtle text-${roleColor(r.nombre)} rounded-pill px-3 py-2 fs-6`}
                                            >
                                                <i className="bi bi-shield-lock me-1"></i>
                                                {r.nombre}
                                            </span>
                                            <span className="text-muted small">
                                                #{r.id}
                                            </span>
                                        </div>
                                        <p className="text-muted small mb-3">
                                            {r.descripcion || (
                                                <em>Sin descripción</em>
                                            )}
                                        </p>
                                        <div className="d-flex gap-2">
                                            <button
                                                className="btn btn-outline-primary btn-sm flex-grow-1"
                                                onClick={() => openEdit(r)}
                                            >
                                                <i className="bi bi-pencil me-1"></i>
                                                Editar
                                            </button>
                                            <button
                                                className="btn btn-outline-danger btn-sm"
                                                onClick={() =>
                                                    setDeleteTarget(r)
                                                }
                                            >
                                                <i className="bi bi-trash"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {showModal && (
                <div
                    className="modal show d-block"
                    style={{ background: "rgba(0,0,0,0.4)" }}
                >
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title fw-semibold">
                                    <i className="bi bi-shield-lock me-2 text-primary"></i>
                                    {editId !== null
                                        ? "Editar rol"
                                        : "Nuevo rol"}
                                </h5>
                                <button
                                    className="btn-close"
                                    onClick={() => setShowModal(false)}
                                />
                            </div>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <label className="form-label fw-semibold small">
                                        Nombre del rol *
                                    </label>
                                    <input
                                        className="form-control"
                                        value={form.nombre}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                nombre: e.target.value.toUpperCase(),
                                            })
                                        }
                                        placeholder="Ej: ADMIN, CLIENTE, VENDEDOR"
                                    />
                                    <div className="form-text">
                                        El nombre se guardará en mayúsculas
                                    </div>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label fw-semibold small">
                                        Descripción
                                    </label>
                                    <textarea
                                        className="form-control"
                                        rows={3}
                                        value={form.descripcion ?? ""}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                descripcion: e.target.value,
                                            })
                                        }
                                        placeholder="Descripción del rol y sus permisos"
                                    />
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
                                    disabled={saving || !form.nombre}
                                >
                                    {saving && (
                                        <span className="spinner-border spinner-border-sm me-2" />
                                    )}
                                    {editId !== null
                                        ? "Guardar cambios"
                                        : "Crear rol"}
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
                                ¿Eliminar el rol{" "}
                                <strong>{deleteTarget.nombre}</strong>? Esto
                                puede afectar a usuarios con este rol.
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
