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
import SellerAnalytics from '../Components/Seller/SellerAnalytics';
import RevenueChart from '../Components/Seller/RevenueChart';
import CategoryPieChart from '../Components/Seller/CategoryPieChart';
import RecentOrders from '../Components/Seller/RecentOrders';
import ProductPerformance from '../Components/Seller/ProductPerformance';
import QuickActions from '../Components/Seller/QuickActions';
import { 
  getSellerDashboardStats,
  getSellerRevenueChart,
  getSellerCategoryData,
  getSellerRecentOrders,
  getSellerProductPerformance
} from '../APIs/SellerAPI';

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
  
  // Parse value if it's a string with currency symbol
  const numericValue = React.useMemo(() => {
    if (typeof value === 'string') {
      // Remove currency symbols and commas, then parse
      const cleaned = value.replace(/[₹,$]/g, '').replace(/,/g, '');
      return parseFloat(cleaned) || 0;
    }
    return typeof value === 'number' ? value : 0;
  }, [value]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCount(prev => {
        if (prev < numericValue) {
          return Math.min(prev + Math.ceil(numericValue / 20), numericValue);
        }
        clearInterval(timer);
        return numericValue;
      });
    }, 50);

    return () => clearInterval(timer);
  }, [numericValue]);

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
  const [dashboardData, setDashboardData] = useState({
    stats: null,
    revenueData: [],
    categoryData: [],
    recentOrders: [],
    productPerformance: [],
    loading: true,
    error: null
  });

  // Fetch dashboard data when component mounts
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setDashboardData(prev => ({ ...prev, loading: true, error: null }));
        
        // Fetch all required data in parallel
        console.log('🚀 Starting to fetch dashboard data...');
        
        const [stats, revenueData, categoryData, recentOrders, productPerformance] = await Promise.all([
          getSellerDashboardStats(),
          getSellerRevenueChart(),
          getSellerCategoryData(),
          getSellerRecentOrders(5),
          getSellerProductPerformance()
        ]);
        
        console.log('📊 RECEIVED DASHBOARD DATA:');
        console.log('Stats:', stats);
        console.log('Revenue Data:', revenueData);
        console.log('Category Data:', categoryData);
        console.log('Recent Orders:', recentOrders);
        console.log('Product Performance from API:', productPerformance);
        
        setDashboardData({
          stats,
          revenueData,
          categoryData,
          recentOrders,
          productPerformance,
          loading: false,
          error: null
        });
        
        console.log('✅ Dashboard data set in state');
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setDashboardData(prev => ({
          ...prev,
          loading: false,
          error: 'Failed to load dashboard data'
        }));
      }
    };

    fetchDashboardData();
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'products':
        return <SellerProducts />;
      case 'orders':
        return <SellerOrders />;
      case 'reviews':
        return <SellerReviews />;
      case 'analytics':
        return <SellerAnalytics />;
      case 'dashboard':
      default:
        return (
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Seller Dashboard</h1>
              <p className="text-gray-600">Manage your rental business and track performance</p>
            </div>

            {/* Loading State */}
            {dashboardData.loading && (
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center space-x-2 text-gray-600">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span>Loading dashboard data...</span>
                </div>
              </div>
            )}

            {/* Error State */}
            {dashboardData.error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-600">{dashboardData.error}</p>
              </div>
            )}

            {/* Stats Cards */}
            {!dashboardData.loading && !dashboardData.error && (
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatsCard
                  icon={DollarSign}
                  title="Total Revenue"
                  value={dashboardData.stats?.revenue?.total || 0}
                  change={dashboardData.stats?.revenue?.change || 0}
                  trend={dashboardData.stats?.revenue?.change > 0 ? 'up' : 'down'}
                />
                <StatsCard
                  icon={Package}
                  title="Total Products"
                  value={dashboardData.stats?.products?.total || 0}
                  change={dashboardData.stats?.products?.change || 0}
                  trend={dashboardData.stats?.products?.change > 0 ? 'up' : 'down'}
                />
                <StatsCard
                  icon={TrendingUp}
                  title="Total Orders"
                  value={dashboardData.stats?.orders?.total || 0}
                  change={dashboardData.stats?.orders?.change || 0}
                  trend={dashboardData.stats?.orders?.change > 0 ? 'up' : 'down'}
                />
                <StatsCard
                  icon={Star}
                  title="Average Rating"
                  value={dashboardData.stats?.rating?.total || 0}
                  change={dashboardData.stats?.rating?.change || 0}
                  suffix="/5"
                  trend={dashboardData.stats?.rating?.change > 0 ? 'up' : 'down'}
                />
              </div>
            )}

            {/* Charts Row */}
            {!dashboardData.loading && !dashboardData.error && (
              <div className="grid lg:grid-cols-2 gap-6 mb-8">
                <RevenueChart data={dashboardData.revenueData} />
                <CategoryPieChart data={dashboardData.categoryData} />
              </div>
            )}

            {/* Content Row */}
            {!dashboardData.loading && !dashboardData.error && (
              <div className="grid lg:grid-cols-3 gap-6 mb-8">
                <div className="lg:col-span-2">
                  <RecentOrders data={dashboardData.recentOrders} />
                </div>
                <QuickActions onTabChange={setActiveTab} />
              </div>
            )}

            {/* Product Performance */}
            {!dashboardData.loading && !dashboardData.error && (
              <ProductPerformance data={dashboardData.productPerformance} />
            )}
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Navbar with improved visibility */}
      <div className="sticky top-0 z-50 bg-black backdrop-blur-md border-b border-gray-700/30">
        <Navbar />
      </div>
      
      {/* Modern Header with Centered Navigation */}
      <div className="relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-cyan-600/5"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl"></div>
        
        <div className="relative bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Centered Tab Navigation */}
            <div className="flex justify-center py-6">
              <nav className="flex items-center space-x-1 bg-gray-100/80 backdrop-blur-md rounded-2xl p-2 shadow-lg border border-white/30" aria-label="Tabs">
                {tabs.map((tab) => {
                  const TabIcon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`
                        relative px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 ease-out
                        flex items-center space-x-2 group overflow-hidden
                        ${isActive 
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transform scale-105' 
                          : 'text-gray-600 hover:text-gray-900 hover:bg-white/60 hover:shadow-md hover:scale-102'
                        }
                      `}
                      style={{
                        transform: isActive ? 'scale(1.05)' : 'scale(1)',
                        zIndex: isActive ? 10 : 1
                      }}
                    >
                      {/* Active background glow */}
                      {isActive && (
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl animate-pulse opacity-75"></div>
                      )}
                      
                      {/* Content */}
                      <div className="relative flex items-center space-x-2">
                        <TabIcon className={`w-5 h-5 transition-all duration-300 ${
                          isActive 
                            ? 'text-white transform rotate-12' 
                            : 'text-gray-500 group-hover:text-gray-700 group-hover:scale-110'
                        }`} />
                        <span className="font-medium tracking-wide">{tab.label}</span>
                      </div>
                      
                      {/* Hover effect */}
                      {!isActive && (
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/10 group-hover:to-purple-500/10 rounded-xl transition-all duration-300"></div>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Page Content with Animation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-fadeIn">
          {renderContent()}
        </div>
      </div>
      
      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out;
        }
        
        .hover\:scale-102:hover {
          transform: scale(1.02);
        }
      `}</style>
    </div>
  );
}