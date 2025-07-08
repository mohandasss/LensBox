
import React, { useState, useEffect } from 'react';
import { 
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Package2,
  UserCheck,
  Eye,
  Download
} from 'lucide-react';
import { PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getDashboardStats, getSalesByCategory, getRecentOrders, getSampleSalesData } from '../APIs/AdminAPI';

const Dashboard = () => {

  const [orders, setOrders] = useState(null);
  const [products, setProducts] = useState(null);
  const [users, setUsers] = useState(null);
  const [revenue, setRevenue] = useState(null);
  const [categoryData, setCategoryData] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [recentOrders, setRecentOrders] = useState([]);
  const [sampleSalesData, setSampleSalesData] = useState([]);
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const {orders, products, users, revenue} = await getDashboardStats();
        setOrders(orders);
        setProducts(products);
        setUsers(users);
        setRevenue(revenue);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      }
    };
    const fetchRecentOrders = async () => {
      try {
        const response = await getRecentOrders();
        console.log('Recent orders response:', response);
        setRecentOrders(response);
      } catch (error) {
        console.error('Error fetching recent orders:', error);
      }
    };

    const fetchCategoryData = async () => {
      try {
        const response = await getSalesByCategory();
        console.log('Category data response:', response);
        // Handle the data structure properly
        const data = response.data || response || [];
        setCategoryData(data);
      } catch (error) {
        console.error('Error fetching category data:', error);
        setCategoryData([]);
      } finally {
        setLoadingCategories(false);
      }
    };

    const fetchSampleSalesData = async () => {
      try {
        const response = await getSampleSalesData();
        console.log('Sample sales data response:', response);
        setSampleSalesData(response);
      } catch (error) {
        console.error('Error fetching sample sales data:', error);
        setSampleSalesData([]);
      }
    };

    fetchStats();
    fetchRecentOrders();
    fetchCategoryData();
    fetchSampleSalesData();
  }, []);

 

  const displayCategoryData = categoryData.length > 0 
    ? categoryData.map((item) => ({
        name: item.name,
        value: Number(item.value) || 0,
        count: Number(item.count) || 0,
        color: item.color || '#6b7280',
        categoryId: item.categoryId
      }))
    : [
        { 
          name: 'No Data', 
          value: 100, 
          color: '#e5e7eb', 
          count: 0,
          categoryId: 'no-data'
        }
      ];

  console.log('Display category data:', displayCategoryData);

 

  const StatCard = ({ title, value, change, icon: Icon, color }) => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
          <div className="flex items-center mt-2">
            {change > 0 ? (
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
            )}
            <span className={`text-sm font-medium ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change > 0 ? '+' : ''}{change}%
            </span>
            <span className="text-sm text-gray-500 ml-1">vs last month</span>
          </div>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  // Custom tooltip for the pie chart
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{data.name}</p>
          <p className="text-sm text-gray-600">Sales: ₹{data.value.toLocaleString()}</p>
          <p className="text-sm text-gray-600">Orders: {data.count}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <button className="flex items-center px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors">
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value={revenue?.total}
          change={revenue?.change !== undefined ? Number(revenue.change).toFixed(1) : '0.0'}
          icon={DollarSign}
          color="bg-violet-500"
        />
        <StatCard
          title="Total Orders"
          value={orders?.total}
          change={orders?.change !== undefined ? Number(orders.change).toFixed(1) : '0.0'}
          icon={ShoppingCart}
          color="bg-blue-500"
        />
        <StatCard
          title="Total Products"
          value={products?.total}
          change={products?.change !== undefined ? Number(products.change).toFixed(1) : '0.0'}
          icon={Package2} 
          color="bg-green-500"
        />
        <StatCard
          title="Active Users"
          value={users?.total}
          change={users?.change !== undefined ? Number(users.change).toFixed(1) : '0.0'}
          icon={UserCheck}
          color="bg-orange-500"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Sales Overview</h3>
            
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={sampleSalesData}>
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="sales"
                stroke="#8b5cf6"
                fillOpacity={1}
                fill="url(#colorSales)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Category Distribution */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Sales by Category</h3>
            {loadingCategories && (
              <div className="flex items-center text-sm text-gray-500">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 mr-2"></div>
                Loading...
              </div>
            )}
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={displayCategoryData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                label={({ name, count }) => `${name} (${count})`}
                labelLine={false}
              >
                {displayCategoryData.map((entry, index) => (
                  <Cell 
                    key={`cell-${entry.categoryId || index}`} 
                    fill={entry.color}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          
          {/* Legend */}
          <div className="mt-4 flex flex-wrap gap-4 justify-center">
            {displayCategoryData.map((entry, index) => (
              <div key={`legend-${entry.categoryId || index}`} className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-2" 
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-sm text-gray-600">
                  {entry.name} ({entry.count})
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
            <button className="text-violet-600 hover:text-violet-700 font-medium text-sm">
              View All
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.customer}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{order.amount}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      order.status === 'Completed' || order.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      order.status === 'Processing' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'Pending' ? 'bg-gray-100 text-gray-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button className="text-violet-600 hover:text-violet-700">
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
