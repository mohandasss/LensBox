import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, useMap, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Import leaflet.heat dynamically to avoid SSR issues
let HeatLayer;
if (typeof window !== 'undefined') {
  try {
    require('leaflet.heat');
    HeatLayer = L.heatLayer;
  } catch (error) {
    console.warn('leaflet.heat not available:', error);
  }
}

// Custom marker icon (optional, for better visibility)
const markerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  shadowSize: [41, 41]
});

// HeatmapLayer for Leaflet
const HeatmapLayer = ({ points }) => {
  const map = useMap();

  useEffect(() => {
    if (!points.length || !HeatLayer) return;
    
    // Remove previous heatmap
    if (map._heatLayer) {
      map.removeLayer(map._heatLayer);
    }
    
    // Create heatmap
    const heat = HeatLayer(points, {
      radius: 25,
      blur: 18,
      maxZoom: 17,
      gradient: { 0.4: 'blue', 0.65: 'lime', 1: 'red' }
    }).addTo(map);
    
    map._heatLayer = heat;
    
    return () => {
      if (map._heatLayer) {
        map.removeLayer(map._heatLayer);
        map._heatLayer = null;
      }
    };
  }, [points, map]);
  
  return null;
};

const HeatmapVisualization = ({ orderCoordinates = [], view = 'admin' }) => {
  const [mapReady, setMapReady] = useState(false);

  // Convert [{lat, lng}] to [[lat, lng, intensity]]
  const heatmapPoints = orderCoordinates.map(({ lat, lng, count }) => [lat, lng, count || 1]);
  
  // Center map on India or your main region
  const center = [22.57, 88.36];
  const zoom = 5;

  if (!HeatLayer) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 rounded-xl">
        <div className="text-center">
          <div className="text-gray-400 mb-2">🗺️</div>
          <p className="text-gray-500">Heatmap not available</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '500px', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 2px 16px #0001' }}>
      <MapContainer 
        center={center} 
        zoom={zoom} 
        style={{ width: '100%', height: '100%' }}
        whenReady={() => setMapReady(true)}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        />
        {mapReady && <HeatmapLayer points={heatmapPoints} />}
        {/* Add a marker for each order location */}
        {orderCoordinates.map((loc, idx) => (
          <Marker key={idx} position={[loc.lat, loc.lng]} icon={markerIcon}>
            <Popup>
              <div>
                <div><b>Lat:</b> {loc.lat}</div>
                <div><b>Lng:</b> {loc.lng}</div>
                {loc.location?.city
                  ? <div><b>City:</b> {loc.location.city}</div>
                  : loc.orders && loc.orders[0]?.customerDetails?.city
                    ? <div><b>City:</b> {loc.orders[0].customerDetails.city}</div>
                    : <div><b>City:</b> Unknown City</div>
                }
                {loc.count && <div><b>Orders:</b> {loc.count}</div>}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default HeatmapVisualization; 