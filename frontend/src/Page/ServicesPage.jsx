import React from 'react'
import Navbar from '../Components/Navbar'
import Footer from '../Components/Footer'
import { Camera, Aperture, Settings, ArrowRight } from 'lucide-react'

const ServicesPage = () => {
  const serviceList = [
    {
      icon: <Camera className="w-8 h-8 text-violet-600 mb-3" />,
      title: 'DSLR Cameras',
      desc: 'Latest full-frame and crop-sensor cameras for every project.'
    },
    {
      icon: <Aperture className="w-8 h-8 text-violet-600 mb-3" />,
      title: 'Professional Lenses',
      desc: 'Wide, telephoto, and prime lenses for creative flexibility.'
    },
    {
      icon: <Settings className="w-8 h-8 text-violet-600 mb-3" />,
      title: 'Accessories',
      desc: 'Tripods, lighting, and bags to complete your kit.'
    }
  ];

  return (
    <div className="min-h-screen bg-black">
      <Navbar bgBlack={true}/>
      
      {/* Hero Section */}
      <section className="py-16 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">Our Rental Services</h1>
        <p className="text-lg text-gray-300 max-w-2xl mx-auto font-light">Professional camera equipment for photographers and videographers. Daily, weekly, and monthly rentals available.</p>
      </section>

      {/* Services Grid */}
      <section className="max-w-5xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
        {serviceList.map((service, idx) => (
          <div key={idx} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col items-center hover:shadow-md transition-all">
            {service.icon}
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{service.title}</h3>
            <p className="text-gray-500 text-sm mb-4 text-center">{service.desc}</p>
            <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-violet-600 text-white rounded-full font-medium text-sm hover:bg-violet-700 transition-all">
              View Details <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ))}
      </section>

      {/* Rental Process */}
      <section className="bg-white py-12 border-t border-gray-100">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-10">How to Rent</h2>
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 px-4">
          {[
            { number: 1, title: 'Browse Equipment', desc: 'Choose from our wide selection of professional gear' },
            { number: 2, title: 'Select Dates', desc: 'Pick your rental duration' },
            { number: 3, title: 'Book Online', desc: 'Complete your reservation' },
            { number: 4, title: 'Pickup/Delivery', desc: 'Get your equipment and start shooting' }
          ].map((step, index) => (
            <div key={index} className="flex flex-col items-center">
              <div className="bg-violet-100 w-12 h-12 rounded-full flex items-center justify-center text-violet-600 text-lg font-bold mb-3">
                {step.number}
              </div>
              <h3 className="font-semibold text-gray-900 mb-1 text-base">{step.title}</h3>
              <p className="text-gray-500 text-sm text-center">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>
              
      <Footer/>
    </div>
  )
}

export default ServicesPage