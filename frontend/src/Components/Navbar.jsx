import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { verifyToken } from "../APIs/AuthAPI";
import { FaHeart } from 'react-icons/fa';
import { FaCartArrowDown } from "react-icons/fa6";

const Navbar = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAdmin, setAdmin] = useState(false);
  const location = useLocation();

  useEffect(() => {
    console.log(user);

    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const response = await verifyToken(token);
          console.log(response.user.profilePic);

          if (
            response.success ||
            response.message === "User is authenticated"
          ) {
            setIsAuthenticated(true);
            setUser(response.user);

            if (response.user.role === "admin") {
              setAdmin(true); // Set true if seller
            } else {
              setAdmin(false);
            }
          } else {
            setIsAuthenticated(false);
            setUser(null);
            setAdmin(false);
          }
        } catch (error) {
          console.error("Token verification failed:", error);
          if (error.response && error.response.status === 401) {
            setIsAuthenticated(false);
            setUser(null);
            setAdmin(false);
          }
        }
      } else {
        setIsAuthenticated(false);
        setUser(null);
        setAdmin(false);
      }
    };

    checkAuth();
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    setUser(null);
  };

  // Check if we're on admin page for styling
  const isAdminPage = location.pathname === '/admin';
  
  // Dynamic navbar class based on location
  const navbarClass = isAdminPage 
    ? "px-4 bg-gray-800 text-white shadow-md" 
    : "px-4 bg-transparent text-white";

  return (
    <nav className={navbarClass}>
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Logo/Brand */}
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-white">
              LensBox
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-white p-2"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMobileMenuOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Center - Navigation Links (Desktop) */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-white hover:text-gray-300">
              Home
            </Link>
            <Link to="/products" className="text-white hover:text-gray-300">
              Products
            </Link>
            <Link to="/orders" className="text-white hover:text-gray-300">
              Orders
            </Link>
            <Link to="/about" className="text-white hover:text-gray-300">
              About
            </Link>
            <Link to="/services" className="text-white hover:text-gray-300">
              Services
            </Link>
            <Link to="/contact" className="text-white hover:text-gray-300">
              Contact
            </Link>

            {isAdmin && (
              <Link
                to="/admin"
                className="text-yellow-300 hover:text-yellow-400 font-semibold"
              >
                Admin
              </Link>
            )}
          </div>

          {/* Right side - User Auth */}
          <div className="hidden md:flex items-center space-x-4 relative">
            {isAuthenticated ? (
              <>
                <Link to="/cart" className="text-white hover:text-gray-300">
                  <FaCartArrowDown className="text-xl" />
                </Link>
                <Link to="/wishlist" className="text-white hover:text-gray-300 ml-2">
                  <FaHeart className="text-xl" />
                </Link>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center focus:outline-none text-white"
                >
                  {user?.profilePic ? (
                    <img
                      src={user.profilePic}
                      alt="Profile"
                      className="w-8 h-8 rounded-full border-2 border-white"
                    />
                  ) : (
                    <span className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 border-2 border-white">
                      {user?.name?.charAt(0) || "U"}
                    </span>
                  )}
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
                    <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-200">
                      <div>{user?.name}</div>
                      <div className="font-medium truncate">{user?.email}</div>
                    </div>
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Profile
                    </Link>
                    <Link
                      to="/settings"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Settings
                    </Link>
                    <Link
                      to="/orders"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Orders
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-white hover:text-gray-300"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="text-black bg-white px-4 py-2 rounded-md hover:text-gray-600"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile menu */}
        <div
          className={`${
            isMobileMenuOpen ? "block" : "hidden"
          } md:hidden bg-white rounded-lg mt-2 shadow-lg absolute left-0 right-0 z-50`}
        >
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              to="/"
              className="block px-3 py-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100"
            >
              Home
            </Link>
            <Link
              to="/orders"
              className="block px-3 py-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100"
            >
              Orders
            </Link>
            <Link
              to="/products"
              className="block px-3 py-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100"
            >
              Products
            </Link>
            <Link
              to="/about"
              className="block px-3 py-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100"
            >
              About
            </Link>
            <Link
              to="/services"
              className="block px-3 py-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100"
            >
              Services
            </Link>
            <Link
              to="/contact"
              className="block px-3 py-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100"
            >
              Contact
            </Link>
          </div>

          {/* Mobile Auth Section */}
          <div className="px-2 pt-2 pb-3 border-t border-gray-200">
            {isAuthenticated ? (
              <div className="space-y-1">
                <div className="px-3 py-2 text-sm text-gray-700">
                  <div>{user?.name}</div>
                  <div className="font-medium truncate">{user?.email}</div>
                </div>
                <Link
                  to="/profile"
                  className="block px-3 py-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                >
                  Profile
                </Link>
                <Link
                  to="/settings"
                  className="block px-3 py-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                >
                  Settings
                </Link>
                <Link
                  to="/orders"
                  className="block px-3 py-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                >
                  Orders
                </Link>
                <button
                  onClick={handleSignOut}
                  className="block w-full text-left px-3 py-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <div className="space-y-1">
                <Link
                  to="/login"
                  className="block px-3 py-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block px-3 py-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
