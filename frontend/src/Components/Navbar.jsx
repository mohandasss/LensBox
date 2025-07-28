import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { verifyToken } from "../APIs/AuthAPI";
import { FaHeart, FaUser, FaCog, FaSignOutAlt } from 'react-icons/fa';
import { FaCartArrowDown } from "react-icons/fa6";
import { useNotification } from "./NotificationSystem";
import { X, Menu } from "lucide-react";

const Navbar = ({ bgBlack = false, fixed = false, className = '' }) => {
  const { showProfileNotification } = useNotification();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAdmin, setAdmin] = useState(false);
  const [isSeller, setSeller] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown-container')) {
        setIsDropdownOpen(false);
      }
      if (!event.target.closest('.mobile-menu-container')) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const response = await verifyToken(token);
          
          if (response.success || response.message === "User is authenticated") {
            setIsAuthenticated(true);
            setUser(response.user);

            if (response.user.role === "admin") {
              setAdmin(true);
              setSeller(false);
            } else if (response.user.role === "seller") {
              setSeller(true);
              setAdmin(false);
            } else {
              setAdmin(false);
              setSeller(false);
            }
          } else {
            setIsAuthenticated(false);
            setUser(null);
            setAdmin(false);
            setSeller(false);
          }
        } catch (error) {
          console.error("Token verification failed:", error);
          setIsAuthenticated(false);
          setUser(null);
          setAdmin(false);
          setSeller(false);
        }
      } else {
        setIsAuthenticated(false);
        setUser(null);
        setAdmin(false);
        setSeller(false);
      }
    };

    checkAuth();
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem("token");
    showProfileNotification(
      "Logged Out", 
      "You have been successfully logged out of your account."
    );
    navigate("/login");
    setIsAuthenticated(false);
    setUser(null);
    setIsDropdownOpen(false);
    setIsMobileMenuOpen(false);
  };

  const isAdminPage = location.pathname === '/admin';

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/products", label: "Products" },
    { to: "/orders", label: "Orders" },
    { to: "/about", label: "About" },
    { to: "/services", label: "Services" },
    { to: "/contact", label: "Contact" },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navbarClasses = `w-full transition-all duration-300 z-50 ${
    bgBlack ? 'bg-black' : 'bg-transparent'
  } ${isScrolled ? 'shadow-md' : ''} ${
    fixed ? 'fixed top-0 left-0 right-0' : 'relative'
  } ${className}`;

  return (
    <header className={`${navbarClasses} relative`} onClick={() => setIsDropdownOpen(false)}>
      <nav className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${fixed ? 'py-2' : 'py-3'}`}>
        <div className="flex justify-between items-center h-12">
          {/* Logo/Brand */}
          <Link to="/" className="flex-shrink-0 flex items-center">
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              LensBox
            </span>
          </Link>

          {/* Desktop Navigation Links */}
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

            {/* Admin/Seller Links */}
            {isAdmin && (
              <Link
                to="/admin"
                className="text-yellow-300 hover:text-yellow-400 font-semibold"
              >
                Admin
              </Link>
            )}
            {isSeller && (
              <Link
                to="/seller"
                className="text-green-400 hover:text-green-300 font-semibold ml-2"
              >
                Seller
              </Link>
            )}
          </div>

          {/* Desktop Right Side - User Auth & Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="relative dropdown-container">
                <div className="flex items-center space-x-4">
                  <Link to="/cart" className="text-white hover:text-gray-300 transition-colors duration-200">
                    <FaCartArrowDown className="text-lg" />
                  </Link>
                  <Link to="/wishlist" className="text-white hover:text-gray-300 transition-colors duration-200">
                    <FaHeart className="text-lg" />
                  </Link>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsDropdownOpen(!isDropdownOpen);
                    }}
                    className="flex items-center focus:outline-none text-white transition-colors duration-200 hover:bg-white/10 rounded-full p-1"
                    aria-expanded={isDropdownOpen}
                    aria-haspopup="true"
                  >
                    {user?.profilePic ? (
                      <img
                        src={user.profilePic}
                        alt="Profile"
                        className="w-8 h-8 rounded-full border-2 border-white/80 hover:border-white transition-all duration-200"
                      />
                    ) : (
                      <span className="w-8 h-8 text-sm rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white border border-white/50 hover:border-white transition-all duration-200">
                        {user?.name?.charAt(0)?.toUpperCase() || "U"}
                      </span>
                    )}
                  </button>
                </div>
                {isDropdownOpen && (
                  <div 
                    className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-xl py-1 z-50 border border-gray-200 animate-fadeIn"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 rounded-t-lg">
                      <div className="font-medium text-gray-900">{user?.name}</div>
                      <div className="text-sm text-gray-500 truncate">{user?.email}</div>
                    </div>
                    <Link
                      to="/profile"
                      className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <FaUser className="w-4 h-4 mr-3 text-gray-400" />
                      <span>Profile</span>
                    </Link>
                    <Link
                      to="/settings"
                      className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <FaCog className="w-4 h-4 mr-3 text-gray-400" />
                      <span>Settings</span>
                    </Link>
                    <Link
                      to="/orders"
                      className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <FaCartArrowDown className="w-4 h-4 mr-3 text-gray-400" />
                      <span>Orders</span>
                    </Link>
                    <div className="border-t border-gray-100 my-1"></div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSignOut();
                      }}
                      className="flex items-center w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150 rounded-b-lg"
                    >
                      <FaSignOutAlt className="w-4 h-4 mr-3" />
                      <span>Sign out</span>
                    </button>
                  </div>
                )}
              </div>
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

          {/* Mobile Menu Button & Quick Actions */}
          <div className="md:hidden flex items-center space-x-3">
            {isAuthenticated && (
              <>
                <Link to="/wishlist" className="text-white hover:text-blue-300 transition-colors duration-200 p-2">
                  <FaHeart className="w-5 h-5" />
                </Link>
                <Link to="/cart" className="text-white hover:text-blue-300 transition-colors duration-200 p-2">
                  <FaCartArrowDown className="w-5 h-5" />
                </Link>
              </>
            )}
            
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-white p-2 focus:outline-none focus:ring-2 focus:ring-blue-400 rounded-lg transition-all duration-200"
              aria-label="Toggle mobile menu"
            >
              <div className="w-6 flex flex-col items-end space-y-1.5">
                <span className={`block h-0.5 bg-white transition-all duration-300 ${isMobileMenuOpen ? 'w-6 rotate-45 translate-y-2' : 'w-6'}`}></span>
                <span className={`block h-0.5 bg-white transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0' : 'w-5'}`}></span>
                <span className={`block h-0.5 bg-white transition-all duration-300 ${isMobileMenuOpen ? 'w-6 -rotate-45 -translate-y-2' : 'w-4'}`}></span>
              </div>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white shadow-xl border-t border-gray-200 mobile-menu-container">
          <div className="px-4 py-3 space-y-2">
            {/* Navigation Links */}
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="block px-3 py-2 rounded-lg text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors duration-200 font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}

            {/* Admin/Seller Links */}
            {isAdmin && (
              <Link
                to="/admin"
                className="block px-3 py-2 rounded-lg text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50 transition-colors duration-200 font-semibold"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Admin Panel
              </Link>
            )}
            {isSeller && (
              <Link
                to="/seller"
                className="block px-3 py-2 rounded-lg text-green-600 hover:text-green-700 hover:bg-green-50 transition-colors duration-200 font-semibold"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Seller Dashboard
              </Link>
            )}

            {/* User Section */}
            {isAuthenticated ? (
              <div className="border-t border-gray-200 pt-3 mt-3">
                <div className="px-3 py-2 text-sm text-gray-500">
                  Signed in as <span className="font-medium text-gray-900">{user?.name}</span>
                </div>
                <Link
                  to="/profile"
                  className="block px-3 py-2 rounded-lg text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Profile
                </Link>
                <Link
                  to="/settings"
                  className="block px-3 py-2 rounded-lg text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Settings
                </Link>
                <Link
                  to="/orders"
                  className="block px-3 py-2 rounded-lg text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Orders
                </Link>
                <button
                  onClick={handleSignOut}
                  className="block w-full text-left px-3 py-2 rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors duration-200 font-medium"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <div className="border-t border-gray-200 pt-3 mt-3 space-y-2">
                <Link
                  to="/login"
                  className="block px-3 py-2 rounded-lg text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors duration-200 font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-200 font-medium text-center"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;