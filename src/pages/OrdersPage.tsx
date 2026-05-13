import { useEffect, useState } from "react";
import type { Order, OrderStatus, OrderItem } from "../types";
import { getOrders, createOrder, updateOrder, deleteOrder } from "../api/pedidos";

const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDIENTE: "Pendiente", EN_PROCESO: "En proceso", ENVIADO: "Enviado", ENTREGADO: "Entregado", CANCELADO: "Cancelado",
};
const STATUS_COLORS: Record<OrderStatus, string> = {
  PENDIENTE: "warning", EN_PROCESO: "info", ENVIADO: "primary", ENTREGADO: "success", CANCELADO: "danger",
};
const ALL_STATUSES: OrderStatus[] = ["PENDIENTE", "EN_PROCESO", "ENVIADO", "ENTREGADO", "CANCELADO"];

interface OrderForm { customerName: string; customerId: string; status: OrderStatus; items: OrderItem[]; }
const emptyForm: OrderForm = { customerName: "", customerId: "", status: "PENDIENTE", items: [] };

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState<OrderForm>(emptyForm);
  const [editId, setEditId] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Order | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [newItem, setNewItem] = useState<OrderItem>({ productId: 0, quantity: 1 });

  const load = () => { setLoading(true); getOrders().then(setOrders).catch(() => setError("No se pudo cargar las órdenes")).finally(() => setLoading(false)); };
  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm(emptyForm); setEditId(null); setNewItem({ productId: 0, quantity: 1 }); setShowModal(true); };
  const openEdit = (o: Order) => {
    setForm({ customerName: o.customerName ?? "", customerId: o.customerId?.toString() ?? "", status: o.status, items: o.items ?? [] });
    setEditId(o.id); setNewItem({ productId: 0, quantity: 1 }); setShowModal(true);
  };

  const addItem = () => {
    if (newItem.productId <= 0 || newItem.quantity <= 0) return;
    setForm((f) => ({ ...f, items: [...f.items, { ...newItem }] }));
    setNewItem({ productId: 0, quantity: 1 });
  };
  const removeItem = (i: number) => setForm((f) => ({ ...f, items: f.items.filter((_, idx) => idx !== i) }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { customerName: form.customerName, customerId: form.customerId ? Number(form.customerId) : undefined, status: form.status, items: form.items };
      editId !== null ? await updateOrder(editId, payload) : await createOrder(payload);
      setShowModal(false); load();
    } catch { setError("Error al guardar la orden"); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try { await deleteOrder(deleteTarget.id); setDeleteTarget(null); load(); }
    catch { setError("Error al eliminar la orden"); }
  };

  const filtered = filterStatus === "ALL" ? orders : orders.filter((o) => o.status === filterStatus);
  const statusBadge = (s: OrderStatus) => <span className={`badge bg-${STATUS_COLORS[s]}-subtle text-${STATUS_COLORS[s]} rounded-pill`}>{STATUS_LABELS[s]}</span>;
  const formatDate = (d?: string) => d ? new Date(d).toLocaleDateString("es-CL", { day: "2-digit", month: "short", year: "numeric" }) : "–";

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div><h3 className="fw-bold mb-0 text-dark">Órdenes</h3><p className="text-muted mb-0 small">Gestión de pedidos y envíos</p></div>
        <button className="btn btn-primary d-flex align-items-center gap-2" onClick={openCreate}><i className="bi bi-plus-lg"></i> Nueva orden</button>
      </div>

      {error && <div className="alert alert-danger alert-dismissible"><span>{error}</span><button className="btn-close" onClick={() => setError("")} /></div>}

      <div className="row g-2 mb-3">
        {ALL_STATUSES.map((s) => (
          <div className="col" key={s}>
            <div className={`card border-0 text-center py-2 px-1 shadow-sm ${filterStatus === s ? `border border-${STATUS_COLORS[s]}` : ""}`} style={{ cursor: "pointer" }} onClick={() => setFilterStatus(filterStatus === s ? "ALL" : s)}>
              <div className={`fw-bold text-${STATUS_COLORS[s]}`}>{orders.filter((o) => o.status === s).length}</div>
              <div className="text-muted" style={{ fontSize: "0.65rem" }}>{STATUS_LABELS[s]}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="d-flex align-items-center gap-2 mb-3 flex-wrap">
        <span className="text-muted small">Filtrar:</span>
        <button className={`btn btn-sm ${filterStatus === "ALL" ? "btn-primary" : "btn-outline-secondary"}`} onClick={() => setFilterStatus("ALL")}>Todos ({orders.length})</button>
        {ALL_STATUSES.map((s) => (
          <button key={s} className={`btn btn-sm ${filterStatus === s ? `btn-${STATUS_COLORS[s]}` : "btn-outline-secondary"}`} onClick={() => setFilterStatus(filterStatus === s ? "ALL" : s)}>{STATUS_LABELS[s]}</button>
        ))}
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          {loading ? <div className="text-center py-5"><div className="spinner-border text-primary" /></div>
            : filtered.length === 0 ? <div className="text-center py-5 text-muted"><i className="bi bi-cart3 fs-1 d-block mb-2"></i>No hay órdenes{filterStatus !== "ALL" ? ` con estado "${STATUS_LABELS[filterStatus as OrderStatus]}"` : ""}</div>
            : (
              <div className="table-responsive">
                <table className="table table-hover mb-0 align-middle">
                  <thead><tr><th>#</th><th>Cliente</th><th>Estado</th><th>Items</th><th>Total</th><th>Fecha</th><th className="text-end">Acciones</th></tr></thead>
                  <tbody>
                    {filtered.map((o) => (
                      <tr key={o.id}>
                        <td className="text-muted small">{o.id}</td>
                        <td className="fw-semibold">{o.customerName ?? `Cliente #${o.customerId}`}</td>
                        <td>{statusBadge(o.status)}</td>
                        <td className="text-muted small">{o.items?.length ?? 0} producto{(o.items?.length ?? 0) !== 1 ? "s" : ""}</td>
                        <td className="fw-semibold">{o.total != null ? `$${o.total.toLocaleString("es-CL")}` : "–"}</td>
                        <td className="text-muted small">{formatDate(o.createdAt)}</td>
                        <td className="text-end">
                          <button className="btn btn-sm btn-outline-primary me-2" onClick={() => openEdit(o)}><i className="bi bi-pencil"></i></button>
                          <button className="btn btn-sm btn-outline-danger" onClick={() => setDeleteTarget(o)}><i className="bi bi-trash"></i></button>
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
        <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.4)" }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-semibold"><i className="bi bi-cart3 me-2 text-primary"></i>{editId !== null ? "Editar orden" : "Nueva orden"}</h5>
                <button className="btn-close" onClick={() => setShowModal(false)} />
              </div>
              <div className="modal-body">
                <div className="row g-3 mb-4">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold small">Nombre del cliente *</label>
                    <input className="form-control" value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} placeholder="Ej: Juan Pérez" />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label fw-semibold small">ID Cliente</label>
                    <input type="number" className="form-control" value={form.customerId} onChange={(e) => setForm({ ...form, customerId: e.target.value })} placeholder="Ej: 5" min={1} />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label fw-semibold small">Estado</label>
                    <select className="form-select" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as OrderStatus })}>
                      {ALL_STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                    </select>
                  </div>
                </div>
                <div className="border rounded-2 p-3 bg-light">
                  <div className="fw-semibold small mb-2"><i className="bi bi-list-ul me-2 text-primary"></i>Productos en la orden</div>
                  {form.items.length > 0 && (
                    <table className="table table-sm mb-2 bg-white rounded-2">
                      <thead><tr><th>ID Producto</th><th>Cantidad</th><th></th></tr></thead>
                      <tbody>
                        {form.items.map((item, i) => (
                          <tr key={i}><td>#{item.productId}</td><td>{item.quantity}</td><td><button className="btn btn-sm btn-outline-danger py-0" onClick={() => removeItem(i)}><i className="bi bi-x"></i></button></td></tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                  <div className="d-flex gap-2 align-items-end">
                    <div>
                      <label className="form-label fw-semibold small mb-1">ID Producto</label>
                      <input type="number" className="form-control form-control-sm" style={{ width: 100 }} value={newItem.productId || ""} onChange={(e) => setNewItem({ ...newItem, productId: Number(e.target.value) })} min={1} placeholder="ID" />
                    </div>
                    <div>
                      <label className="form-label fw-semibold small mb-1">Cantidad</label>
                      <input type="number" className="form-control form-control-sm" style={{ width: 80 }} value={newItem.quantity} onChange={(e) => setNewItem({ ...newItem, quantity: Number(e.target.value) })} min={1} />
                    </div>
                    <button className="btn btn-outline-primary btn-sm" onClick={addItem}><i className="bi bi-plus"></i> Agregar</button>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                <button className="btn btn-primary" onClick={handleSave} disabled={saving || !form.customerName}>
                  {saving && <span className="spinner-border spinner-border-sm me-2" />}
                  {editId !== null ? "Guardar cambios" : "Crear orden"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.4)" }}>
          <div className="modal-dialog modal-dialog-centered modal-sm">
            <div className="modal-content">
              <div className="modal-header border-0"><h5 className="modal-title fw-semibold text-danger"><i className="bi bi-exclamation-triangle me-2"></i>Eliminar</h5><button className="btn-close" onClick={() => setDeleteTarget(null)} /></div>
              <div className="modal-body pt-0">¿Eliminar la orden <strong>#{deleteTarget.id}</strong> de <strong>{deleteTarget.customerName}</strong>?</div>
              <div className="modal-footer border-0">
                <button className="btn btn-secondary btn-sm" onClick={() => setDeleteTarget(null)}>Cancelar</button>
                <button className="btn btn-danger btn-sm" onClick={handleDelete}>Eliminar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
