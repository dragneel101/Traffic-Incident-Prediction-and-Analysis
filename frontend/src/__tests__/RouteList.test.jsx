import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import RouteList from "../components/RouteList";

const ROUTES = [
  {
    properties: {
      route_id: 0,
      risk_score: 0.15,
      is_recommended: true,
      distance_km: 5.2,
      duration_min: 10,
      incident_count: 0,
    },
  },
  {
    properties: {
      route_id: 1,
      risk_score: 0.45,
      is_recommended: false,
      distance_km: 6.8,
      duration_min: 14,
      incident_count: 2,
    },
  },
  {
    properties: {
      route_id: 2,
      risk_score: 0.75,
      is_recommended: false,
      distance_km: 8.1,
      duration_min: 18,
      incident_count: 1,
    },
  },
];

describe("RouteList", () => {
  it("renders all route cards", () => {
    render(<RouteList routes={ROUTES} selectedRouteId={null} onSelect={vi.fn()} />);
    expect(screen.getByText("Route 1")).toBeInTheDocument();
    expect(screen.getByText("Route 2")).toBeInTheDocument();
    expect(screen.getByText("Route 3")).toBeInTheDocument();
  });

  it("shows recommended badge on the recommended route", () => {
    render(<RouteList routes={ROUTES} selectedRouteId={null} onSelect={vi.fn()} />);
    expect(screen.getByText(/recommended/i)).toBeInTheDocument();
  });

  it("displays correct risk levels", () => {
    render(<RouteList routes={ROUTES} selectedRouteId={null} onSelect={vi.fn()} />);
    expect(screen.getByText("Low")).toBeInTheDocument();
    expect(screen.getByText("Medium")).toBeInTheDocument();
    expect(screen.getByText("High")).toBeInTheDocument();
  });

  it("shows distance and duration for each route", () => {
    render(<RouteList routes={ROUTES} selectedRouteId={null} onSelect={vi.fn()} />);
    expect(screen.getByText(/5\.2 km/)).toBeInTheDocument();
    expect(screen.getByText(/10 min/)).toBeInTheDocument();
  });

  it("calls onSelect with the correct route_id when clicked", async () => {
    const onSelect = vi.fn();
    render(<RouteList routes={ROUTES} selectedRouteId={null} onSelect={onSelect} />);

    const cards = screen.getAllByRole("button");
    await userEvent.click(cards[1]);
    expect(onSelect).toHaveBeenCalledWith(1);
  });

  it("highlights the selected route with indigo border", () => {
    const { container } = render(
      <RouteList routes={ROUTES} selectedRouteId={0} onSelect={vi.fn()} />
    );
    const selectedCard = container.querySelector(".border-indigo-500");
    expect(selectedCard).toBeTruthy();
  });

  it("renders nothing when no routes provided", () => {
    const { container } = render(
      <RouteList routes={[]} selectedRouteId={null} onSelect={vi.fn()} />
    );
    expect(container).toBeEmptyDOMElement();
  });
});
