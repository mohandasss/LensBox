import React, { useState } from 'react';
import { Plus, BarChart3, Users, Star, X, Upload, Camera } from 'lucide-react';
import { useNotification } from '../NotificationSystem';
import { addProduct } from '../../APIs/ProductAPI';

const QuickActions = ({ onTabChange }) => {
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showSuccess, showError } = useNotification();

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    category: '',
    stock: '',
    features: ['']
  });

  const [images, setImages] = useState([]);
  const [imagePreview, setImagePreview] = useState([]);

  const actions = [
    {
      icon: Plus,
      title: 'Add Product',
      description: 'Add a new product to your inventory',
      color: 'blue',
      onClick: () => setShowAddProductModal(true)
    },
    {
      icon: BarChart3,
      title: 'View Analytics',
      description: 'Check your sales and performance metrics',
      color: 'purple',
      onClick: () => onTabChange('analytics')
    },
    {
      icon: Users,
      title: 'Manage Orders',
      description: 'Process and manage customer orders',
      color: 'green',
      onClick: () => onTabChange('orders')
    },
    {
      icon: Star,
      title: 'View Reviews',
      description: 'Read customer feedback and ratings',
      color: 'yellow',
      onClick: () => onTabChange('reviews')
    }
  ];

  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-200',
    purple: 'bg-purple-50 text-purple-600 hover:bg-purple-100 border-purple-200',
    green: 'bg-green-50 text-green-600 hover:bg-green-100 border-green-200',
    yellow: 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100 border-yellow-200'
  };

  const categories = [
    { id: '507f1f77bcf86cd799439011', name: 'Camera' },
    { id: '507f1f77bcf86cd799439012', name: 'Lens' },
    { id: '507f1f77bcf86cd799439013', name: 'Equipment' }
  ];

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
    
    // Create preview URLs
    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreview(previews);
  };

  const handleCloseModal = () => {
    setShowAddProductModal(false);
    // Clean up image preview URLs to prevent memory leaks
    imagePreview.forEach(url => URL.revokeObjectURL(url));
    setImagePreview([]);
    setImages([]);
    setFormData({
      name: '',
      price: '',
      description: '',
      category: '',
      stock: '',
      features: ['']
    });
  };

  const handleFeatureChange = (index, value) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData({ ...formData, features: newFeatures });
  };

  const addFeature = () => {
    setFormData({
      ...formData,
      features: [...formData.features, '']
    });
  };

  const removeFeature = (index) => {
    const newFeatures = formData.features.filter((_, i) => i !== index);
    setFormData({ ...formData, features: newFeatures });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate that at least one image is selected
      if (images.length === 0) {
        showError(
          'Image Required',
          'Please select at least one product image.'
        );
        setIsSubmitting(false);
        return;
      }

      const formDataToSend = new FormData();
      
      // Add basic fields
      formDataToSend.append('name', formData.name);
      formDataToSend.append('price', formData.price);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('stock', formData.stock);
      
      // Add features (filter out empty ones)
      const validFeatures = formData.features.filter(feature => feature.trim() !== '');
      formDataToSend.append('features', JSON.stringify(validFeatures));
      
      // Add images
      images.forEach((image, index) => {
        formDataToSend.append('image', image);
      });

      const response = await addProduct(formDataToSend);
      
      if (response.success) {
        showSuccess(
          'Product Added!',
          'New product has been added successfully.'
        );
        handleCloseModal();
      }
    } catch (error) {
      console.error('Error adding product:', error);
      showError(
        'Failed to Add Product',
        'Please try again or check your connection.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Quick Actions</h3>
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={action.onClick}
            className={`w-full p-4 rounded-xl border-2 border-dashed flex items-start space-x-3 transition-all duration-300 hover:scale-105 ${colorClasses[action.color]}`}
          >
            <div className={`p-2 rounded-lg ${action.color === 'yellow' ? 'bg-yellow-100' : `bg-${action.color}-100`}`}>
              <action.icon className="w-5 h-5" />
            </div>
            <div className="text-left">
              <h4 className="font-medium">{action.title}</h4>
              <p className="text-sm text-gray-600">{action.description}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Add Product Modal */}
      {showAddProductModal && (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
    <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[95vh] overflow-hidden animate-in slide-in-from-bottom-4 duration-500 border border-gray-200/50">
      {/* Gradient Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 animate-pulse"></div>
        <div className="relative flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
              <Plus className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">Add New Product</h2>
          </div>
          <button
            onClick={handleCloseModal}
            className="p-2 hover:bg-white/20 rounded-xl transition-all duration-300 backdrop-blur-sm group"
          >
            <X className="w-6 h-6 text-white group-hover:rotate-90 transition-transform duration-300" />
          </button>
        </div>
      </div>

      {/* Form Content */}
      <div className="overflow-y-auto max-h-[calc(95vh-100px)]">
        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Product Images */}
          <div className="space-y-4">
            <label className="block text-sm font-semibold text-gray-900 flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Product Images</span>
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {imagePreview.map((preview, index) => (
                <div key={index} className="relative group">
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-24 object-cover rounded-2xl border-2 border-gray-200 group-hover:border-blue-400 transition-all duration-300 group-hover:scale-105"
                  />
                  <button
                    type="button"
                    className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-red-600 shadow-lg"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              ))}
              <label className="w-full h-24 border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 hover:scale-105 transition-all duration-300 group">
                <Upload className="w-6 h-6 text-gray-400 mb-1 group-hover:text-blue-500 group-hover:scale-110 transition-all duration-300" />
                <span className="text-xs text-gray-500 font-medium group-hover:text-blue-600">Add Image</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-900 flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Product Name *</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-blue-50/50 transition-all duration-300 hover:border-gray-400"
                placeholder="Enter product name"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-900 flex items-center space-x-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span>Price (₹) *</span>
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-blue-50/50 transition-all duration-300 hover:border-gray-400"
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-900 flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>Category *</span>
              </label>
              <select
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-blue-50/50 transition-all duration-300 hover:border-gray-400"
              >
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-900 flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span>Stock Quantity *</span>
              </label>
              <input
                type="number"
                required
                min="0"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-blue-50/50 transition-all duration-300 hover:border-gray-400"
                placeholder="0"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-900 flex items-center space-x-2">
              <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
              <span>Description *</span>
            </label>
            <textarea
              required
              rows="4"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-blue-50/50 transition-all duration-300 hover:border-gray-400 resize-none"
              placeholder="Describe your product..."
            />
          </div>

          {/* Features */}
          <div className="space-y-4">
            <label className="block text-sm font-semibold text-gray-900 flex items-center space-x-2">
              <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
              <span>Features</span>
            </label>
            <div className="space-y-3">
              {formData.features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-3 group">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={feature}
                      onChange={(e) => handleFeatureChange(index, e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-blue-50/50 transition-all duration-300 hover:border-gray-400"
                      placeholder={`Feature ${index + 1}`}
                    />
                  </div>
                  {formData.features.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeFeature(index)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-2xl transition-all duration-300 hover:scale-110 opacity-0 group-hover:opacity-100"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addFeature}
                className="text-blue-600 hover:text-blue-700 text-sm font-semibold hover:bg-blue-50 px-3 py-2 rounded-xl transition-all duration-300 flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Feature</span>
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleCloseModal}
              className="px-8 py-3 border border-gray-300 rounded-2xl text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center space-x-2 font-medium shadow-lg hover:shadow-xl hover:scale-105 disabled:hover:scale-100"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Adding...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Add Product</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
)}
    </>
  );
};

export default QuickActions;
