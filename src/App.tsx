import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import "../src/css/styles.css";

// Inventario
import ProductsPage from "./pages/ProductsPage";
import BranchesPage from "./pages/BranchesPage";
import WarehousesPage from "./pages/WarehousesPage";

// Pedidos
import OrdersPage from "./pages/OrdersPage";

// Usuarios
import UsersPage from "./pages/UsersPage";
import RolesPage from "./pages/RolesPage";

export default function App() {
    return (
        <Routes>
            <Route element={<Layout />}>
                <Route path="/" element={<Home />} />
                <Route path="/productos" element={<ProductsPage />} />
                <Route path="/sucursales" element={<BranchesPage />} />
                <Route path="/bodegas" element={<WarehousesPage />} />
                <Route path="/pedidos" element={<OrdersPage />} />
                <Route path="/usuarios" element={<UsersPage />} />
                <Route path="/roles" element={<RolesPage />} />
            </Route>
        </Routes>
    );
}
