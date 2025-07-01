import React, { useState, useEffect } from 'react';
import { getOrders } from '../APIs/AdminAPI';
import { 
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Truck,
  Package,
  CheckCircle,
  Clock,
  XCircle,
  Calendar,
  DollarSign,
  ShoppingCart,
  Users,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';

const Index = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedDate, setSelectedDate] = useState('all');
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
    limit: 15
  });
  // Helper function to generate page numbers with ellipsis
  const getPageNumbers = () => {
    const totalPages = pagination.pages;
    const currentPage = pagination.page;
    const pageNumbers = [];
    
    // Always show first page
    pageNumbers.push(1);
    
    // Calculate start and end page numbers
    let startPage = Math.max(2, currentPage - 1);
    let endPage = Math.min(totalPages - 1, currentPage + 1);
    
    // Add ellipsis if needed
    if (startPage > 2) {
      pageNumbers.push('...');
    }
    
    // Add middle pages
    for (let i = startPage; i <= endPage; i++) {
      if (i > 1 && i < totalPages) {
        pageNumbers.push(i);
      }
    }
    
    // Add ellipsis if needed
    if (endPage < totalPages - 1) {
      pageNumbers.push('...');
    }
    
    // Always show last page if there is more than one page
    if (totalPages > 1) {
      pageNumbers.push(totalPages);
    }
    
    return pageNumbers;
  };

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchOrders = async (page = 1) => {
    try {
      setLoading(true);
      const response = await getOrders(page);
      console.log('API Response:', response);
      
      const ordersData = response.data || [];
      const paginationData = response.pagination || {
        page: page,
        pages: 1,
        total: ordersData.length,
        limit: 15
      };
      
      console.log('Orders Data:', ordersData);
      console.log('Pagination Data:', paginationData);
      
      setOrders(Array.isArray(ordersData) ? ordersData : []);
      setPagination({
        page: Number(paginationData.page) || page,
        pages: Number(paginationData.pages) || 1,
        total: Number(paginationData.total) || ordersData.length,
        limit: Number(paginationData.limit) || 15
      });
      setError(null);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Failed to load orders. Please try again.');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(pagination.currentPage);
  }, []);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      fetchOrders(newPage);
    }
  };

  const statuses = ['Pending', 'Processing', 'Shipped', 'Completed', 'Cancelled'];
  
  // Client-side filtering for search and status
  const filteredOrders = orders.filter(order => {
    if (!order) return false;
    
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      (order.customer?.toLowerCase().includes(searchLower) || 
       order.id?.toLowerCase().includes(searchLower) ||
       order.email?.toLowerCase().includes(searchLower)) ||
      !searchTerm;
      
    const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Pending':
        return <Clock className="w-4 h-4" />;
      case 'Processing':
        return <Package className="w-4 h-4" />;
      case 'Shipped':
        return <Truck className="w-4 h-4" />;
      case 'Completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'Cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Processing':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Shipped':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Completed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Cancelled':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getPaymentColor = (payment) => {
    switch (payment) {
      case 'Paid':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Pending':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Refunded':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const totalRevenue = orders.reduce((sum, order) => sum + order.amount, 0);
  const completedOrders = orders.filter(order => order.status === 'Completed').length;
  const pendingOrders = orders.filter(order => order.status === 'Pending').length;
  const averageOrderValue = totalRevenue / orders.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Order Management</h1>
              <p className="text-gray-600 mt-1">Monitor and manage all your orders in one place</p>
            </div>
            <div className="flex items-center space-x-3">
              <button className="flex items-center px-4 py-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md group">
                <Calendar className="w-4 h-4 mr-2 text-gray-500 group-hover:text-gray-700" />
                <span className="text-sm font-medium text-gray-700">Date Range</span>
              </button>
              <button className="flex items-center px-4 py-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md group">
                <Download className="w-4 h-4 mr-2 text-gray-500 group-hover:text-gray-700" />
                <span className="text-sm font-medium text-gray-700">Export</span>
              </button>
              <button className="flex items-center px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                <ShoppingCart className="w-4 h-4 mr-2" />
                <span className="text-sm font-medium">New Order</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">₹{totalRevenue.toLocaleString()}</p>
              </div>
              <div className="bg-emerald-100 p-3 rounded-xl group-hover:bg-emerald-200 transition-colors">
                <DollarSign className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed Orders</p>
                <p className="text-2xl font-bold text-gray-900">{completedOrders}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-xl group-hover:bg-blue-200 transition-colors">
                <CheckCircle className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Orders</p>
                <p className="text-2xl font-bold text-gray-900">{pendingOrders}</p>
              </div>
              <div className="bg-amber-100 p-3 rounded-xl group-hover:bg-amber-200 transition-colors">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Order</p>
                <p className="text-2xl font-bold text-gray-900">₹{averageOrderValue.toFixed(0)}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-xl group-hover:bg-purple-200 transition-colors">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by customer, order ID, or email..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex gap-3">
              <div className="relative">
                <select
                  className="appearance-none bg-white border border-gray-200 rounded-xl px-4 py-3 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                >
                  <option value="all">All Statuses</option>
                  {statuses.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
                <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Order</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Payment</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order, index) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <img className="w-10 h-10 rounded-lg object-cover" src={order.productImage} alt="" />
                        <div className="text-sm text-gray-500">{order.items} items</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{order.customer}</div>
                        <div className="text-sm text-gray-500">{order.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">₹{order.amount}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium border ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        <span className="ml-2">{order.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium border ${getPaymentColor(order.payment)}`}>
                        {order.payment}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200">
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Custom Gradient Pagination */}
        <div className="mt-8 bg-gradient-to-r from-white/80 to-gray-50/80 backdrop-blur-xl p-6 rounded-2xl shadow-xl border border-white/20 transition-all duration-500 hover:shadow-2xl">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            {/* Results Info */}
            <div className="flex items-center space-x-2">
              <div className="px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-full border border-blue-100/50">
                <p className="text-sm font-medium bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent">
                  Showing{' '}
                  <span className="font-bold text-blue-600 transition-colors duration-300">
                    {filteredOrders.length}
                  </span>{' '}
                  of{' '}
                  <span className="font-bold text-indigo-600 transition-colors duration-300">
                    {pagination.total}
                  </span>{' '}
                  orders
                  {searchTerm || (selectedStatus && selectedStatus !== 'all') ? (
                    <span className="text-amber-600 font-medium ml-1">
                      (filtered)
                    </span>
                  ) : null}
                </p>
              </div>
            </div>
            
            {/* Pagination Controls */}
            <div className="flex items-center space-x-2">
              {/* Previous Button */}
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className={`group relative px-4 py-2.5 flex items-center space-x-2 text-sm font-medium rounded-xl border transition-all duration-300 transform ${
                  pagination.page === 1
                    ? 'text-gray-300 border-gray-200/50 cursor-not-allowed bg-gray-50/30'
                    : 'text-gray-700 border-gray-200/80 hover:border-blue-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700 hover:scale-105 hover:shadow-lg active:scale-95'
                }`}
              >
                <ArrowLeft className={`w-4 h-4 transition-transform duration-300 ${
                  pagination.page !== 1 ? 'group-hover:-translate-x-0.5' : ''
                }`} />
                <span className="hidden sm:inline">Previous</span>
              </button>
              
              {/* Page Numbers */}
              <div className="flex items-center space-x-1">
                {getPageNumbers().map((pageNum, index) => {
                  if (pageNum === '...') {
                    return (
                      <div
                        key={`ellipsis-${index}`}
                        className="w-10 h-10 flex items-center justify-center text-gray-400 font-medium"
                      >
                        ...
                      </div>
                    );
                  }
                  
                  const isActive = pagination.page === pageNum;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`relative w-10 h-10 flex items-center justify-center text-sm font-semibold rounded-xl transition-all duration-300 transform hover:scale-110 active:scale-95 ${
                        isActive
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25 ring-2 ring-blue-200/50 scale-105'
                          : 'text-gray-700 hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-200 hover:text-gray-900 hover:shadow-md'
                      }`}
                    >
                      {pageNum}
                      {isActive && (
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-xl blur opacity-30" />
                      )}
                    </button>
                  );
                })}
              </div>
              
              {/* Next Button */}
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
                className={`group relative px-4 py-2.5 flex items-center space-x-2 text-sm font-medium rounded-xl border transition-all duration-300 transform ${
                  pagination.page === pagination.pages
                    ? 'text-gray-300 border-gray-200/50 cursor-not-allowed bg-gray-50/30'
                    : 'text-gray-700 border-gray-200/80 hover:border-blue-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700 hover:scale-105 hover:shadow-lg active:scale-95'
                }`}
              >
                <span className="hidden sm:inline">Next</span>
                <ArrowRight className={`w-4 h-4 transition-transform duration-300 ${
                  pagination.page !== pagination.pages ? 'group-hover:translate-x-0.5' : ''
                }`} />
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading orders...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12 bg-red-50 rounded-lg">
            <div className="text-red-500 mb-2">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading orders</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={() => fetchOrders(pagination.currentPage)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || selectedStatus !== 'all' ? 'No matching orders found' : 'No orders yet'}
            </h3>
            <p className="text-gray-500">
              {searchTerm || selectedStatus !== 'all' 
                ? 'Try adjusting your search criteria or filters.'
                : 'New orders will appear here.'}
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default Index;