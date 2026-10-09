// Thin API client. The backend address is same-origin (empty string) in
// any production build, and localhost:8000 in dev, decided by Vite's own
// built-in import.meta.env.DEV flag rather than a custom .env file. That
// flag is baked in by Vite itself at build time no matter what, so this
// can't silently break if a dotfile gets lost in a manual file move, the
// way a .env.production-based approach could (and once did, in practice).
// VITE_API_BASE, if a .env file happens to set it, still overrides both.
const API_BASE = import.meta.env.VITE_API_BASE ?? (import.meta.env.DEV ? "http://localhost:8000" : "");

function getToken() {
  return localStorage.getItem("freshroute_token");
}

async function request(path, { method = "GET", body, auth = true } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  let data = null;
  try {
    data = await res.json();
  } catch {
    // no body, fine for some endpoints
  }
  if (!res.ok) {
    const message = (data && data.detail) || `Request failed (${res.status})`;
    throw new Error(message);
  }
  return data;
}

export const api = {
  register: (payload) => request("/api/auth/register", { method: "POST", body: payload, auth: false }),
  login: (payload) => request("/api/auth/login", { method: "POST", body: payload, auth: false }),
  me: () => request("/api/auth/me"),

  listRestaurants: () => request("/api/restaurants", { auth: false }),
  createRestaurant: (payload) => request("/api/restaurants", { method: "POST", body: payload }),
  getMenu: (restaurantId) => request(`/api/restaurants/${restaurantId}/menu`, { auth: false }),
  addMenuItem: (restaurantId, payload) =>
    request(`/api/restaurants/${restaurantId}/menu`, { method: "POST", body: payload }),
  updateMenuItem: (itemId, payload) =>
    request(`/api/menu-items/${itemId}`, { method: "PATCH", body: payload }),

  placeOrder: (payload) => request("/api/orders", { method: "POST", body: payload }),
  listOrders: () => request("/api/orders"),
  getOrder: (orderId) => request(`/api/orders/${orderId}`),
  getOrderHistory: (orderId) => request(`/api/orders/${orderId}/history`),
  claimOrder: (orderId) => request(`/api/orders/${orderId}/claim`, { method: "POST" }),
  updateOrderStatus: (orderId, status) =>
    request(`/api/orders/${orderId}/status`, { method: "PATCH", body: { status } }),

  getAnalytics: (restaurantId) => request(`/api/restaurants/${restaurantId}/analytics`),
};

export function saveToken(token) {
  localStorage.setItem("freshroute_token", token);
}
export function clearToken() {
  localStorage.removeItem("freshroute_token");
}
