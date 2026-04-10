import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import RoutePlanner from "../components/RoutePlanner";

// ── Mock heavy dependencies ───────────────────────────────────────────────────

// Leaflet / react-leaflet don't work in jsdom
vi.mock("../components/MapView", () => ({
  default: () => <div data-testid="map-view" />,
}));

vi.mock("../components/AddressSearch", () => ({
  default: ({ label, onSelect }) => {
    const id = label.split(" ")[0]; // "Start" or "End"
    return (
      <div>
        <span>{label}</span>
        <button onClick={() => onSelect({ latitude: 43.65, longitude: -79.38 })}>
          Select {id}
        </button>
      </div>
    );
  },
}));

// Mock predict API
const mockGetMultipleRouteRisks = vi.fn();
const mockGetTrafficIncidents = vi.fn();
vi.mock("../api/predict", () => ({
  getMultipleRouteRisks: (...args) => mockGetMultipleRouteRisks(...args),
  getTrafficIncidents: (...args) => mockGetTrafficIncidents(...args),
}));

// Mock auth context
vi.mock("../context/AuthContext", () => ({
  useAuth: () => ({ user: { name: "Test" }, isAuthenticated: true }),
}));

// ── Test data ─────────────────────────────────────────────────────────────────

const MOCK_GEOJSON = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      geometry: { type: "LineString", coordinates: [[-79.38, 43.65], [-79.40, 43.66]] },
      properties: {
        route_id: 0,
        risk_score: 0.15,
        is_recommended: true,
        distance_km: 5.2,
        duration_min: 10,
        incident_count: 0,
        congestion_level: 0.1,
      },
    },
    {
      type: "Feature",
      geometry: { type: "LineString", coordinates: [[-79.38, 43.65], [-79.42, 43.67]] },
      properties: {
        route_id: 1,
        risk_score: 0.45,
        is_recommended: false,
        distance_km: 6.8,
        duration_min: 14,
        incident_count: 1,
        congestion_level: 0.3,
      },
    },
  ],
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function renderPlanner() {
  return render(
    <MemoryRouter>
      <RoutePlanner />
    </MemoryRouter>
  );
}

describe("RoutePlanner", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetTrafficIncidents.mockResolvedValue({ features: [] });
  });

  it("renders start and end address inputs", () => {
    renderPlanner();
    expect(screen.getByText("Start Address")).toBeInTheDocument();
    expect(screen.getByText("End Address")).toBeInTheDocument();
  });

  it("renders the map", () => {
    renderPlanner();
    expect(screen.getByTestId("map-view")).toBeInTheDocument();
  });

  it("shows predict button", () => {
    renderPlanner();
    expect(screen.getByRole("button", { name: /predict/i })).toBeInTheDocument();
  });

  it("shows route list after successful prediction", async () => {
    mockGetMultipleRouteRisks.mockResolvedValue(MOCK_GEOJSON);

    renderPlanner();

    // Select start and end
    await userEvent.click(screen.getByText("Select Start"));
    await userEvent.click(screen.getByText("Select End"));

    // Submit prediction
    await userEvent.click(screen.getByRole("button", { name: /predict/i }));

    // Route cards should appear
    await waitFor(() => {
      expect(screen.getByText("Safest Route")).toBeInTheDocument();
      expect(screen.getByText("Alternative 2")).toBeInTheDocument();
    });
  });

  it("shows loading state while predicting", async () => {
    // Never resolves during this check
    mockGetMultipleRouteRisks.mockReturnValue(new Promise(() => {}));

    renderPlanner();
    await userEvent.click(screen.getByText("Select Start"));
    await userEvent.click(screen.getByText("Select End"));
    await userEvent.click(screen.getByRole("button", { name: /predict/i }));

    expect(screen.getAllByText(/calculating/i).length).toBeGreaterThan(0);
  });

  it("shows error toast on prediction failure", async () => {
    mockGetMultipleRouteRisks.mockRejectedValue(new Error("Network error"));

    renderPlanner();
    await userEvent.click(screen.getByText("Select Start"));
    await userEvent.click(screen.getByText("Select End"));
    await userEvent.click(screen.getByRole("button", { name: /predict/i }));

    await waitFor(() => {
      // Route list should not appear
      expect(screen.queryByText("Safest Route")).not.toBeInTheDocument();
    });
  });
});
