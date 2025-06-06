// src/components/Orders/OrderList.jsx - CLEAN VERSION
import React, { useState, useEffect, useCallback } from 'react';
import { orderService } from '../../services/orderService';
import { useDataContext } from '../../Context/DataContext';
import { formatCurrency, formatDateTime, getStatusColor } from '../../utils/helpers';
import OrderForm from './OrderForm';
import OrderTracking from './OrderTracking';

const OrderList = () => {
  const { triggerOrderUpdate } = useDataContext();
  
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    orderType: '',
    startDate: '',
    endDate: ''
  });

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== '')
      );
      const data = await orderService.getOrders(cleanFilters);
      setOrders(data.orders || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleAdd = () => {
    setEditingOrder(null);
    setShowForm(true);
  };

  const handleEdit = (order) => {
    setEditingOrder(order);
    setShowForm(true);
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await orderService.updateOrderStatus(orderId, newStatus);
      
      // Trigger analytics refresh when order status changes
      triggerOrderUpdate();
      console.log('🔄 Analytics refresh triggered after status update');
      
      fetchOrders();
      // Update selected order if it's the one being updated
      if (selectedOrder?._id === orderId) {
        const updatedOrder = { ...selectedOrder, status: newStatus };
        setSelectedOrder(updatedOrder);
      }
    } catch (err) {
      setError(err.message || 'Failed to update order status');
    }
  };

  const handleFormSave = () => {
    setShowForm(false);
    setEditingOrder(null);
    fetchOrders();
    
    // Trigger analytics refresh after order save
    triggerOrderUpdate();
    console.log('🔄 Analytics refresh triggered after order save');
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingOrder(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>
        <button
          onClick={handleAdd}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          New Order
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="placed">Placed</option>
              <option value="preparing">Preparing</option>
              <option value="ready">Ready</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Order Type
            </label>
            <select
              value={filters.orderType}
              onChange={(e) => handleFilterChange('orderType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              <option value="dine-in">Dine In</option>
              <option value="takeout">Takeout</option>
              <option value="delivery">Delivery</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders List */}
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order._id}
              className={`bg-white p-4 rounded-lg shadow cursor-pointer transition-colors ${
                selectedOrder?._id === order._id ? 'ring-2 ring-blue-500' : 'hover:bg-gray-50'
              }`}
              onClick={() => setSelectedOrder(order)}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold">Order #{order.orderNumber}</h3>
                  <p className="text-sm text-gray-600">{order.customerName}</p>
                  <p className="text-sm text-gray-600">{order.customerPhone}</p>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                  <p className="text-sm text-gray-600 mt-1 capitalize">
                    {order.orderType}
                  </p>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-600">
                    {order.items.length} item(s)
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDateTime(order.createdAt)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">
                    {formatCurrency(order.totalAmount)}
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(order);
                    }}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    Edit
                  </button>
                </div>
              </div>
            </div>
          ))}

          {orders.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No orders found.</p>
            </div>
          )}
        </div>

        {/* Order Details */}
        <div>
          {selectedOrder ? (
            <div className="space-y-4">
              <OrderTracking
                order={selectedOrder}
                onStatusUpdate={handleStatusUpdate}
              />
              
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Order Details</h3>
                
                <div className="space-y-2 mb-4">
                  <p><span className="font-medium">Customer:</span> {selectedOrder.customerName}</p>
                  <p><span className="font-medium">Phone:</span> {selectedOrder.customerPhone}</p>
                  <p><span className="font-medium">Type:</span> {selectedOrder.orderType}</p>
                  {selectedOrder.deliveryAddress && (
                    <p><span className="font-medium">Address:</span> {selectedOrder.deliveryAddress}</p>
                  )}
                  <p><span className="font-medium">Placed:</span> {formatDateTime(selectedOrder.createdAt)}</p>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2">Items:</h4>
                  <div className="space-y-2">
                    {selectedOrder.items.map((item, index) => (
                      <div key={index} className="flex justify-between">
                        <div>
                          <span>{item.name}</span>
                          <span className="text-gray-600 ml-2">x{item.quantity}</span>
                          {item.specialNotes && (
                            <div className="text-sm text-gray-500">
                              Note: {item.specialNotes}
                            </div>
                          )}
                        </div>
                        <span>{formatCurrency(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="border-t mt-2 pt-2">
                    <div className="flex justify-between font-semibold">
                      <span>Total:</span>
                      <span>{formatCurrency(selectedOrder.totalAmount)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white p-8 rounded-lg shadow text-center">
              <p className="text-gray-500">Select an order to view details</p>
            </div>
          )}
        </div>
      </div>

      {showForm && (
        <OrderForm
          order={editingOrder}
          onSave={handleFormSave}
          onCancel={handleFormCancel}
        />
      )}
    </div>
  );
};

export default OrderList;