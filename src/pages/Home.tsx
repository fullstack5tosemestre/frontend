import { useEffect, useState } from "react";
import { API } from "../api/config";

interface StatCard {
    label: string;
    icon: string;
    color: string;
    key: string;
}

interface DashboardStats {
    productos: number;
    sucursales: number;
    bodegas: number;
    ordenes: number;
    usuarios: number;
    roles: number;
}

const stats: StatCard[] = [
    {
        label: "Productos",
        icon: "bi-box-seam",
        color: "primary",
        key: "productos",
    },
    {
        label: "Sucursales",
        icon: "bi-building",
        color: "info",
        key: "sucursales",
    },
    {
        label: "Bodegas",
        icon: "bi-archive",
        color: "secondary",
        key: "bodegas",
    },
    {
        label: "Órdenes",
        icon: "bi-cart-check",
        color: "success",
        key: "ordenes",
    },
    {
        label: "Usuarios",
        icon: "bi-person-badge",
        color: "warning",
        key: "usuarios",
    },
    { label: "Roles", icon: "bi-shield-check", color: "danger", key: "roles" },
];

const BFF = API.replace("/api/v1", "/bff/v1");

export default function Home() {
    const [counts, setCounts] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${BFF}/dashboard`)
            .then((res) => res.json())
            .then((data: DashboardStats) => {
                setCounts(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    return (
        <div>
            {/* Header */}
            <div className="d-flex align-items-center justify-content-between mb-4">
                <div>
                    <h3 className="fw-bold mb-0 text-dark">Dashboard</h3>
                    <p className="text-muted mb-0 small">
                        Resumen general del sistema SmartLogix
                    </p>
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
                                <div
                                    className={`stat-icon mb-2 text-${s.color}`}
                                >
                                    <i className={`bi ${s.icon} fs-2`}></i>
                                </div>
                                <div className="fw-bold fs-3 text-dark">
                                    {loading ? (
                                        <span className="spinner-border spinner-border-sm text-secondary" />
                                    ) : (
                                        (counts?.[
                                            s.key as keyof DashboardStats
                                        ] ?? "–")
                                    )}
                                </div>
                                <div className="text-muted small mt-1">
                                    {s.label}
                                </div>
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
                            <i className="bi bi-info-circle me-2 text-primary"></i>
                            Acerca del sistema
                        </div>
                        <div className="card-body">
                            <p className="mb-3 text-muted">
                                <strong>SmartLogix</strong> es una plataforma de
                                gestión de inventario, pedidos y usuarios para
                                e-commerce.
                            </p>
                            <ul className="list-unstyled mb-0">
                                {[
                                    [
                                        "bi-box-seam text-primary",
                                        "Gestión de productos, sucursales y bodegas",
                                    ],
                                    [
                                        "bi-cart3 text-success",
                                        "Control de órdenes y envíos",
                                    ],
                                    [
                                        "bi-people text-info",
                                        "Administración de usuarios y roles",
                                    ],
                                    [
                                        "bi-shield-lock text-warning",
                                        "Acceso por roles: Admin, Cliente, Vendedor",
                                    ],
                                ].map(([icon, text]) => (
                                    <li
                                        key={text}
                                        className="d-flex align-items-start gap-2 mb-2"
                                    >
                                        <i className={`bi ${icon} mt-1`}></i>
                                        <span className="small text-muted">
                                            {text}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="col-12 col-lg-6">
                    <div className="card border-0 shadow-sm">
                        <div className="card-header bg-white border-bottom fw-semibold py-3">
                            <i className="bi bi-hdd-network me-2 text-primary"></i>
                            Microservicios conectados
                        </div>
                        <div className="card-body p-0">
                            {[
                                {
                                    name: "/api/v1/products",
                                    endpoint: "/products",
                                    desc: "Productos, sucursales y bodegas",
                                },
                                {
                                    name: "/api/v1/orders",
                                    endpoint: "/orders",
                                    desc: "Gestión de órdenes",
                                },
                                {
                                    name: "/api/v1/users",
                                    endpoint: "/users",
                                    desc: "Usuarios y roles",
                                },
                            ].map((svc, i, arr) => (
                                <div
                                    key={svc.name}
                                    className={`d-flex align-items-center justify-content-between px-3 py-3 ${
                                        i < arr.length - 1
                                            ? "border-bottom"
                                            : ""
                                    }`}
                                >
                                    <div>
                                        <a
                                            className="fw-semibold small text-decoration-none"
                                            href={`${API}${svc.endpoint}`}
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            {svc.name}
                                        </a>
                                        <p
                                            className="mb-0 text-muted"
                                            style={{ fontSize: "0.75rem" }}
                                        >
                                            {svc.desc}
                                        </p>
                                    </div>
                                    <span className="badge bg-success-subtle text-success rounded-pill">
                                        Online
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
