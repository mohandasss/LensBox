import * as React from 'react';
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import config from "./secretfront";
import { paymentConfirmation } from "../APIs/SubscriberAPI";
import {
  XMarkIcon,
  UserIcon,
  PhoneIcon,
  MapPinIcon,
  HomeIcon,
  MapIcon,
  CalendarIcon,
  CheckIcon,
  CreditCardIcon,
  TruckIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { createOrder, verifyPayment } from "../APIs/CheckoutAPI";
import { loadRazorpay, formatAmount } from "../utils/razorpay";
import { verifyToken } from "../APIs/AuthAPI";
import { clearCart } from "../APIs/CartAPI";
import PaymentSuccess from "./PaymentSuccess";
import { useNotification } from "./NotificationSystem";

// Move InputField outside the component to prevent recreation
const InputField = React.memo(({
  id,
  name,
  label,
  type = "text",
  value,
  onChange,
  error,
  icon: Icon,
  placeholder,
  className = "",
  ...props
}) => {
  return (
    <div className={`mb-4 ${className}`}>
      <label htmlFor={id} className="block text-sm font-semibold text-gray-700 mb-2">
        {label}
      </label>
      <div className="relative group">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Icon
              className={`h-5 w-5 transition-colors ${
                error ? "text-red-500" : "text-gray-400 group-focus-within:text-indigo-600"
              }`}
              aria-hidden="true"
            />
          </div>
        )}
        <input
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder || `Enter ${label.toLowerCase()}`}
          className={`block w-full ${Icon ? "pl-12" : "pl-4"} pr-4 py-3 text-gray-900 placeholder-gray-500 bg-white border-2 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${
            error 
              ? "border-red-500 bg-red-50" 
              : "border-gray-200 hover:border-gray-300 focus:border-indigo-500"
          }`}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-600 flex items-center">
          <span className="inline-block w-1 h-1 bg-red-500 rounded-full mr-2"></span>
          {error}
        </p>
      )}
    </div>
  );
});

InputField.displayName = "InputField";

