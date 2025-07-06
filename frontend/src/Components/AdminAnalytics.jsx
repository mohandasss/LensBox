import React, { useState, useEffect } from 'react';
import { MapPin, TrendingUp, Users, DollarSign, ShoppingCart } from 'lucide-react';
import HeatmapVisualization from './HeatmapVisualization';
import { getAdminHeatmapData } from '../APIs/HeatmapAPI';

const AdminAnalytics = () => {
  const [orderCoordinates, setOrderCoordinates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalLocations: 0,
    totalOrders: 0,
    averageOrdersPerLocation: 0
  });

  useEffect(() => {
    fetchHeatmapData();
  }, []);

  const fetchHeatmapData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await getAdminHeatmapData();
      // Convert the data format to match what HeatmapVisualization expects
      const coordinates = data.map(location => ({
        lat: location.lat,
        lng: location.lng,
        count: location.count
      }));
      
      setOrderCoordinates(coordinates);
      
      // Calculate stats
      const totalOrders = coordinates.reduce((sum, location) => sum + location.count, 0);
      setStats({
        totalLocations: coordinates.length,
        totalOrders,
        averageOrdersPerLocation: coordinates.length > 0 ? (totalOrders / coordinates.length).toFixed(1) : 0
      });
      
    } catch (err) {
      console.error('Error fetching heatmap data:', err);
      setError('Failed to load heatmap data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
            <p className="text-gray-500 mt-1">Comprehensive insights into order distribution and performance</p>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <MapPin className="w-4 h-4" />
            <span>Real-time data</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Locations</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalLocations}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <MapPin className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <ShoppingCart className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Orders/Location</p>
              <p className="text-2xl font-bold text-gray-900">{stats.averageOrdersPerLocation}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Heatmap Visualization */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Global Order Distribution</h3>
              <p className="text-sm text-gray-500 mt-1">Heatmap showing order concentration across all locations</p>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span>Low</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span>High</span>
              </div>
            </div>
          </div>
        </div>
        
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading heatmap data...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center text-gray-500">
            <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>{error}</p>
          </div>
        ) : (
          <HeatmapVisualization orderCoordinates={orderCoordinates} view="admin" />
        )}
      </div>

      {/* Empty State */}
      {!loading && orderCoordinates.length === 0 && !error && (
        <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-100">
          <MapPin className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Order Data Available</h3>
          <p className="text-gray-500">Orders with location data will appear here once they are created.</p>
        </div>
      )}
    </div>
  );
};

export default AdminAnalytics; 