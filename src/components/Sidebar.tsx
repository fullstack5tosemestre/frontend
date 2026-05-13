import { NavLink } from "react-router-dom";

const navItems = [
  {
    section: "Dashboard",
    icon: "bi-speedometer2",
    links: [{ to: "/", label: "Inicio" }],
  },
  {
    section: "Inventario",
    icon: "bi-boxes",
    links: [
      { to: "/productos", label: "Productos" },
      { to: "/sucursales", label: "Sucursales" },
      { to: "/bodegas", label: "Bodegas" },
    ],
  },
  {
    section: "Pedidos",
    icon: "bi-cart3",
    links: [{ to: "/pedidos", label: "Órdenes" }],
  },
  {
    section: "Usuarios",
    icon: "bi-people",
    links: [
      { to: "/usuarios", label: "Usuarios" },
      { to: "/roles", label: "Roles" },
    ],
  },
];

export default function Sidebar() {
  return (
    <nav className="sidebar d-flex flex-column">
      {/* Brand */}
      <div className="sidebar-brand px-3 py-4 d-flex align-items-center gap-2">
        <i className="bi bi-truck fs-4 text-primary"></i>
        <span className="fw-bold fs-5">SmartLogix</span>
      </div>

      <hr className="sidebar-divider mx-3 my-0" />

      {/* Nav sections */}
      <div className="sidebar-nav flex-grow-1 px-2 pt-3">
        {navItems.map((group) => (
          <div key={group.section} className="mb-3">
            <div className="sidebar-section-label px-2 mb-1">
              <i className={`bi ${group.icon} me-2`}></i>
              {group.section}
            </div>
            {group.links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/"}
                className={({ isActive }) =>
                  `sidebar-link d-flex align-items-center px-3 py-2 rounded-2 mb-1 text-decoration-none ${
                    isActive ? "sidebar-link-active" : ""
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="sidebar-footer px-3 py-3 text-muted small">
        <i className="bi bi-info-circle me-1"></i>
        SmartLogix v1.0
      </div>
    </nav>
  );
}
