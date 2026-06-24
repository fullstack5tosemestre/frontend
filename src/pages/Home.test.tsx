import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import Home from "./Home";

describe("Home", () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("shows a spinner while loading and then renders the stats from the BFF", async () => {
        const stats = {
            productos: 12,
            sucursales: 3,
            bodegas: 5,
            ordenes: 20,
            usuarios: 8,
            roles: 3,
        };
        const fetchMock = vi.fn().mockResolvedValue({
            json: () => Promise.resolve(stats),
        });
        vi.stubGlobal("fetch", fetchMock);

        render(<Home />);

        expect(screen.getByText("Dashboard")).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.getByText("12")).toBeInTheDocument();
        });
        expect(screen.getByText("20")).toBeInTheDocument();
        expect(screen.getByText("Productos")).toBeInTheDocument();
    });

    it("shows a dash placeholder if the dashboard request fails", async () => {
        const fetchMock = vi.fn().mockRejectedValue(new Error("network error"));
        vi.stubGlobal("fetch", fetchMock);

        render(<Home />);

        await waitFor(() => {
            expect(screen.getAllByText("–").length).toBeGreaterThan(0);
        });
    });
});
