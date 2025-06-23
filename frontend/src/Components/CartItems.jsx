import React from 'react';

const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
  return (
    
    <div className="p-6 flex border-b border-gray-200">
      <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
        <img
          src={item.productId.image[0]}
          alt={item.productId.name}
          className="h-full w-full object-cover object-center"
        />
        
      </div>
      <div className="ml-6 flex-1 flex flex-col">
        <div>
          <div className="flex justify-between">
            <h3 className="text-base font-medium text-gray-900">
              {item.productId.name}
            </h3>
            <p className="ml-4 text-base font-medium text-gray-900">
              ₹{item.productId.price.toLocaleString()}
            </p>
          </div>
          <p className="mt-1 text-sm text-gray-500 line-clamp-2">
            {item.productId.description}
          </p>
        </div>
        <div className="flex-1 flex items-end justify-between">
          <div className="flex items-center">
            <button 
              className="p-1 rounded-md hover:bg-gray-100"
              onClick={() => onUpdateQuantity(item._id, item.quantity - 1)}
              disabled={item.quantity <= 1}
            >
              <svg className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </button>
            <span className="mx-2 text-gray-700">{item.quantity}</span>
            <button 
              className="p-1 rounded-md hover:bg-gray-100"
              onClick={() => onUpdateQuantity(item._id, item.quantity + 1)}
            >
              <svg className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          <button 
            type="button" 
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
            onClick={() => onRemove(item.productId._id)}
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartItem;