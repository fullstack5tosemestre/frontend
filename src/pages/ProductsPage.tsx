import { useEffect, useState } from "react";
import type { Product } from "../types";
import { getProducts, createProduct, updateProduct, deleteProduct } from "../api/inventario";

const emptyProduct: Omit<Product, "id"> = { name: "", sku: "", description: "", price: 0, stock: 0 };

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState<Omit<Product, "id">>(emptyProduct);
  const [editId, setEditId] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [search, setSearch] = useState("");

  const load = () => {
    setLoading(true);
    getProducts()
      .then(setProducts)
      .catch(() => setError("No se pudo cargar los productos"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm(emptyProduct); setEditId(null); setShowModal(true); };
  const openEdit = (p: Product) => {
    setForm({ name: p.name, sku: p.sku, description: p.description ?? "", price: p.price, stock: p.stock, warehouseId: p.warehouseId });
    setEditId(p.id); setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      editId !== null ? await updateProduct(editId, form) : await createProduct(form);
      setShowModal(false); load();
    } catch { setError("Error al guardar el producto"); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try { await deleteProduct(deleteTarget.id); setDeleteTarget(null); load(); }
    catch { setError("Error al eliminar el producto"); }
  };

  const filtered = products.filter(
    (p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase())
  );

  const stockBadge = (stock: number) => {
    if (stock === 0) return <span className="badge bg-danger-subtle text-danger rounded-pill">Sin stock</span>;
    if (stock < 10) return <span className="badge bg-warning-subtle text-warning rounded-pill">Bajo ({stock})</span>;
    return <span className="badge bg-success-subtle text-success rounded-pill">{stock} unidades</span>;
  };

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h3 className="fw-bold mb-0 text-dark">Productos</h3>
          <p className="text-muted mb-0 small">Catálogo de productos del inventario</p>
        </div>
        <button className="btn btn-primary d-flex align-items-center gap-2" onClick={openCreate}>
          <i className="bi bi-plus-lg"></i> Nuevo producto
        </button>
      </div>

      {error && <div className="alert alert-danger alert-dismissible"><span>{error}</span><button className="btn-close" onClick={() => setError("")} /></div>}

      <div className="card border-0 shadow-sm mb-3">
        <div className="card-body py-2">
          <div className="input-group">
            <span className="input-group-text bg-white border-end-0"><i className="bi bi-search text-muted"></i></span>
            <input type="text" className="form-control border-start-0 ps-0" placeholder="Buscar por nombre o SKU..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          {loading ? (
            <div className="text-center py-5"><div className="spinner-border text-primary" /></div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <i className="bi bi-box-seam fs-1 d-block mb-2"></i>
              {search ? "Sin resultados para tu búsqueda" : "No hay productos registrados"}
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0 align-middle">
                <thead><tr><th>#</th><th>Nombre</th><th>SKU</th><th>Precio</th><th>Stock</th><th className="text-end">Acciones</th></tr></thead>
                <tbody>
                  {filtered.map((p) => (
                    <tr key={p.id}>
                      <td className="text-muted small">{p.id}</td>
                      <td>
                        <div className="fw-semibold">{p.name}</div>
                        {p.description && <div className="text-muted" style={{ fontSize: "0.75rem" }}>{p.description}</div>}
                      </td>
                      <td><code className="bg-light px-2 py-1 rounded small">{p.sku}</code></td>
                      <td className="fw-semibold">${p.price.toLocaleString("es-CL")}</td>
                      <td>{stockBadge(p.stock)}</td>
                      <td className="text-end">
                        <button className="btn btn-sm btn-outline-primary me-2" onClick={() => openEdit(p)}><i className="bi bi-pencil"></i></button>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => setDeleteTarget(p)}><i className="bi bi-trash"></i></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        {!loading && filtered.length > 0 && (
          <div className="card-footer bg-white border-top text-muted small py-2 px-3">
            {filtered.length} producto{filtered.length !== 1 ? "s" : ""} encontrado{filtered.length !== 1 ? "s" : ""}
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.4)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-semibold"><i className="bi bi-box-seam me-2 text-primary"></i>{editId !== null ? "Editar producto" : "Nuevo producto"}</h5>
                <button className="btn-close" onClick={() => setShowModal(false)} />
              </div>
              <div className="modal-body">
                <div className="row g-3">
                  <div className="col-12">
                    <label className="form-label fw-semibold small">Nombre *</label>
                    <input className="form-control" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ej: Laptop Dell Inspiron 15" />
                  </div>
                  <div className="col-6">
                    <label className="form-label fw-semibold small">SKU *</label>
                    <input className="form-control" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} placeholder="Ej: LAP-DELL-001" />
                  </div>
                  <div className="col-6">
                    <label className="form-label fw-semibold small">Precio (CLP) *</label>
                    <input type="number" className="form-control" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} min={0} />
                  </div>
                  <div className="col-6">
                    <label className="form-label fw-semibold small">Stock *</label>
                    <input type="number" className="form-control" value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} min={0} />
                  </div>
                  <div className="col-12">
                    <label className="form-label fw-semibold small">Descripción</label>
                    <textarea className="form-control" rows={2} value={form.description ?? ""} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Descripción opcional del producto" />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                <button className="btn btn-primary" onClick={handleSave} disabled={saving || !form.name || !form.sku}>
                  {saving && <span className="spinner-border spinner-border-sm me-2" />}
                  {editId !== null ? "Guardar cambios" : "Crear producto"}
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
              <div className="modal-body pt-0">¿Eliminar el producto <strong>{deleteTarget.name}</strong>?</div>
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
