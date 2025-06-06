// src/services/menuService.js - Fixed Response Handling
// ================================
import api from './api';

export const menuService = {
  // Get all menu items with filters
  getMenuItems: async (params = {}) => {
    try {
      console.log('🔍 Fetching menu items with params:', params);
      const response = await api.get('/menu', { params });
      console.log('📊 Menu items response:', response.data);
      
      // Backend returns { status: 'success', results: number, menuItems: [...] }
      return {
        menuItems: response.data.menuItems || [],
        pagination: response.data.pagination || {}
      };
    } catch (error) {
      console.error('❌ Error in getMenuItems:', error);
      throw error;
    }
  },

  // Get menu item by ID
  getMenuItemById: async (id) => {
    try {
      const response = await api.get(`/menu/${id}`);
      return response.data.menuItem;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Create new menu item
  createMenuItem: async (menuItem) => {
    try {
      const response = await api.post('/menu', menuItem);
      return response.data.menuItem;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update menu item
  updateMenuItem: async (id, menuItem) => {
    try {
      const response = await api.put(`/menu/${id}`, menuItem);
      return response.data.menuItem;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete menu item
  deleteMenuItem: async (id) => {
    try {
      const response = await api.delete(`/menu/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};
