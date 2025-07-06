import React, { useEffect, useState } from 'react';
import { getProductsBySellerId } from '../../APIs/SellerAPI';
import { verifyToken } from '../../APIs/AuthAPI';
import { Star, TrendingUp, DollarSign, Package, ArrowDownUp, Calendar, Layers, ChevronLeft, ChevronRight, Image as ImageIcon, Eye, EyeOff, Trash2, X, AlertTriangle } from 'lucide-react';
import { useNotification } from '../NotificationSystem';
import axios from 'axios';

const SORT_OPTIONS = [
  { label: 'Most Sales', value: 'salesCount', icon: <TrendingUp className="w-4 h-4 mr-1" /> },
  { label: 'Most Revenue', value: 'totalRevenue', icon: <DollarSign className="w-4 h-4 mr-1" /> },
  { label: 'Newest', value: 'createdAt', icon: <Calendar className="w-4 h-4 mr-1" /> },
  { label: 'Stock', value: 'stock', icon: <Package className="w-4 h-4 mr-1" /> },
];

const PAGE_SIZE = 10;

const SellerProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState('salesCount');
  const [order, setOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const { showSuccess, showError } = useNotification();

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const user = await verifyToken(token);
        const sellerId = user?.user?._id || user?._id || user?.id;
        const { data, pagination } = await getProductsBySellerId(sellerId, { page, limit: PAGE_SIZE, sort, order });
        setProducts(data);
        setPages(pagination.pages);
        setTotal(pagination.total);
      } catch (e) {
        setProducts([]);
        setPages(1);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [sort, order, page]);

  // Animation for page transitions
  const [pageKey, setPageKey] = useState(0);
  useEffect(() => { setPageKey(page); }, [page]);

  // Delete product handler
  const handleDelete = async () => {
    if (!productToDelete) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/products/${productToDelete._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(products.filter(p => p._id !== productToDelete._id));
      showSuccess('Product Deleted', 'The product has been deleted successfully.');
      setShowDeleteModal(false);
      setProductToDelete(null);
    } catch (error) {
      showError('Delete Failed', error?.response?.data?.message || 'Could not delete product.');
    }
  };

  // Toggle active/visibility handler
  const handleToggleActive = async (productId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.patch(`http://localhost:5000/api/products/${productId}/toggle-active`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(products.map(p => p._id === productId ? { ...p, active: res.data.active } : p));
      showSuccess('Product Updated', res.data.message);
    } catch (error) {
      showError('Update Failed', error?.response?.data?.message || 'Could not update product.');
    }
  };

  const openDeleteModal = (product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  return (
    <>
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-gray-100 animate-fade-in-ios max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Layers className="w-6 h-6 text-blue-500 animate-pop-in" />
            Your Products
          </h2>
          <div className="flex items-center gap-2">
            <div className="relative">
              <select
                className="appearance-none bg-gray-100 border border-gray-200 rounded-xl px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                value={sort}
                onChange={e => setSort(e.target.value)}
              >
                {SORT_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <ArrowDownUp className="absolute right-2 top-2.5 w-4 h-4 text-gray-400 pointer-events-none animate-bounce-x" />
            </div>
            <button
              className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-4 py-2 rounded-xl flex items-center space-x-2 shadow-md transition-transform duration-200 active:scale-95 animate-pop-in"
              style={{ minWidth: 120 }}
            >
              <span>+ Add Product</span>
            </button>
          </div>
        </div>
        <div className="w-full max-w-full overflow-x-auto rounded-2xl">
          {loading ? (
            <div className="flex items-center justify-center py-12 animate-fade-in">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-2"></div>
              <span className="text-gray-500">Loading products...</span>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12 animate-fade-in">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-12 w-12 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Products Yet</h3>
              <p className="text-gray-500">Add your first product to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto w-full">
              <table className="min-w-full divide-y divide-gray-200 animate-fade-in-ios" key={pageKey}>
                <thead className="bg-gradient-to-r from-gray-50 to-blue-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider rounded-tl-2xl">Images</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Sales</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Revenue</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Stock</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Rating</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Last Sold</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider rounded-tr-2xl">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {products.map((product, idx) => (
                    <tr
                      key={product._id}
                      className={`bg-white group animate-fade-in-up-ios shadow-sm rounded-xl transition-all duration-200 hover:shadow-lg hover:bg-blue-50/40 ${idx !== products.length - 1 ? 'mb-2' : ''}`}
                      style={{ animationDelay: `${idx * 40}ms`, height: '72px' }}
                    >
                      <td className="px-6 py-3 align-middle">
                        <div className="flex items-center gap-1 overflow-x-auto max-w-[100px]">
                          {product.image && product.image.length > 0 ? (
                            product.image.slice(0, 3).map((img, i) => (
                              <img
                                key={i}
                                src={img}
                                alt={product.name + ' ' + (i + 1)}
                                className="w-8 h-8 object-cover rounded-lg border border-gray-100 shadow-sm hover:scale-110 transition-transform duration-200 flex-shrink-0"
                                style={{ background: '#f8f8fa' }}
                              />
                            ))
                          ) : (
                            <div className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-lg border border-gray-100">
                              <ImageIcon className="w-4 h-4 text-gray-300" />
                            </div>
                          )}
                          {product.image && product.image.length > 3 && (
                            <div className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-lg border border-gray-100 text-xs font-medium text-gray-600">
                              +{product.image.length - 3}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-3 align-middle">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900 text-sm">{product.name}</span>
                          {idx === 0 && page === 1 && sort === 'salesCount' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-50 text-yellow-700 border border-yellow-200 animate-pop-in ml-1">
                              <TrendingUp className="w-3 h-3 mr-1" /> Top Seller
                            </span>
                          )}
                          {idx === 0 && page === 1 && sort === 'totalRevenue' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200 animate-pop-in ml-1">
                              <DollarSign className="w-3 h-3 mr-1" /> Most Revenue
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-3 align-middle text-center">
                        <span className="text-sm text-gray-500">{product.category?.name || 'Uncategorized'}</span>
                      </td>
                      <td className="px-6 py-3 align-middle text-center">
                        <span className="text-sm text-blue-700 font-semibold flex items-center justify-center gap-1">
                          <TrendingUp className="w-4 h-4 text-blue-400 animate-bounce-x" />
                          {product.salesCount || 0}
                        </span>
                      </td>
                      <td className="px-6 py-3 align-middle text-center">
                        <span className="text-sm text-green-700 font-semibold flex items-center justify-center gap-1">
                          <DollarSign className="w-4 h-4 text-green-400 animate-bounce-x" />
                          ₹{product.totalRevenue ? product.totalRevenue.toLocaleString('en-IN') : '0'}
                        </span>
                      </td>
                      <td className="px-6 py-3 align-middle text-center">
                        <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full transition-all duration-200 ${
                          product.stock > 5 ? 'bg-green-50 text-green-700 border border-green-200' :
                          product.stock > 0 ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' :
                          'bg-red-50 text-red-700 border border-red-200 animate-pulse'
                        }`}>
                          {product.stock} in stock
                        </span>
                      </td>
                      <td className="px-6 py-3 align-middle text-center">
                        <span className="flex items-center justify-center gap-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current animate-pop-in" />
                          <span className="text-sm text-gray-900">{product.averageRating || 0}</span>
                        </span>
                      </td>
                      <td className="px-6 py-3 align-middle text-center">
                        <span className="text-sm text-gray-500">
                          {product.lastSoldAt ? new Date(product.lastSoldAt).toLocaleDateString() : <span className="text-gray-400 italic">Never sold</span>}
                        </span>
                      </td>
                      <td className="px-6 py-3 align-middle text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleToggleActive(product._id)}
                            className={`p-1.5 rounded-full border transition-colors duration-200 ${product.active ? 'bg-green-50 border-green-200 text-green-600 hover:bg-green-100' : 'bg-gray-100 border-gray-200 text-gray-400 hover:bg-gray-200'}`}
                            title={product.active ? 'Disable (Hide) Product' : 'Enable (Show) Product'}
                          >
                            {product.active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => openDeleteModal(product)}
                            className="p-1.5 rounded-full border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 transition-colors duration-200"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        {/* Pagination Controls */}
        {pages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-4 mb-2 animate-fade-in-ios bg-white/90 rounded-xl shadow p-2 w-fit mx-auto border border-gray-100">
            <button
              className="p-2 rounded-full bg-gray-100 hover:bg-blue-100 text-blue-500 shadow transition-all duration-200 disabled:opacity-50"
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              aria-label="Previous page"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            {[...Array(pages)].map((_, i) => (
              <button
                key={i}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 ${
                  page === i + 1
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                onClick={() => setPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
            <button
              className="p-2 rounded-full bg-gray-100 hover:bg-blue-100 text-blue-500 shadow transition-all duration-200 disabled:opacity-50"
              onClick={() => setPage(page + 1)}
              disabled={page === pages}
              aria-label="Next page"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Custom Delete Confirmation Modal */}
      {showDeleteModal && productToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-fade-in">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-full">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Delete Product</h2>
              </div>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="p-6">
              <p className="text-gray-600 mb-4">
                Are you sure you want to delete <span className="font-semibold text-gray-900">"{productToDelete.name}"</span>?
              </p>
              <p className="text-sm text-gray-500 mb-6">
                This action cannot be undone. The product will be permanently removed from your inventory.
              </p>
              
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Product
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SellerProducts;
