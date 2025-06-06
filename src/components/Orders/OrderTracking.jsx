// components/Orders/OrderTracking.jsx
// ================================
import React from 'react';
import { formatDateTime, getStatusColor } from '../../utils/helpers';

const OrderTracking = ({ order, onStatusUpdate }) => {
  const statuses = ['placed', 'preparing', 'ready', 'delivered'];
  
  const getStatusIndex = (status) => statuses.indexOf(status);
  
  const handleStatusChange = (newStatus) => {
    if (onStatusUpdate) {
      onStatusUpdate(order._id, newStatus);
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Order #{order.orderNumber}</h3>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between">
          {statuses.map((status, index) => {
            const isCompleted = getStatusIndex(order.status) >= index;
            const isCurrent = order.status === status;
            
            return (
              <div key={status} className="flex flex-col items-center flex-1">
                <div className="relative">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      isCompleted
                        ? 'bg-green-500 text-white'
                        : isCurrent
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {index + 1}
                  </div>
                  {index < statuses.length - 1 && (
                    <div
                      className={`absolute top-4 left-8 w-full h-0.5 ${
                        getStatusIndex(order.status) > index ? 'bg-green-500' : 'bg-gray-200'
                      }`}
                      style={{ width: 'calc(100% + 2rem)' }}
                    />
                  )}
                </div>
                <span className="text-xs mt-2 text-center capitalize">
                  {status}
                </span>
                {order.timestamps[status] && (
                  <span className="text-xs text-gray-500 mt-1">
                    {formatDateTime(order.timestamps[status])}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Status Update Buttons */}
      {order.status !== 'delivered' && order.status !== 'cancelled' && (
        <div className="flex flex-wrap gap-2">
          {statuses.map((status) => {
            const currentIndex = getStatusIndex(order.status);
            const statusIndex = getStatusIndex(status);
            
            // Allow moving to next status or staying in current
            if (statusIndex <= currentIndex || statusIndex > currentIndex + 1) {
              return null;
            }

            return (
              <button
                key={status}
                onClick={() => handleStatusChange(status)}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Mark as {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            );
          })}
          
          <button
            onClick={() => handleStatusChange('cancelled')}
            className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
          >
            Cancel Order
          </button>
        </div>
      )}
    </div>
  );
};

export default OrderTracking;