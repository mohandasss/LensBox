import React from 'react';
import { Plus, BarChart3, Users, Star } from 'lucide-react';

const QuickActions = () => {
  const actions = [
    {
      icon: Plus,
      title: 'Add Product',
      description: 'Add a new product to your inventory',
      color: 'blue',
      onClick: () => console.log('Add Product clicked')
    },
    {
      icon: BarChart3,
      title: 'View Analytics',
      description: 'Check your sales and performance metrics',
      color: 'purple',
      onClick: () => console.log('View Analytics clicked')
    },
    {
      icon: Users,
      title: 'Manage Orders',
      description: 'Process and manage customer orders',
      color: 'green',
      onClick: () => console.log('Manage Orders clicked')
    },
    {
      icon: Star,
      title: 'View Reviews',
      description: 'Read customer feedback and ratings',
      color: 'yellow',
      onClick: () => console.log('View Reviews clicked')
    }
  ];

  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-200',
    purple: 'bg-purple-50 text-purple-600 hover:bg-purple-100 border-purple-200',
    green: 'bg-green-50 text-green-600 hover:bg-green-100 border-green-200',
    yellow: 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100 border-yellow-200'
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Quick Actions</h3>
      {actions.map((action, index) => (
        <button
          key={index}
          onClick={action.onClick}
          className={`w-full p-4 rounded-xl border-2 border-dashed flex items-start space-x-3 transition-colors ${colorClasses[action.color]}`}
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
  );
};

export default QuickActions;