const CheckoutModal = ({
  isOpen,
  onClose,
  cartItems,
  onCheckout,
  initialValues = {},
}) => {
  const { showPaymentNotification, showError, showSuccess, showShippingNotification } = useNotification();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [paymentError, setPaymentError] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const [userLocation, setUserLocation] = useState({ lat: null, lng: null });
  const [locationStatus, setLocationStatus] = useState("");
  const [showLocationPopup, setShowLocationPopup] = useState(false);

  // Simplified form state management
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    zipCode: "",
    country: "India",
  });

  // Default rental dates - 1 day from today
  const [rentalDates, setRentalDates] = useState({
    startDate: new Date(),
    endDate: new Date(),
  });

  const [errors, setErrors] = useState({});

  // Initialize form data from initialValues only once
  useEffect(() => {
    if (initialValues && Object.keys(initialValues).length > 0) {
      setFormData(prev => ({
        ...prev,
        fullName: initialValues.fullName || "",
        phone: initialValues.phone || "",
        addressLine1: initialValues.addressLine1 || "",
        addressLine2: initialValues.addressLine2 || "",
        city: initialValues.city || "",
        state: initialValues.state || "",
        zipCode: initialValues.zipCode || "",
        country: initialValues.country || "India",
      }));
    }
  }, [initialValues]);

  useEffect(() => {
    if (isOpen) {
      setShowLocationPopup(true);
    } else {
      setShowLocationPopup(false);
    }
  }, [isOpen]);

  // Simple input change handler
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  }, [errors]);

  const validateForm = useCallback(() => {
    const newErrors = {};
    const requiredFields = [
      "fullName",
      "phone", 
      "addressLine1",
      "city",
      "state",
      "zipCode",
    ];

    requiredFields.forEach((field) => {
      if (!formData[field]?.trim()) {
        newErrors[field] = "This field is required";
      }
    });

    if (formData.zipCode && !/^\d{6}$/.test(formData.zipCode)) {
      newErrors.zipCode = "Please enter a valid 6-digit PIN code";
    }

    if (formData.phone && !/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = "Please enter a valid 10-digit phone number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const calculateSubtotal = useCallback(() => {
    return cartItems.reduce((total, item) => {
      return total + parseFloat(item.productId.price) * item.quantity;
    }, 0);
  }, [cartItems]);

  const calculateRentalDays = useCallback(() => {
    if (!rentalDates.startDate || !rentalDates.endDate) return 1;
    const diffTime = Math.abs(rentalDates.endDate - rentalDates.startDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }, [rentalDates.startDate, rentalDates.endDate]);

  const calculateTotal = useCallback(() => {
    const days = calculateRentalDays();
    return (calculateSubtotal() * days).toFixed(2);
  }, [calculateSubtotal, calculateRentalDays]);

  // Geolocation handler
  const handleGetLocation = () => {
    setLocationStatus("Getting your location...");
    if (!navigator.geolocation) {
      setLocationStatus("Geolocation is not supported by your browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLocationStatus("Location captured!");
      },
      (error) => {
        setLocationStatus("Unable to retrieve your location. Please allow location access or enter your address manually.");
      }
    );
  };

  const handleLocationPermission = (allow) => {
    setShowLocationPopup(false);
    if (allow) {
      handleGetLocation();
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setError("");
    setPaymentError("");

    try {
      const { user } = await verifyToken(localStorage.getItem("token"));

      const orderData = {
        ...formData,
        startDate: rentalDates.startDate,
        endDate: rentalDates.endDate,
        total: calculateTotal(),
        userId: user._id,
        items: cartItems.map((item) => ({
          productId: item.productId._id,
          quantity: item.quantity,
          amount: item.productId.price,
        })),
        // Add lat/lng if available
        lat: userLocation.lat,
        lng: userLocation.lng,
      };

      const response = await createOrder(orderData);
      const isRazorpayLoaded = await loadRazorpay();
      
      if (!isRazorpayLoaded) {
        throw new Error("Failed to load payment gateway. Please try again.");
      }

      const options = {
        key: config.RAZORPAY_KEY_ID,
        amount: formatAmount(calculateTotal()),
        currency: "INR",
        name: "LensBox",
        description: "Camera Equipment Rental",
        order_id: response.razorpayOrderId,
        handler: async function (razorpayResponse) {
          try {
            const verificationData = {
              razorpay_order_id: razorpayResponse.razorpay_order_id,
              razorpay_payment_id: razorpayResponse.razorpay_payment_id,
              razorpay_signature: razorpayResponse.razorpay_signature,
            };

            const verificationResponse = await verifyPayment(verificationData);
            const clearCartResponse = await clearCart(user._id);

            setOrderDetails({
              orderId: verificationResponse.orderId,
              amount: calculateTotal(),
            });

            setPaymentSuccess(true);
            showPaymentNotification(
              "Payment Successful!", 
              `Your order has been confirmed. Order ID: ${verificationResponse.orderId}`
            );

            if (onCheckout) {
              onCheckout();
            }
          } catch (error) {
            console.error("Payment verification failed:", error);
            setPaymentError("Payment verification failed. Please contact support.");
            showError(
              "Payment Failed", 
              "There was an error verifying your payment. Please contact support."
            );
          }
        },
        prefill: {
          name: formData.fullName,
          contact: formData.phone,
        },
        theme: {
          color: "#4F46E5",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Checkout failed:", error);
      setError("Failed to process checkout. Please try again.");
      showError(
        "Checkout Failed", 
        "There was an error processing your checkout. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div>
      {paymentSuccess && orderDetails && (
        <PaymentSuccess
          orderDetails={orderDetails}
          onClose={() => {
            setPaymentSuccess(false);
            onClose();
            navigate("/orders");
          }}
          timer={5}
          autoClose={true}
        />
      )}

      <div className="fixed inset-0 z-40 overflow-y-auto">
        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div
            className="fixed inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-sm transition-opacity"
            aria-hidden="true"
            onClick={onClose}
          ></div>

          <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
            &#8203;
          </span>

          <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
            <div className="bg-white px-6 pt-6 pb-4 sm:p-8 sm:pb-4">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Complete Your Rental</h2>
                  <p className="text-gray-600 mt-1">Enter your details and proceed to payment</p>
                </div>
                <button
                  type="button"
                  className="bg-white rounded-xl p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  onClick={onClose}
                >
                  <span className="sr-only">Close</span>
                  <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>

              {/* Error Display */}
              {(error || paymentError) && (
                <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-xl">
                  <div className="text-sm text-red-700 font-medium whitespace-pre-line">
                    {error || paymentError}
                  </div>
                </div>
              )}

              {/* Main Content */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Left Column - Shipping Information */}
                <div className="space-y-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 rounded-xl bg-indigo-50">
                      <TruckIcon className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Shipping Information</h3>
                      <p className="text-sm text-gray-600">Where should we deliver your equipment?</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField
                      id="fullName"
                      name="fullName"
                      label="Full Name"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      error={errors.fullName}
                      icon={UserIcon}
                    />
                    <InputField
                      id="phone"
                      name="phone"
                      label="Phone Number"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      error={errors.phone}
                      icon={PhoneIcon}
                    />
                  </div>

                  {/* Location Permission Popup */}
                  {showLocationPopup && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
                      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center animate-fade-in">
                        <div className="flex flex-col items-center space-y-4">
                          <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 mb-2">
                            <MapPinIcon className="h-7 w-7 text-blue-600" />
                          </span>
                          <h3 className="text-lg font-semibold text-gray-900">Allow Location Access?</h3>
                          <p className="text-gray-600 text-sm">To deliver your order accurately, we can use your current location. Would you like to share your location?</p>
                          <div className="flex space-x-3 mt-4">
                            <button
                              className="px-5 py-2 rounded-lg bg-blue-600 text-white font-medium shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                              onClick={() => handleLocationPermission(true)}
                            >
                              Yes, use my location
                            </button>
                            <button
                              className="px-5 py-2 rounded-lg bg-gray-100 text-gray-700 font-medium shadow hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all"
                              onClick={() => handleLocationPermission(false)}
                            >
                              No, thanks
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <InputField
                    id="addressLine1"
                    name="addressLine1"
                    label="Address Line 1"
                    value={formData.addressLine1}
                    onChange={handleInputChange}
                    error={errors.addressLine1}
                    icon={HomeIcon}
                  />

                  <InputField
                    id="addressLine2"
                    name="addressLine2"
                    label="Address Line 2 (Optional)"
                    value={formData.addressLine2}
                    onChange={handleInputChange}
                    icon={MapPinIcon}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <InputField
                      id="city"
                      name="city"
                      label="City"
                      value={formData.city}
                      onChange={handleInputChange}
                      error={errors.city}
                      icon={MapIcon}
                    />
                    <InputField
                      id="state"
                      name="state"
                      label="State"
                      value={formData.state}
                      onChange={handleInputChange}
                      error={errors.state}
                    />
                    <InputField
                      id="zipCode"
                      name="zipCode"
                      label="PIN Code"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      error={errors.zipCode}
                    />
                  </div>
                </div>

                {/* Right Column - Rental Details & Order Summary */}
                <div className="space-y-6">
                  
                  {/* Rental Duration */}
                  <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="p-2 rounded-xl bg-indigo-100">
                        <CalendarIcon className="h-5 w-5 text-indigo-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Rental Period</h3>
                        <p className="text-sm text-gray-600">Select your rental start and end dates</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                        <div className="relative">
                          <DatePicker
                            selected={rentalDates.startDate}
                            onChange={(date) => setRentalDates(prev => ({ ...prev, startDate: date }))}
                            selectsStart
                            startDate={rentalDates.startDate}
                            endDate={rentalDates.endDate}
                            minDate={new Date()}
                            maxDate={new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)} // 1 year from now
                            dateFormat="MMM dd, yyyy"
                            className="block w-full px-4 py-3 text-gray-900 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                            placeholderText="Select start date"
                          />
                          <CalendarIcon className="h-5 w-5 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                        <div className="relative">
                          <DatePicker
                            selected={rentalDates.endDate}
                            onChange={(date) => setRentalDates(prev => ({ ...prev, endDate: date }))}
                            selectsEnd
                            startDate={rentalDates.startDate}
                            endDate={rentalDates.endDate}
                            minDate={rentalDates.startDate}
                            maxDate={new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)} // 1 year from now
                            dateFormat="MMM dd, yyyy"
                            className="block w-full px-4 py-3 text-gray-900 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                            placeholderText="Select end date"
                          />
                          <CalendarIcon className="h-5 w-5 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                        </div>
                      </div>
                      
                      {rentalDates.startDate && rentalDates.endDate && (
                        <div className="mt-4 p-3 bg-white rounded-lg border border-indigo-200">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-indigo-700">
                                {rentalDates.startDate.toLocaleDateString()} - {rentalDates.endDate.toLocaleDateString()}
                              </p>
                              <p className="text-xs text-indigo-600 mt-1">Rental Period Selected</p>
                            </div>
                            <div className="text-right">
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-700 border border-indigo-200">
                                {calculateRentalDays()} {calculateRentalDays() === 1 ? "Day" : "Days"}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className="bg-white border-2 border-gray-100 rounded-xl p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="p-2 rounded-xl bg-green-50">
                        <CreditCardIcon className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Order Summary</h3>
                        <p className="text-sm text-gray-600">Review your rental details</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {cartItems.map((item) => (
                        <div key={item._id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                          <div className="flex-1">
                            <span className="text-gray-900 font-medium">{item.productId.name}</span>
                            <span className="text-gray-500 ml-2">× {item.quantity}</span>
                          </div>
                          <span className="font-semibold text-gray-900">
                            ₹{(item.productId.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                      
                      <div className="border-t border-gray-200 pt-4 space-y-2">
                        <div className="flex justify-between text-gray-600">
                          <span>Subtotal:</span>
                          <span>₹{calculateSubtotal().toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                          <span>Duration:</span>
                          <span>{calculateRentalDays()} day{calculateRentalDays() !== 1 ? "s" : ""}</span>
                        </div>
                        <div className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t border-gray-200">
                          <span>Total Amount:</span>
                          <span className="text-green-600">₹{calculateTotal()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Visible confirmation of coordinates to be saved */}
            {userLocation.lat && userLocation.lng && (
              <div className="my-4 p-3 rounded-lg bg-green-50 border border-green-300 text-green-800 text-sm flex items-center">
                <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 11c0 1.104-.896 2-2 2s-2-.896-2-2 .896-2 2-2 2 .896 2 2zm0 0c0 2.21-1.79 4-4 4s-4-1.79-4-4 1.79-4 4-4 4 1.79 4 4zm0 0c0 2.21 1.79 4 4 4s4-1.79 4-4-1.79-4-4-4-4 1.79-4 4z" /></svg>
                <span>
                  <b>Location to be saved:</b> Latitude <b>{userLocation.lat.toFixed(6)}</b>, Longitude <b>{userLocation.lng.toFixed(6)}</b>
                </span>
              </div>
            )}

            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {isSubmitting ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Processing...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <CreditCardIcon className="h-5 w-5" />
                    <span>Proceed to Payment</span>
                  </div>
                )}
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;
