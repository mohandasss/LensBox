import React from 'react'
import { FaStar } from 'react-icons/fa' // Make sure to install react-icons

const ProductCard = ({ image, name, price, rating }) => {
  return (
    <div className="w-[280px] bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <div className="h-[200px] overflow-hidden">
        <img 
          src={image} 
          alt={name}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">{name}</h3>
        
        <div className="flex items-center mb-3">
          <FaStar className="text-yellow-400" />
          <span className="ml-1 text-gray-600">{rating}</span>
        </div>

        <div className="flex justify-between items-center">
          <div className="text-gray-800">
            <span className="text-sm">₹</span>
            <span className="text-xl font-bold">{price}</span>
            <span className="text-sm text-gray-600">/day</span>
          </div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
            Rent Now
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProductCard