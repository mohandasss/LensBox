import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../Components/Navbar";
import Caruselshapevideo from "../Components/CarouselShapeVideo";
import PreferenceSearch from "../Components/PreferenceSearch";
import Footer from "../Components/Footer";
import { Link } from "react-router-dom";
import ChatButton from "../Components/ChatButton";
import TestimonialsSection from "../Components/TestimonialsSection";
import HeroProducts, { MostPopularProducts } from "../Components/HeroProducts";

const HomePage = () => {
  const navigate = useNavigate();
  
  // Handle search submission from PreferenceSearch
  const handleSearch = (category, query) => {
    if (query && query.trim() !== '') {
      // Navigate to products page with search parameters
      navigate(`/products?category=${category}&q=${encodeURIComponent(query)}`);
    } else {
      // If no search term, just go to products page
      navigate('/products');
    }
  };
  const brands = [
    {
      name: "Sony",
      image:
        "https://res.cloudinary.com/dk5gtjb3k/image/upload/v1739014793/Sony_lens_w4pt7c.jpg",
    },
    {
      name: "Nikon",
      image:
        "https://res.cloudinary.com/dk5gtjb3k/image/upload/v1739014793/NIKON_pukcdj.jpg",
    },

    {
      name: "Canon",
      image:
        "https://res.cloudinary.com/dk5gtjb3k/image/upload/v1739014793/CANON_i3zpuv.jpg",
    },
  ];

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Caruselshapevideo />
        <div className="flex flex-col items-center justify-center py-12">
          <PreferenceSearch onSearch={handleSearch} />
        </div>
      </main>
      <h1 className="text-white text-center text-3xl font-bold ">
        Top brands{" "}
      </h1>
      <div className="flex flex-col items-center justify-center py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 w-full px-4">
          {brands.map((brand) => (
            <div key={brand.name} className="relative">
              <img
                src={brand.image}
                alt={brand.name}
                className="w-full h-64 hover:scale-105 transition-all duration-300s rounded-lg object-cover"
              />
              <div className="absolute bottom-4 right-4 text-white text-xl font-bold z-10">
                {brand.name}
              </div>
            </div>
          ))}
        </div>
      </div>

          <div className="bg-white py-8" >
            <HeroProducts/>
          </div>

      <div className="bg-black py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center py-4">
            <h1 className="text-white text-center text-3xl font-bold ">
              What we offer
            </h1>
          </div>

          <div className="flex py-8 flex-col md:flex-row items-center justify-between gap-8">
            {/* Left side text content */}

            <div className="md:w-1/2 space-y-4">
              <h2 className="text-3xl font-bold text-white">
                High-Quality Camera & Lens Rentals
              </h2>
              <p className="text-lg text-white">
                Rent the latest DSLR, mirrorless cameras, and premium lenses
                from top brands like Canon, Sony, and Nikon.
              </p>
              <Link to="/about">
                <button className="bg-white text-black px-6 py-2 my-3 rounded-lg hover:bg-gray-800 transition-colors">
                  Learn More
                </button>
              </Link>

            </div>
            {/* Right side image */}
            <div className="md:w-1/2">
              <img
                src="https://res.cloudinary.com/dk5gtjb3k/image/upload/v1739015662/Gabriele_Tiso_-_Hasselblad_500C_M_ebllnd.jpg"
                alt="Photography Equipment"
                className="w-full h-[400px] object-cover rounded-lg"
              />
            </div>
          </div>
        </div>
      </div>


      <div className="bg-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center py-4"></div>

          <div className="flex py-8 flex-col md:flex-row items-center justify-between gap-8">
            {/* Left side image */}
            <div className="md:w-1/2">
              <img
                src="https://res.cloudinary.com/dk5gtjb3k/image/upload/v1739016801/download_vzv6rw.jpg"
                alt="Photography Services"
                className="w-full h-[400px] object-cover rounded-lg"
              />
            </div>
            {/* Right side text content */}
            <div className="md:w-1/2 space-y-4">
              <h2 className="text-3xl font-bold text-black">
                Flexible Rental Plans & Affordable Pricing
              </h2>
              <p className="text-lg text-black">
                Choose from hourly, daily, or weekly rental options at
                competitive prices with no hidden fees.
              </p>
              <button className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-200 transition-colors">
                Explore Services
              </button>
             
             
            </div>
          </div>
        </div>
      </div>
      <div className="bg-black py-8" >
              <MostPopularProducts />
          </div>
      <div className="bg-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center py-4"></div>

          <div className="flex py-8 flex-col md:flex-row items-center justify-between gap-8">
            {/* Left side text content */}
            <div className="md:w-1/2 space-y-4">
              <h2 className="text-3xl font-bold text-black">
                24/7 Expert Assistance
              </h2>
              <p className="text-lg text-black">
                Easy online booking, doorstep delivery, and 24/7 customer
                support for a seamless rental experience.
              </p>
              <Link to="/contact">
                <button className="bg-black my-3 text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors">
                  Contact Us
                </button>
              </Link>

            </div>
            {/* Right side image */}
            <div className="md:w-1/2">
              <img
                src="https://res.cloudinary.com/dk5gtjb3k/image/upload/v1739016800/call_center_ismqxv.jpg"
                alt="Customer Support"
                className="w-full h-[400px] object-cover rounded-lg"
              />
            </div>
          </div>
        </div>
      </div>
      <TestimonialsSection />
      <Footer />
      <ChatButton />
    </div>
  );
};

export default HomePage;
