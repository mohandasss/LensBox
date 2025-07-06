# Heatmap Feature Setup Guide

## Overview
The heatmap feature provides visual analytics showing order distribution by location for both admin and seller dashboards.

## Features
- **Admin Dashboard**: View heatmap of all orders from all users
- **Seller Dashboard**: View heatmap of only that seller's orders
- **Interactive Map**: Click on locations to see detailed order information
- **Real-time Data**: Updates automatically as new orders are created

## Setup Instructions

### 1. Google Maps API Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - **Geocoding API** (for converting addresses to coordinates)
   - **Maps JavaScript API** (for displaying the map)
   - **Maps Visualization API** (for heatmap functionality)

4. Create API credentials:
   - Go to "Credentials" in the left sidebar
   - Click "Create Credentials" → "API Key"
   - Copy the generated API key

### 2. Environment Variables

Add the following to your backend `.env` file:

```env
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

Add the following to your frontend `.env` file:

```env
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

### 3. API Key Security

For production, restrict your API key:
1. In Google Cloud Console, go to your API key settings
2. Add restrictions:
   - **Application restrictions**: HTTP referrers (web sites)
   - **API restrictions**: Restrict to only the APIs you need

### 4. Database Migration

The order schema has been updated to include location data. New orders will automatically include:
- `location.lat`: Latitude coordinate
- `location.lng`: Longitude coordinate  
- `location.address`: Human-readable address

### 5. Testing the Feature

1. **Create Test Orders**: Place orders with different addresses to generate heatmap data
2. **Admin Dashboard**: Navigate to Admin → Analytics tab
3. **Seller Dashboard**: Navigate to Seller → Analytics tab
4. **Interactive Features**: Click on map markers to see order details

## Usage

### Admin Analytics
- View global order distribution across all sellers
- See total locations, orders, and average orders per location
- Click on map markers for detailed order information
- View top performing locations in a table format

### Seller Analytics  
- View order distribution for your products only
- Track your geographic reach and market performance
- Get insights on top markets and growth opportunities
- Compare your performance across different locations

## Technical Details

### Backend Components
- `backend/utils/geocoding.js`: Address to coordinate conversion
- `backend/Controllers/HeatmapController.js`: API endpoints for heatmap data
- `backend/Routes/heatmapRoutes.js`: Route definitions
- `backend/Models/orderModel.js`: Updated schema with location field

### Frontend Components
- `frontend/src/Components/HeatmapVisualization.jsx`: Reusable heatmap component
- `frontend/src/Components/AdminAnalytics.jsx`: Admin analytics dashboard
- `frontend/src/Components/Seller/SellerAnalytics.jsx`: Seller analytics dashboard
- `frontend/src/APIs/HeatmapAPI.js`: API integration

### API Endpoints
- `GET /api/heatmap/admin`: Get all order locations (admin only)
- `GET /api/heatmap/seller/:sellerId`: Get seller's order locations
- `GET /api/heatmap/location-orders`: Get detailed orders for a location

## Troubleshooting

### Common Issues

1. **Map not loading**: Check if Google Maps API key is correctly set
2. **No heatmap data**: Ensure orders have valid addresses and geocoding is working
3. **API errors**: Verify API key has proper permissions and billing is enabled
4. **Empty analytics**: Create test orders with different addresses to generate data

### Debug Steps

1. Check browser console for JavaScript errors
2. Verify API key in environment variables
3. Test geocoding with sample addresses
4. Check MongoDB for order location data
5. Verify API endpoints are accessible

## Performance Considerations

- Heatmap data is aggregated and cached for better performance
- Large datasets are automatically clustered for optimal visualization
- API calls are rate-limited to prevent abuse
- Map tiles are cached for faster loading

## Future Enhancements

- Time-based filtering (daily, weekly, monthly views)
- Export heatmap data to CSV/PDF
- Custom map styles and themes
- Real-time order tracking
- Advanced analytics and insights 