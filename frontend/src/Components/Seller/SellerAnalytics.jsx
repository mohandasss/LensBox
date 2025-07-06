import React, { useState, useEffect } from 'react';
import { MapPin, TrendingUp, ShoppingCart, Package } from 'lucide-react';
import HeatmapVisualization from '../HeatmapVisualization';
import { getSellerHeatmapData } from '../../APIs/HeatmapAPI';
import { verifyToken } from '../../APIs/AuthAPI';

const SellerAnalytics = () => {
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
      
      // Get seller ID from token
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No authentication token found. Please login again.');
        setLoading(false);
        return;
      }

      const { user } = await verifyToken(token);
      const sellerId = user._id;
      
      if (!sellerId) {
        setError('Seller ID not found. Please login again.');
        setLoading(false);
        return;
      }
      
      const data = await getSellerHeatmapData(sellerId);
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
      console.error('Error fetching seller heatmap data:', err);
      setError('Failed to load heatmap data. Please try again.');
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
            <h2 className="text-2xl font-bold text-gray-900">Seller Analytics</h2>
            <p className="text-gray-500 mt-1">Track your order distribution and customer locations</p>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Package className="w-4 h-4" />
            <span>Your products only</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Your Locations</p>
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
              <p className="text-sm font-medium text-gray-600">Your Orders</p>
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
              <h3 className="text-lg font-semibold text-gray-900">Your Order Distribution</h3>
              <p className="text-sm text-gray-500 mt-1">Heatmap showing where your products are being ordered from</p>
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
          <HeatmapVisualization orderCoordinates={orderCoordinates} view="seller" />
        )}
      </div>

      {/* Top Locations Table */}
      {orderCoordinates.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">Your Top Order Locations</h3>
            <p className="text-sm text-gray-500 mt-1">Locations with the highest order volume for your products</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Orders
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Percentage
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orderCoordinates.slice(0, 10).map((location, index) => {
                  const percentage = ((location.count / stats.totalOrders) * 100).toFixed(1);
                  return (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium ${
                            index === 0 ? 'bg-yellow-100 text-yellow-800' :
                            index === 1 ? 'bg-gray-100 text-gray-800' :
                            index === 2 ? 'bg-orange-100 text-orange-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {index + 1}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {location.location?.city
                            ? location.location.city
                            : location.orders && location.orders[0]?.customerDetails?.city
                              ? location.orders[0].customerDetails.city
                              : 'Unknown City'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{location.count}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className="bg-green-600 h-2 rounded-full" 
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-500">{percentage}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Insights Section */}
      {orderCoordinates.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg mt-1">
                  <MapPin className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Geographic Reach</p>
                  <p className="text-sm text-gray-500">
                    Your products are reaching customers in {stats.totalLocations} different locations
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-green-100 rounded-lg mt-1">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Order Distribution</p>
                  <p className="text-sm text-gray-500">
                    Average of {stats.averageOrdersPerLocation} orders per location
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg mt-1">
                  <ShoppingCart className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Top Market</p>
                  <p className="text-sm text-gray-500">
                    {orderCoordinates[0]?.orders?.[0]?.customerDetails?.city || 'Unknown'} is your highest performing location
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-orange-100 rounded-lg mt-1">
                  <Package className="w-4 h-4 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Growth Opportunity</p>
                  <p className="text-sm text-gray-500">
                    Consider expanding to areas with lower order density
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && orderCoordinates.length === 0 && !error && (
        <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-100">
          <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Order Data Available</h3>
          <p className="text-gray-500">Orders for your products with location data will appear here once they are created.</p>
        </div>
      )}
    </div>
  );
};

export default SellerAnalytics; 