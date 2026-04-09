import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { AuthProvider, useAuth } from "../context/AuthContext";

// ── Mock axios client ─────────────────────────────────────────────────────────
const mockPost = vi.fn();
const mockGet  = vi.fn();

vi.mock("../api/client", () => ({
  default: {
    post: (...args) => mockPost(...args),
    get:  (...args) => mockGet(...args),
    interceptors: {
      request:  { use: vi.fn() },
      response: { use: vi.fn() },
    },
  },
  setAccessToken: vi.fn(),
  getAccessToken: vi.fn(),
  getTotalPredictions:  vi.fn(),
  getTimeseries:        vi.fn(),
  getFrequentLocations: vi.fn(),
  getRecentActivity:    vi.fn(),
}));

// ── Helper consumer component ─────────────────────────────────────────────────
function AuthConsumer() {
  const { user, isAuthenticated, ready, login, logout } = useAuth();
  if (!ready) return <span data-testid="loading">loading</span>;
  return (
    <div>
      <span data-testid="authenticated">{String(isAuthenticated)}</span>
      <span data-testid="username">{user?.name ?? "none"}</span>
      <button onClick={() => login("a@b.com", "pass")}>Login</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

function renderWithAuth() {
  return render(
    <AuthProvider>
      <AuthConsumer />
    </AuthProvider>
  );
}

// ── Shared mock responses ─────────────────────────────────────────────────────
const SIGNIN_RESPONSE   = { data: { access_token: "test-at", refresh_token: "test-rt" } };
const PROFILE_RESPONSE  = { data: { name: "Alice", email: "a@b.com" } };
const REFRESH_RESPONSE  = { data: { access_token: "refreshed-at" } };

describe("AuthContext", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("starts unauthenticated when localStorage is empty", async () => {
    renderWithAuth();
    await waitFor(() =>
      expect(screen.queryByTestId("loading")).not.toBeInTheDocument()
    );
    expect(screen.getByTestId("authenticated").textContent).toBe("false");
  });

  it("becomes authenticated after successful login", async () => {
    mockPost.mockResolvedValueOnce(SIGNIN_RESPONSE);
    mockGet.mockResolvedValueOnce(PROFILE_RESPONSE);

    renderWithAuth();
    await waitFor(() => expect(screen.queryByTestId("loading")).not.toBeInTheDocument());

    await userEvent.click(screen.getByText("Login"));

    await waitFor(() =>
      expect(screen.getByTestId("authenticated").textContent).toBe("true")
    );
    expect(screen.getByTestId("username").textContent).toBe("Alice");
  });

  it("stores refresh token in localStorage after login", async () => {
    mockPost.mockResolvedValueOnce(SIGNIN_RESPONSE);
    mockGet.mockResolvedValueOnce(PROFILE_RESPONSE);

    renderWithAuth();
    await waitFor(() => expect(screen.queryByTestId("loading")).not.toBeInTheDocument());

    await userEvent.click(screen.getByText("Login"));

    await waitFor(() =>
      expect(localStorage.getItem("refresh_token")).toBe("test-rt")
    );
  });

  it("clears state and localStorage on logout", async () => {
    mockPost.mockResolvedValueOnce(SIGNIN_RESPONSE);
    mockGet.mockResolvedValueOnce(PROFILE_RESPONSE);
    mockPost.mockResolvedValueOnce({ data: {} }); // /auth/logout

    renderWithAuth();
    await waitFor(() => expect(screen.queryByTestId("loading")).not.toBeInTheDocument());

    await userEvent.click(screen.getByText("Login"));
    await waitFor(() => expect(screen.getByTestId("authenticated").textContent).toBe("true"));

    await userEvent.click(screen.getByText("Logout"));
    await waitFor(() =>
      expect(screen.getByTestId("authenticated").textContent).toBe("false")
    );
    expect(localStorage.getItem("refresh_token")).toBeNull();
  });

  it("silently restores session on mount when refresh token exists", async () => {
    localStorage.setItem("refresh_token", "stored-rt");
    mockPost.mockResolvedValueOnce(REFRESH_RESPONSE); // /auth/refresh
    mockGet.mockResolvedValueOnce(PROFILE_RESPONSE);  // /user/profile

    renderWithAuth();

    await waitFor(() =>
      expect(screen.getByTestId("authenticated").textContent).toBe("true")
    );
    expect(mockPost).toHaveBeenCalledWith(
      "/auth/refresh",
      expect.objectContaining({ refresh_token: "stored-rt" })
    );
  });

  it("clears invalid refresh token on failed restore", async () => {
    localStorage.setItem("refresh_token", "expired-rt");
    mockPost.mockRejectedValueOnce(new Error("401"));

    renderWithAuth();

    await waitFor(() =>
      expect(screen.getByTestId("authenticated").textContent).toBe("false")
    );
    expect(localStorage.getItem("refresh_token")).toBeNull();
  });
});
