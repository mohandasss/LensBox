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
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      {/* Contact Section */}
      <div className="flex flex-col items-center justify-center py-12 px-4 md:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Contact Us</h1>
          <p className="text-gray-400">We are here to help you</p>
        </div>

        {/* Contact Form */}
        <form className="w-full max-w-md bg-gray-900 p-6 rounded-lg shadow-xl border border-gray-700">
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-1" htmlFor="email">
              Email
            </label>
            
            <input
              className="w-full p-3 rounded-md bg-gray-800 text-white border border-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              id="email"
              type="email"
              placeholder="Enter your email"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold mb-1" htmlFor="message">
              Message
            </label>
            <textarea
              className="w-full p-3 rounded-md bg-gray-800 text-white border border-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none h-32 resize-none"
              id="message"
              placeholder="Enter your message"
            />
          </div>

          <div className="text-center">
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-md transition-all duration-300 shadow-lg"
              type="submit"
            >
              Send Message
            </button>
          </div>
        </form>

        {/* Image Gallery */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-12">
          {images.map((image, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
              className="rounded-lg overflow-hidden shadow-xl"
            >
              <img
                className="w-full h-[250px] object-cover rounded-lg"
                src={image}
                alt={`Contact Image ${index + 1}`}
              />
            </motion.div>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ContactPage;
