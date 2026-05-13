import { useEffect, useState } from "react";
import type { Warehouse } from "../types";
import {
    getWarehouses,
    createWarehouse,
    updateWarehouse,
    deleteWarehouse,
} from "../api/inventario";

interface WarehouseForm {
    name: string;
    branchId?: number;
}

const emptyWarehouse: WarehouseForm = {
    name: "",
    branchId: undefined,
};

export default function WarehousesPage() {
    const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [form, setForm] = useState<WarehouseForm>(emptyWarehouse);
    const [editId, setEditId] = useState<number | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [saving, setSaving] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<Warehouse | null>(null);

    const load = (withLoading = true) => {
        if (withLoading) setLoading(true);
        getWarehouses()
            .then(setWarehouses)
            .catch(() => setError("No se pudo cargar las bodegas"))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        const timer = setTimeout(() => load(true), 0);
        return () => clearTimeout(timer);
    }, []);

    const openCreate = () => {
        setForm(emptyWarehouse);
        setEditId(null);
        setShowModal(true);
    };
    const openEdit = (w: Warehouse) => {
        setForm({
            name: w.name ?? "",
            branchId: w.inBranch?.id,
        });
        setEditId(w.id);
        setShowModal(true);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const payload = {
                name: form.name,
                inBranch: form.branchId ? { id: form.branchId } : undefined,
            };
            if (editId !== null) {
                await updateWarehouse(editId, payload);
            } else {
                await createWarehouse(payload);
            }
            setShowModal(false);
            load(true);
        } catch {
            setError("Error al guardar la bodega");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        try {
            await deleteWarehouse(deleteTarget.id);
            setDeleteTarget(null);
            load(true);
        } catch {
            setError("Error al eliminar la bodega");
        }
    };

    const branchLabel = (w: Warehouse) =>
        w.inBranch?.name ?? (w.inBranch?.id ? `#${w.inBranch.id}` : "–");

    return (
        <div>
            <div className="d-flex align-items-center justify-content-between mb-4">
                <div>
                    <h3 className="fw-bold mb-0 text-dark">Bodegas</h3>
                    <p className="text-muted mb-0 small">
                        Gestión de bodegas y almacenes
                    </p>
                </div>
                <button
                    className="btn btn-primary d-flex align-items-center gap-2"
                    onClick={openCreate}
                >
                    <i className="bi bi-plus-lg"></i> Nueva bodega
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
                    ) : warehouses.length === 0 ? (
                        <div className="text-center py-5 text-muted">
                            <i className="bi bi-archive fs-1 d-block mb-2"></i>
                            No hay bodegas registradas
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover mb-0 align-middle">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Nombre</th>
                                        <th>Sucursal</th>
                                        <th className="text-end">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {warehouses.map((w) => (
                                        <tr key={w.id}>
                                            <td className="text-muted small">
                                                {w.id}
                                            </td>
                                            <td className="fw-semibold">
                                                {w.name ?? "–"}
                                            </td>
                                            <td className="text-muted small">
                                                {branchLabel(w)}
                                            </td>
                                            <td className="text-end">
                                                <button
                                                    className="btn btn-sm btn-outline-primary me-2"
                                                    onClick={() => openEdit(w)}
                                                >
                                                    <i className="bi bi-pencil"></i>
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-outline-danger"
                                                    onClick={() =>
                                                        setDeleteTarget(w)
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
                                    <i className="bi bi-archive me-2 text-primary"></i>
                                    {editId !== null
                                        ? "Editar bodega"
                                        : "Nueva bodega"}
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
                                        placeholder="Ej: Bodega Principal Santiago"
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label fw-semibold small">
                                        Sucursal (ID) *
                                    </label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        value={form.branchId ?? ""}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                branchId: Number(
                                                    e.target.value,
                                                ),
                                            })
                                        }
                                        min={1}
                                        placeholder="Ej: 3"
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
                                        saving ||
                                        !form.name ||
                                        form.branchId === undefined
                                    }
                                >
                                    {saving && (
                                        <span className="spinner-border spinner-border-sm me-2" />
                                    )}
                                    {editId !== null
                                        ? "Guardar cambios"
                                        : "Crear bodega"}
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
                                ¿Eliminar la bodega{" "}
                                <strong>{deleteTarget.name ?? "–"}</strong>?
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
