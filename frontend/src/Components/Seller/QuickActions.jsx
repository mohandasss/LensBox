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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Add New Product</h2>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Product Images */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Product Images
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {imagePreview.map((preview, index) => (
                    <div key={index} className="relative">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border-2 border-gray-200"
                      />
                    </div>
                  ))}
                  <label className="w-full h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
                    <Upload className="w-6 h-6 text-gray-400 mb-1" />
                    <span className="text-xs text-gray-500">Add Image</span>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter product name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  required
                  rows="4"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe your product..."
                />
              </div>

              {/* Features */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Features
                </label>
                <div className="space-y-2">
                  {formData.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={feature}
                        onChange={(e) => handleFeatureChange(index, e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder={`Feature ${index + 1}`}
                      />
                      {formData.features.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeFeature(index)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addFeature}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    + Add Feature
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
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
      )}
    </>
  );
};

export default QuickActions;
