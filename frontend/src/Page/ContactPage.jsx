import React from "react";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import { motion } from "framer-motion";

const images = [
  "https://res.cloudinary.com/dk5gtjb3k/image/upload/v1739121661/Monkoodog_-_Pet_Care_Services___Call_8826965008_uhbyxp.jpg",
  "https://res.cloudinary.com/dk5gtjb3k/image/upload/v1739121616/3D_Self_Portrait_Elise_Fedoroff_ozkbfq.jpg",
  "https://res.cloudinary.com/dk5gtjb3k/image/upload/v1739121744/Denis_Hebi_-_Concept_designer_in_Saint_Petersburg_Russian_Federation_gxzkeh.jpg"
];

const ContactPage = () => {
  return (
    <div className="bg-black"> 
    <Navbar />  
    <div className="min-h-screen bg-gray-200 text-gray-900">
      

      {/* Contact Section */}
      <div className="flex flex-col items-center justify-center py-20 px-4 md:px-8 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-light text-gray-900 mb-4 tracking-tight">Get in Touch</h1>
          <div className="w-12 h-0.5 bg-gray-900 mx-auto mb-6"></div>
          <p className="text-lg text-gray-600 font-light">We'd love to hear from you</p>
        </div>

        {/* Contact Form */}
        <form className="w-full max-w-lg bg-white p-8 border border-gray-100 shadow-sm">
          <div className="mb-8">
            <label className="block text-xs font-medium text-gray-700 mb-3 tracking-widest uppercase" htmlFor="email">
              Email Address
            </label>
            
            <input
              className="w-full p-4 bg-white text-gray-900 border-0 border-b border-gray-200 focus:border-gray-900 focus:outline-none transition-all duration-300 text-lg font-light placeholder-gray-400"
              id="email"
              type="email"
              placeholder="your@email.com"
            />
          </div>

          <div className="mb-10">
            <label className="block text-xs font-medium text-gray-700 mb-3 tracking-widest uppercase" htmlFor="message">
              Message
            </label>
            <textarea
              className="w-full p-4 bg-white text-gray-900 border-0 border-b border-gray-200 focus:border-gray-900 focus:outline-none transition-all duration-300 h-32 resize-none text-lg font-light placeholder-gray-400"
              id="message"
              placeholder="Tell us what's on your mind..."
            />
          </div>

          <div className="text-center">
            <button
              className="w-full py-4 px-8 bg-gray-900 text-white font-medium tracking-widest uppercase text-xs hover:bg-gray-800 transition-all duration-300"
              type="submit"
            >
              Send Message
            </button>
          </div>
        </form>

        {/* Image Gallery */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 mt-20 w-full max-w-5xl">
          {images.map((image, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.02, y: -8 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="bg-white shadow-sm hover:shadow-lg transition-all duration-500"
            >
              <img
                className="w-full h-[280px] object-cover rounded-xl grayscale hover:grayscale-0 transition-all duration-500"
                src={image || "/placeholder.svg"}
                alt={`Contact Image ${index + 1}`}
              />
            </motion.div>
          ))}
        </div>
      </div>

      <Footer />
    </div>
    </div>
  );
};

export default ContactPage;