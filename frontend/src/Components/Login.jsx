import { Link, useNavigate } from "react-router-dom";
import { FaGoogle, FaApple, FaFacebook } from "react-icons/fa";
import { X, Mail, Eye, EyeOff, Lock, User } from "lucide-react";
import { login, requestForgotOtp, verifyForgotOtp, resetPassword } from "../APIs/AuthAPI";
import React, { useRef, useEffect, useState } from "react";
import Navbar from "./Navbar";
import { useNotification } from "./NotificationSystem";
import OtpModal from "./OtpModal";
import PasswordResetModal from "./PasswordResetModal";

const Login = () => {
  const { showSuccess, showError, showProfileNotification } = useNotification();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isFormFocused, setIsFormFocused] = useState(false);
  
  // Forgot password states
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [showPasswordResetModal, setShowPasswordResetModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState(null);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState(null);
  const [currentOtp, setCurrentOtp] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      const response = await login({ email, password });
      console.log(response);
      showProfileNotification(
        "Welcome Back!", 
        "You have successfully logged in to your account."
      );
      // Immediate redirect to home page
      setTimeout(() => {
        navigate("/", { replace: true });
      }, 100);
    } catch (error) {
      setError(error.response?.data?.message || "Login failed");
      showError(
        "Login Failed", 
        error.response?.data?.message || "Invalid email or password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;

    if (!video) return;

    // Set initial start time at 20s
    video.currentTime = 20;

    // Play once metadata is loaded
    const handleLoaded = () => {
      video.play();
    };

    // Loop back to 20s when reaching 43s
    const handleTimeUpdate = () => {
      if (video.currentTime >= 43) {
        video.currentTime = 20;
        video.play();
      }
    };

    video.addEventListener("loadedmetadata", handleLoaded);
    video.addEventListener("timeupdate", handleTimeUpdate);

    return () => {
      video.removeEventListener("loadedmetadata", handleLoaded);
      video.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, []);

  const navigate = useNavigate();

  // Forgot password functions
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!forgotEmail) return;

    try {
      await requestForgotOtp(forgotEmail);
      setShowForgotModal(false);
      setShowOtpModal(true);
      setOtpError(null);
      showProfileNotification(
        "OTP Sent!", 
        "We've sent a password reset code to your email."
      );
    } catch (error) {
      showError(
        "Failed to Send OTP", 
        error.response?.data?.message || "Please check your email and try again."
      );
    }
  };

  const handleOtpVerify = async (otp) => {
    setOtpLoading(true);
    setOtpError(null);

    try {
      await verifyForgotOtp(forgotEmail, otp);
      setCurrentOtp(otp);
      setShowOtpModal(false);
      setShowPasswordResetModal(true);
    } catch (error) {
      setOtpError(error.response?.data?.message || "Invalid OTP. Please try again.");
    } finally {
      setOtpLoading(false);
    }
  };

  const handlePasswordReset = async (newPassword) => {
    setResetLoading(true);
    setResetError(null);

    try {
      await resetPassword(forgotEmail, currentOtp, newPassword);
      setShowPasswordResetModal(false);
      setForgotEmail("");
      setCurrentOtp("");
      showProfileNotification(
        "Password Reset!", 
        "Your password has been successfully reset. You can now login with your new password."
      );
    } catch (error) {
      setResetError(error.response?.data?.message || "Failed to reset password. Please try again.");
    } finally {
      setResetLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      await requestForgotOtp(forgotEmail);
      showProfileNotification(
        "OTP Resent!", 
        "A new password reset code has been sent to your email."
      );
    } catch (error) {
      setOtpError("Failed to resend OTP. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <div className="relative w-full h-screen overflow-hidden">
        {/* Background Video */}
        <video
          ref={videoRef}
          muted
          className="absolute top-0 left-0 w-full h-full object-cover z-0"
          playsInline
        >
          <source
            src="https://res.cloudinary.com/dk5gtjb3k/video/upload/v1750170682/mvpxxk2fdmzwyzgxp7kz.mp4"
            type="video/mp4"
          />
        </video>

        {/* Dynamic Overlay */}
        <div className={`absolute top-0 left-0 w-full h-full transition-all duration-1000 z-10 ${
          isFormFocused ? 'bg-black/80 backdrop-blur-sm' : 'bg-black/60'
        }`} />

        {/* Floating Particles */}
        <div className="absolute inset-0 z-15 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-400/30 rounded-full animate-pulse" />
          <div className="absolute top-3/4 right-1/4 w-3 h-3 bg-purple-400/20 rounded-full animate-pulse delay-1000" />
          <div className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-pink-400/40 rounded-full animate-pulse delay-2000" />
        </div>

        {/* Login Card */}
        <div className="relative z-20 flex justify-center items-center h-full px-4">
          <div className={`w-full max-w-md bg-white/95 backdrop-blur-xl shadow-2xl rounded-2xl p-8 border border-white/20 transition-all duration-700 transform ${
            isFormFocused ? 'scale-105 shadow-3xl' : 'scale-100'
          }`}>
            
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                <User className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                Welcome Back
              </h2>
              <p className="text-gray-600">
                Sign in to continue your journey
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              {/* Email Input */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 px-1">
                  Email Address
                </label>
                <div className="relative group">
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setIsFormFocused(true)}
                    onBlur={() => setIsFormFocused(false)}
                    type="email"
                    required
                    className="w-full px-4 py-3 pl-12 bg-gray-50/80 backdrop-blur-sm border border-gray-200 rounded-xl focus:border-blue-500 focus:bg-white/90 focus:outline-none transition-all duration-300 text-gray-900 placeholder-gray-400"
                    placeholder="Enter your email"
                  />
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-300" />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 px-1">
                  Password
                </label>
                <div className="relative group">
                  <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setIsFormFocused(true)}
                    onBlur={() => setIsFormFocused(false)}
                    type={showPassword ? "text" : "password"}
                    required
                    className="w-full px-4 py-3 pl-12 pr-12 bg-gray-50/80 backdrop-blur-sm border border-gray-200 rounded-xl focus:border-blue-500 focus:bg-white/90 focus:outline-none transition-all duration-300 text-gray-900 placeholder-gray-400"
                    placeholder="Enter your password"
                  />
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-300" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-500 transition-colors duration-300"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                
                {/* Forgot Password Link */}
                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(true)}
                    className="text-sm text-blue-600 hover:text-blue-700 hover:underline transition-colors duration-300"
                  >
                    Forgot Password?
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm animate-fade-in">
                  {error}
                </div>
              )}

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 px-6 rounded-xl font-semibold text-white transition-all duration-300 transform ${
                  loading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:scale-105 hover:shadow-lg active:scale-95'
                }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Signing in...</span>
                  </div>
                ) : (
                  "Sign In"
                )}
              </button>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">Or continue with</span>
                </div>
              </div>

              {/* Social Login */}
              <div className="flex justify-center space-x-4">
                <Link to="http://localhost:5000/api/auth/google">
                  <button
                    type="button"
                    className="p-3 rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-300 transform hover:scale-110 active:scale-95"
                  >
                    <FaGoogle className="w-5 h-5 text-red-500" />
                  </button>
                </Link>
                
                <button
                  type="button"
                  className="p-3 rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-300 transform hover:scale-110 active:scale-95"
                >
                  <FaApple className="w-5 h-5 text-gray-800" />
                </button>
                
                <button
                  type="button"
                  className="p-3 rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-300 transform hover:scale-110 active:scale-95"
                >
                  <FaFacebook className="w-5 h-5 text-blue-600" />
                </button>
              </div>

              {/* Register Link */}
              <div className="text-center pt-4 border-t border-gray-100">
                <p className="text-gray-600">
                  Don't have an account?{" "}
                  <Link 
                    to="/register" 
                    className="text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors duration-300"
                  >
                    Create Account
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Enhanced Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md animate-fade-in">
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-md transform transition-all duration-500 scale-100 opacity-100 border border-white/20">
            
            {/* Header */}
            <div className="relative p-6 pb-4">
              <button
                onClick={() => setShowForgotModal(false)}
                className="absolute right-4 top-4 w-10 h-10 rounded-full bg-gray-100/80 backdrop-blur-sm flex items-center justify-center hover:bg-gray-200/80 transition-all duration-300 transform hover:scale-110 active:scale-95"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
              
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Mail className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Forgot Password</h3>
                <p className="text-gray-600">Enter your email to reset your password</p>
              </div>
            </div>

            {/* Content */}
            <div className="px-6 pb-6">
              <form onSubmit={handleForgotPassword} className="space-y-6">
                
                {/* Email Input */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 px-1">
                    Email Address
                  </label>
                  <div className="relative group">
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className="w-full px-4 py-3 pl-12 bg-gray-50/80 backdrop-blur-sm border border-gray-200 rounded-xl focus:border-purple-500 focus:bg-white/90 focus:outline-none transition-all duration-300 text-gray-900 placeholder-gray-400"
                      placeholder="Enter your email address"
                      required
                    />
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-purple-500 transition-colors duration-300" />
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full py-3 px-6 rounded-xl font-semibold text-white transition-all duration-300 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
                >
                  Send Reset Code
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* OTP Modal */}
      <OtpModal
        isOpen={showOtpModal}
        onClose={() => {
          setShowOtpModal(false);
          setForgotEmail("");
          setOtpError(null);
        }}
        onVerify={handleOtpVerify}
        email={forgotEmail}
        title="Enter Reset Code"
        subtitle="We've sent a 6-digit code to your email"
        loading={otpLoading}
        error={otpError}
        resendOtp={handleResendOtp}
        resendLoading={false}
      />

      {/* Password Reset Modal */}
      <PasswordResetModal
        isOpen={showPasswordResetModal}
        onClose={() => {
          setShowPasswordResetModal(false);
          setForgotEmail("");
          setCurrentOtp("");
          setResetError(null);
        }}
        onSubmit={handlePasswordReset}
        email={forgotEmail}
        loading={resetLoading}
        error={resetError}
      />
    </div>
  );
};

export default Login;