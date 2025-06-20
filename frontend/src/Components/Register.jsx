import React, { useState, useRef, useEffect } from "react";
import { Upload, User, X, Eye, EyeOff, Mail, Lock, Phone, MapPin, Globe } from "lucide-react";
import { Link } from "react-router-dom";
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
  });

  const [imagePreview, setImagePreview] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const videoRef = useRef(null);

  const handleImageUpload = (file) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData({ ...formData, image: reader.result });
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    handleImageUpload(file);
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
    if (file && file.type.startsWith('image/')) {
      handleImageUpload(file);
    }
  };

  const removeImage = () => {
    setImagePreview("");
    setFormData({ ...formData, image: "" });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setPopupMessage("Registration successful! Welcome aboard.");
      setShowPopup(true);
      setFormData({
        name: "",
        email: "",
        password: "",
        city: "",
        state: "",
        zip: "",
        country: "",
        phone: "",
        image: "",
      });
      setImagePreview("");
      setIsSubmitting(false);
    }, 1500);
  };

  useEffect(() => {
    const video = videoRef.current;
    const handleTimeUpdate = () => {
      if (video.currentTime >= 30) {
        video.currentTime = 0;
        video.play();
      }
    };
    if (video) video.addEventListener("timeupdate", handleTimeUpdate);
    return () => {
      if (video) video.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, []);

  const InputField = ({ icon: Icon, label, name, type = "text", value, onChange, placeholder }) => (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/80 backdrop-blur-sm"
        />
        {name === "password" && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            ) : (
              <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            )}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Video Background */}
      <div className="fixed inset-0 z-0">
        <video
          ref={videoRef}
          src="https://res.cloudinary.com/dk5gtjb3k/video/upload/v1750171067/mgz85nxfibtftw5m3oba.mp4"
          className="w-full h-full object-cover"
          autoPlay
          loop
          muted
        />
        <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px]" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-4xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Create Account</h1>
            <p className="text-gray-200">Join us and get started today</p>
          </div>

          {/* Form Container */}
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-8 md:p-10">
            
            {/* Profile Image Upload */}
            <div className="flex justify-center mb-8">
              <div className="relative group">
                <div
                  className={`
                    relative w-28 h-28 rounded-full border-2 border-dashed transition-all duration-300 cursor-pointer
                    ${isDragging 
                      ? 'border-blue-400 bg-blue-50' 
                      : imagePreview 
                        ? 'border-transparent' 
                        : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                    }
                  `}
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
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center hover:bg-red-600"
                      >
                        <X size={14} />
                      </button>
                    </>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer">
                      <div className="flex flex-col items-center">
                        {isDragging ? (
                          <Upload className="w-8 h-8 text-blue-500 mb-1" />
                        ) : (
                          <User className="w-8 h-8 text-gray-400 mb-1" />
                        )}
                        <span className="text-xs text-gray-500 text-center px-2">
                          {isDragging ? 'Drop here' : 'Upload photo'}
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
                {!imagePreview && (
                  <p className="text-xs text-gray-400 mt-2 text-center">
                    JPG, PNG • Max 5MB
                  </p>
                )}
              </div>
            </div>

            <div onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                  Personal Information
                </h3>
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
                    label="Email Address"
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
                  />
                  <InputField
                    icon={Phone}
                    label="Phone Number"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>

              {/* Address Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                  Address Information
                </h3>
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
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Creating Account...
                    </div>
                  ) : (
                    "Create Account"
                  )}
                </button>
              </div>

              {/* Login Link */}
              <Link to="/login">
              <div className="text-center pt-4">
                <p className="text-gray-600">
                  Already have an account?{" "}
                  <button className="text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors">
                    Sign in
                  </button>
                </p>
              </div></Link>

              {/* Social Login */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">Or continue with</span>
                </div>
              </div>

              <div className="flex justify-center space-x-4">
                {["Google", "Apple", "Facebook"].map((provider, index) => {
                  const colors = ["text-red-500 hover:bg-red-50", "text-gray-800 hover:bg-gray-50", "text-blue-600 hover:bg-blue-50"];
                  const icons = ["G", "A", "f"];
                  return (
                    <button
                      key={index}
                      type="button"
                      className={`p-3 border border-gray-200 rounded-lg ${colors[index]} transition-all duration-200 hover:shadow-md font-bold text-lg w-12 h-12 flex items-center justify-center`}
                    >
                      {icons[index]}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Popup */}
      {showPopup && (
        <div className="fixed inset-0 flex justify-center items-center z-[9999]">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="relative z-[10000] bg-white rounded-lg p-6 mx-4 max-w-md w-full shadow-2xl">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Success!</h3>
              <p className="text-gray-600 mb-4">{popupMessage}</p>
              <button
                onClick={() => setShowPopup(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Register;