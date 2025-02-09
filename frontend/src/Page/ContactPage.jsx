import React from "react";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import { useState } from "react";

const ContactPage = () => {
  const images = [
    "https://res.cloudinary.com/dk5gtjb3k/image/upload/v1739121661/Monkoodog_-_Pet_Care_Services___Call_8826965008_uhbyxp.jpg",
    "https://res.cloudinary.com/dk5gtjb3k/image/upload/v1739121616/3D_Self_Portrait_Elise_Fedoroff_ozkbfq.jpg",
    "https://res.cloudinary.com/dk5gtjb3k/image/upload/v1739121744/Denis_Hebi_-_Concept_designer_in_Saint_Petersburg_Russian_Federation_gxzkeh.jpg",
    "https://res.cloudinary.com/dk5gtjb3k/image/upload/v1739121490/3D_woman_talking_with_chatbot_Illustration_fb3xtr.jpg",
    "https://res.cloudinary.com/dk5gtjb3k/image/upload/v1739121744/3D_young_smiling_woman_with_laptop_and_credit_card_Illustration_yuagwd.jpg"
  ];

  return (
    <div className="min-h-screen bg-black">
      

      <Navbar />
      <div className="min-h-screen bg-black">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="flex flex-col items-center justify-center mb-8">
            <h1 className="text-white text-2xl font-bold">Contact Us</h1>
            <p className="text-white text-sm">We are here to help you</p>
          </div>

          <form className="w-full max-w-lg px-4 bg-white p-8 rounded-lg shadow-xl">
            <div className="mb-4">
              <label
                className="block text-gray-800 text-sm font-bold mb-2"
                htmlFor="email"
              >
                Email
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-50"
                id="email"
                type="email"
                placeholder="Enter your email"
              />
            </div>

            <div className="mb-6">
              <label
                className="block text-gray-800 text-sm font-bold mb-2"
                htmlFor="message"
              >
                Message
              </label>
              <textarea
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-50 h-32"
                id="message"
                placeholder="Enter your message"
              />
            </div>

            <div className="flex items-center justify-center">
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg focus:outline-none focus:shadow-outline transition-colors duration-300"
                type="submit"
              >
                Send Message
              </button>
            </div>
          </form>
          <div className="flex flex-wrap items-center justify-center gap-8 py-8">
            {images.map((image, index) => (
              <div 
                key={index} 
                className={`animate-float hover:animate-none ${index === 1 ? 'bg-transparent' : ''}`}
                style={{
                  animationDelay: `${index * 0.2}s`
                }}
              >
                {typeof image === 'string' ? (
                  <img 
                    className={`w-82 h-[300px] object-cover rounded-lg shadow-xl hover:scale-105 transition-transform duration-300 ${
                      index === 1 ? 'bg-transparent' : ''
                    }`}
                    src={image} 
                    alt="Contact Us" 
                  />
                ) : (
                  image
                )}
              </div>
            ))}
          </div>




          


        </div>
      </div>
      <Footer />

    </div>
  );
};

export default ContactPage;
