import React, { useState } from 'react';
import Dashboard from '../Components/Dashboard';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';
import User from '../Components/Users';
import Products from '../Components/Products';
import Order from '../Components/Orders';
import Broadcast from '../Components/Broadcast';
import { DollarSign, Users, Package, ShoppingCart } from 'lucide-react';
import { FaBroadcastTower } from "react-icons/fa";
const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'users':
        return <User />;
      case 'products':
        return <Products />;
      case 'orders':
        return <Order />;
      case 'broadcast':
        return <Broadcast />;
      case 'dashboard':
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation - Centered */}
        <div className="mb-8">
          <div className="flex justify-center">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-1.5 inline-flex space-x-1">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: DollarSign },
                { id: 'users', label: 'Users', icon: Users },
                { id: 'products', label: 'Products', icon: Package },
                { id: 'orders', label: 'Orders', icon: ShoppingCart },
                { id: 'broadcast', label: 'Broadcast', icon: FaBroadcastTower }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`relative px-6 py-3 rounded-xl font-medium text-sm transition-all duration-300 transform hover:scale-105 ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <Icon className="w-4 h-4" />
                      <span>{tab.label}</span>
                    </div>
                    {activeTab === tab.id && (
                      <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl opacity-20 animate-pulse"></div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Tab Content with Animation */}
        <div className="transition-all duration-500 ease-in-out">
          {renderContent()}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AdminPage;