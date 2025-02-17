import React from 'react'

import { FaUser, FaPhone, FaCalendar, FaCar, FaTools, FaSignature, FaMoneyBill, FaCreditCard, FaStar } from 'react-icons/fa';

const Form = () => {
  return (
    <div className="max-w-4xl mx-auto p-8 bg-slate-50 shadow-xl rounded-xl">
      {/* Header with Job Card styling */}
      <div className="text-center mb-8 border-b-2 border-slate-300 pb-4">
        
        <h1 className="text-4xl font-serif text-slate-900">Dalim Auto Service</h1>
        <h2 className="text-xl mt-2 text-slate-700 font-medium tracking-wide">JOB CARD</h2>
        <p className="text-sm text-slate-600 mt-2">Two Wheeler Service Specialist</p>
        <p className="text-sm text-slate-600">Service - Repair - Spare Parts</p>
      </div>

      <form className="space-y-6">
        {/* Job Details Section */}
        <div className="bg-slate-100 p-4 rounded-lg mb-6">
          <h3 className="text-lg font-medium text-slate-800 mb-4">Job Details</h3>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 flex items-center gap-2">
                  <FaSignature className="text-slate-600" />
                  Job Card No:
                </label>
                <input type="text" className="w-full border-b-2 border-slate-300 bg-transparent px-2 py-1 focus:border-slate-600 focus:outline-none transition-colors" />
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium text-slate-700 flex items-center gap-2">
                  <FaUser className="text-slate-600" />
                  Customer Name:
                </label>
                <input type="text" className="w-full border-b-2 border-slate-300 bg-transparent px-2 py-1 focus:border-slate-600 focus:outline-none transition-colors" />
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium text-slate-700 flex items-center gap-2">
                  <FaPhone className="text-slate-600" />
                  Phone Number:
                </label>
                <input type="tel" className="w-full border-b-2 border-slate-300 bg-transparent px-2 py-1 focus:border-slate-600 focus:outline-none transition-colors" />
              </div>
            </div>
            <div>
              <div className="mb-3">
                <label className="block text-sm font-medium text-slate-700 flex items-center gap-2">
                  <FaCalendar className="text-slate-600" />
                  Receiving Date & Time:
                </label>
                <div className="flex gap-2">
                  <input 
                    type="date" 
                    className="flex-1 border-b-2 border-slate-300 bg-transparent px-2 py-1 focus:border-slate-600 focus:outline-none transition-colors" 
                  />
                  <input 
                    type="time" 
                    className="w-32 border-b-2 border-slate-300 bg-transparent px-2 py-1 focus:border-slate-600 focus:outline-none transition-colors" 
                  />
                </div>
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium text-slate-700 flex items-center gap-2">
                  <FaCalendar className="text-slate-600" />
                  Delivery Date & Time:
                </label>
                <div className="flex gap-2">
                  <input 
                    type="date" 
                    className="flex-1 border-b-2 border-slate-300 bg-transparent px-2 py-1 focus:border-slate-600 focus:outline-none transition-colors" 
                  />
                  <input 
                    type="time" 
                    className="w-32 border-b-2 border-slate-300 bg-transparent px-2 py-1 focus:border-slate-600 focus:outline-none transition-colors" 
                  />
                </div>
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium text-slate-700 flex items-center gap-2">
                  <FaCar className="text-slate-600" />
                  Vehicle Number:
                </label>
                <input type="text" className="w-full border-b-2 border-slate-300 bg-transparent px-2 py-1 focus:border-slate-600 focus:outline-none transition-colors" />
              </div>
            </div>
          </div>
        </div>

        {/* Service Details Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <h3 className="text-lg font-medium text-slate-800 p-4 bg-slate-100">Service Details</h3>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50">
                <th className="border-b border-slate-200 p-3 text-left text-sm font-medium text-slate-700">Customer Requirements</th>
                <th className="border-b border-slate-200 p-3 text-left text-sm font-medium text-slate-700">Mechanics Requirements</th>
                <th className="border-b border-slate-200 p-3 text-left text-sm font-medium text-slate-700">Parts Needed</th>
                <th className="border-b border-slate-200 p-3 text-left text-sm font-medium text-slate-700">MRP</th>
              </tr>
            </thead>
            <tbody>
              {[...Array(25)].map((_, index) => (
                <tr key={index + 1}>
                  <td className="border-b border-slate-100 p-3 flex items-center">
                    <span className="mr-2 text-slate-600 min-w-[25px]">{index + 1}.</span>
                    <input type="text" className="w-full bg-transparent focus:outline-none" />
                  </td>
                  <td className="border-b border-slate-100 p-3">
                    <input type="text" className="w-full bg-transparent focus:outline-none" />
                  </td>
                  <td className="border-b border-slate-100 p-3">
                    <input type="text" className="w-full bg-transparent focus:outline-none" />
                  </td>
                  <td className="border-b border-slate-100 p-3">
                    <input type="number" className="w-full bg-transparent focus:outline-none" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-2 gap-6 mt-6">
          <div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 flex items-center gap-2 mb-2">
                  <FaStar className="text-slate-600" />
                  Service Rating:
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className="text-2xl focus:outline-none transition-colors"
                    >
                      <FaStar className="text-yellow-400 hover:text-yellow-500" />
                    </button>
                  ))}
                </div>
                <textarea 
                  placeholder="Additional Comments (Optional)"
                  className="w-full mt-2 border-2 border-slate-200 rounded-lg p-3 focus:outline-none focus:border-slate-600 transition-colors" 
                  rows="2"
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 flex items-center gap-2">
                  <FaSignature className="text-slate-600" />
                  Customer Signature:
                </label>
                <div className="border-b-2 border-slate-300 h-16 mt-2"></div>
              </div>
            </div>
          </div>
          <div>
            <div className="space-y-3 bg-slate-100 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-slate-800 mb-3 flex items-center gap-2">
                <FaMoneyBill className="text-slate-600" />
                Payment Details
              </h3>
              <div className="flex justify-between items-center">
                <span className="text-slate-700 font-medium flex items-center gap-2">
                  <FaMoneyBill className="text-slate-600" />
                  Total Amount:
                </span>
                <input type="number" className="border-b-2 border-slate-300 bg-transparent w-32 text-right focus:outline-none focus:border-slate-600 transition-colors" />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-700 font-medium flex items-center gap-2">
                  <FaMoneyBill className="text-slate-600" />
                  Cash Payment:
                </span>
                <input type="number" className="border-b-2 border-slate-300 bg-transparent w-32 text-right focus:outline-none focus:border-slate-600 transition-colors" />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-700 font-medium flex items-center gap-2">
                  <FaCreditCard className="text-slate-600" />
                  Online Payment:
                </span>
                <input type="number" className="border-b-2 border-slate-300 bg-transparent w-32 text-right focus:outline-none focus:border-slate-600 transition-colors" />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center border-t-2 border-slate-200 pt-4 mt-6">
          <p className="text-slate-600 font-medium">Contact: 9903309493</p>
          <p className="text-sm text-slate-500 mt-1">Thank you for choosing Dalim Auto Service</p>
        </div>
      </form>
    </div>
  )
}

export default Form