import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const CategoryPieChart = ({ data = [] }) => {
  // Fallback data if no data is provided
  const fallbackData = [
    { name: 'Cameras', value: 35, color: '#3B82F6' },
    { name: 'Lenses', value: 25, color: '#10B981' },
    { name: 'Tripods', value: 20, color: '#F59E0B' },
    { name: 'Lighting', value: 15, color: '#EF4444' },
    { name: 'Others', value: 5, color: '#8B5CF6' }
  ];
  
  const chartData = data.length > 0 ? data : fallbackData;
  
  return (
  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 h-full">
    <h3 className="text-lg font-semibold text-gray-900 mb-6">Product Categories</h3>
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            outerRadius={80}
            dataKey="value"
            animationBegin={0}
            animationDuration={1000}
            label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
            labelLine={false}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
            formatter={(value, name, props) => [
              `${props.payload.name}: ${value}%`,
              ''
            ]}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
    <div className="mt-4 grid grid-cols-2 gap-2">
      {chartData.map((item) => (
        <div key={item.name} className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
          <span className="text-sm text-gray-600">{item.name} ({item.count || item.value})</span>
        </div>
      ))}
    </div>
  </div>
);
};

export default CategoryPieChart;
