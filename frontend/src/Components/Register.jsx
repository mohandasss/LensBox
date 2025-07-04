import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaGoogle, FaApple, FaFacebook } from "react-icons/fa";
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
} from "lucide-react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { Link } from "react-router-dom";
import InputField from "./InputField";
import { register } from "../APIs/AuthAPI";
import { useNotification } from "./NotificationSystem";

const Register = () => {
  const { showSuccess, showError, showProfileNotification } = useNotification();
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
    role: "user", // Default role is user
  });
  const [imageFile, setImageFile] = useState(null); // ✅ Add this line
  const [imagePreview, setImagePreview] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [role, setRole] = useState("user"); // Default role is user

  const videoRef = useRef(null);
  const navigate = useNavigate();

  const handleImageUpload = (file) => {
    if (!file) return;

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

  useEffect(() => {
    if (showPopup) {
      const timeout = setTimeout(() => setShowPopup(false), 4000);
      return () => clearTimeout(timeout);
    }
  }, [showPopup]);

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) handleImageUpload(file);
  };

  const removeImage = () => {
    setImagePreview("");
    setFormData((prev) => ({ ...prev, image: "" }));
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const submissionData = {
        ...formData,
        image: imageFile,
        role: role || "user" // Use the role state which is always in sync
      };

      console.log("Submitting data:", submissionData);

      const response = await register(submissionData);
      console.log("Register response:", response);

      if (response) {
        console.log(response.message);
        showProfileNotification(
          "Account Created!", 
          "Your account has been successfully created. Welcome to LensBox!"
        );

        setFormData({
          name: "",
          email: "",
          password: "",
          city: "",
          state: "",
          zip: "",
          country: "",
          phone: "",
        });
        setTimeout(() => {
          navigate("/", { replace: true });
        }, 1500); // Reduced delay for faster redirect
        setImagePreview("");
      } else {
        showError(
          "Registration Failed", 
          "Failed to create your account. Please try again."
        );
      }
    } catch (error) {
      console.error("Registration error:", error);
      showError(
        "Registration Error", 
        error.response?.data?.message || "Something went wrong. Please try again later."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const video = videoRef.current;

    if (!video) return;

    // Set initial start time at 20s (matching login page)
    video.currentTime = 20;

    // Play once metadata is loaded
    const handleLoaded = () => {
      video.play();
    };

    // Loop back to 20s when reaching 43s (matching login page)
    const handleTimeUpdate = () => {
      if (video.currentTime >= 43) {
        video.currentTime = 20;
        video.play(); // Ensure continuous playback
      }
    };

    video.addEventListener("loadedmetadata", handleLoaded);
    video.addEventListener("timeupdate", handleTimeUpdate);

    return () => {
      video.removeEventListener("loadedmetadata", handleLoaded);
      video.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, []);

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <div className="relative w-full h-screen overflow-hidden">
        {/* Video Background */}
        <video
          ref={videoRef}
          muted
          className="absolute top-0 left-0 w-full h-full object-cover z-0"
          playsInline
        >
          <source
            src="https://res.cloudinary.com/dk5gtjb3k/video/upload/v1750171067/mgz85nxfibtftw5m3oba.mp4"
            type="video/mp4"
          />
        </video>

        {/* Dark Overlay */}
        <div className="absolute top-0 left-0 w-full h-full bg-black/60 z-10" />

        {/* Register Card */}
        <div className="relative z-20 flex justify-center items-center h-full px-4">
          <div className="w-full max-w-3xl bg-white/90 rounded-2xl shadow-2xl p-10 backdrop-blur-md">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-extrabold text-center mb-4 text-gray-800 mb-2">
              Create Account
            </h1>
            <p className="text-gray-600 text-sm">
              Join us and get started today
            </p>
          </div>

          {/* Form Section */}
          <div className="mb-8 flex justify-center">
            <div className="relative group">
              <div
                className={`relative w-20 h-20 rounded-full border border-dashed transition-all duration-300 cursor-pointer ${
                  isDragging
                    ? "border-blue-400 bg-blue-50"
                    : imagePreview
                    ? "border-transparent"
                    : "border-gray-300 hover:border-blue-400"
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
                      className="w-full h-full rounded-full object-cover"
                    />
                    <button
                      onClick={removeImage}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center hover:bg-red-600"
                    >
                      <X size={12} />
                    </button>
                  </>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer">
                    <div className="flex flex-col items-center">
                      {isDragging ? (
                        <Upload className="w-6 h-6 text-blue-500 mb-1" />
                      ) : (
                        <User className="w-6 h-6 text-gray-400 mb-1" />
                      )}
                      <span className="text-xs text-gray-500 text-center">
                        Photo
                      </span>
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

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                icon={User}
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
              />
              <InputField
                icon={Mail}
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
              />
              <InputField
                icon={Lock}
                label="Password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a password"
                showPassword={showPassword}
                onTogglePassword={() => setShowPassword(!showPassword)}
              />
              <InputField
                icon={Phone}
                label="Phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter your phone"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                icon={MapPin}
                label="City"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Enter your city"
              />
              <InputField
                icon={MapPin}
                label="State"
                name="state"
                value={formData.state}
                onChange={handleChange}
                placeholder="Enter your state"
              />
              <InputField
                icon={MapPin}
                label="ZIP Code"
                name="zip"
                value={formData.zip}
                onChange={handleChange}
                placeholder="Enter ZIP code"
              />
              <InputField
                icon={Globe}
                label="Country"
                name="country"
                value={formData.country}
                onChange={handleChange}
                placeholder="Enter your country"
              />
              <div className="flex items-center space-x-3 col-span-2">
      <span className={`text-sm font-medium transition-colors ${role === "user" ? "text-gray-900" : "text-gray-400"}`}>
        User
      </span>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          const newRole = role === "user" ? "seller" : "user";
          setRole(newRole);
          setFormData(prev => ({ ...prev, role: newRole }));
        }}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
          role === "seller" ? "bg-blue-600" : "bg-gray-300"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform ${
            role === "seller" ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
      <span className={`text-sm font-medium transition-colors ${role === "seller" ? "text-gray-900" : "text-gray-400"}`}>
        Seller
      </span>
    </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2.5 px-6 rounded-md transition-colors"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Creating Account...
                </div>
              ) : (
                "Create Account"
              )}
            </button>

            <div className="text-center pt-4">
              <p className="text-gray-600 text-sm">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </form>
          <div className="flex justify-center space-x-6 mb-6">
            {/* Google Login - External Redirect */}
            <Link to="http://localhost:5000/api/auth/google">
              <button className="p-3 rounded-full border border-gray-300 hover:bg-gray-100 transition duration-300">
                <FaGoogle className="text-red-500" />
              </button>
            </Link>

            {/* Apple Button */}
                <button className="p-3 rounded-full border border-gray-300 hover:bg-gray-100 transition duration-300">
              <FaApple className="text-black" />
            </button>

            {/* Facebook Button */}
            <button className="p-3 rounded-full border border-gray-300 hover:bg-gray-100 transition duration-300">
              <FaFacebook className="text-blue-600" />
            </button>
          </div>
        </div>
      </div>
    </div>

      {/* Success Popup */}
      {showPopup && (
        <div className="fixed inset-0 flex justify-center items-center z-50">
          <div
            className="fixed inset-0 bg-black opacity-40 backdrop-blur-sm"
            onClick={() => setShowPopup(false)}
          ></div>
          <div className="bg-white p-6 rounded-xl shadow-lg z-50 max-w-sm w-full relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
              onClick={() => setShowPopup(false)}
            >
              <X size={18} />
            </button>
            <div className="flex items-center space-x-3">
              <CheckCircle className="text-green-500 w-6 h-6" />
              <h2 className="text-lg font-semibold text-gray-800">Message</h2>
            </div>
            <p className="text-gray-600 mt-2">{popupMessage}</p>
          </div>
        </div>
      )}
    
    </div>
  );
};

export default Register;
