const BASE_URL = 'http://localhost:8080/api/v1';

export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(errorData.message || `API Error ${response.status}`);
  }

  return response.json();
}

export interface SearchParams {
  q?: string;
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  availability?: boolean;
  sort?: string;
  page?: number;
  size?: number;
}

export const api = {
  // Search
  search: (params: SearchParams) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query.append(key, String(value));
      }
    });
    return apiFetch<any>(`/search?${query.toString()}`);
  },

  // Products
  getProducts: () => apiFetch<any[]>('/products'),
  getProductById: (id: string) => apiFetch<any>(`/products/${id}`),

  // Inventory & Stock
  getInventory: (productId: string) => apiFetch<any>(`/inventory/${productId}`),
  seedInventory: (productId: string, stock: number = 100) =>
    apiFetch<any>(`/inventory/${productId}/seed?stock=${stock}`, { method: 'POST' }),

  // Carts
  getCart: (customerId: string = 'cust_demo') => apiFetch<any>(`/carts/${customerId}`),
  addToCart: (customerId: string, item: any) =>
    apiFetch<any>(`/carts/${customerId}/items`, {
      method: 'POST',
      body: JSON.stringify(item),
    }),
  removeFromCart: (customerId: string, productId: string) =>
    apiFetch<any>(`/carts/${customerId}/items/${productId}`, { method: 'DELETE' }),

  // Checkout & Reservations
  processCheckout: (request: any, idempotencyKey?: string) => {
    const key = idempotencyKey || `chk_ui_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    return apiFetch<any>('/checkout', {
      method: 'POST',
      headers: { 'Idempotency-Key': key },
      body: JSON.stringify(request),
    });
  },

  // Orders
  getOrders: (customerId: string = 'cust_demo') => apiFetch<any[]>(`/orders?customerId=${customerId}`),
  getOrderById: (id: string) => apiFetch<any>(`/orders/${id}`),

  // Recommendations
  getRecommendations: (category?: string, brand?: string) => {
    const query = new URLSearchParams();
    if (category) query.append('category', category);
    if (brand) query.append('brand', brand);
    return apiFetch<any[]>(`/recommendations?${query.toString()}`);
  },

  // Hackathon Demo Simulation APIs
  simulateFlashSale: (productId: string = 'prod_flash_1', initialStock: number = 100, requests: number = 10000) =>
    apiFetch<any>(`/demo/simulate-flash-sale?productId=${productId}&initialStock=${initialStock}&requests=${requests}`, { method: 'POST' }),

  simulatePaymentFailure: () => apiFetch<any>('/demo/simulate-payment-failure', { method: 'POST' }),
  simulatePaymentTimeout: () => apiFetch<any>('/demo/simulate-payment-timeout', { method: 'POST' }),
  toggleOrderService: (active: boolean) => apiFetch<any>(`/demo/toggle-order-service?active=${active}`, { method: 'POST' }),
  expireReservations: () => apiFetch<any>('/demo/expire-reservations', { method: 'POST' }),
};
