# Restaurant Management System 🍽️

A comprehensive restaurant management solution built with **MongoDB**, **React**, and **Node.js**. This system demonstrates advanced NoSQL database techniques, complex aggregation pipelines, and real-time data synchronization for managing dynamic menus, customer orders, and business analytics.

![Restaurant Management System](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)

## 🚀 Project Overview

Traditional restaurants struggle with managing dynamic menus and complex order data using relational databases. This system leverages MongoDB's flexible document structure to handle:

- **Dynamic Menu Management** with varying attributes and customizations
- **Complex Order Processing** with nested line items and real-time status tracking
- **Advanced Analytics** using MongoDB aggregation pipelines
- **Real-time Data Synchronization** across the entire application

## ✨ Features

### 🍜 Menu Management
- **Dynamic Menu Items** with flexible attributes (ingredients, tags, nutritional info)
- **Real-time Search & Filtering** by name, category, dietary restrictions, price range
- **Advanced Text Search** using MongoDB text indexes
- **Category Management** with visual organization
- **Availability Status** tracking with instant updates

### 📋 Order Management
- **Complete Order Lifecycle** tracking (Placed → Preparing → Ready → Delivered)
- **Unique Order ID Generation** with timestamp-based numbering
- **Customer Information** management with phone and delivery details
- **Order Customizations** with special notes and modifications
- **Real-time Status Updates** with timestamp logging

### 📊 Advanced Analytics
- **Sales Analytics** with daily/monthly breakdowns
- **Category Revenue Analysis** using complex aggregation pipelines
- **Peak Hours Identification** through time-based data analysis
- **Popular Items Tracking** with quantity and revenue metrics
- **Real-time Dashboard** with automatic data refresh

### 🔧 Technical Features
- **MongoDB Aggregation Framework** for complex analytics
- **Strategic Indexing** for optimal query performance
- **Real-time State Management** using React Context
- **Professional Error Handling** with comprehensive validation
- **Responsive Design** with Tailwind CSS

## 🏗️ Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web application framework
- **MongoDB** - Primary database (NoSQL)
- **Mongoose** - MongoDB object modeling

### Frontend
- **React** - Frontend library
- **Tailwind CSS** - Utility-first CSS framework
- **Recharts** - Data visualization library
- **Axios** - HTTP client for API calls

### Database
- **MongoDB** - Document-based NoSQL database
- **MongoDB Compass** - Database GUI (recommended for development)

## 📋 Prerequisites

Before running this project, make sure you have the following installed:

- **Node.js** (v14.0.0 or higher)
- **MongoDB** (v4.4.0 or higher)
- **npm** or **yarn** package manager
- **Git** for version control

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/restaurant-management-system.git
cd restaurant-management-system
```

### 2. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Configure your environment variables in .env:
# MONGODB_URI=mongodb://localhost:27017/restaurant_db
# PORT=5001
# NODE_ENV=development

# Start MongoDB service (if running locally)
# On Windows: net start MongoDB
# On macOS: brew services start mongodb-community
# On Linux: sudo systemctl start mongod

# Start the backend server
npm run dev
```

### 3. Frontend Setup
```bash
# Open new terminal and navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Configure your environment variables in .env:
# REACT_APP_API_URL=http://localhost:5001/api

# Start the React development server
npm start
```

### 4. Database Setup
```bash
# Optional: Seed the database with sample data
cd backend
npm run seed
```

## 🗄️ Database Schema

### MenuItem Schema
```javascript
{
  name: String,
  description: String,
  category: ['appetizer', 'main', 'dessert', 'beverage', 'salad'],
  price: Number,
  ingredients: [String],
  tags: [String],
  availability: Boolean,
  imageUrl: String,
  nutritionalInfo: {
    calories: Number,
    protein: Number,
    carbs: Number,
    fat: Number
  },
  customizationOptions: [{
    name: String,
    options: [String],
    additionalPrice: Number
  }]
}
```

### Order Schema
```javascript
{
  orderNumber: String,
  customerName: String,
  customerPhone: String,
  items: [{
    menuItemId: ObjectId,
    name: String,
    quantity: Number,
    price: Number,
    customizations: [Object],
    specialNotes: String
  }],
  status: ['placed', 'preparing', 'ready', 'delivered', 'cancelled'],
  orderType: ['dine-in', 'takeout', 'delivery'],
  totalAmount: Number,
  timestamps: {
    placed: Date,
    preparing: Date,
    ready: Date,
    delivered: Date
  }
}
```

