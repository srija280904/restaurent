// Step 2: Update src/App.js
// ================================
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { DataProvider } from './Context/DataContext'; // Fixed path (lowercase)
import Layout from './components/Layout/Layout';
import MenuList from './components/Menu/MenuList';
import OrderList from './components/Orders/OrderList';
import Analytics from './components/Analytics/analytics'; // Fixed component name
import './index.css';

function App() {
  return (
    <DataProvider>
      <Router>
        <div className="App">
          <Layout>
            <Routes>
              <Route path="/" element={<MenuList />} />
              <Route path="/menu" element={<MenuList />} />
              <Route path="/orders" element={<OrderList />} />
              <Route path="/analytics" element={<Analytics />} />
            </Routes>
          </Layout>
        </div>
      </Router>
    </DataProvider>
  );
}

export default App;