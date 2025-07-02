import React, { useState ,useEffect } from 'react';
import Navbar from '../Components/Navbar';
import { 
  Package, 
  DollarSign, 
  Star, 
  ShoppingCart,
  BarChart3,
  Grid,
  Box,
  List,
  TrendingUp,
  ArrowUp,
  ArrowDown,
  CheckCircle,
  XCircle,
  Clock,
  Plus,
  Users
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell } from 'recharts';
import SellerProducts from '../Components/Seller/SellerProducts';
import SellerOrders from '../Components/Seller/SellerOrders';
import SellerReviews from '../Components/Seller/SellerReviews';
import RevenueChart from '../Components/Seller/RevenueChart';
import CategoryPieChart from '../Components/Seller/CategoryPieChart';
import RecentOrders from '../Components/Seller/RecentOrders';
import ProductPerformance from '../Components/Seller/ProductPerformance';
import QuickActions from '../Components/Seller/QuickActions';

// Sample data
const revenueData = [
  { month: 'Jan', revenue: 4500, orders: 45 },
  { month: 'Feb', revenue: 6200, orders: 62 },
  { month: 'Mar', revenue: 5800, orders: 58 },
  { month: 'Apr', revenue: 7200, orders: 72 },
  { month: 'May', revenue: 8900, orders: 89 },
  { month: 'Jun', revenue: 9500, orders: 95 }
];

const productCategoryData = [
  { name: 'Cameras', value: 35, color: '#3B82F6' },
  { name: 'Lenses', value: 25, color: '#10B981' },
  { name: 'Tripods', value: 20, color: '#F59E0B' },
  { name: 'Lighting', value: 15, color: '#EF4444' },
  { name: 'Others', value: 5, color: '#8B5CF6' }
];

const orderStatusData = [
  { name: 'Active', value: 45, color: '#10B981' },
  { name: 'Pending', value: 25, color: '#F59E0B' },
  { name: 'Completed', value: 30, color: '#3B82F6' }
];

// Animated Counter Component
const AnimatedCounter = ({ value, prefix = '', suffix = '' }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCount(prev => {
        if (prev < value) {
          return Math.min(prev + Math.ceil(value / 20), value);
        }
        clearInterval(timer);
        return value;
      });
    }, 50);

    return () => clearInterval(timer);
  }, [value]);

  return <span>{prefix}{count.toLocaleString()}{suffix}</span>;
};

// Stats Card Component
const StatsCard = ({ icon: Icon, title, value, change, prefix = '', suffix = '', trend }) => (
  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 group">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-lg bg-gradient-to-r ${
        title.includes('Revenue') ? 'from-green-400 to-green-600' :
        title.includes('Products') ? 'from-blue-400 to-blue-600' :
        title.includes('Orders') ? 'from-purple-400 to-purple-600' :
        'from-yellow-400 to-yellow-600'
      } group-hover:scale-110 transition-transform duration-300`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      {change && (
        <div className={`flex items-center space-x-1 text-sm ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
          {trend === 'up' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
          <span>{change}%</span>
        </div>
      )}
    </div>
    <h3 className="text-gray-600 text-sm font-medium mb-1">{title}</h3>
    <p className="text-2xl font-bold text-gray-900">
      <AnimatedCounter value={value} prefix={prefix} suffix={suffix} />
    </p>
  </div>
);

// Import RecentOrders component from the components directory


  

// Tab navigation items
const tabs = [
  { id: 'dashboard', label: 'Dashboard', icon: Grid },
  { id: 'products', label: 'Products', icon: Box },
  { id: 'orders', label: 'Orders', icon: ShoppingCart },
  { id: 'reviews', label: 'Reviews', icon: Star },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 }
];

// Main Seller Dashboard Component
export default function SellerPage() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'products':
        return <SellerProducts />;
      case 'orders':
        return <SellerOrders />;
      case 'reviews':
        return <SellerReviews />;
      case 'analytics':
        return (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Analytics</h2>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <p className="text-gray-500">Analytics dashboard coming soon</p>
            </div>
          </div>
        );
      case 'dashboard':
      default:
        return (
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Seller Dashboard</h1>
              <p className="text-gray-600">Manage your rental business and track performance</p>
            </div>

            {/* Stats Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatsCard
                icon={DollarSign}
                title="Total Revenue"
                value={42000}
                change={12}
                prefix="$"
                trend="up"
              />
              <StatsCard
                icon={Package}
                title="Active Products"
                value={24}
                change={8}
                trend="up"
              />
              <StatsCard
                icon={TrendingUp}
                title="Monthly Orders"
                value={156}
                change={15}
                trend="up"
              />
              <StatsCard
                icon={Star}
                title="Average Rating"
                value={4.8}
                change={2}
                suffix="/5"
                trend="up"
              />
            </div>

            {/* Charts Row */}
            <div className="grid lg:grid-cols-2 gap-6 mb-8">
              <RevenueChart />
              <CategoryPieChart />
            </div>

            {/* Content Row */}
            <div className="grid lg:grid-cols-3 gap-6 mb-8">
              <div className="lg:col-span-2">
                <RecentOrders />
              </div>
              <QuickActions />
            </div>

            {/* Product Performance */}
            <ProductPerformance />
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-start overflow-x-auto">
            <nav className="flex space-x-8" aria-label="Tabs">
              {tabs.map((tab) => {
                const TabIcon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      ${isActive 
                        ? 'border-blue-500 text-blue-600' 
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }
                      whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center
                    `}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <TabIcon className={`w-4 h-4 mr-2 ${isActive ? 'text-blue-500' : 'text-gray-400'}`} />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Page Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </div>
    </div>
  );
}