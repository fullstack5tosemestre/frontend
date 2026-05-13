import { useEffect, useState } from "react";
import type { Order, OrderStatus, OrderItem, Product } from "../types";
import { getOrders, createOrder, updateOrderStatus, deleteOrder } from "../api/pedidos";
import { getProducts } from "../api/inventario";

const STATUS_LABELS: Record<OrderStatus,string> = { PENDIENTE:"Pendiente", EN_PROCESO:"En proceso", ENVIADO:"Enviado", ENTREGADO:"Entregado", CANCELADO:"Cancelado" };
const STATUS_COLORS: Record<OrderStatus,string> = { PENDIENTE:"warning", EN_PROCESO:"info", ENVIADO:"primary", ENTREGADO:"success", CANCELADO:"danger" };
const ALL_STATUSES: OrderStatus[] = ["PENDIENTE","EN_PROCESO","ENVIADO","ENTREGADO","CANCELADO"];

interface OrderForm { customerName: string; status: OrderStatus; items: OrderItem[]; }
const emptyForm: OrderForm = { customerName: "", status: "PENDIENTE", items: [] };

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState<OrderForm>(emptyForm);
  const [editId, setEditId] = useState<number|null>(null);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Order|null>(null);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [newItem, setNewItem] = useState<{ productId: number; quantity: number }>({ productId: 0, quantity: 1 });

  const load = () => {
    setLoading(true);
    Promise.all([getOrders(), getProducts()])
      .then(([o, p]) => { setOrders(o); setProducts(p); })
      .catch(() => setError("No se pudo cargar los datos"))
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm(emptyForm); setEditId(null); setNewItem({ productId: 0, quantity: 1 }); setShowModal(true); };
  const openEdit = (o: Order) => {
    setForm({ customerName: o.customerName ?? "", status: o.status, items: o.items ?? [] });
    setEditId(o.id); setNewItem({ productId: 0, quantity: 1 }); setShowModal(true);
  };

  const addItem = () => {
    if (newItem.productId <= 0 || newItem.quantity <= 0) return;
    const exists = form.items.findIndex(i => i.productId === newItem.productId);
    if (exists >= 0) {
      const updated = [...form.items];
      updated[exists] = { ...updated[exists], quantity: updated[exists].quantity + newItem.quantity };
      setForm(f => ({ ...f, items: updated }));
    } else {
      setForm(f => ({ ...f, items: [...f.items, { ...newItem }] }));
    }
    setNewItem({ productId: 0, quantity: 1 });
  };
  const removeItem = (i: number) => setForm(f => ({ ...f, items: f.items.filter((_, idx) => idx !== i) }));

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editId !== null) {
        await updateOrderStatus(editId, form.status);
      } else {
        await createOrder({ customerName: form.customerName, status: form.status, items: form.items });
      }
      setShowModal(false); load();
    } catch { setError("Error al guardar la orden"); } finally { setSaving(false); }
  };
  const handleDelete = async () => {
    if (!deleteTarget) return;
    try { await deleteOrder(deleteTarget.id); setDeleteTarget(null); load(); }
    catch { setError("Error al eliminar"); }
  };

  const filtered = filterStatus === "ALL" ? orders : orders.filter(o => o.status === filterStatus);
  const statusBadge = (s: OrderStatus) => <span className={`badge bg-${STATUS_COLORS[s]}-subtle text-${STATUS_COLORS[s]} rounded-pill`}>{STATUS_LABELS[s]}</span>;
  const formatDate = (d?: string) => d ? new Date(d).toLocaleDateString("es-CL", { day: "2-digit", month: "short", year: "numeric" }) : "–";
  const productName = (id: number) => { const p = products.find(p => p.id === id); return p ? `${p.name} (${p.sku})` : `Producto #${id}`; };

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div><h3 className="fw-bold mb-0 text-dark">Órdenes</h3><p className="text-muted mb-0 small">Gestión de pedidos y envíos</p></div>
        <button className="btn btn-primary" onClick={openCreate}><i className="bi bi-plus-lg me-2"></i>Nueva orden</button>
      </div>
      {error && <div className="alert alert-danger alert-dismissible"><span>{error}</span><button className="btn-close" onClick={() => setError("")}/></div>}

      <div className="row g-2 mb-3">
        {ALL_STATUSES.map(s => (
          <div className="col" key={s}>
            <div className={`card border-0 text-center py-2 shadow-sm ${filterStatus === s ? `border border-${STATUS_COLORS[s]}` : ""}`} style={{cursor:"pointer"}} onClick={() => setFilterStatus(filterStatus === s ? "ALL" : s)}>
              <div className={`fw-bold text-${STATUS_COLORS[s]}`}>{orders.filter(o => o.status === s).length}</div>
              <div className="text-muted" style={{fontSize:"0.65rem"}}>{STATUS_LABELS[s]}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="d-flex align-items-center gap-2 mb-3 flex-wrap">
        <button className={`btn btn-sm ${filterStatus === "ALL" ? "btn-primary" : "btn-outline-secondary"}`} onClick={() => setFilterStatus("ALL")}>Todos ({orders.length})</button>
        {ALL_STATUSES.map(s => <button key={s} className={`btn btn-sm ${filterStatus === s ? `btn-${STATUS_COLORS[s]}` : "btn-outline-secondary"}`} onClick={() => setFilterStatus(filterStatus === s ? "ALL" : s)}>{STATUS_LABELS[s]}</button>)}
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          {loading ? <div className="text-center py-5"><div className="spinner-border text-primary"/></div>
          : filtered.length === 0 ? <div className="text-center py-5 text-muted"><i className="bi bi-cart3 fs-1 d-block mb-2"></i>No hay órdenes</div>
          : <div className="table-responsive"><table className="table table-hover mb-0 align-middle">
              <thead><tr><th>#</th><th>Cliente</th><th>Estado</th><th>Items</th><th>Fecha</th><th className="text-end">Acciones</th></tr></thead>
              <tbody>{filtered.map(o => (
                <tr key={o.id}>
                  <td className="text-muted small">{o.id}</td>
                  <td className="fw-semibold">{o.customerName ?? "–"}</td>
                  <td>{statusBadge(o.status)}</td>
                  <td className="text-muted small">{o.items?.length ?? 0} prod.</td>
                  <td className="text-muted small">{formatDate(o.createdAt)}</td>
                  <td className="text-end">
                    <button className="btn btn-sm btn-outline-primary me-2" onClick={() => openEdit(o)} title="Editar estado"><i className="bi bi-pencil"></i></button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => setDeleteTarget(o)}><i className="bi bi-trash"></i></button>
                  </td>
                </tr>
              ))}</tbody>
            </table></div>}
        </div>
      </div>

      {showModal && <div className="modal show d-block" style={{background:"rgba(0,0,0,0.4)"}}>
        <div className="modal-dialog modal-dialog-centered modal-lg"><div className="modal-content">
          <div className="modal-header"><h5 className="modal-title fw-semibold"><i className="bi bi-cart3 me-2 text-primary"></i>{editId !== null ? "Editar estado" : "Nueva"} orden</h5><button className="btn-close" onClick={() => setShowModal(false)}/></div>
          <div className="modal-body">
            {editId !== null ? (
              <div className="alert alert-info small mb-3"><i className="bi bi-info-circle me-2"></i>Solo se puede actualizar el estado de una orden existente.</div>
            ) : (
              <div className="mb-3"><label className="form-label fw-semibold small">Nombre del cliente *</label><input className="form-control" value={form.customerName} onChange={e => setForm({...form, customerName: e.target.value})} placeholder="Ej: Juan Pérez"/></div>
            )}
            <div className="mb-3"><label className="form-label fw-semibold small">Estado</label>
              <select className="form-select" value={form.status} onChange={e => setForm({...form, status: e.target.value as OrderStatus})}>
                {ALL_STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
              </select>
            </div>
            {editId === null && (
              <div className="border rounded-2 p-3 bg-light">
                <div className="fw-semibold small mb-2"><i className="bi bi-list-ul me-2 text-primary"></i>Productos en la orden</div>
                {form.items.length > 0 && <table className="table table-sm mb-2 bg-white rounded-2">
                  <thead><tr><th>Producto</th><th>Cantidad</th><th></th></tr></thead>
                  <tbody>{form.items.map((item, i) => (
                    <tr key={i}>
                      <td className="small">{productName(item.productId)}</td>
                      <td>{item.quantity}</td>
                      <td><button className="btn btn-sm btn-outline-danger py-0" onClick={() => removeItem(i)}><i className="bi bi-x"></i></button></td>
                    </tr>
                  ))}</tbody>
                </table>}
                <div className="row g-2 align-items-end">
                  <div className="col">
                    <label className="form-label fw-semibold small mb-1">Producto *</label>
                    <select className="form-select form-select-sm" value={newItem.productId || ""} onChange={e => setNewItem({...newItem, productId: Number(e.target.value)})}>
                      <option value="">Seleccionar producto...</option>
                      {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.sku}) — stock: {p.stock}</option>)}
                    </select>
                  </div>
                  <div className="col-auto">
                    <label className="form-label fw-semibold small mb-1">Cantidad</label>
                    <input type="number" className="form-control form-control-sm" style={{width:80}} value={newItem.quantity} onChange={e => setNewItem({...newItem, quantity: Number(e.target.value)})} min={1}/>
                  </div>
                  <div className="col-auto">
                    <button className="btn btn-outline-primary btn-sm" onClick={addItem} disabled={!newItem.productId}><i className="bi bi-plus"></i> Agregar</button>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving || (editId === null && !form.customerName)}>{saving && <span className="spinner-border spinner-border-sm me-2"/>}{editId !== null ? "Actualizar estado" : "Crear orden"}</button>
          </div>
        </div></div>
      </div>}

      {deleteTarget && <div className="modal show d-block" style={{background:"rgba(0,0,0,0.4)"}}>
        <div className="modal-dialog modal-dialog-centered modal-sm"><div className="modal-content">
          <div className="modal-header border-0"><h5 className="modal-title fw-semibold text-danger"><i className="bi bi-exclamation-triangle me-2"></i>Eliminar</h5><button className="btn-close" onClick={() => setDeleteTarget(null)}/></div>
          <div className="modal-body pt-0">¿Eliminar orden <strong>#{deleteTarget.id}</strong> de <strong>{deleteTarget.customerName}</strong>?</div>
          <div className="modal-footer border-0"><button className="btn btn-secondary btn-sm" onClick={() => setDeleteTarget(null)}>Cancelar</button><button className="btn btn-danger btn-sm" onClick={handleDelete}>Eliminar</button></div>
        </div></div>
      </div>}
    </div>
  );
}
