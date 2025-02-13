import React from 'react'
import Navbar from '../Components/Navbar'
import Footer from '../Components/Footer'

const ServicesPage = () => {
  return (
    <div className="min-h-screen bg-black">
      <Navbar/>
      
      {/* Hero Section */}
      <div className='bg-black text-white py-8 sm:py-12 md:py-16'>
        <div className='container mx-auto px-4'>
          <h1 className='text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-3 sm:mb-4'>Our Rental Services</h1>
          <p className='text-center text-gray-300 text-base sm:text-lg max-w-xl sm:max-w-2xl mx-auto px-4'>
            Professional camera equipment for photographers and videographers. Daily, weekly, and monthly rentals available.
          </p>
        </div>
      </div>

      {/* Categories Section */}
      <div className='container mx-auto px-4 py-8 sm:py-12 md:py-16'>
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8'>
          {/* DSLR Cameras */}
          <div className='bg-white p-4 sm:p-6 rounded-lg shadow-lg transform transition duration-300 hover:scale-105'>
            <h3 className='text-xl sm:text-2xl font-bold mb-3 sm:mb-4'>DSLR Cameras</h3>
            <img 
              src="https://res.cloudinary.com/dk5gtjb3k/image/upload/v1739122219/The_perfect_lightweight_Sony_video_camera_setup_djkkvm.jpg" 
              alt="DSLR Camera" 
              className='w-full h-48 sm:h-64 md:h-[32rem] object-cover rounded-lg mb-4'
            />
            <ul className='space-y-2 text-gray-600 text-sm sm:text-base'>
              <li>• Canon EOS R5</li>
              <li>• Sony A7 III</li>
              <li>• Nikon Z6</li>
            </ul>
            <button className='mt-4 w-full sm:w-auto bg-black text-white px-4 sm:px-6 py-2 rounded-full hover:bg-white hover:text-black transition border border-black'>
              View Details
            </button>
          </div>

          {/* Lenses */}
          <div className='bg-white p-4 sm:p-6 rounded-lg shadow-lg transform transition duration-300 hover:scale-105'>
            <h3 className='text-xl sm:text-2xl font-bold mb-3 sm:mb-4'>Professional Lenses</h3>
            <img 
              src="https://res.cloudinary.com/dk5gtjb3k/image/upload/v1739122298/Sigma_322965_Sigma_85Mm___F_1_4_Dg_Dn_Art_Teleobiettivo_15_11_Sony_E_nli9gn.jpg" 
              alt="Camera Lenses" 
              className='w-full h-48 sm:h-64 md:h-[32rem] object-cover rounded-lg mb-4'
            />
            <ul className='space-y-2 text-gray-600 text-sm sm:text-base'>
              <li>• Wide Angle Lenses</li>
              <li>• Telephoto Lenses</li>
              <li>• Prime Lenses</li>
            </ul>
            <button className='mt-4 w-full sm:w-auto bg-black text-white px-4 sm:px-6 py-2 rounded-full hover:bg-white hover:text-black transition border border-black'>
              View Details
            </button>
          </div>

          {/* Accessories */}
          <div className='bg-white p-4 sm:p-6 rounded-lg shadow-lg transform transition duration-300 hover:scale-105'>
            <h3 className='text-xl sm:text-2xl font-bold mb-3 sm:mb-4'>Accessories</h3>
            <img 
              src="https://res.cloudinary.com/dk5gtjb3k/image/upload/v1739122218/888cfed3-ad9d-4ac5-acd5-aab3f7394401_neriwf.jpg" 
              alt="Camera Accessories" 
              className='w-full h-48 sm:h-64 md:h-[32rem] object-cover rounded-lg mb-4'
            />
            <ul className='space-y-2 text-gray-600 text-sm sm:text-base'>
              <li>• Tripods & Stabilizers</li>
              <li>• Lighting Equipment</li>
              <li>• Camera Bags</li>
            </ul>
            <button className='mt-4 w-full sm:w-auto bg-black text-white px-4 sm:px-6 py-2 rounded-full hover:bg-white hover:text-black transition border border-black'>
              View Details
            </button>
          </div>
        </div>
      </div>

      {/* Rental Process Section */}
      <div className='bg-gray-100 py-8 sm:py-12 md:py-16'>
        <div className='container mx-auto px-4'>
          <h2 className='text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12'>How to Rent</h2>
          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 text-center'>
            {[
              { number: 1, title: 'Browse Equipment', desc: 'Choose from our wide selection of professional gear' },
              { number: 2, title: 'Select Dates', desc: 'Pick your rental duration' },
              { number: 3, title: 'Book Online', desc: 'Complete your reservation' },
              { number: 4, title: 'Pickup/Delivery', desc: 'Get your equipment and start shooting' }
            ].map((step, index) => (
              <div key={index} className='p-4'>
                <div className='bg-black w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-white text-lg sm:text-xl font-bold mx-auto mb-4'>
                  {step.number}
                </div>
                <h3 className='font-bold mb-2 text-base sm:text-lg'>{step.title}</h3>
                <p className='text-gray-600 text-sm sm:text-base'>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
              
      <Footer/>
    </div>
  )
}

export default ServicesPage