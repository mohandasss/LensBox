import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { verifyToken } from "../APIs/AuthAPI";

const Navbar = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const response = await verifyToken(token);

          if (
            response.success ||
            response.message === "User is authenticated"
          ) {
            setIsAuthenticated(true);
            console.log(isAuthenticated);
            console.log(response.user);
            setUser(response.user);
          } else {
            

            setIsAuthenticated(false);
            setUser(null);
          }
        } catch (error) {
        
          console.error("Token verification failed:", error);
          
          if (error.response && error.response.status === 401) {
            setIsAuthenticated(false);
            setUser(null);
          }
        }
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    };

    checkAuth();
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <nav className="px-4 bg-transparent">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Logo/Brand */}
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-white">
              LensBox
            </Link>
          </div>


          {/* Center - Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-white hover:text-gray-600">
              Home
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
          </div>

          {/* Right side - Auth Section */}
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="relative inline-flex items-center justify-center w-10 h-10 overflow-hidden bg-gray-100 rounded-full dark:bg-gray-600 "
          
              >
                <span className="  font-medium text-black  bg-white px-4 py-2 rounded-md">
                  {user?.name?.charAt(0)}
                </span>
              </button>


              <div
                className={`absolute right-0 mt-2 ${
                  isDropdownOpen ? 'block' : 'hidden'
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
              <Link to="/login" className="text-white border border-white px-4 py-2 rounded-md hover:text-gray-600 mr-4">
                Login
              </Link>
              <Link to="/register" className="text-black bg-white px-4 py-2 rounded-md hover:text-gray-600">

                Register
              </Link>
            </div>



          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
