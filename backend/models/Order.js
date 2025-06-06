// models/Order.js
// ================================
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: [true, 'Order number is required'],
    unique: true,
    trim: true
  },
  customerId: {
    type: String,
    trim: true
  },
  customerName: {
    type: String,
    required: [true, 'Customer name is required'],
    trim: true,
    maxlength: [100, 'Customer name cannot be more than 100 characters']
  },
  customerPhone: {
    type: String,
    required: [true, 'Customer phone is required'],
    trim: true
  },
  items: [{
    menuItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MenuItem',
      required: [true, 'Menu item ID is required']
    },
    name: {
      type: String,
      required: [true, 'Item name is required']
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1']
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative']
    },
    customizations: [{
      name: String,
      value: String,
      additionalPrice: {
        type: Number,
        default: 0
      }
    }],
    specialNotes: {
      type: String,
      maxlength: [200, 'Special notes cannot be more than 200 characters']
    }
  }],
  status: {
    type: String,
    enum: {
      values: ['placed', 'preparing', 'ready', 'delivered', 'cancelled'],
      message: '{VALUE} is not a valid status'
    },
    default: 'placed'
  },
  orderType: {
    type: String,
    required: [true, 'Order type is required'],
    enum: {
      values: ['dine-in', 'takeout', 'delivery'],
      message: '{VALUE} is not a valid order type'
    }
  },
  totalAmount: {
    type: Number,
    required: [true, 'Total amount is required'],
    min: [0, 'Total amount cannot be negative']
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded'],
    default: 'pending'
  },
  timestamps: {
    placed: {
      type: Date,
      default: Date.now
    },
    preparing: Date,
    ready: Date,
    delivered: Date
  },
  deliveryAddress: {
    type: String,
    trim: true,
    maxlength: [300, 'Delivery address cannot be more than 300 characters']
  }
}, {
  timestamps: true
});

// Indexes for better query performance
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ customerId: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ 'items.menuItemId': 1 });
orderSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);