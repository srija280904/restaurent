// services/orderService.js
// ================================
import api from './api';

export const orderService = {
  // Get all orders with filters
  getOrders: async (params = {}) => {
    try {
      const response = await api.get('/orders', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get order by ID
  getOrderById: async (id) => {
    try {
      const response = await api.get(`/orders/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Create new order
  createOrder: async (order) => {
    try {
      const response = await api.post('/orders', order);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update order status
  updateOrderStatus: async (id, status) => {
    try {
      const response = await api.put(`/orders/${id}/status`, { status });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update order items
  updateOrderItems: async (id, items, totalAmount) => {
    try {
      const response = await api.put(`/orders/${id}/items`, {
        items,
        totalAmount
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Cancel order
  cancelOrder: async (id) => {
    try {
      const response = await api.put(`/orders/${id}/status`, {
        status: 'cancelled'
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};