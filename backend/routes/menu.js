// routes/menu.js
// ================================
const express = require('express');
const router = express.Router();
const MenuItem = require('../models/MenuItem');

// GET all menu items with search and filter
router.get('/', async (req, res) => {
  try {
    const {
      search,
      category,
      tags,
      minPrice,
      maxPrice,
      page = 1,
      limit = 20,
      sortBy = 'name',
      sortOrder = 'asc'
    } = req.query;

    // Build query
    let query = {};

    // Add availability filter by default
    if (req.query.availability !== undefined) {
      query.availability = req.query.availability === 'true';
    } else {
      query.availability = true; // Show only available items by default
    }

    if (search) {
      query.$text = { $search: search };
    }

    if (category) {
      query.category = category;
    }

    if (tags) {
      query.tags = { $in: tags.split(',').map(tag => tag.trim()) };
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const menuItems = await MenuItem.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await MenuItem.countDocuments(query);

    res.status(200).json({
      status: 'success',
      results: menuItems.length,
      menuItems,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching menu items:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching menu items',
      error: error.message
    });
  }
});

// GET single menu item by ID
router.get('/:id', async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id);
    
    if (!menuItem) {
      return res.status(404).json({
        status: 'error',
        message: 'Menu item not found'
      });
    }
    
    res.status(200).json({
      status: 'success',
      menuItem
    });
  } catch (error) {
    console.error('Error fetching menu item:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching menu item',
      error: error.message
    });
  }
});

// POST new menu item
router.post('/', async (req, res) => {
  try {
    const menuItem = new MenuItem(req.body);
    await menuItem.save();
    
    res.status(201).json({
      status: 'success',
      message: 'Menu item created successfully',
      menuItem
    });
  } catch (error) {
    console.error('Error creating menu item:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        status: 'error',
        message: 'Validation error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }
    
    res.status(500).json({
      status: 'error',
      message: 'Error creating menu item',
      error: error.message
    });
  }
});

// PUT update menu item
router.put('/:id', async (req, res) => {
  try {
    const menuItem = await MenuItem.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { 
        new: true, 
        runValidators: true 
      }
    );
    
    if (!menuItem) {
      return res.status(404).json({
        status: 'error',
        message: 'Menu item not found'
      });
    }
    
    res.status(200).json({
      status: 'success',
      message: 'Menu item updated successfully',
      menuItem
    });
  } catch (error) {
    console.error('Error updating menu item:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        status: 'error',
        message: 'Validation error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }
    
    res.status(500).json({
      status: 'error',
      message: 'Error updating menu item',
      error: error.message
    });
  }
});

// DELETE menu item (soft delete by setting availability to false)
router.delete('/:id', async (req, res) => {
  try {
    const menuItem = await MenuItem.findByIdAndUpdate(
      req.params.id,
      { $set: { availability: false } },
      { new: true }
    );
    
    if (!menuItem) {
      return res.status(404).json({
        status: 'error',
        message: 'Menu item not found'
      });
    }
    
    res.status(200).json({
      status: 'success',
      message: 'Menu item deleted successfully (marked as unavailable)',
      menuItem
    });
  } catch (error) {
    console.error('Error deleting menu item:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error deleting menu item',
      error: error.message
    });
  }
});

module.exports = router;