import React from "react";
import { Link } from "react-router-dom";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-6 lg:gap-8">
          {/* Company Info */}
          <div className="space-y-4 text-center sm:text-left">
            <h2 className="text-2xl sm:text-xl font-bold text-white">LensBox</h2>
            <p className="text-sm max-w-xs mx-auto sm:mx-0">
              Discover and share the world's best photography gear and experiences.
            </p>
            {/* Social Media Icons */}
            <div className="flex justify-center sm:justify-start space-x-6">
              <FaFacebook className="text-2xl sm:text-xl hover:text-blue-500 cursor-pointer transition-colors duration-300" />
              <FaTwitter className="text-2xl sm:text-xl hover:text-blue-400 cursor-pointer transition-colors duration-300" />
              <FaInstagram className="text-2xl sm:text-xl hover:text-pink-500 cursor-pointer transition-colors duration-300" />
              <FaLinkedin className="text-2xl sm:text-xl hover:text-blue-600 cursor-pointer transition-colors duration-300" />
            </div>
          </div>

          {/* Quick Links */}
          <div className="text-center sm:text-left">
            <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
            <ul className="space-y-3">
              <li><Link to="/" className="hover:text-white transition-colors duration-300 inline-block">Home</Link></li>
              <li><Link to="/about" className="hover:text-white transition-colors duration-300 inline-block">About Us</Link></li>
              <li><Link to="/products" className="hover:text-white transition-colors duration-300 inline-block">Products</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors duration-300 inline-block">Contact</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div className="text-center sm:text-left">
            <h3 className="text-lg font-semibold text-white mb-4">Support</h3>
            <ul className="space-y-3">
              <li><Link to="/faq" className="hover:text-white transition-colors duration-300 inline-block">FAQ</Link></li>
              <li><Link to="/shipping" className="hover:text-white transition-colors duration-300 inline-block">Shipping Info</Link></li>
              <li><Link to="/returns" className="hover:text-white transition-colors duration-300 inline-block">Returns</Link></li>
              <li><Link to="/privacy" className="hover:text-white transition-colors duration-300 inline-block">Privacy Policy</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="text-center sm:text-left">
            <h3 className="text-lg font-semibold text-white mb-4">Newsletter</h3>
            <p className="text-sm mb-4">Subscribe to our newsletter for updates and exclusive offers.</p>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="bg-gray-800 text-white px-4 py-2 rounded-md sm:rounded-l-md sm:rounded-r-none focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
              />
              <button className="bg-blue-600 text-white px-6 py-2 rounded-md sm:rounded-l-none sm:rounded-r-md hover:bg-blue-700 transition-colors duration-300 whitespace-nowrap">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 sm:mt-12 pt-8">
          <p className="text-center text-sm">
            © {new Date().getFullYear()} LensBox. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;