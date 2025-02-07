import React from "react";

const Navbar = () => {
  return (
    <nav className="navbar bg-white shadow-md px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo/Brand */}
        <div className="flex items-center">
          <h1 className="text-xl font-bold text-blue-600">Brand</h1>
        </div>

        {/* Main Navigation */}
        <div className="hidden md:flex items-center">
          <ul className="flex space-x-8">
            <li><a href="/" className="text-gray-700 hover:text-blue-600 transition-colors">Home</a></li>
            <li><a href="/about" className="text-gray-700 hover:text-blue-600 transition-colors">About</a></li>
            <li><a href="/services" className="text-gray-700 hover:text-blue-600 transition-colors">Services</a></li>
            <li><a href="/contact" className="text-gray-700 hover:text-blue-600 transition-colors">Contact</a></li>
          </ul>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="hidden md:flex">
            <button className="text-gray-600 hover:text-blue-600 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>

          {/* Cart */}
          <button className="text-gray-600 hover:text-blue-600 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </button>

          {/* Auth Buttons */}
          <div className="hidden md:flex space-x-2">
            <button className="px-4 py-2 text-gray-600 hover:text-blue-600 transition-colors">Login</button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">Sign up</button>
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden text-gray-600 hover:text-blue-600 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
