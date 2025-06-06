// backend/routes/analytics.js - Complete Updated Version
const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

// GET sales analytics
router.get('/sales', async (req, res) => {
  try {
    const { period = 'daily', startDate, endDate } = req.query;
    
    let matchStage = {
      status: { $in: ['delivered', 'ready', 'placed', 'preparing'] } // Include all orders for analytics
    };

    if (startDate || endDate) {
      matchStage.createdAt = {};
      if (startDate) matchStage.createdAt.$gte = new Date(startDate);
      if (endDate) matchStage.createdAt.$lte = new Date(endDate);
    }

    let groupStage;
    if (period === 'daily') {
      groupStage = {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        },
        totalSales: { $sum: '$totalAmount' },
        orderCount: { $sum: 1 }
      };
    } else if (period === 'monthly') {
      groupStage = {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        totalSales: { $sum: '$totalAmount' },
        orderCount: { $sum: 1 }
      };
    }

    const salesData = await Order.aggregate([
      { $match: matchStage },
      { $group: groupStage },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    console.log(`📊 Sales analytics: Found ${salesData.length} data points for period: ${period}`);

    res.status(200).json({
      status: 'success',
      results: salesData.length,
      data: salesData
    });
  } catch (error) {
    console.error('Error fetching sales analytics:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching sales analytics',
      error: error.message
    });
  }
});

// GET most popular items
router.get('/popular-items', async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const popularItems = await Order.aggregate([
      { $match: { status: { $in: ['delivered', 'ready', 'placed', 'preparing'] } } }, // Include all orders
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.menuItemId',
          itemName: { $first: '$items.name' },
          totalOrdered: { $sum: '$items.quantity' },
          totalRevenue: { 
            $sum: { 
              $multiply: ['$items.price', '$items.quantity'] 
            } 
          }
        }
      },
      { $sort: { totalOrdered: -1 } },
      { $limit: parseInt(limit) }
    ]);

    console.log(`📊 Popular items: Found ${popularItems.length} items`);

    res.status(200).json({
      status: 'success',
      results: popularItems.length,
      data: popularItems
    });
  } catch (error) {
    console.error('Error fetching popular items:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching popular items',
      error: error.message
    });
  }
});

// GET category revenue breakdown
router.get('/category-revenue', async (req, res) => {
  try {
    const categoryRevenue = await Order.aggregate([
      { $match: { status: { $in: ['delivered', 'ready', 'placed', 'preparing'] } } }, // Include all orders
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'menuitems',
          localField: 'items.menuItemId',
          foreignField: '_id',
          as: 'menuItem'
        }
      },
      { $unwind: '$menuItem' },
      {
        $group: {
          _id: '$menuItem.category',
          totalRevenue: { 
            $sum: { 
              $multiply: ['$items.price', '$items.quantity'] 
            } 
          },
          itemCount: { $sum: '$items.quantity' }
        }
      },
      { $sort: { totalRevenue: -1 } }
    ]);

    console.log(`📊 Category revenue: Found ${categoryRevenue.length} categories`);

    res.status(200).json({
      status: 'success',
      results: categoryRevenue.length,
      data: categoryRevenue
    });
  } catch (error) {
    console.error('Error fetching category revenue:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching category revenue',
      error: error.message
    });
  }
});

