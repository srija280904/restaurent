// ================================
// src/components/Menu/MenuList.jsx - Final Fixed Version
// ================================
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { menuService } from '../../services/menuService';
import { formatCurrency } from '../../utils/helpers';
import MenuForm from './MenuForm';
import MenuSearch from './MenuSearch';

const MenuList = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  // Current search parameters
  const [currentParams, setCurrentParams] = useState({});
  const isInitialMount = useRef(true);

  // Stable callback for search
  const handleSearch = useCallback((searchTerm) => {
    console.log('🔍 Search triggered:', searchTerm);
    const newParams = { ...currentParams, search: searchTerm, page: 1 };
    setCurrentParams(newParams);
  }, [currentParams]);

  // Stable callback for filters
  const handleFilter = useCallback((filters) => {
    console.log('🔍 Filter triggered:', filters);
    const newParams = { ...currentParams, ...filters, page: 1 };
    setCurrentParams(newParams);
  }, [currentParams]);

  // Fetch menu items function
  const fetchMenuItems = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError('');
      
      // Clean params - remove empty values
      const cleanParams = {};
      Object.entries(params).forEach(([key, value]) => {
        if (value !== '' && value != null && value !== undefined) {
          cleanParams[key] = value;
        }
      });
      
      console.log('📡 API call with params:', cleanParams);
      const response = await menuService.getMenuItems(cleanParams);
      console.log('📡 API response:', response);
      
      setMenuItems(response.menuItems || []);
    } catch (err) {
      console.error('❌ API Error:', err);
      setError(err.message || 'Failed to fetch menu items');
      setMenuItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Effect for initial load
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      fetchMenuItems(); // Load all items initially
    }
  }, [fetchMenuItems]);

  // Effect for parameter changes
  useEffect(() => {
    if (!isInitialMount.current) {
      fetchMenuItems(currentParams);
    }
  }, [currentParams, fetchMenuItems]);

  const handleAdd = () => {
    setEditingItem(null);
    setShowForm(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this menu item?')) {
      try {
        await menuService.deleteMenuItem(id);
        fetchMenuItems(currentParams); // Refresh with current filters
      } catch (err) {
        setError(err.message || 'Failed to delete menu item');
      }
    }
  };

  const handleFormSave = () => {
    setShowForm(false);
    setEditingItem(null);
    fetchMenuItems(currentParams); // Refresh with current filters
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingItem(null);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Menu Management</h1>
        <button
          onClick={handleAdd}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Add Menu Item
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p className="font-semibold">Error:</p>
          <p>{error}</p>
        </div>
      )}

      {/* Search component */}
      <MenuSearch onSearch={handleSearch} onFilter={handleFilter} />

      {/* Loading state */}
      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-gray-600">Loading menu items...</span>
        </div>
      )}

      {/* Menu items grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {menuItems.map((item) => (
          <div key={item._id} className="bg-white rounded-lg shadow-md overflow-hidden">
            {item.imageUrl && (
              <img
                src={item.imageUrl}
                alt={item.name}
                className="w-full h-48 object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            )}
            
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  item.availability ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {item.availability ? 'Available' : 'Unavailable'}
                </span>
              </div>
              
              <p className="text-gray-600 text-sm mb-2 line-clamp-2">{item.description}</p>
              
              <div className="flex justify-between items-center mb-2">
                <span className="text-xl font-bold text-green-600">
                  {formatCurrency(item.price)}
                </span>
                <span className="text-sm text-gray-500 capitalize">
                  {item.category}
                </span>
              </div>

              {item.tags && item.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {item.tags.slice(0, 3).map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                  {item.tags.length > 3 && (
                    <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                      +{item.tags.length - 3} more
                    </span>
                  )}
                </div>
              )}

              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => handleEdit(item)}
                  className="px-3 py-1 text-sm bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(item._id)}
                  className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* No results state */}
      {!loading && menuItems.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🍽️</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No menu items found</h3>
          {Object.keys(currentParams).length > 0 ? (
            <div>
              <p className="text-gray-500 mb-4">Try adjusting your search criteria</p>
              <button
                onClick={() => {
                  setCurrentParams({});
                  console.log('🔄 Clearing all filters');
                }}
                className="text-blue-600 hover:text-blue-800 underline"
              >
                Clear all filters and show all items
              </button>
            </div>
          ) : (
            <p className="text-gray-500">Start by adding some menu items</p>
          )}
        </div>
      )}

      {/* Results summary */}
      {!loading && menuItems.length > 0 && (
        <div className="mt-6 text-center text-sm text-gray-600">
          Showing {menuItems.length} menu item{menuItems.length !== 1 ? 's' : ''}
          {Object.keys(currentParams).length > 0 && (
            <span> with current filters</span>
          )}
        </div>
      )}

      {showForm && (
        <MenuForm
          menuItem={editingItem}
          onSave={handleFormSave}
          onCancel={handleFormCancel}
        />
      )}
    </div>
  );
};

export default MenuList;