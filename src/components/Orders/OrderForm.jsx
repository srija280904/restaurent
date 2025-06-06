// Step 3: Update src/components/Orders/OrderForm.jsx
// ================================
import React, { useState, useEffect } from 'react';
import { orderService } from '../../services/orderService';
import { menuService } from '../../services/menuService';
import { formatCurrency, calculateOrderTotal, generateOrderNumber } from '../../utils/helpers';
import { useDataContext } from '../../Context/DataContext'; // Fixed import path (lowercase)

const OrderForm = ({ order, onSave, onCancel }) => {
  const { triggerOrderUpdate } = useDataContext(); // Get the trigger function
  
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    orderType: 'dine-in',
    deliveryAddress: '',
    items: [],
    totalAmount: 0
  });

  const [menuItems, setMenuItems] = useState([]);
  const [selectedMenuItem, setSelectedMenuItem] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [specialNotes, setSpecialNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMenuItems();
    if (order) {
      setFormData({
        customerName: order.customerName || '',
        customerPhone: order.customerPhone || '',
        orderType: order.orderType || 'dine-in',
        deliveryAddress: order.deliveryAddress || '',
        items: order.items || [],
        totalAmount: order.totalAmount || 0
      });
    }
  }, [order]);

  const fetchMenuItems = async () => {
    try {
      const data = await menuService.getMenuItems({ availability: true });
      setMenuItems(data.menuItems || []);
    } catch (err) {
      setError('Failed to fetch menu items');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addItemToOrder = () => {
    if (!selectedMenuItem) return;

    const menuItem = menuItems.find(item => item._id === selectedMenuItem);
    if (!menuItem) return;

    const orderItem = {
      menuItemId: menuItem._id,
      name: menuItem.name,
      price: menuItem.price,
      quantity: parseInt(quantity),
      specialNotes: specialNotes,
      customizations: []
    };

    const updatedItems = [...formData.items, orderItem];
    const totalAmount = calculateOrderTotal(updatedItems);

    setFormData(prev => ({
      ...prev,
      items: updatedItems,
      totalAmount
    }));

    // Reset form
    setSelectedMenuItem('');
    setQuantity(1);
    setSpecialNotes('');
  };

  const removeItemFromOrder = (index) => {
    const updatedItems = formData.items.filter((_, i) => i !== index);
    const totalAmount = calculateOrderTotal(updatedItems);

    setFormData(prev => ({
      ...prev,
      items: updatedItems,
      totalAmount
    }));
  };

  const updateItemQuantity = (index, newQuantity) => {
    const updatedItems = [...formData.items];
    updatedItems[index].quantity = parseInt(newQuantity);
    const totalAmount = calculateOrderTotal(updatedItems);

    setFormData(prev => ({
      ...prev,
      items: updatedItems,
      totalAmount
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.items.length === 0) {
      setError('Please add at least one item to the order');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const submitData = {
        ...formData,
        orderNumber: order?.orderNumber || generateOrderNumber()
      };

      if (order?._id) {
        // Updating existing order
        await orderService.updateOrderItems(order._id, formData.items, formData.totalAmount);
        console.log('✅ Order updated successfully');
      } else {
        // Creating new order
        const newOrder = await orderService.createOrder(submitData);
        console.log('✅ New order created successfully:', newOrder);
      }

      // Trigger analytics refresh after successful order operation
      triggerOrderUpdate();
      console.log('🔄 Analytics refresh triggered');

      onSave();
    } catch (err) {
      console.error('❌ Error saving order:', err);
      setError(err.response?.data?.message || err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-screen overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">
          {order ? 'Edit Order' : 'New Order'}
        </h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p className="font-semibold">Error:</p>
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Customer Name *
              </label>
              <input
                type="text"
                name="customerName"
                value={formData.customerName}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter customer name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Customer Phone *
              </label>
              <input
                type="tel"
                name="customerPhone"
                value={formData.customerPhone}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter phone number"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Order Type *
              </label>
              <select
                name="orderType"
                value={formData.orderType}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="dine-in">Dine In</option>
                <option value="takeout">Takeout</option>
                <option value="delivery">Delivery</option>
              </select>
            </div>

            {formData.orderType === 'delivery' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Delivery Address *
                </label>
                <input
                  type="text"
                  name="deliveryAddress"
                  value={formData.deliveryAddress}
                  onChange={handleChange}
                  required={formData.orderType === 'delivery'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter delivery address"
                />
              </div>
            )}
          </div>

          {/* Add Items Section */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-medium mb-4">Add Items to Order</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Menu Item
                </label>
                <select
                  value={selectedMenuItem}
                  onChange={(e) => setSelectedMenuItem(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Choose a menu item...</option>
                  {menuItems.map(item => (
                    <option key={item._id} value={item._id}>
                      {item.name} - {formatCurrency(item.price)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity
                </label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  min="1"
                  max="50"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Action
                </label>
                <button
                  type="button"
                  onClick={addItemToOrder}
                  disabled={!selectedMenuItem}
                  className="w-full px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Add Item
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Special Notes (Optional)
              </label>
              <input
                type="text"
                value={specialNotes}
                onChange={(e) => setSpecialNotes(e.target.value)}
                placeholder="Any special instructions for this item..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxLength="200"
              />
            </div>
          </div>

          {/* Order Items Display */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-medium mb-4">Order Summary</h3>
            
            {formData.items.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-500 text-lg">No items added to order yet</p>
                <p className="text-gray-400 text-sm mt-1">Add items from the menu above</p>
              </div>
            ) : (
              <div className="space-y-3">
                {formData.items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <span className="font-medium text-gray-900">{item.name}</span>
                        {item.specialNotes && (
                          <span className="text-sm text-gray-600 ml-2 italic">
                            (Note: {item.specialNotes})
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">Qty:</span>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateItemQuantity(index, e.target.value)}
                          min="1"
                          max="50"
                          className="w-16 px-2 py-1 border border-gray-300 rounded text-center focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                      
                      <span className="text-sm text-gray-600">×</span>
                      <span className="w-20 text-right text-gray-700">{formatCurrency(item.price)}</span>
                      <span className="w-24 text-right font-semibold text-gray-900">
                        {formatCurrency(item.price * item.quantity)}
                      </span>
                      
                      <button
                        type="button"
                        onClick={() => removeItemFromOrder(index)}
                        className="text-red-600 hover:text-red-800 hover:bg-red-50 p-1 rounded transition-colors"
                        title="Remove item"
                      >
                        <span className="text-lg">✕</span>
                      </button>
                    </div>
                  </div>
                ))}
                
                <div className="border-t border-gray-300 pt-3 mt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-700">
                      Total ({formData.items.length} item{formData.items.length !== 1 ? 's' : ''}):
                    </span>
                    <span className="text-xl font-bold text-green-600">
                      {formatCurrency(formData.totalAmount)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || formData.items.length === 0}
              className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
              <span>{loading ? 'Saving Order...' : (order ? 'Update Order' : 'Create Order')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrderForm;