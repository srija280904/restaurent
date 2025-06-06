// routes/orders.js
// ================================
const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

// Generate unique order number
const generateOrderNumber = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `ORD-${timestamp}-${random}`;
};

// GET all orders with filters
router.get('/', async (req, res) => {
  try {
    const {
      status,
      orderType,
      customerId,
      startDate,
      endDate,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    let query = {};

    if (status) {
      query.status = status;
    }

    if (orderType) {
      query.orderType = orderType;
    }

    if (customerId) {
      query.customerId = customerId;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const orders = await Order.find(query)
      .populate('items.menuItemId', 'name price category')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Order.countDocuments(query);

    res.status(200).json({
      status: 'success',
      results: orders.length,
      orders,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching orders',
      error: error.message
    });
  }
});

// GET single order by ID
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.menuItemId', 'name price category');
    
    if (!order) {
      return res.status(404).json({
        status: 'error',
        message: 'Order not found'
      });
    }
    
    res.status(200).json({
      status: 'success',
      order
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching order',
      error: error.message
    });
  }
});

// POST new order
router.post('/', async (req, res) => {
  try {
    const orderData = {
      ...req.body,
      orderNumber: generateOrderNumber()
    };
    
    const order = new Order(orderData);
    await order.save();
    
    const populatedOrder = await Order.findById(order._id)
      .populate('items.menuItemId', 'name price category');
    
    res.status(201).json({
      status: 'success',
      message: 'Order created successfully',
      order: populatedOrder
    });
  } catch (error) {
    console.error('Error creating order:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        status: 'error',
        message: 'Validation error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }
    
    res.status(500).json({
      status: 'error',
      message: 'Error creating order',
      error: error.message
    });
  }
});

// PUT update order status
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const updateData = { status };

    // Update timestamp based on status
    if (status === 'preparing') {
      updateData['timestamps.preparing'] = new Date();
    } else if (status === 'ready') {
      updateData['timestamps.ready'] = new Date();
    } else if (status === 'delivered') {
      updateData['timestamps.delivered'] = new Date();
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate('items.menuItemId', 'name price category');

    if (!order) {
      return res.status(404).json({
        status: 'error',
        message: 'Order not found'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Order status updated successfully',
      order
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error updating order status',
      error: error.message
    });
  }
});

// PUT update order items
router.put('/:id/items', async (req, res) => {
  try {
    const { items, totalAmount } = req.body;
    
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { 
        $set: { 
          items: items,
          totalAmount: totalAmount
        }
      },
      { new: true, runValidators: true }
    ).populate('items.menuItemId', 'name price category');

    if (!order) {
      return res.status(404).json({
        status: 'error',
        message: 'Order not found'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Order items updated successfully',
      order
    });
  } catch (error) {
    console.error('Error updating order items:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error updating order items',
      error: error.message
    });
  }
});

// DELETE order (cancel order)
router.delete('/:id', async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { 
        $set: { 
          status: 'cancelled',
          'timestamps.cancelled': new Date()
        }
      },
      { new: true }
    );
    
    if (!order) {
      return res.status(404).json({
        status: 'error',
        message: 'Order not found'
      });
    }
    
    res.status(200).json({
      status: 'success',
      message: 'Order cancelled successfully',
      order
    });
  } catch (error) {
    console.error('Error cancelling order:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error cancelling order',
      error: error.message
    });
  }
});

module.exports = router;
