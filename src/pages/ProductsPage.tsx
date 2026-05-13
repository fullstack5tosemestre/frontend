import { useEffect, useState } from "react";
import type { Product, Warehouse } from "../types";
import { getProducts, createProduct, updateProduct, deleteProduct, getWarehouses } from "../api/inventario";

interface ProductForm { name: string; sku: string; stock: number; inWarehouse?: { id: number }; }
const empty: ProductForm = { name: "", sku: "", stock: 0, inWarehouse: undefined };

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState<ProductForm>(empty);
  const [editId, setEditId] = useState<number|null>(null);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Product|null>(null);
  const [search, setSearch] = useState("");

  const load = () => {
    setLoading(true);
    Promise.all([getProducts(), getWarehouses()])
      .then(([p, w]) => { setProducts(p); setWarehouses(w); })
      .catch(() => setError("No se pudo cargar los datos"))
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm(empty); setEditId(null); setShowModal(true); };
  const openEdit = (p: Product) => {
    setForm({ name: p.name, sku: p.sku, stock: p.stock, inWarehouse: p.inWarehouse ? { id: p.inWarehouse.id } : undefined });
    setEditId(p.id); setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { ...form, inWarehouse: form.inWarehouse?.id ? { id: form.inWarehouse.id } : undefined };
      editId !== null ? await updateProduct(editId, payload as any) : await createProduct(payload as any);
      setShowModal(false); load();
    } catch { setError("Error al guardar"); } finally { setSaving(false); }
  };
  const handleDelete = async () => {
    if (!deleteTarget) return;
    try { await deleteProduct(deleteTarget.id); setDeleteTarget(null); load(); }
    catch { setError("Error al eliminar"); }
  };

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase())
  );
  const stockBadge = (s: number) =>
    s === 0 ? <span className="badge bg-danger-subtle text-danger rounded-pill">Sin stock</span>
    : s < 10 ? <span className="badge bg-warning-subtle text-warning rounded-pill">Bajo ({s})</span>
    : <span className="badge bg-success-subtle text-success rounded-pill">{s} uds</span>;

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div><h3 className="fw-bold mb-0 text-dark">Productos</h3><p className="text-muted mb-0 small">Catálogo de productos del inventario</p></div>
        <button className="btn btn-primary" onClick={openCreate}><i className="bi bi-plus-lg me-2"></i>Nuevo producto</button>
      </div>
      {error && <div className="alert alert-danger alert-dismissible"><span>{error}</span><button className="btn-close" onClick={() => setError("")}/></div>}
      <div className="card border-0 shadow-sm mb-3"><div className="card-body py-2">
        <div className="input-group"><span className="input-group-text bg-white border-end-0"><i className="bi bi-search text-muted"></i></span>
        <input type="text" className="form-control border-start-0 ps-0" placeholder="Buscar por nombre o SKU..." value={search} onChange={e => setSearch(e.target.value)}/></div>
      </div></div>
      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          {loading ? <div className="text-center py-5"><div className="spinner-border text-primary"/></div>
          : filtered.length === 0 ? <div className="text-center py-5 text-muted"><i className="bi bi-box-seam fs-1 d-block mb-2"></i>{search ? "Sin resultados" : "No hay productos"}</div>
          : <div className="table-responsive"><table className="table table-hover mb-0 align-middle">
              <thead><tr><th>#</th><th>Nombre</th><th>SKU</th><th>Stock</th><th>Bodega</th><th className="text-end">Acciones</th></tr></thead>
              <tbody>{filtered.map(p => (
                <tr key={p.id}>
                  <td className="text-muted small">{p.id}</td>
                  <td className="fw-semibold">{p.name}</td>
                  <td><code className="bg-light px-2 py-1 rounded small">{p.sku}</code></td>
                  <td>{stockBadge(p.stock)}</td>
                  <td>
                    {p.inWarehouse
                      ? <span className="badge bg-secondary-subtle text-secondary rounded-pill"><i className="bi bi-archive me-1"></i>{p.inWarehouse.name ?? `Bodega #${p.inWarehouse.id}`}</span>
                      : <span className="text-muted small">–</span>}
                  </td>
                  <td className="text-end">
                    <button className="btn btn-sm btn-outline-primary me-2" onClick={() => openEdit(p)}><i className="bi bi-pencil"></i></button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => setDeleteTarget(p)}><i className="bi bi-trash"></i></button>
                  </td>
                </tr>
              ))}</tbody>
            </table></div>}
        </div>
        {!loading && filtered.length > 0 && <div className="card-footer bg-white border-top text-muted small py-2 px-3">{filtered.length} producto{filtered.length !== 1 ? "s" : ""}</div>}
      </div>

      {showModal && <div className="modal show d-block" style={{background:"rgba(0,0,0,0.4)"}}>
        <div className="modal-dialog modal-dialog-centered"><div className="modal-content">
          <div className="modal-header"><h5 className="modal-title fw-semibold"><i className="bi bi-box-seam me-2 text-primary"></i>{editId !== null ? "Editar" : "Nuevo"} producto</h5><button className="btn-close" onClick={() => setShowModal(false)}/></div>
          <div className="modal-body"><div className="row g-3">
            <div className="col-12"><label className="form-label fw-semibold small">Nombre *</label><input className="form-control" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Ej: Laptop Dell Inspiron"/></div>
            <div className="col-6"><label className="form-label fw-semibold small">SKU *</label><input className="form-control" value={form.sku} onChange={e => setForm({...form, sku: e.target.value})} placeholder="LAP-DELL-001"/></div>
            <div className="col-6"><label className="form-label fw-semibold small">Stock</label><input type="number" className="form-control" value={form.stock} onChange={e => setForm({...form, stock: Number(e.target.value)})} min={0}/></div>
            <div className="col-12">
              <label className="form-label fw-semibold small">Bodega</label>
              <select className="form-select" value={form.inWarehouse?.id ?? ""} onChange={e => setForm({...form, inWarehouse: e.target.value ? { id: Number(e.target.value) } : undefined})}>
                <option value="">Sin bodega asignada</option>
                {warehouses.map(w => <option key={w.id} value={w.id}>{w.name ?? `Bodega #${w.id}`}{w.inBranch ? ` — ${w.inBranch.name ?? "Sucursal #"+w.inBranch.id}` : ""}</option>)}
              </select>
              <div className="form-text">Selecciona la bodega donde se almacena este producto</div>
            </div>
          </div></div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving || !form.name || !form.sku}>{saving && <span className="spinner-border spinner-border-sm me-2"/>}{editId !== null ? "Guardar cambios" : "Crear producto"}</button>
          </div>
        </div></div>
      </div>}

      {deleteTarget && <div className="modal show d-block" style={{background:"rgba(0,0,0,0.4)"}}>
        <div className="modal-dialog modal-dialog-centered modal-sm"><div className="modal-content">
          <div className="modal-header border-0"><h5 className="modal-title fw-semibold text-danger"><i className="bi bi-exclamation-triangle me-2"></i>Eliminar</h5><button className="btn-close" onClick={() => setDeleteTarget(null)}/></div>
          <div className="modal-body pt-0">¿Eliminar <strong>{deleteTarget.name}</strong>?</div>
          <div className="modal-footer border-0"><button className="btn btn-secondary btn-sm" onClick={() => setDeleteTarget(null)}>Cancelar</button><button className="btn btn-danger btn-sm" onClick={handleDelete}>Eliminar</button></div>
        </div></div>
      </div>}
    </div>
  );
}
