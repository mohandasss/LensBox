import React, { useEffect, useState } from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

const AnimatedCounter = ({ value, prefix = '', suffix = '' }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCount(prev => {
        if (prev < value) {
          return Math.min(prev + Math.ceil(value / 20), value);
        }
        clearInterval(timer);
        return value;
      });
    }, 50);

    return () => clearInterval(timer);
  }, [value]);

  return <span>{prefix}{count.toLocaleString()}{suffix}</span>;
};

const StatsCard = ({ icon: Icon, title, value, change, prefix = '', suffix = '', trend }) => (
  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 group">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-lg bg-gradient-to-r ${
        title.includes('Revenue') ? 'from-green-400 to-green-600' :
        title.includes('Product') ? 'from-blue-400 to-blue-600' :
        title.includes('Order') ? 'from-purple-400 to-purple-600' :
        'from-yellow-400 to-yellow-600'
      } group-hover:scale-110 transition-transform duration-300`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      {change && (
        <div className={`flex items-center space-x-1 text-sm ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
          {trend === 'up' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
          <span>{change}%</span>
        </div>
      )}
    </div>
    <h3 className="text-gray-600 text-sm font-medium mb-1">{title}</h3>
    <p className="text-2xl font-bold text-gray-900">
      <AnimatedCounter value={value} prefix={prefix} suffix={suffix} />
    </p>
  </div>
);

export default StatsCard;
