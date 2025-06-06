// config/database.js
// ================================
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database Name: ${conn.connection.db.databaseName}`);
    
    // Create indexes for optimization
    await createIndexes();
    
    // Seed database with sample data (only in development)
    if (process.env.NODE_ENV === 'development') {
      await seedDatabase();
    }
    
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    process.exit(1);
  }
};

const createIndexes = async () => {
  try {
    const db = mongoose.connection.db;
    
    console.log('🔧 Creating database indexes...');
    
    // Menu items indexes
    await db.collection('menuitems').createIndex({ 
      name: 'text', 
      description: 'text' 
    });
    await db.collection('menuitems').createIndex({ category: 1 });
    await db.collection('menuitems').createIndex({ tags: 1 });
    await db.collection('menuitems').createIndex({ price: 1 });
    await db.collection('menuitems').createIndex({ availability: 1 });
    
    // Orders indexes
    await db.collection('orders').createIndex({ orderNumber: 1 }, { unique: true });
    await db.collection('orders').createIndex({ customerId: 1 });
    await db.collection('orders').createIndex({ status: 1 });
    await db.collection('orders').createIndex({ createdAt: -1 });
    await db.collection('orders').createIndex({ "items.menuItemId": 1 });
    
    console.log('✅ Database indexes created successfully');
  } catch (error) {
    console.error('❌ Error creating indexes:', error.message);
  }
};

const seedDatabase = async () => {
  try {
    const MenuItem = require('../models/MenuItem');
    const Order = require('../models/Order');
    
    // Check if data already exists
    const existingMenuItems = await MenuItem.countDocuments();
    const existingOrders = await Order.countDocuments();
    
    if (existingMenuItems > 0 && existingOrders > 0) {
      console.log('📝 Database already contains data, skipping seed');
      return;
    }
    
    console.log('🌱 Seeding database with sample data...');
    
    // Sample menu items
    const sampleMenuItems = [
      {
        name: "Margherita Pizza",
        description: "Classic pizza with fresh tomato sauce, mozzarella cheese, and aromatic basil leaves",
        category: "main",
        price: 14.99,
        ingredients: ["tomato sauce", "mozzarella cheese", "fresh basil", "pizza dough", "olive oil"],
        tags: ["vegetarian", "italian", "popular"],
        availability: true,
        nutritionalInfo: {
          calories: 285,
          protein: 12,
          carbs: 36,
          fat: 10
        }
      },
      {
        name: "Caesar Salad",
        description: "Crisp romaine lettuce with creamy Caesar dressing, parmesan cheese, and crunchy croutons",
        category: "salad",
        price: 12.99,
        ingredients: ["romaine lettuce", "parmesan cheese", "croutons", "caesar dressing"],
        tags: ["vegetarian", "healthy", "classic"],
        availability: true,
        nutritionalInfo: {
          calories: 180,
          protein: 8,
          carbs: 12,
          fat: 12
        }
      },
      {
        name: "Grilled Salmon",
        description: "Fresh Atlantic salmon grilled to perfection, served with lemon butter sauce and seasonal vegetables",
        category: "main",
        price: 24.99,
        ingredients: ["atlantic salmon", "lemon", "butter", "herbs", "seasonal vegetables"],
        tags: ["healthy", "gluten-free", "high-protein"],
        availability: true,
        nutritionalInfo: {
          calories: 320,
          protein: 35,
          carbs: 8,
          fat: 16
        }
      },
      {
        name: "Chicken Wings",
        description: "Crispy buffalo chicken wings served with celery sticks and blue cheese dip",
        category: "appetizer",
        price: 11.99,
        ingredients: ["chicken wings", "buffalo sauce", "celery", "blue cheese"],
        tags: ["spicy", "popular", "shareable"],
        availability: true,
        nutritionalInfo: {
          calories: 425,
          protein: 28,
          carbs: 5,
          fat: 32
        }
      },
      {
        name: "Chocolate Brownie",
        description: "Rich, fudgy chocolate brownie served warm with vanilla ice cream and chocolate sauce",
        category: "dessert",
        price: 8.99,
        ingredients: ["chocolate", "flour", "eggs", "butter", "vanilla ice cream"],
        tags: ["dessert", "sweet", "indulgent"],
        availability: true,
        nutritionalInfo: {
          calories: 450,
          protein: 6,
          carbs: 58,
          fat: 24
        }
      },
      {
        name: "Fresh Orange Juice",
        description: "Freshly squeezed orange juice, no additives or preservatives",
        category: "beverage",
        price: 4.99,
        ingredients: ["fresh oranges"],
        tags: ["healthy", "fresh", "vitamin-c"],
        availability: true,
        nutritionalInfo: {
          calories: 110,
          protein: 2,
          carbs: 26,
          fat: 0
        }
      }
    ];

    // Insert menu items if collection is empty
    if (existingMenuItems === 0) {
      await MenuItem.insertMany(sampleMenuItems);
      console.log(`✅ Inserted ${sampleMenuItems.length} sample menu items`);
    }

    // Sample orders
    const menuItems = await MenuItem.find().limit(3);
    if (menuItems.length > 0 && existingOrders === 0) {
      const sampleOrders = [
        {
          orderNumber: `ORD-${Date.now()}-001`,
          customerName: "John Smith",
          customerPhone: "+1-555-0123",
          orderType: "dine-in",
          items: [
            {
              menuItemId: menuItems[0]._id,
              name: menuItems[0].name,
              quantity: 2,
              price: menuItems[0].price,
              customizations: [],
              specialNotes: "Extra cheese please"
            }
          ],
          status: "delivered",
          totalAmount: menuItems[0].price * 2,
          paymentStatus: "paid",
          timestamps: {
            placed: new Date(Date.now() - 86400000), // 1 day ago
            preparing: new Date(Date.now() - 86380000),
            ready: new Date(Date.now() - 86340000),
            delivered: new Date(Date.now() - 86300000)
          }
        },
        {
          orderNumber: `ORD-${Date.now()}-002`,
          customerName: "Sarah Johnson",
          customerPhone: "+1-555-0456",
          orderType: "takeout",
          items: [
            {
              menuItemId: menuItems[1]._id,
              name: menuItems[1].name,
              quantity: 1,
              price: menuItems[1].price,
              customizations: [],
              specialNotes: ""
            }
          ],
          status: "ready",
          totalAmount: menuItems[1].price,
          paymentStatus: "paid",
          timestamps: {
            placed: new Date(Date.now() - 1800000), // 30 minutes ago
            preparing: new Date(Date.now() - 1200000),
            ready: new Date(Date.now() - 300000)
          }
        }
      ];

      await Order.insertMany(sampleOrders);
      console.log(`✅ Inserted ${sampleOrders.length} sample orders`);
    }

    console.log('🎉 Database seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
  }
};

module.exports = connectDB;