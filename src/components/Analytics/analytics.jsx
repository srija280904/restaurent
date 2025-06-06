// src/components/Analytics/Analytics.jsx - WITH DEBUG LOGGING
import React, { useState, useEffect } from 'react';
import { useDataContext } from '../../Context/DataContext';
import SalesChart from './SalesChart';
import PopularItems from './PopularItems';
import CategoryRevenue from './CategoryRevenue';
import { analyticsService } from '../../services/analyticsService';
import { formatCurrency } from '../../utils/helpers';

const Analytics = () => {
  const { lastOrderUpdate } = useDataContext();
  const [peakHours, setPeakHours] = useState([]);
  const [summary, setSummary] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    peakHour: 'N/A'
  });
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Fetch data when component mounts or when orders are updated
  useEffect(() => {
    console.log('🔄 Analytics useEffect triggered by order update:', lastOrderUpdate);
    fetchAnalyticsData();
  }, [lastOrderUpdate]);

  // Auto-refresh every 60 seconds as backup
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('🔄 Auto-refreshing analytics (60s interval)...');
      fetchAnalyticsData();
    }, 60000);

    return () => clearInterval(interval);
  }, []);

const fetchAnalyticsData = async () => {
  try {
    setLoading(true);
    console.log('📊 Fetching all analytics data...');
    
    // Get summary from backend
    const summaryData = await analyticsService.getSummary();
    console.log('📊 Summary data received from backend:', summaryData);
    
    // ✅ QUICK FIX: Calculate correct revenue from orders directly
    const ordersResponse = await fetch('http://localhost:5001/api/orders');
    const ordersData = await ordersResponse.json();
    const allOrders = ordersData.orders || [];
    
    // Calculate correct metrics
    const correctTotalRevenue = allOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const correctTotalOrders = allOrders.length;
    const correctAverageOrderValue = correctTotalOrders > 0 ? correctTotalRevenue / correctTotalOrders : 0;
    
    console.log('📊 Corrected calculations:', {
      backendRevenue: summaryData.totalRevenue,
      correctRevenue: correctTotalRevenue,
      backendOrders: summaryData.totalOrders,
      correctOrders: correctTotalOrders
    });
    
    setSummary({
      totalRevenue: correctTotalRevenue, // ✅ Use corrected revenue
      totalOrders: correctTotalOrders,   // ✅ Use corrected orders
      averageOrderValue: correctAverageOrderValue, // ✅ Use corrected average
      peakHour: 'N/A' // Will be calculated from peak hours
    });
    
    // Fetch peak hours data
    const peakHoursData = await analyticsService.getPeakHours();
    setPeakHours(peakHoursData || []);
    
    // Find peak hour from peak hours data
    if (peakHoursData && peakHoursData.length > 0) {
      const peakHourData = peakHoursData.reduce((peak, hour) => 
        hour.orderCount > peak.orderCount ? hour : peak
      , { orderCount: 0, _id: 0 });
      
      const peakHourFormatted = peakHourData._id !== undefined 
        ? `${peakHourData._id}:00 - ${peakHourData._id + 1}:00`
        : 'N/A';
        
      setSummary(prev => ({
        ...prev,
        peakHour: peakHourFormatted
      }));
    }
    
    setLastRefresh(new Date());
    console.log('✅ Analytics data updated with corrected revenue');
    
  } catch (error) {
    console.error('❌ Failed to fetch analytics data:', error);
  } finally {
    setLoading(false);
  }
};

  const handleManualRefresh = () => {
    console.log('🔄 Manual refresh triggered');
    fetchAnalyticsData();
  };

  const formatHour = (hour) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:00 ${period}`;
  };

  // DEBUG LOGGING
  console.log('🔍 Analytics render data:', {
    summaryState: summary,
    loading: loading,
    lastOrderUpdate: lastOrderUpdate,
    lastRefresh: lastRefresh.toISOString()
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-sm text-gray-600">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </p>
          <p className="text-xs text-gray-500">
            Order update trigger: {lastOrderUpdate}
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => window.debugAnalytics && window.debugAnalytics()}
            className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600"
          >
            Debug
          </button>
          <button
            onClick={handleManualRefresh}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
          >
            <span className={loading ? 'animate-spin' : ''}>{loading ? '🔄' : '↻'}</span>
            <span>{loading ? 'Refreshing...' : 'Refresh Data'}</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
          <div className="flex items-center">
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Total Revenue</h3>
              <p className="text-2xl font-bold text-green-600">
                {loading ? '...' : formatCurrency(summary.totalRevenue)}
              </p>
              <p className="text-xs text-gray-600 mt-1">All time</p>
            </div>
            <div className="text-green-500 text-3xl">💰</div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
          <div className="flex items-center">
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Total Orders</h3>
              <p className="text-2xl font-bold text-blue-600">
                {loading ? '...' : summary.totalOrders.toLocaleString()}
              </p>
              <p className="text-xs text-gray-600 mt-1">All time</p>
            </div>
            <div className="text-blue-500 text-3xl">📋</div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-purple-500">
          <div className="flex items-center">
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Average Order Value</h3>
              <p className="text-2xl font-bold text-purple-600">
                {loading ? '...' : formatCurrency(summary.averageOrderValue)}
              </p>
              <p className="text-xs text-gray-600 mt-1">Per order</p>
            </div>
            <div className="text-purple-500 text-3xl">📊</div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-orange-500">
          <div className="flex items-center">
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Peak Hour</h3>
              <p className="text-lg font-bold text-orange-600">
                {loading ? '...' : summary.peakHour}
              </p>
              <p className="text-xs text-gray-600 mt-1">Busiest time</p>
            </div>
            <div className="text-orange-500 text-3xl">🕐</div>
          </div>
        </div>
      </div>

      {/* Charts - Pass lastOrderUpdate to force refresh */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SalesChart key={`sales-${lastOrderUpdate}`} />
        <CategoryRevenue key={`category-${lastOrderUpdate}`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PopularItems key={`popular-${lastOrderUpdate}`} />
        
        {/* Peak Hours Chart */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Peak Hours Analysis</h3>
          
          {loading ? (
            <div className="animate-pulse space-y-2">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded"></div>
              ))}
            </div>
          ) : peakHours.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No data available</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {peakHours
                .sort((a, b) => b.orderCount - a.orderCount)
                .map((hour) => {
                  const maxOrders = Math.max(...peakHours.map(h => h.orderCount));
                  const percentage = maxOrders > 0 ? (hour.orderCount / maxOrders) * 100 : 0;
                  
                  return (
                    <div key={hour._id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                      <div className="flex items-center w-full">
                        <span className="text-sm font-medium w-20">
                          {formatHour(hour._id)}
                        </span>
                        <div className="flex-1 mx-3">
                          <div className="bg-gray-200 rounded-full h-3">
                            <div
                              className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-semibold">
                            {hour.orderCount} orders
                          </span>
                          <p className="text-xs text-gray-600">
                            {formatCurrency(hour.totalRevenue)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;

// Debug function (add this to your browser console)
window.debugAnalytics = async () => {
  console.log('🔍 Debug Analytics Backend...');
  
  try {
    // Test summary endpoint
    const summaryRes = await fetch('http://localhost:5001/api/analytics/summary');
    const summaryData = await summaryRes.json();
    console.log('📊 Summary from backend:', summaryData);
    
    // Test orders count directly
    const ordersRes = await fetch('http://localhost:5001/api/orders');
    const ordersData = await ordersRes.json();
    console.log('📋 Orders from backend:', {
      totalOrders: ordersData.orders?.length,
      totalRevenue: ordersData.orders?.reduce((sum, o) => sum + o.totalAmount, 0),
      orders: ordersData.orders?.map(o => ({
        id: o._id.slice(-6),
        total: o.totalAmount,
        status: o.status,
        created: new Date(o.createdAt).toLocaleDateString()
      }))
    });
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
  }
};