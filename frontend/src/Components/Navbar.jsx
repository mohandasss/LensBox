import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { verifyToken } from "../APIs/AuthAPI";
import { FaHeart } from 'react-icons/fa'
import { FaCartArrowDown } from "react-icons/fa6";
const Navbar = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSeller, setIsSeller] = useState(false);

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

            if (response.user.role === "seller") {
              setIsSeller(true); // ✅ Set true if seller
            } else {
              setIsSeller(false);
            }
          } else {
            setIsAuthenticated(false);
            setUser(null);
            setIsSeller(false);
          }
        } catch (error) {
          console.error("Token verification failed:", error);
          if (error.response && error.response.status === 401) {
            setIsAuthenticated(false);
            setUser(null);
            setIsSeller(false);
          }
        }
      } else {
        setIsAuthenticated(false);
        setUser(null);
        setIsSeller(false);
      }
    };

    checkAuth();
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <nav className="  px-4 bg-transparent">
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
            <Link to="/" className="text-white hover:text-gray-600">
              Home
            </Link>
            <Link to="/products" className="text-white hover:text-gray-600">
              Products
            </Link>
            <Link to="/orders" className="text-white hover:text-gray-600">
              Orders
            </Link>
            <Link to="/about" className="text-white hover:text-gray-600">
              About
            </Link>
            <Link to="/services" className="text-white hover:text-gray-600">
              Services
            </Link>
            <Link to="/contact" className="text-white hover:text-gray-600">
              Contact
            </Link>

            {isSeller && (
              <Link
                to="/seller/panel"
                className="text-yellow-400 hover:text-yellow-600 font-semibold"
              >
                Panel
              </Link>
            )}
          </div>

          {/* Right side - Auth Section (Desktop) */}
          <div className="hidden md:block">
            {isAuthenticated ? (
              <div className="relative flex items-center gap-4">
                <Link
                  to="/wishlist"
                  className="text-white hover:text-gray-600"
                  title="Wishlist"
                >
                  <span className="text-white hover:text-gray-600">
                    <FaHeart className="text-2xl text-red-500" />
                  </span>
                </Link>
                
                <Link
                  to="/cart"
                  className="text-white hover:text-gray-600"
                  title="Cart"
                >
                  <span className="text-white hover:text-gray-600">
                    <FaCartArrowDown className="text-2xl text-yellow-500" />
                  </span>
                </Link>
                <Link
                  to="/profile"
                  className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-gray-300 dark:ring-gray-500"
                >
                  <img
                    src={user?.profilePic}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </Link>

                <div
                  className={`absolute right-0 mt-2 ${
                    isDropdownOpen ? "block" : "hidden"
                  } bg-white divide-y divide-gray-100 rounded-lg shadow-sm w-44 dark:bg-gray-700 dark:divide-gray-600`}
                >
                  <div className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                    <div>{user?.name}</div>
                    <div className="font-medium truncate">{user?.email}</div>
                  </div>
                  <ul
                    className="py-2 text-sm text-gray-700 dark:text-gray-200"
                    aria-labelledby="avatarButton"
                  >
                    <li>
                      <Link
                        to="/dashboard"
                        className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-white"
                      >
                        Dashboard
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/settings"
                        className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-white"
                      >
                        Settings
                      </Link>
                    </li>
                  </ul>
                  <div className="py-1">
                    <button
                      onClick={handleSignOut}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-white dark:hover:text-white"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center">
                <Link
                  to="/login"
                  className="text-white border border-white px-4 py-2 rounded-md hover:text-gray-600 mr-4"
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
                  to="/dashboard"
                  className="block px-3 py-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                >
                  Dashboard
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
