// components/Menu/MenuForm.jsx
// ================================
import React, { useState, useEffect } from 'react';
import { menuService } from '../../services/menuService';

const MenuForm = ({ menuItem, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'main',
    price: '',
    ingredients: [],
    tags: [],
    availability: true,
    imageUrl: '',
    nutritionalInfo: {
      calories: '',
      protein: '',
      carbs: '',
      fat: ''
    },
    customizationOptions: []
  });

  // Add separate state for the raw input strings
  const [ingredientsInput, setIngredientsInput] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (menuItem) {
      setFormData({
        ...menuItem,
        ingredients: menuItem.ingredients || [],
        tags: menuItem.tags || [],
        nutritionalInfo: menuItem.nutritionalInfo || {
          calories: '',
          protein: '',
          carbs: '',
          fat: ''
        },
        customizationOptions: menuItem.customizationOptions || []
      });
      
      // Set the input strings from the arrays
      setIngredientsInput((menuItem.ingredients || []).join(', '));
      setTagsInput((menuItem.tags || []).join(', '));
    }
  }, [menuItem]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'number' ? parseFloat(value) || '' : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  // Handle ingredients input
  const handleIngredientsChange = (e) => {
    const value = e.target.value;
    setIngredientsInput(value);
    
    // Convert to array and update formData
    const array = value.split(',').map(item => item.trim()).filter(item => item);
    setFormData(prev => ({
      ...prev,
      ingredients: array
    }));
  };

  // Handle tags input
  const handleTagsChange = (e) => {
    const value = e.target.value;
    setTagsInput(value);
    
    // Convert to array and update formData
    const array = value.split(',').map(item => item.trim()).filter(item => item);
    setFormData(prev => ({
      ...prev,
      tags: array
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const submitData = {
        ...formData,
        price: parseFloat(formData.price)
      };

      if (menuItem?._id) {
        await menuService.updateMenuItem(menuItem._id, submitData);
      } else {
        await menuService.createMenuItem(submitData);
      }

      onSave();
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">
          {menuItem ? 'Edit Menu Item' : 'Add Menu Item'}
        </h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="appetizer">Appetizer</option>
                <option value="main">Main</option>
                <option value="dessert">Dessert</option>
                <option value="salad">Salad</option>
                <option value="beverage">Beverage</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price *
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                step="0.01"
                min="0"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Image URL
              </label>
              <input
                type="url"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ingredients (comma-separated)
            </label>
            <input
              type="text"
              value={ingredientsInput}
              onChange={handleIngredientsChange}
              placeholder="tomato, lettuce, cheese..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {/* Show preview of parsed ingredients */}
            {formData.ingredients.length > 0 && (
              <div className="mt-1 text-xs text-gray-500">
                Preview: {formData.ingredients.map((ingredient, index) => (
                  <span key={index} className="inline-block bg-gray-100 rounded px-2 py-1 mr-1 mb-1">
                    {ingredient}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={handleTagsChange}
              placeholder="vegan, spicy, gluten-free..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {/* Show preview of parsed tags */}
            {formData.tags.length > 0 && (
              <div className="mt-1 text-xs text-gray-500">
                Preview: {formData.tags.map((tag, index) => (
                  <span key={index} className="inline-block bg-blue-100 text-blue-800 rounded px-2 py-1 mr-1 mb-1">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Nutritional Information</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Calories</label>
                <input
                  type="number"
                  name="nutritionalInfo.calories"
                  value={formData.nutritionalInfo.calories}
                  onChange={handleChange}
                  className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Protein (g)</label>
                <input
                  type="number"
                  name="nutritionalInfo.protein"
                  value={formData.nutritionalInfo.protein}
                  onChange={handleChange}
                  className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Carbs (g)</label>
                <input
                  type="number"
                  name="nutritionalInfo.carbs"
                  value={formData.nutritionalInfo.carbs}
                  onChange={handleChange}
                  className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Fat (g)</label>
                <input
                  type="number"
                  name="nutritionalInfo.fat"
                  value={formData.nutritionalInfo.fat}
                  onChange={handleChange}
                  className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="availability"
              checked={formData.availability}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-700">
              Available
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MenuForm;