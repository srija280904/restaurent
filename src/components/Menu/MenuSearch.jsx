// src/components/Menu/MenuSearch.jsx - Completely Fixed Version
import React, { useState, useRef } from 'react';

const MenuSearch = ({ onSearch, onFilter }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    minPrice: '',
    maxPrice: '',
    tags: ''
  });

  // Use refs to prevent excessive API calls
  const searchTimeoutRef = useRef(null);
  const filterTimeoutRef = useRef(null);

  const categories = ['appetizer', 'main', 'dessert', 'beverage', 'salad'];

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Set new timeout
    searchTimeoutRef.current = setTimeout(() => {
      console.log('🔍 Executing search:', value);
      onSearch(value);
    }, 500);
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    // Clear previous timeout
    if (filterTimeoutRef.current) {
      clearTimeout(filterTimeoutRef.current);
    }
    
    // Set new timeout
    filterTimeoutRef.current = setTimeout(() => {
      console.log('🔍 Executing filter:', newFilters);
      onFilter(newFilters);
    }, 300);
  };

  const handleClearAll = () => {
    // Clear timeouts
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    if (filterTimeoutRef.current) {
      clearTimeout(filterTimeoutRef.current);
    }

    // Reset state
    setSearchTerm('');
    const emptyFilters = {
      category: '',
      minPrice: '',
      maxPrice: '',
      tags: ''
    };
    setFilters(emptyFilters);
    
    // Immediately call callbacks
    onSearch('');
    onFilter(emptyFilters);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // Clear timeout and search immediately
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    console.log('🔍 Immediate search:', searchTerm);
    onSearch(searchTerm);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      <form onSubmit={handleSearchSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search Menu Items
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Search by name or description..."
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm('');
                    onSearch('');
                  }}
                  className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price Range
            </label>
            <div className="flex space-x-1">
              <input
                type="number"
                value={filters.minPrice}
                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                placeholder="Min $"
                min="0"
                step="0.01"
                className="w-full px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <input
                type="number"
                value={filters.maxPrice}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                placeholder="Max $"
                min="0"
                step="0.01"
                className="w-full px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Actions
            </label>
            <div className="flex space-x-2">
              <button
                type="submit"
                className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm flex-1"
              >
                Search
              </button>
              <button
                type="button"
                onClick={handleClearAll}
                className="px-3 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 text-sm flex-1"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tags (comma-separated)
          </label>
          <input
            type="text"
            value={filters.tags}
            onChange={(e) => handleFilterChange('tags', e.target.value)}
            placeholder="vegan, spicy, gluten-free, italian..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </form>

      {/* Active Filters Display */}
      {(searchTerm || Object.values(filters).some(value => value)) && (
        <div className="mt-4 p-3 bg-blue-50 rounded-md">
          <h4 className="text-sm font-medium text-blue-800 mb-2">Active Filters:</h4>
          <div className="flex flex-wrap gap-2">
            {searchTerm && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                Search: "{searchTerm}"
              </span>
            )}
            {filters.category && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                Category: {filters.category}
              </span>
            )}
            {(filters.minPrice || filters.maxPrice) && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                Price: ${filters.minPrice || '0'} - ${filters.maxPrice || '∞'}
              </span>
            )}
            {filters.tags && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                Tags: {filters.tags}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuSearch;