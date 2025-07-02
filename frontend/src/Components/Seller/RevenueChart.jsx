import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const revenueData = [
  { month: 'Jan', revenue: 4500, orders: 45 },
  { month: 'Feb', revenue: 6200, orders: 62 },
  { month: 'Mar', revenue: 5800, orders: 58 },
  { month: 'Apr', revenue: 7200, orders: 72 },
  { month: 'May', revenue: 8900, orders: 89 },
  { month: 'Jun', revenue: 9500, orders: 95 }
];

const RevenueChart = () => (
  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 h-full">
    <h3 className="text-lg font-semibold text-gray-900 mb-6">Revenue Trend</h3>
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={revenueData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="month" stroke="#6b7280" />
          <YAxis stroke="#6b7280" />
          <Tooltip 
            contentStyle={{
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
          />
          <Line 
            type="monotone" 
            dataKey="revenue" 
            stroke="#3B82F6" 
            strokeWidth={3}
            dot={{ fill: '#3B82F6', strokeWidth: 2, r: 6 }}
            activeDot={{ r: 8, stroke: '#3B82F6', strokeWidth: 2, fill: '#ffffff' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  </div>
);

export default RevenueChart;
