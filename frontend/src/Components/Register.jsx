import React, { useState, useRef, useEffect } from "react";
import {
  Upload,
  User,
  X,
  Mail,
  Lock,
  Phone,
  MapPin,
  Globe,
  CheckCircle,
  Eye,
  EyeOff,
  Camera,
  
  Sparkles,
  Shield,
  UserPlus
} from "lucide-react";
import { FaGoogle, FaApple, FaFacebook } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    city: "",
    state: "",
    zip: "",
    country: "",
    phone: "",
    image: "",
    role: "user",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [role, setRole] = useState("user");
  const [focusedField, setFocusedField] = useState("");
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [pendingRegistration, setPendingRegistration] = useState(null);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState(null);

  const navigate = useNavigate();
  const videoRef = useRef(null);
  const handleImageUpload = (file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (JPEG, PNG)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    setImageFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };

    reader.readAsDataURL(file);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) handleImageUpload(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleImageUpload(file);
  };

  const removeImage = () => {
    setImagePreview("");
    setImageFile(null);
    setFormData((prev) => ({ ...prev, image: "" }));
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate submission
    setTimeout(() => {
      setIsSubmitting(false);
      alert('Registration successful! (Demo)');
    }, 2000);
  };

  const InputField = ({ icon: Icon, label, name, type = "text", value, onChange, placeholder, showPassword, onTogglePassword }) => (
    <div className="relative group">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon className={`h-4 w-4 transition-all duration-300 ${
            focusedField === name ? 'text-blue-500 scale-110' : 'text-gray-400'
          }`} />
        </div>
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          onFocus={() => setFocusedField(name)}
          onBlur={() => setFocusedField("")}
          placeholder={placeholder}
          className={`w-full pl-10 pr-4 py-2.5 bg-gray-50/80 border border-gray-200 rounded-xl text-gray-900 text-sm
            focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white
            transition-all duration-300 hover:border-gray-300 hover:bg-gray-50
            ${focusedField === name ? 'transform scale-[1.02] shadow-lg' : ''}
          `}
        />
        {name === "password" && (
          <button
            type="button"
            onClick={onTogglePassword}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600 transition-colors" />
            ) : (
              <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600 transition-colors" />
            )}
          </button>
        )}
      </div>
      <label className={`absolute left-3 px-2 bg-white pointer-events-none transition-all duration-200 font-medium
        ${focusedField === name || value ? 'text-xs text-blue-600 -top-3.5' : 'top-1/2 -translate-y-1/2 text-base text-gray-500 px-2 bg-white font-medium'}
      `}>
        {label}
      </label>
    </div>
  );

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = 20;
    video.muted = true;
    video.playsInline = true;

    const playVideo = () => {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.log('Autoplay prevented');
        });
      }
    };

    const handleTimeUpdate = () => {
      if (video.currentTime >= 43) {
        video.currentTime = 20;
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    playVideo();

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Navbar */}
      <div className="fixed top-0 left-0 w-full z-30 bg-black/70 backdrop-blur-md">
        <Navbar />
      </div>
      {/* Video Background */}
      <video
        ref={videoRef}
        muted
        loop
        autoPlay
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover z-0"
        style={{ pointerEvents: 'none' }}
      >
        <source
          src="https://res.cloudinary.com/dk5gtjb3k/video/upload/v1750171067/mgz85nxfibtftw5m3oba.mp4"
          type="video/mp4"
        />
      </video>
      {/* Black Overlay */}
      <div className="absolute top-0 left-0 w-full h-full bg-black/70 z-10" />

      {/* Main Content */}
      <div className="relative z-20 flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-4xl mx-auto rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row bg-white/80 backdrop-blur-2xl border border-white/20">
          {/* Left Panel - Branding */}
          <div className="md:w-2/5 bg-gradient-to-br from-blue-700 to-gray-900 p-8 flex flex-col justify-center">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mr-4">
                <Sparkles className="h-6 w-6 text-white animate-pulse" />
              </div>
              <h1 className="text-3xl font-bold text-white">LensBox</h1>
            </div>
            <h2 className="text-2xl font-semibold text-white mb-4">Join Our Community</h2>
            <p className="text-blue-100 text-lg leading-relaxed mb-8">
              Create your account and discover amazing opportunities. Connect with professionals and grow your network.
            </p>
            <div className="space-y-4">
              <div className="flex items-center text-blue-100">
                <Shield className="h-5 w-5 mr-3 text-green-400" />
                <span>Secure & Protected</span>
              </div>
              <div className="flex items-center text-blue-100">
                <UserPlus className="h-5 w-5 mr-3 text-green-400" />
                <span>Easy Registration</span>
              </div>
              <div className="flex items-center text-blue-100">
                <CheckCircle className="h-5 w-5 mr-3 text-green-400" />
                <span>Instant Access</span>
              </div>
            </div>
          </div>
          {/* Right Panel - Form */}
          <div className="md:w-3/5 p-10 flex flex-col justify-center bg-white/95 shadow-2xl">
            <div className="max-w-lg mx-auto w-full">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Create Account</h3>
                <p className="text-gray-500">Get started in just a few steps</p>
              </div>
              {/* Profile Picture Upload */}
              <div className="flex justify-center mb-6">
                <div className="relative group">
                  <div
                    className={`relative w-24 h-24 rounded-full border-2 border-dashed transition-all duration-300 cursor-pointer overflow-hidden bg-gray-100 flex items-center justify-center`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    {imagePreview ? (
                      <>
                        <img
                          src={imagePreview}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={removeImage}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center hover:bg-red-600 hover:scale-110"
                        >
                          <X size={14} />
                        </button>
                      </>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer">
                        <div className="flex flex-col items-center">
                          <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center mb-1">
                            <Camera className="w-4 h-4 text-gray-300" />
                          </div>
                          <span className="text-xs text-gray-500">Photo</span>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>
              <p className="text-center text-xs text-gray-500 mb-6">
                JPG, PNG (max 5MB)
              </p>
              {/* Form Fields with Floating Labels */}
              <form className="space-y-4">
                <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0">
                  <div className="relative w-full">
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('name')}
                      onBlur={() => setFocusedField("")}
                      placeholder={focusedField === 'name' ? 'Full Name' : ''}
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all peer"
                    />
                    {!(focusedField === 'name') && (
                      <label className={`absolute left-3 px-2 bg-white pointer-events-none transition-all duration-200 font-medium
                        ${formData.name ? 'text-xs text-blue-600 -top-3.5' : 'top-1/2 -translate-y-1/2 text-base text-gray-500 px-2 bg-white font-medium'}
                      `}>Full Name</label>
                    )}
                  </div>
                  <div className="relative w-full">
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField("")}
                      placeholder={focusedField === 'email' ? 'Email' : ''}
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all peer"
                    />
                    {!(focusedField === 'email') && (
                      <label className={`absolute left-3 px-2 bg-white pointer-events-none transition-all duration-200 font-medium
                        ${formData.email ? 'text-xs text-blue-600 -top-3.5' : 'top-1/2 -translate-y-1/2 text-base text-gray-500 px-2 bg-white font-medium'}
                      `}>Email</label>
                    )}
                  </div>
                </div>
                <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0">
                  <div className="relative w-full">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('password')}
                      onBlur={() => setFocusedField("")}
                      placeholder={focusedField === 'password' ? 'Password' : ''}
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all peer"
                    />
                    {!(focusedField === 'password') && (
                      <label className={`absolute left-3 px-2 bg-white pointer-events-none transition-all duration-200 font-medium
                        ${formData.password ? 'text-xs text-blue-600 -top-3.5' : 'top-1/2 -translate-y-1/2 text-base text-gray-500 px-2 bg-white font-medium'}
                      `}>Password</label>
                    )}
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <div className="relative w-full">
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('phone')}
                      onBlur={() => setFocusedField("")}
                      placeholder={focusedField === 'phone' ? 'Phone' : ''}
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all peer"
                    />
                    {!(focusedField === 'phone') && (
                      <label className={`absolute left-3 px-2 bg-white pointer-events-none transition-all duration-200 font-medium
                        ${formData.phone ? 'text-xs text-blue-600 -top-3.5' : 'top-1/2 -translate-y-1/2 text-base text-gray-500 px-2 bg-white font-medium'}
                      `}>Phone</label>
                    )}
                  </div>
                </div>
                <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0">
                  <div className="relative w-full">
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('city')}
                      onBlur={() => setFocusedField("")}
                      placeholder={focusedField === 'city' ? 'City' : ''}
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all peer"
                    />
                    {!(focusedField === 'city') && (
                      <label className={`absolute left-3 px-2 bg-white pointer-events-none transition-all duration-200 font-medium
                        ${formData.city ? 'text-xs text-blue-600 -top-3.5' : 'top-1/2 -translate-y-1/2 text-base text-gray-500 px-2 bg-white font-medium'}
                      `}>City</label>
                    )}
                  </div>
                  <div className="relative w-full">
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('state')}
                      onBlur={() => setFocusedField("")}
                      placeholder={focusedField === 'state' ? 'State' : ''}
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all peer"
                    />
                    {!(focusedField === 'state') && (
                      <label className={`absolute left-3 px-2 bg-white pointer-events-none transition-all duration-200 font-medium
                        ${formData.state ? 'text-xs text-blue-600 -top-3.5' : 'top-1/2 -translate-y-1/2 text-base text-gray-500 px-2 bg-white font-medium'}
                      `}>State</label>
                    )}
                  </div>
                </div>
                <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0">
                  <div className="relative w-full">
                    <input
                      type="text"
                      name="zip"
                      value={formData.zip}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('zip')}
                      onBlur={() => setFocusedField("")}
                      placeholder={focusedField === 'zip' ? 'ZIP' : ''}
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all peer"
                    />
                    {!(focusedField === 'zip') && (
                      <label className={`absolute left-3 px-2 bg-white pointer-events-none transition-all duration-200 font-medium
                        ${formData.zip ? 'text-xs text-blue-600 -top-3.5' : 'top-1/2 -translate-y-1/2 text-base text-gray-500 px-2 bg-white font-medium'}
                      `}>ZIP</label>
                    )}
                  </div>
                  <div className="relative w-full">
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('country')}
                      onBlur={() => setFocusedField("")}
                      placeholder={focusedField === 'country' ? 'Country' : ''}
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all peer"
                    />
                    {!(focusedField === 'country') && (
                      <label className={`absolute left-3 px-2 bg-white pointer-events-none transition-all duration-200 font-medium
                        ${formData.country ? 'text-xs text-blue-600 -top-3.5' : 'top-1/2 -translate-y-1/2 text-base text-gray-500 px-2 bg-white font-medium'}
                      `}>Country</label>
                    )}
                  </div>
                </div>
                {/* Role Toggle */}
                <div className="flex items-center justify-center space-x-4 py-2">
                  <span className={`text-sm font-medium transition-all duration-300 ${role === "user" ? "text-blue-600 scale-110" : "text-gray-400"}`}>User</span>
                  <button
                    type="button"
                    onClick={() => {
                      const newRole = role === "user" ? "seller" : "user";
                      setRole(newRole);
                      setFormData(prev => ({ ...prev, role: newRole }));
                    }}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-gray-800 transform hover:scale-105 ${role === "seller" ? "bg-gradient-to-r from-blue-500 to-purple-600" : "bg-gray-300"}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-all duration-300 ${role === "seller" ? "translate-x-6 scale-110" : "translate-x-1"}`} />
                  </button>
                  <span className={`text-sm font-medium transition-all duration-300 ${role === "seller" ? "text-blue-600 scale-110" : "text-gray-400"}`}>Seller</span>
                </div>
                {/* Submit Button */}
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg disabled:hover:scale-100 disabled:hover:shadow-none"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <UserPlus className="w-5 h-5 mr-2 animate-spin" />
                      Creating Account...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <UserPlus className="w-5 h-5 mr-2" />
                      Create Account
                    </div>
                  )}
                </button>
                {/* Social Login */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-400">Or continue with</span>
                  </div>
                </div>
                <div className="flex justify-center space-x-4">
                  <a href="http://localhost:5000/api/auth/google">
                    <button
                      type="button"
                      className="p-3 rounded-xl border border-gray-300 hover:border-gray-400 bg-white hover:bg-gray-50 transition-all duration-300 transform hover:scale-110"
                    >
                      <FaGoogle className="text-red-500 w-5 h-5" />
                    </button>
                  </a>
                  <button
                    type="button"
                    className="p-3 rounded-xl border border-gray-300 hover:border-gray-400 bg-white hover:bg-gray-50 transition-all duration-300 transform hover:scale-110"
                  >
                    <FaApple className="text-gray-700 w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    className="p-3 rounded-xl border border-gray-300 hover:border-gray-400 bg-white hover:bg-gray-50 transition-all duration-300 transform hover:scale-110"
                  >
                    <FaFacebook className="text-blue-600 w-5 h-5" />
                  </button>
                </div>
                {/* Login Link */}
                <div className="text-center pt-4">
                  <p className="text-gray-600 text-sm">
                    Already have an account?{' '}
                    <a
                      href="/login"
                      className="text-blue-600 hover:text-blue-500 font-medium hover:underline transition-colors"
                    >
                      Sign in
                    </a>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;