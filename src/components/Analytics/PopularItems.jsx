import React, { useState, useEffect } from 'react';
import { analyticsService } from '../../services/analyticsService';
import { formatCurrency } from '../../utils/helpers';

const PopularItems = () => {
  const [popularItems, setPopularItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPopularItems();
  }, []);

  const fetchPopularItems = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await analyticsService.getPopularItems();
      setPopularItems(data || []);
    } catch (error) {
      setError('Failed to fetch popular items');
      console.error('Failed to fetch popular items:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMedalIcon = (index) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `#${index + 1}`;
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-20"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Most Popular Items</h3>
        <button
          onClick={fetchPopularItems}
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

      {popularItems.length === 0 && !loading ? (
        <p className="text-gray-500 text-center py-8">No data available</p>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {popularItems.map((item, index) => (
            <div
              key={item._id}
              className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                index < 3 ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200' : 'bg-gray-50 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-sm mr-3">
                  <span className="text-lg font-bold">
                    {getMedalIcon(index)}
                  </span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">
                    {item.itemName || 'Unknown Item'}
                  </h4>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>{item.totalOrdered} orders</span>
                    <span>•</span>
                    <span>Avg: {formatCurrency(item.totalRevenue / item.totalOrdered)}</span>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <p className="font-semibold text-green-600">
                  {formatCurrency(item.totalRevenue)}
                </p>
                <p className="text-xs text-gray-600">
                  total revenue
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PopularItems;