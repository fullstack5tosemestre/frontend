import { useEffect, useState } from "react";
import type { Branch } from "../types";
import {
    getBranches,
    createBranch,
    updateBranch,
    deleteBranch,
} from "../api/inventario";

const emptyBranch: Omit<Branch, "id"> = {
    name: "",
    direccion: "",
};

export default function BranchesPage() {
    const [branches, setBranches] = useState<Branch[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [form, setForm] = useState<Omit<Branch, "id">>(emptyBranch);
    const [editId, setEditId] = useState<number | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [saving, setSaving] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<Branch | null>(null);

    const load = (withLoading = true) => {
        if (withLoading) setLoading(true);
        getBranches()
            .then(setBranches)
            .catch(() => setError("No se pudo cargar las sucursales"))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        const timer = setTimeout(() => load(true), 0);
        return () => clearTimeout(timer);
    }, []);

    const openCreate = () => {
        setForm(emptyBranch);
        setEditId(null);
        setShowModal(true);
    };
    const openEdit = (b: Branch) => {
        setForm({
            name: b.name,
            direccion: b.direccion,
        });
        setEditId(b.id);
        setShowModal(true);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            if (editId !== null) {
                await updateBranch(editId, form);
            } else {
                await createBranch(form);
            }
            setShowModal(false);
            load(true);
        } catch {
            setError("Error al guardar la sucursal");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        try {
            await deleteBranch(deleteTarget.id);
            setDeleteTarget(null);
            load(true);
        } catch {
            setError("Error al eliminar la sucursal");
        }
    };

    return (
        <div>
            <div className="d-flex align-items-center justify-content-between mb-4">
                <div>
                    <h3 className="fw-bold mb-0 text-dark">Sucursales</h3>
                    <p className="text-muted mb-0 small">
                        Gestión de sucursales de SmartLogix
                    </p>
                </div>
                <button
                    className="btn btn-primary d-flex align-items-center gap-2"
                    onClick={openCreate}
                >
                    <i className="bi bi-plus-lg"></i> Nueva sucursal
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

            <div className="card border-0 shadow-sm">
                <div className="card-body p-0">
                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" />
                        </div>
                    ) : branches.length === 0 ? (
                        <div className="text-center py-5 text-muted">
                            <i className="bi bi-building fs-1 d-block mb-2"></i>
                            No hay sucursales registradas
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover mb-0 align-middle">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Nombre</th>
                                        <th>Dirección</th>
                                        <th className="text-end">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {branches.map((b) => (
                                        <tr key={b.id}>
                                            <td className="text-muted small">
                                                {b.id}
                                            </td>
                                            <td className="fw-semibold">
                                                {b.name}
                                            </td>
                                            <td className="text-muted small">
                                                {b.direccion}
                                            </td>
                                            <td className="text-end">
                                                <button
                                                    className="btn btn-sm btn-outline-primary me-2"
                                                    onClick={() => openEdit(b)}
                                                >
                                                    <i className="bi bi-pencil"></i>
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-outline-danger"
                                                    onClick={() =>
                                                        setDeleteTarget(b)
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
            </div>

            {showModal && (
                <div
                    className="modal show d-block"
                    style={{ background: "rgba(0,0,0,0.4)" }}
                >
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title fw-semibold">
                                    <i className="bi bi-building me-2 text-primary"></i>
                                    {editId !== null
                                        ? "Editar sucursal"
                                        : "Nueva sucursal"}
                                </h5>
                                <button
                                    className="btn-close"
                                    onClick={() => setShowModal(false)}
                                />
                            </div>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <label className="form-label fw-semibold small">
                                        Nombre *
                                    </label>
                                    <input
                                        className="form-control"
                                        value={form.name}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                name: e.target.value,
                                            })
                                        }
                                        placeholder="Ej: Sucursal Santiago Centro"
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label fw-semibold small">
                                        Dirección *
                                    </label>
                                    <input
                                        className="form-control"
                                        value={form.direccion}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                direccion: e.target.value,
                                            })
                                        }
                                        placeholder="Ej: Av. Providencia 1234"
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
                                    disabled={
                                        saving || !form.name || !form.direccion
                                    }
                                >
                                    {saving && (
                                        <span className="spinner-border spinner-border-sm me-2" />
                                    )}
                                    {editId !== null
                                        ? "Guardar cambios"
                                        : "Crear sucursal"}
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
                                ¿Eliminar la sucursal{" "}
                                <strong>{deleteTarget.name}</strong>?
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