// GET peak hours analysis
router.get('/peak-hours', async (req, res) => {
  try {
    const peakHours = await Order.aggregate([
      { $match: { status: { $in: ['delivered', 'ready', 'placed', 'preparing'] } } }, // Include all orders
      {
        $group: {
          _id: { $hour: '$createdAt' },
          orderCount: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    console.log(`📊 Peak hours: Found ${peakHours.length} hour slots`);

    res.status(200).json({
      status: 'success',
      results: peakHours.length,
      data: peakHours
    });
  } catch (error) {
    console.error('Error fetching peak hours:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching peak hours',
      error: error.message
    });
  }
});

// GET dashboard summary - ENHANCED VERSION
// backend/routes/analytics.js - FIXED Summary Endpoint
// Replace just the /summary route with this:

router.get('/summary', async (req, res) => {
  try {
    console.log('📊 Calculating dashboard summary...');
    
    // Get all orders for comprehensive analysis
    const allOrders = await Order.find({}).sort({ createdAt: -1 });
    console.log(`📊 Found ${allOrders.length} total orders in database`);
    
    // Calculate today's date range
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    
    // Filter orders by different criteria
    const todayOrders = allOrders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= startOfDay && orderDate <= endOfDay;
    });
    
    const completedOrders = allOrders.filter(order => 
      ['delivered', 'ready'].includes(order.status)
    );
    
    const todayCompletedOrders = todayOrders.filter(order => 
      ['delivered', 'ready'].includes(order.status)
    );
    
    const pendingOrders = allOrders.filter(order => 
      ['placed', 'preparing'].includes(order.status)
    );
    
    // Calculate metrics
    const totalOrders = allOrders.length;
    
    // ✅ FIXED: Use ALL orders for total revenue (not just completed)
    const totalRevenue = allOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    
    // Completed orders revenue for comparison
    const completedRevenue = completedOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    
    const todayRevenue = todayOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    const summary = {
      // ✅ FIXED: Primary metrics using ALL orders
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalOrders: totalOrders,
      averageOrderValue: Math.round(averageOrderValue * 100) / 100,
      
      // Today's metrics (all orders)
      todayOrders: todayOrders.length,
      todayRevenue: Math.round(todayRevenue * 100) / 100,
      
      // Status breakdown
      pendingOrders: pendingOrders.length,
      completedOrders: completedOrders.length,
      completedRevenue: Math.round(completedRevenue * 100) / 100,
      
      // Debug info
      debug: {
        totalOrdersInDB: allOrders.length,
        allOrdersRevenue: Math.round(totalRevenue * 100) / 100,
        completedOrdersCount: completedOrders.length,
        completedOrdersRevenue: Math.round(completedRevenue * 100) / 100,
        todayOrdersCount: todayOrders.length,
        pendingOrdersCount: pendingOrders.length,
        calculation: 'Using ALL orders for total revenue'
      }
    };

    console.log('📊 Summary calculated:', summary);

    res.status(200).json({
      status: 'success',
      data: summary
    });
  } catch (error) {
    console.error('❌ Error fetching dashboard summary:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching dashboard summary',
      error: error.message
    });
  }
});

// GET revenue trends (last 7 days) - ENHANCED
router.get('/trends', async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(days));

    const trends = await Order.aggregate([
      {
        $match: {
          status: { $in: ['delivered', 'ready', 'placed', 'preparing'] }, // Include all orders
          createdAt: { $gte: daysAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 },
          completedRevenue: {
            $sum: {
              $cond: [
                { $in: ['$status', ['delivered', 'ready']] },
                '$totalAmount',
                0
              ]
            }
          },
          completedOrders: {
            $sum: {
              $cond: [
                { $in: ['$status', ['delivered', 'ready']] },
                1,
                0
              ]
            }
          }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    console.log(`📊 Revenue trends: Found ${trends.length} days of data`);

    res.status(200).json({
      status: 'success',
      results: trends.length,
      data: trends
    });
  } catch (error) {
    console.error('Error fetching revenue trends:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching revenue trends',
      error: error.message
    });
  }
});

// GET order status breakdown - NEW ENDPOINT
router.get('/status-breakdown', async (req, res) => {
  try {
    const statusBreakdown = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' },
          averageValue: { $avg: '$totalAmount' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    console.log(`📊 Status breakdown: Found ${statusBreakdown.length} different statuses`);

    res.status(200).json({
      status: 'success',
      results: statusBreakdown.length,
      data: statusBreakdown
    });
  } catch (error) {
    console.error('Error fetching status breakdown:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching status breakdown',
      error: error.message
    });
  }
});

// GET real-time stats - NEW ENDPOINT
router.get('/realtime', async (req, res) => {
  try {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    
    const realtimeStats = await Order.aggregate([
      {
        $facet: {
          lastHour: [
            { $match: { createdAt: { $gte: oneHourAgo } } },
            {
              $group: {
                _id: null,
                orders: { $sum: 1 },
                revenue: { $sum: '$totalAmount' }
              }
            }
          ],
          currentlyPreparing: [
            { $match: { status: 'preparing' } },
            { $count: 'preparing' }
          ],
          readyForPickup: [
            { $match: { status: 'ready' } },
            { $count: 'ready' }
          ]
        }
      }
    ]);

    const stats = {
      lastHourOrders: realtimeStats[0].lastHour[0]?.orders || 0,
      lastHourRevenue: realtimeStats[0].lastHour[0]?.revenue || 0,
      currentlyPreparing: realtimeStats[0].currentlyPreparing[0]?.preparing || 0,
      readyForPickup: realtimeStats[0].readyForPickup[0]?.ready || 0,
      timestamp: now
    };

    console.log('📊 Real-time stats:', stats);

    res.status(200).json({
      status: 'success',
      data: stats
    });
  } catch (error) {
    console.error('Error fetching real-time stats:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching real-time stats',
      error: error.message
    });
  }
});

module.exports = router;