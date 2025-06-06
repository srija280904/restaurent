// ================================
// src/services/analyticsService.js - Fixed Response Handling
// ================================
import api from './api';

export const analyticsService = {
  // Get sales analytics
  getSalesAnalytics: async (params = {}) => {
    try {
      console.log('🔍 Fetching sales analytics with params:', params);
      const response = await api.get('/analytics/sales', { params });
      console.log('📊 Sales analytics response:', response.data);
      
      // Backend returns { status: 'success', results: number, data: [...] }
      // Return the data array directly
      return response.data.data || [];
    } catch (error) {
      console.error('❌ Error in getSalesAnalytics:', error);
      throw error;
    }
  },

  // Get popular items
  getPopularItems: async () => {
    try {
      console.log('🔍 Fetching popular items...');
      const response = await api.get('/analytics/popular-items');
      console.log('📊 Popular items response:', response.data);
      
      return response.data.data || [];
    } catch (error) {
      console.error('❌ Error in getPopularItems:', error);
      throw error;
    }
  },

  // Get category revenue
  getCategoryRevenue: async () => {
    try {
      console.log('🔍 Fetching category revenue...');
      const response = await api.get('/analytics/category-revenue');
      console.log('📊 Category revenue response:', response.data);
      
      return response.data.data || [];
    } catch (error) {
      console.error('❌ Error in getCategoryRevenue:', error);
      throw error;
    }
  },

  // Get peak hours
  getPeakHours: async () => {
    try {
      console.log('🔍 Fetching peak hours...');
      const response = await api.get('/analytics/peak-hours');
      console.log('📊 Peak hours response:', response.data);
      
      return response.data.data || [];
    } catch (error) {
      console.error('❌ Error in getPeakHours:', error);
      throw error;
    }
  },

  // Get dashboard summary - NEW
  getSummary: async () => {
    try {
      console.log('🔍 Fetching dashboard summary...');
      const response = await api.get('/analytics/summary');
      console.log('📊 Summary response:', response.data);
      
      return response.data.data || {};
    } catch (error) {
      console.error('❌ Error in getSummary:', error);
      throw error;
    }
  }
};