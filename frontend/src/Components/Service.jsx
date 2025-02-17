
import { FaMotorcycle } from 'react-icons/fa';


const Service = () => {
    return (
      <div className="bg-gray-100 min-h-screen py-10">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-center mb-10 text-blue-800">
            Our Motorcycle Service Checklist
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Basic Inspection Services */}
            <div className="bg-blue-50 rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
              <h2 className="text-xl font-semibold text-blue-700 mb-4">Basic Inspection</h2>
              <ul className="space-y-2">
                <li className="flex items-center text-gray-700">
                  <span className="text-blue-500 mr-2">✓</span> Front Wheel Alignment Check
                </li>
                <li className="flex items-center text-gray-700">
                  <span className="text-blue-500 mr-2">✓</span> Rear Wheel Alignment Check
                </li>
                <li className="flex items-center text-gray-700">
                  <span className="text-blue-500 mr-2">✓</span> Tire Pressure Optimization
                </li>
                <li className="flex items-center text-gray-700">
                  <span className="text-blue-500 mr-2">✓</span> Tire Tread Depth Check
                </li>
              </ul>
            </div>
  
            {/* Engine Services */}
            <div className="bg-green-50 rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
              <h2 className="text-xl font-semibold text-green-700 mb-4">Engine Care</h2>
              <ul className="space-y-2">
                <li className="flex items-center text-gray-700">
                  <span className="text-green-500 mr-2">✓</span> Engine Oil Change
                </li>
                <li className="flex items-center text-gray-700">
                  <span className="text-green-500 mr-2">✓</span> Air Filter Cleaning/Replacement
                </li>
                <li className="flex items-center text-gray-700">
                  <span className="text-green-500 mr-2">✓</span> Spark Plug Check
                </li>
                <li className="flex items-center text-gray-700">
                  <span className="text-green-500 mr-2">✓</span> Carburetor Cleaning
                </li>
              </ul>
            </div>
  
            {/* Brake System */}
            <div className="bg-red-50 rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
              <h2 className="text-xl font-semibold text-red-700 mb-4">Brake System</h2>
              <ul className="space-y-2">
                <li className="flex items-center text-gray-700">
                  <span className="text-red-500 mr-2">✓</span> Brake Pad Inspection
                </li>
                <li className="flex items-center text-gray-700">
                  <span className="text-red-500 mr-2">✓</span> Brake Fluid Check
                </li>
                <li className="flex items-center text-gray-700">
                  <span className="text-red-500 mr-2">✓</span> Brake Cable Adjustment
                </li>
                <li className="flex items-center text-gray-700">
                  <span className="text-red-500 mr-2">✓</span> Disc Brake Inspection
                </li>
              </ul>
            </div>
  
            {/* Electrical System */}
            <div className="bg-yellow-50 rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
              <h2 className="text-xl font-semibold text-yellow-700 mb-4">Electrical System</h2>
              <ul className="space-y-2">
                <li className="flex items-center text-gray-700">
                  <span className="text-yellow-600 mr-2">✓</span> Battery Health Check
                </li>
                <li className="flex items-center text-gray-700">
                  <span className="text-yellow-600 mr-2">✓</span> Light System Inspection
                </li>
                <li className="flex items-center text-gray-700">
                  <span className="text-yellow-600 mr-2">✓</span> Horn Function Test
                </li>
                <li className="flex items-center text-gray-700">
                  <span className="text-yellow-600 mr-2">✓</span> Indicator Check
                </li>
              </ul>
            </div>
  
            {/* Chain & Sprocket */}
            <div className="bg-purple-50 rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
              <h2 className="text-xl font-semibold text-purple-700 mb-4">Chain & Sprocket</h2>
              <ul className="space-y-2">
                <li className="flex items-center text-gray-700">
                  <span className="text-purple-500 mr-2">✓</span> Chain Tension Adjustment
                </li>
                <li className="flex items-center text-gray-700">
                  <span className="text-purple-500 mr-2">✓</span> Chain Lubrication
                </li>
                <li className="flex items-center text-gray-700">
                  <span className="text-purple-500 mr-2">✓</span> Sprocket Wear Check
                </li>
                <li className="flex items-center text-gray-700">
                  <span className="text-purple-500 mr-2">✓</span> Chain Alignment Check
                </li>
              </ul>
            </div>
  
            {/* Additional Services */}
            <div className="bg-indigo-50 rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
              <h2 className="text-xl font-semibold text-indigo-700 mb-4">Additional Services</h2>
              <ul className="space-y-2">
                <li className="flex items-center text-gray-700">
                  <span className="text-indigo-500 mr-2">✓</span> Clutch Adjustment
                </li>
                <li className="flex items-center text-gray-700">
                  <span className="text-indigo-500 mr-2">✓</span> Suspension Check
                </li>
                <li className="flex items-center text-gray-700">
                  <span className="text-indigo-500 mr-2">✓</span> Exhaust System Inspection
                </li>
                <li className="flex items-center text-gray-700">
                  <span className="text-indigo-500 mr-2">✓</span> General Nuts & Bolts Check
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    )
  }

  export default Service