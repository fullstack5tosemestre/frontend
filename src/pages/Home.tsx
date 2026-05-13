import { useEffect, useState } from "react";
import { API } from "../api/config";

interface StatCard {
  label: string;
  icon: string;
  color: string;
  endpoint: string;
  key: string;
}

const stats: StatCard[] = [
  { label: "Productos", icon: "bi-box-seam", color: "primary", endpoint: "/products", key: "productos" },
  { label: "Sucursales", icon: "bi-building", color: "info", endpoint: "/branches", key: "sucursales" },
  { label: "Bodegas", icon: "bi-archive", color: "secondary", endpoint: "/warehouses", key: "bodegas" },
  { label: "Órdenes", icon: "bi-cart-check", color: "success", endpoint: "/orders", key: "ordenes" },
  { label: "Usuarios", icon: "bi-person-badge", color: "warning", endpoint: "/usuarios", key: "usuarios" },
  { label: "Roles", icon: "bi-shield-check", color: "danger", endpoint: "/roles", key: "roles" },
];

export default function Home() {
  const [counts, setCounts] = useState<Record<string, number | string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetches = stats.map(async (s) => {
      try {
        const res = await fetch(`${API}${s.endpoint}`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        return { key: s.key, count: Array.isArray(data) ? data.length : "–" };
      } catch {
        return { key: s.key, count: "–" };
      }
    });

    Promise.all(fetches).then((results) => {
      const map: Record<string, number | string> = {};
      results.forEach((r) => (map[r.key] = r.count));
      setCounts(map);
      setLoading(false);
    });
  }, []);

  return (
    <div>
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h3 className="fw-bold mb-0 text-dark">Dashboard</h3>
          <p className="text-muted mb-0 small">Resumen general del sistema SmartLogix</p>
        </div>
        <span className="badge bg-primary-subtle text-primary rounded-pill px-3 py-2">
          <i className="bi bi-activity me-1"></i>Sistema activo
        </span>
      </div>

      {/* Stat cards */}
      <div className="row g-3 mb-4">
        {stats.map((s) => (
          <div className="col-6 col-md-4 col-xl-2" key={s.key}>
            <div className="card border-0 shadow-sm h-100 stat-card">
              <div className="card-body d-flex flex-column align-items-center justify-content-center py-4">
                <div className={`stat-icon mb-2 text-${s.color}`}>
                  <i className={`bi ${s.icon} fs-2`}></i>
                </div>
                <div className="fw-bold fs-3 text-dark">
                  {loading ? (
                    <span className="spinner-border spinner-border-sm text-secondary" />
                  ) : (
                    counts[s.key]
                  )}
                </div>
                <div className="text-muted small mt-1">{s.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Info panel */}
      <div className="row g-3">
        <div className="col-12 col-lg-6">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-bottom fw-semibold py-3">
              <i className="bi bi-info-circle me-2 text-primary"></i>Acerca del sistema
            </div>
            <div className="card-body">
              <p className="mb-3 text-muted">
                <strong>SmartLogix</strong> es una plataforma de gestión de inventario, pedidos y usuarios para e-commerce.
              </p>
              <ul className="list-unstyled mb-0">
                {[
                  ["bi-box-seam text-primary", "Gestión de productos, sucursales y bodegas"],
                  ["bi-cart3 text-success", "Control de órdenes y envíos"],
                  ["bi-people text-info", "Administración de usuarios y roles"],
                  ["bi-shield-lock text-warning", "Acceso por roles: Admin, Cliente, Vendedor"],
                ].map(([icon, text]) => (
                  <li key={text} className="d-flex align-items-start gap-2 mb-2">
                    <i className={`bi ${icon} mt-1`}></i>
                    <span className="small text-muted">{text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-6">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-bottom fw-semibold py-3">
              <i className="bi bi-hdd-network me-2 text-primary"></i>Microservicios conectados
            </div>
            <div className="card-body p-0">
              {[
                { name: "api-inventario", port: "8081", desc: "Productos, sucursales y bodegas" },
                { name: "api-pedidos", port: "8081", desc: "Gestión de órdenes" },
                { name: "api-usuarios", port: "8082", desc: "Usuarios y roles" },
                { name: "api-gateway", port: "80", desc: "Punto de entrada único (proxy)" },
              ].map((svc, i, arr) => (
                <div
                  key={svc.name}
                  className={`d-flex align-items-center justify-content-between px-3 py-3 ${
                    i < arr.length - 1 ? "border-bottom" : ""
                  }`}
                >
                  <div>
                    <span className="fw-semibold small">{svc.name}</span>
                    <span className="text-muted small ms-2">:{svc.port}</span>
                    <p className="mb-0 text-muted" style={{ fontSize: "0.75rem" }}>
                      {svc.desc}
                    </p>
                  </div>
                  <span className="badge bg-success-subtle text-success rounded-pill">Online</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
