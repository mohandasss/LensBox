import React, { useState, useEffect } from 'react';
import Dashboard from '../Components/Dashboard';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';
import User from '../Components/Users';
import Products from '../Components/Products';
import Order from '../Components/Orders';
import Broadcast from '../Components/Broadcast';
import AdminAnalytics from '../Components/AdminAnalytics';
import LoadingSpinner from '../Components/LoadingSpinner';
import { DollarSign, Users, Package, ShoppingCart, BarChart3 } from 'lucide-react';
import { FaBroadcastTower } from "react-icons/fa";
const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    
    // Add scroll listener for navbar effect
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleTabChange = (tab) => {
    setIsLoading(true);
    setActiveTab(tab);
    // Simulate loading time for tab change
    setTimeout(() => setIsLoading(false), 300);
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
      case 'analytics':
        return <AdminAnalytics />;
      case 'dashboard':
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar bgBlack={true} fixed={true} className={`transition-all duration-300 ${isScrolled ? 'shadow-lg bg-gray-900/95 backdrop-blur-md' : 'bg-gray-900'}`} />
      
      <div className="pt-24 px-4 sm:px-6 lg:px-8 pb-12 max-w-7xl mx-auto">
        {/* Tab Navigation - Sticky with Shadow */}
        <div className={`sticky top-16 z-10 bg-white shadow-sm rounded-lg mb-8 transition-all duration-300 ${isScrolled ? 'py-2' : 'py-4'}`}>
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex flex-wrap justify-center gap-1">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: DollarSign },
                { id: 'users', label: 'Users', icon: Users },
                { id: 'products', label: 'Products', icon: Package },
                { id: 'orders', label: 'Orders', icon: ShoppingCart },
                { id: 'analytics', label: 'Analytics', icon: BarChart3 },
                { id: 'broadcast', label: 'Broadcast', icon: FaBroadcastTower }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`relative px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 flex items-center space-x-2 ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-md'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="whitespace-nowrap">{tab.label}</span>
                    {activeTab === tab.id && (
                      <span className="absolute -bottom-1 left-1/2 w-4 h-0.5 bg-white rounded-full -translate-x-1/2"></span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Tab Content with Loading State */}
        <div className="relative min-h-[400px] bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="p-6 transition-opacity duration-300">
              {renderContent()}
            </div>
          )}
        </div>
      </div>
      
      <Footer className="border-t border-gray-200 mt-12" />
    </div>
  );
};

export default AdminPage;