## 🔗 API Endpoints

### Menu Endpoints
- `GET /api/menu` - Get all menu items with filtering
- `POST /api/menu` - Create new menu item
- `GET /api/menu/:id` - Get specific menu item
- `PUT /api/menu/:id` - Update menu item
- `DELETE /api/menu/:id` - Delete menu item (soft delete)

### Order Endpoints
- `GET /api/orders` - Get all orders with filtering
- `POST /api/orders` - Create new order
- `GET /api/orders/:id` - Get specific order
- `PUT /api/orders/:id/status` - Update order status
- `PUT /api/orders/:id/items` - Update order items
- `DELETE /api/orders/:id` - Cancel order

### Analytics Endpoints
- `GET /api/analytics/summary` - Dashboard summary
- `GET /api/analytics/sales` - Sales analytics
- `GET /api/analytics/popular-items` - Most popular items
- `GET /api/analytics/category-revenue` - Revenue by category
- `GET /api/analytics/peak-hours` - Peak hours analysis

## 🧩 Key Technical Implementations

### MongoDB Aggregation Examples

#### Sales Analytics Pipeline
```javascript
const salesData = await Order.aggregate([
  { $match: { status: { $in: ['delivered', 'ready', 'placed', 'preparing'] } } },
  { 
    $group: {
      _id: {
        year: { $year: '$createdAt' },
        month: { $month: '$createdAt' },
        day: { $dayOfMonth: '$createdAt' }
      },
      totalSales: { $sum: '$totalAmount' },
      orderCount: { $sum: 1 }
    }
  },
  { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
]);
```

#### Category Revenue Analysis
```javascript
const categoryRevenue = await Order.aggregate([
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
      totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
      itemCount: { $sum: '$items.quantity' }
    }
  }
]);
```

### Performance Optimizations

#### Strategic Indexing
```javascript
// Menu Items
menuItemSchema.index({ name: 'text', description: 'text' });
menuItemSchema.index({ category: 1 });
menuItemSchema.index({ tags: 1 });
menuItemSchema.index({ price: 1 });

// Orders
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ 'items.menuItemId': 1 });
```

## 🚨 Challenges Solved

### 1. Comma-Separated Input Bug
**Problem**: Users couldn't type commas in ingredient/tag fields  
**Solution**: Implemented separate state for raw input strings and background array processing

### 2. Revenue Calculation Accuracy
**Problem**: Backend analytics showed inconsistent revenue calculations  
**Solution**: Unified calculation strategy across all order statuses

### 3. Real-time Data Synchronization
**Problem**: Frontend and database synchronization issues  
**Solution**: React Context with order update triggers and automatic refresh

### 4. Complex Aggregation Performance
**Problem**: Multi-stage aggregation pipelines were slow  
**Solution**: Strategic indexing and query optimization

## 🎯 Learning Outcomes

- **MongoDB Aggregation Framework** mastery with complex pipelines
- **NoSQL Schema Design** best practices and optimization
- **Real-time State Management** in React applications
- **Performance Optimization** techniques for database queries
- **Professional Error Handling** and validation patterns
- **Full-stack Development** with modern JavaScript technologies

## 📱 Screenshots

### Menu Management
![Menu Management Interface showing search, filtering, and CRUD operations]

### Order Processing
![Order Management with real-time status tracking and customer details]

### Analytics Dashboard
![Comprehensive analytics with charts, metrics, and business insights]

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## 👨‍💻 Author

**Your Name**
- GitHub: [@srija280904](github.com/srija280904)
- Email: srijareddy280904@gmail.com.com

## 🙏 Acknowledgments

- **MongoDB University** for excellent aggregation pipeline tutorials
- **React Documentation** for comprehensive hooks and context examples
- **Tailwind CSS** for utility-first CSS framework
- **Express.js Community** for robust backend development patterns

## 📚 Additional Resources

- [MongoDB Aggregation Pipeline Documentation](https://docs.mongodb.com/manual/aggregation/)
- [React Context API Guide](https://reactjs.org/docs/context.html)
- [Express.js Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [Mongoose Schema Documentation](https://mongoosejs.com/docs/guide.html)

---

**⭐ If you found this project helpful, please give it a star!**
