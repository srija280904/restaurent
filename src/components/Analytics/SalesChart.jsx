// src/components/Analytics/SalesChart.jsx
import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler, // Add this import
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { analyticsService } from '../../services/analyticsService';
import { formatCurrency } from '../../utils/helpers';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler // Add this registration
);

const SalesChart = () => {
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('daily');
  const [chartType, setChartType] = useState('line');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSalesData();
  }, [period]);

  const fetchSalesData = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('Fetching sales data...'); // Debug log
      const data = await analyticsService.getSalesAnalytics({ period });
      console.log('Sales data received:', data); // Debug log
      setSalesData(data || []);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch sales data';
      setError(errorMessage);
      console.error('Failed to fetch sales data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDateLabel = (item) => {
    if (period === 'daily') {
      return `${item._id.month}/${item._id.day}`;
    } else if (period === 'monthly') {
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${monthNames[item._id.month - 1]} ${item._id.year}`;
    }
    return '';
  };

  const chartData = {
    labels: salesData.map(formatDateLabel),
    datasets: [
      {
        label: 'Sales Revenue',
        data: salesData.map(item => item.totalSales),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: chartType === 'bar' ? 'rgba(59, 130, 246, 0.7)' : 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: chartType === 'line',
        borderWidth: 2,
      },
      {
        label: 'Order Count',
        data: salesData.map(item => item.orderCount),
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: chartType === 'bar' ? 'rgba(16, 185, 129, 0.7)' : 'rgba(16, 185, 129, 0.1)',
        yAxisID: 'y1',
        tension: 0.4,
        fill: chartType === 'line',
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      title: {
        display: true,
        text: `${period.charAt(0).toUpperCase() + period.slice(1)} Sales Analytics`,
        font: {
          size: 16,
          weight: 'bold'
        }
      },
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            if (context.dataset.label === 'Sales Revenue') {
              return `Sales: ${formatCurrency(context.parsed.y)}`;
            }
            return `Orders: ${context.parsed.y}`;
          }
        }
      }
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: period === 'daily' ? 'Date' : 'Month',
        },
        grid: {
          display: false
        }
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Sales Revenue ($)',
        },
        ticks: {
          callback: function(value) {
            return formatCurrency(value);
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Order Count',
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Sales Analytics</h3>
        <div className="flex space-x-2">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="daily">Daily</option>
            <option value="monthly">Monthly</option>
          </select>
          <select
            value={chartType}
            onChange={(e) => setChartType(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="line">Line Chart</option>
            <option value="bar">Bar Chart</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p className="font-semibold">Error:</p>
          <p>{error}</p>
        </div>
      )}

      <div className="h-64">
        {chartType === 'line' ? (
          <Line data={chartData} options={chartOptions} />
        ) : (
          <Bar data={chartData} options={chartOptions} />
        )}
      </div>

      {salesData.length === 0 && !loading && !error && (
        <div className="text-center py-8">
          <p className="text-gray-500">No sales data available</p>
          <button
            onClick={fetchSalesData}
            className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
          >
            Refresh Data
          </button>
        </div>
      )}
    </div>
  );
};

export default SalesChart;