import React, { useState, useEffect } from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { analyticsService } from '../../services/analyticsService';
import { formatCurrency } from '../../utils/helpers';

ChartJS.register(ArcElement, Tooltip, Legend);

const CategoryRevenue = () => {
  const [categoryData, setCategoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCategoryRevenue();
  }, []);

  const fetchCategoryRevenue = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await analyticsService.getCategoryRevenue();
      setCategoryData(data || []);
    } catch (error) {
      setError('Failed to fetch category revenue');
      console.error('Failed to fetch category revenue:', error);
    } finally {
      setLoading(false);
    }
  };

  const colors = [
    '#3B82F6', // Blue
    '#10B981', // Green
    '#F59E0B', // Yellow
    '#EF4444', // Red
    '#8B5CF6', // Purple
    '#F97316', // Orange
    '#06B6D4', // Cyan
    '#84CC16', // Lime
  ];

  const chartData = {
    labels: categoryData.map(item => 
      item._id ? item._id.charAt(0).toUpperCase() + item._id.slice(1) : 'Unknown'
    ),
    datasets: [
      {
        label: 'Revenue',
        data: categoryData.map(item => item.totalRevenue),
        backgroundColor: colors.slice(0, categoryData.length),
        borderColor: colors.slice(0, categoryData.length),
        borderWidth: 2,
        hoverBorderWidth: 3,
        hoverBackgroundColor: colors.slice(0, categoryData.length).map(color => color + 'DD'),
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: 'Revenue by Category',
        font: {
          size: 16,
          weight: 'bold'
        }
      },
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = formatCurrency(context.parsed);
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    },
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const totalRevenue = categoryData.reduce((total, item) => total + item.totalRevenue, 0);
  const totalItems = categoryData.reduce((total, item) => total + item.itemCount, 0);

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Category Revenue Breakdown</h3>
        <button
          onClick={fetchCategoryRevenue}
          className="text-blue-600 hover:text-blue-800 text-sm"
        >
          Refresh
        </button>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {categoryData.length === 0 && !loading ? (
        <p className="text-gray-500 text-center py-8">No data available</p>
      ) : (
        <div>
          <div className="h-64 mb-6">
            <Doughnut data={chartData} options={chartOptions} />
          </div>
          
          <div className="space-y-3">
            <div className="text-center mb-4 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Total Items Sold</p>
                  <p className="text-xl font-bold text-blue-600">
                    {totalItems.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
            
            {categoryData.map((item, index) => {
              const percentage = ((item.totalRevenue / totalRevenue) * 100).toFixed(1);
              return (
                <div key={item._id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center">
                    <div
                      className="w-4 h-4 rounded-full mr-3 border-2 border-white shadow-sm"
                      style={{ backgroundColor: colors[index] }}
                    ></div>
                    <div>
                      <span className="text-sm font-medium capitalize">
                        {item._id || 'Unknown'}
                      </span>
                      <p className="text-xs text-gray-600">
                        {item.itemCount} items sold
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">
                      {formatCurrency(item.totalRevenue)}
                    </p>
                    <p className="text-xs text-gray-600">
                      {percentage}%
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryRevenue;