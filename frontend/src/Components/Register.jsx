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
  UserPlus,
  ArrowLeft
} from "lucide-react";
import { Link } from "react-router-dom";
import { FaGoogle, FaApple, FaFacebook } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import { register } from "../APIs/AuthAPI";
import { useNotification } from "./NotificationSystem";
import OtpModal from "./OtpModal";
import { requestRegisterOtp, verifyRegisterOtp } from "../APIs/AuthAPI";

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
  const notification = useNotification();
  const BACKEND_BASE_API = process.env.REACT_APP_BACKEND_BASE_API;

  const handleImageUpload = (file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      notification.showNotification('error', 'Invalid File', 'Please select an image file (JPEG, PNG)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      notification.showNotification('error', 'File Too Large', 'Image size should be less than 5MB');
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
    setOtpError(null);
    try {
      const otpRequestData = { ...formData };
      delete otpRequestData.image;
      await requestRegisterOtp(otpRequestData);
      setPendingRegistration({ ...formData, imageFile });
      setShowOtpModal(true);
    } catch (error) {
      let msg = "Failed to send OTP. Please try again.";
      if (error.response && error.response.data && error.response.data.message) {
        msg = error.response.data.message;
      }
      notification.showNotification("error", "OTP Error", msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async (otp) => {
    setOtpLoading(true);
    setOtpError(null);
    try {
      const verifyData = { ...pendingRegistration };
      delete verifyData.imageFile;
      verifyData.otp = otp;
      await verifyRegisterOtp(verifyData);
      setShowOtpModal(false);
      notification.showNotification("success", "Registration successful!", "You can now log in.");
      setTimeout(() => {
        navigate("/login");
      }, 1200);
    } catch (error) {
      let msg = "OTP verification failed. Please try again.";
      if (error.response && error.response.data && error.response.data.message) {
        msg = error.response.data.message;
      }
      setOtpError(msg);
    } finally {
      setOtpLoading(false);
    }
  };

  const handleCloseOtpModal = () => {
    setShowOtpModal(false);
    setPendingRegistration(null);
    setOtpError(null);
  };

  const InputField = ({ icon: Icon, label, name, type = "text", value, onChange, placeholder, required = false }) => (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
        <Icon className={`h-4 w-4 transition-colors duration-200 ${
          focusedField === name ? 'text-blue-500' : 'text-gray-400'
        }`} />
      </div>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        onFocus={() => setFocusedField(name)}
        onBlur={() => setFocusedField("")}
        placeholder=" "
        required={required}
        className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-transparent
          focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 
          transition-all duration-200 peer"
      />
      <label className={`absolute left-10 px-1 bg-white pointer-events-none transition-all duration-200 
        peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-base
        peer-focus:-top-2 peer-focus:text-xs peer-focus:text-blue-600
        ${value ? '-top-2 text-xs text-blue-600' : 'top-1/2 -translate-y-1/2 text-gray-400'}
      `}>
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {name === "password" && (
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute inset-y-0 right-0 pr-3 flex items-center z-10"
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600 transition-colors" />
          ) : (
            <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600 transition-colors" />
          )}
        </button>
      )}
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
      {/* Navbar - Hidden on mobile for cleaner look */}
      <div className="hidden md:block fixed top-0 left-0 w-full z-30 bg-black/70 backdrop-blur-md">
        <Navbar />
      </div>

      {/* Mobile Back Button */}
      <div className="md:hidden fixed top-4 left-4 z-30">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all duration-200"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
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

      {/* Overlay */}
      <div className="absolute top-0 left-0 w-full h-full bg-black/60 z-10" />

      {/* Main Content */}
      <div className="relative z-20 min-h-screen flex items-center justify-center p-4 pt-16 md:pt-20">
        <div className="w-full max-w-6xl mx-auto">
          {/* Mobile Header */}
          <div className="md:hidden text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center mr-3">
                <Sparkles className="h-6 w-6 text-white animate-pulse" />
              </div>
              <h1 className="text-3xl font-bold text-white">LensBox</h1>
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">Create Account</h2>
            <p className="text-gray-300 text-sm">Join our community today</p>
          </div>

          <div className="bg-white/95 backdrop-blur-xl rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden border border-white/20">
            <div className="flex flex-col lg:flex-row">
              {/* Left Panel - Hidden on mobile, visible on desktop */}
              <div className="hidden lg:flex lg:w-2/5 bg-gradient-to-br from-blue-700 to-gray-900 p-8 flex-col justify-center">
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
              <div className="w-full lg:w-3/5 p-6 md:p-10">
                <div className="max-w-lg mx-auto w-full">
                  {/* Desktop Header */}
                  <div className="hidden lg:block text-center mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Create Account</h3>
                    <p className="text-gray-500">Get started in just a few steps</p>
                  </div>

                  {/* Profile Picture Upload */}
                  <div className="flex justify-center mb-6">
                    <div className="relative group">
                      <div
                        className={`relative w-20 h-20 md:w-24 md:h-24 rounded-full border-2 border-dashed transition-all duration-300 cursor-pointer overflow-hidden bg-gray-100 flex items-center justify-center ${
                          isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                        }`}
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
                              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mb-1">
                                <Camera className="w-4 h-4 text-gray-500" />
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

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Name and Email */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InputField
                        icon={User}
                        label="Full Name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                      <InputField
                        icon={Mail}
                        label="Email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    {/* Password and Phone */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InputField
                        icon={Lock}
                        label="Password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={handleChange}
                        required
                      />
                      <InputField
                        icon={Phone}
                        label="Phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                      />
                    </div>

                    {/* Location Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InputField
                        icon={MapPin}
                        label="City"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                      />
                      <InputField
                        icon={MapPin}
                        label="State"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InputField
                        icon={MapPin}
                        label="ZIP Code"
                        name="zip"
                        value={formData.zip}
                        onChange={handleChange}
                      />
                      <InputField
                        icon={Globe}
                        label="Country"
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                      />
                    </div>

                    {/* Role Toggle */}
                    <div className="flex items-center justify-center space-x-4 py-4">
                      <span className={`text-sm font-medium transition-all duration-300 ${
                        role === "user" ? "text-blue-600" : "text-gray-400"
                      }`}>
                        User
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const newRole = role === "user" ? "seller" : "user";
                          setRole(newRole);
                          setFormData(prev => ({ ...prev, role: newRole }));
                        }}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 ${
                          role === "seller" ? "bg-gradient-to-r from-blue-500 to-purple-600" : "bg-gray-300"
                        }`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-all duration-300 ${
                          role === "seller" ? "translate-x-6" : "translate-x-1"
                        }`} />
                      </button>
                      <span className={`text-sm font-medium transition-all duration-300 ${
                        role === "seller" ? "text-blue-600" : "text-gray-400"
                      }`}>
                        Seller
                      </span>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg disabled:hover:scale-100 disabled:hover:shadow-none disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center justify-center">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
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
                        <span className="px-4 bg-white text-gray-500">Or continue with</span>
                      </div>
                    </div>

                    <div className="flex justify-center space-x-4">
                      <Link to={`${BACKEND_BASE_API}/auth/google`}>
                        <button
                          type="button"
                          className="p-3 rounded-lg border border-gray-300 hover:border-gray-400 bg-white hover:bg-gray-50 transition-all duration-200 transform hover:scale-105"
                        >
                          <FaGoogle className="text-red-500 w-5 h-5" />
                        </button>
                      </Link>
                      <button
                        type="button"
                        className="p-3 rounded-lg border border-gray-300 hover:border-gray-400 bg-white hover:bg-gray-50 transition-all duration-200 transform hover:scale-105"
                      >
                        <FaApple className="text-gray-700 w-5 h-5" />
                      </button>
                      <button
                        type="button"
                        className="p-3 rounded-lg border border-gray-300 hover:border-gray-400 bg-white hover:bg-gray-50 transition-all duration-200 transform hover:scale-105"
                      >
                        <FaFacebook className="text-blue-600 w-5 h-5" />
                      </button>
                    </div>

                    {/* Login Link */}
                    <div className="text-center pt-4">
                      <p className="text-gray-600 text-sm">
                        Already have an account?{' '}
                        <Link
                          to="/login"
                          className="text-blue-600 hover:text-blue-500 font-medium hover:underline transition-colors"
                        >
                          Sign in
                        </Link>
                      </p>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* OTP Modal */}
      <OtpModal
        isOpen={showOtpModal}
        onClose={handleCloseOtpModal}
        onVerify={handleVerifyOtp}
        email={pendingRegistration?.email || formData.email}
        loading={otpLoading}
        error={otpError}
      />
    </div>
  );
};

export default Register;