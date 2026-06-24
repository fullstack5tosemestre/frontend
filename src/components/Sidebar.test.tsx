import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Sidebar from "./Sidebar";

describe("Sidebar", () => {
    it("renders the brand and every navigation link", () => {
        render(
            <MemoryRouter>
                <Sidebar />
            </MemoryRouter>,
        );

        expect(screen.getByText("SmartLogix")).toBeInTheDocument();

        const expectedLinks = [
            "Inicio",
            "Productos",
            "Sucursales",
            "Bodegas",
            "Órdenes",
            "Usuarios",
            "Roles",
        ];
        for (const label of expectedLinks) {
            expect(screen.getByRole("link", { name: label })).toBeInTheDocument();
        }
    });

    it("marks the link matching the current route as active", () => {
        render(
            <MemoryRouter initialEntries={["/productos"]}>
                <Sidebar />
            </MemoryRouter>,
        );

        expect(screen.getByRole("link", { name: "Productos" })).toHaveClass(
            "sidebar-link-active",
        );
        expect(screen.getByRole("link", { name: "Inicio" })).not.toHaveClass(
            "sidebar-link-active",
        );
    });
});
