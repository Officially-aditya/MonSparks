import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Quest API
export const questsApi = {
  getAll: (address?: string) =>
    api.get("/quests", { params: { address } }).then((res) => res.data),

  getById: (id: number, address?: string) =>
    api.get(`/quests/${id}`, { params: { address } }).then((res) => res.data),

  complete: (id: number, userAddress: string) =>
    api.post(`/quests/${id}/complete`, { userAddress }).then((res) => res.data),

  getProgress: (address: string) =>
    api.get(`/quests/progress/${address}`).then((res) => res.data),
};

// Gas API
export const gasApi = {
  getEligibility: (address: string) =>
    api.get(`/gas/eligibility/${address}`).then((res) => res.data),

  allocate: (userAddress: string) =>
    api.post("/gas/allocate", { userAddress }).then((res) => res.data),

  revert: (allocationId: string, userAddress: string) =>
    api.post("/gas/revert", { allocationId, userAddress }).then((res) => res.data),

  getPoolBalance: () => api.get("/gas/pool").then((res) => res.data),

  getAllocations: (address: string) =>
    api.get(`/gas/allocations/${address}`).then((res) => res.data),
};

// Bridge API
export const bridgeApi = {
  calculate: (inputAmount: string, targetToken: string) =>
    api.post("/bridge/calculate", { inputAmount, targetToken }).then((res) => res.data),

  initiate: (userAddress: string, amount: string, targetChain: string, targetToken: string) =>
    api
      .post("/bridge/initiate", { userAddress, amount, targetChain, targetToken })
      .then((res) => res.data),

  getRequest: (requestId: string) =>
    api.get(`/bridge/request/${requestId}`).then((res) => res.data),

  getSupported: () => api.get("/bridge/supported").then((res) => res.data),
};

// Activity API
export const activityApi = {
  getAll: (limit?: number) =>
    api.get("/activity", { params: { limit } }).then((res) => res.data),

  getByUser: (address: string, limit?: number) =>
    api.get(`/activity/${address}`, { params: { limit } }).then((res) => res.data),
};

export default api;
