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
} from "@heroicons/react/24/outline";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { createOrder, verifyPayment } from "../APIs/CheckoutAPI";
import { loadRazorpay, formatAmount } from "../utils/razorpay";
import { verifyToken } from "../APIs/AuthAPI";

import { clearCart } from "../APIs/CartAPI";
import PaymentSuccess from "./PaymentSuccess";
import { AnimatePresence } from "framer-motion";

const CheckoutModal = ({
  isOpen,
  onClose,
  cartItems,
  onCheckout,
  initialValues = {},
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const [paymentError, setPaymentError] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  console.log(orderDetails);
  // Initialize form data with proper defaults
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

  // Initialize dates with proper defaults
  const [dates, setDates] = useState({
    startDate: null,
    endDate: null,
  });

  const [errors, setErrors] = useState({});

  // Update form data when initialValues change (only once when component mounts or initialValues change)
  useEffect(() => {
    if (initialValues && Object.keys(initialValues).length > 0) {
      setFormData((prev) => ({
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

      if (initialValues.startDate || initialValues.endDate) {
        setDates({
          startDate: initialValues.startDate
            ? new Date(initialValues.startDate)
            : null,
          endDate: initialValues.endDate
            ? new Date(initialValues.endDate)
            : null,
        });
      }
    }
  }, [initialValues]);

  // Custom Input Component - Memoized to prevent re-renders
  const InputField = React.memo(
    ({
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
    }) => (
      <div className={`mb-4 ${className}`}>
        <div className="relative">
          {Icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Icon
                className={`h-5 w-5 ${
                  error ? "text-red-500" : "text-gray-400"
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
            className={`block w-full ${
              Icon ? "pl-10" : "pl-3"
            } pr-3 py-3 border-0 border-b-2 ${
              error ? "border-red-500" : "border-gray-200 hover:border-gray-300"
            } focus:border-indigo-600 focus:ring-0 sm:text-sm transition-colors duration-200 bg-transparent`}
            {...props}
          />
        </div>
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    )
  );

  // Memoized input change handler to prevent unnecessary re-renders
  const handleInputChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));

      // Clear error for this field when user starts typing
      if (errors[name]) {
        setErrors((prev) => ({
          ...prev,
          [name]: "",
        }));
      }
    },
    [errors]
  );

  const validateStep1 = useCallback(() => {
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

  const handleNext = useCallback(() => {
    if (currentStep === 1 && !validateStep1()) {
      return;
    }
    if (currentStep === 2 && (!dates.startDate || !dates.endDate)) {
      setError("Please select both start and end dates");
      return;
    }

    setError(""); // Clear any previous errors
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  }, [currentStep, validateStep1, dates]);

  const handlePrevious = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setError(""); // Clear errors when going back
    }
  }, [currentStep]);

  const handleDateChange = useCallback(
    (field, date) => {
      setDates((prev) => ({
        ...prev,
        [field]: date,
      }));

      // Clear error when dates are selected
      if (error && date) {
        setError("");
      }
    },
    [error]
  );

  const calculateRentalDays = useCallback(() => {
    if (!dates.startDate || !dates.endDate) return 0;
    const diffTime = Math.abs(dates.endDate - dates.startDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end days
  }, [dates.startDate, dates.endDate]);

  const calculateSubtotal = useCallback(() => {
    return cartItems.reduce((total, item) => {
      return total + parseFloat(item.productId.price) * item.quantity;
    }, 0);
  }, [cartItems]);

  const calculateTotal = useCallback(() => {
    const days = calculateRentalDays();
    return (calculateSubtotal() * days).toFixed(2);
  }, [calculateRentalDays, calculateSubtotal]);

  const handleSubmit = async () => {
    if (currentStep !== 3) return;

    setIsSubmitting(true);
    setError("");
    setPaymentError("");

    try {
      const { user } = await verifyToken(localStorage.getItem("token"));
      console.log("user data", user._id);

      // 1. Create order in your backend
      const orderData = {
        ...formData,
        startDate: dates.startDate,
        endDate: dates.endDate,
        total: calculateTotal(),
        userId: user._id,
        items: cartItems.map((item) => ({
          productId: item.productId._id,
          quantity: item.quantity,
          amount: item.productId.price,
        })),
      };

      console.log("🚀 Creating order with data:", orderData);
      const response = await createOrder(orderData);
      console.log("✅ Order created successfully:", response);

      // 2. Load Razorpay script
      const isRazorpayLoaded = await loadRazorpay();
      if (!isRazorpayLoaded) {
        throw new Error("Failed to load payment gateway. Please try again.");
      }

      console.log("✅ Razorpay loaded successfully");

      // 3. Initialize Razorpay checkout
      const options = {
        key: config.RAZORPAY_KEY_ID,
        amount: formatAmount(calculateTotal()),
        currency: "INR",
        name: "LensBox",
        description: "Camera Equipment Rental",
        order_id: response.razorpayOrderId,
        handler: async function (razorpayResponse) {
          try {
            console.log("💳 Payment response received:", razorpayResponse);

            // Prepare verification data
            const verificationData = {
              razorpay_order_id: razorpayResponse.razorpay_order_id,
              razorpay_payment_id: razorpayResponse.razorpay_payment_id,
              razorpay_signature: razorpayResponse.razorpay_signature,
            };

            console.log("📤 Sending verification data:", verificationData);

            // 4. Verify payment on your server
            const verificationResponse = await verifyPayment(verificationData);
            console.log(
              "✅ Payment verification successful:",
              verificationResponse
            );
            console.log("orderDetails", orderDetails);

            // 5. Clear cart and update state
            const clearCartResponse = await clearCart(user._id);
            console.log("Cart cleared successfully:", clearCartResponse);

            // 6. Set order details for success popup
            setOrderDetails({
              orderId: verificationResponse.orderId,
              amount: calculateTotal(),
            });
              console.log("paymentConfirmation", verificationResponse.orderId);
              paymentConfirmation(verificationResponse.orderId);
            // 7. Show success popup

            // 8. Close modal after a short delay
            // 1. First show the success popup
            setPaymentSuccess(true);
            console.log("orderId", response.order.id);
            
            
            // 2. Set up cleanup and navigation
            const timer = setTimeout(() => {
              onClose();
              navigate("/orders");
            }, 4000);

            // 3. Return cleanup function to clear the timeout if component unmounts
            return () => clearTimeout(timer);
          } catch (error) {
            console.error("❌ Payment verification failed:", error);
            setPaymentError(
              "Payment verification failed. Please contact support with payment ID: " +
                (razorpayResponse.razorpay_payment_id || "N/A")
            );
          } finally {
            setIsSubmitting(false);
          }
        },
        prefill: {
          name: formData.fullName,
          email: formData.email || "",
          contact: formData.phone,
        },
        theme: {
          color: "#4f46e5",
        },
        modal: {
          ondismiss: function () {
            console.log("⚠️ Payment modal dismissed by user");
            setIsSubmitting(false);
          },
        },
      };

      console.log("🎯 Opening Razorpay checkout");

      // 6. Open Razorpay checkout
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("❌ Error during checkout:", error);
      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to process payment. Please try again."
      );
      setIsSubmitting(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-2">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 rounded-full bg-indigo-50">
          <UserIcon className="h-6 w-6 text-indigo-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900">
          Shipping Information
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

      <InputField
        id="addressLine1"
        name="addressLine1"
        label="Street Address"
        value={formData.addressLine1}
        onChange={handleInputChange}
        error={errors.addressLine1}
        icon={HomeIcon}
      />

      <InputField
        id="addressLine2"
        name="addressLine2"
        label="Landmark (Optional)"
        value={formData.addressLine2}
        onChange={handleInputChange}
        icon={MapPinIcon}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <InputField
          id="city"
          name="city"
          label="City"
          value={formData.city}
          onChange={handleInputChange}
          error={errors.city}
          icon={MapPinIcon}
        />
        <InputField
          id="state"
          name="state"
          label="State"
          value={formData.state}
          onChange={handleInputChange}
          error={errors.state}
          icon={MapIcon}
        />
        <InputField
          id="zipCode"
          name="zipCode"
          label="ZIP Code"
          value={formData.zipCode}
          onChange={handleInputChange}
          error={errors.zipCode}
          icon={MapPinIcon}
        />
      </div>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MapPinIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
        </div>
        <select
          id="country"
          name="country"
          value={formData.country}
          onChange={handleInputChange}
          className="block w-full pl-10 pr-3 py-3 border-0 border-b-2 border-gray-200 focus:border-indigo-600 focus:ring-0 sm:text-sm hover:border-gray-300 transition-colors duration-200 bg-transparent"
          disabled
        >
          <option>India</option>
        </select>
      </div>
    </div>
  );

  const renderStep2 = () => {
    const today = new Date();
    const maxDate = new Date();
    maxDate.setMonth(today.getMonth() + 3); // Allow selection up to 3 months in future

    return (
      <div className="space-y-8">
        <div className="space-y-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 rounded-full bg-indigo-50">
              <CalendarIcon className="h-5 w-5 text-indigo-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">
              Select Rental Period
            </h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Start Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  min={today.toISOString().split("T")[0]}
                  value={
                    dates.startDate
                      ? dates.startDate.toISOString().split("T")[0]
                      : ""
                  }
                  onChange={(e) => {
                    const date = e.target.value
                      ? new Date(e.target.value)
                      : null;
                    handleDateChange("startDate", date);
                  }}
                  className="block w-full px-4 py-3 text-sm text-gray-900 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:ring-indigo-400 focus:border-indigo-400 transition-all"
                />
                <CalendarIcon className="h-4 w-4 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                End Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  min={
                    dates.startDate
                      ? dates.startDate.toISOString().split("T")[0]
                      : today.toISOString().split("T")[0]
                  }
                  max={maxDate.toISOString().split("T")[0]}
                  value={
                    dates.endDate
                      ? dates.endDate.toISOString().split("T")[0]
                      : ""
                  }
                  onChange={(e) => {
                    const date = e.target.value
                      ? new Date(e.target.value)
                      : null;
                    handleDateChange("endDate", date);
                  }}
                  disabled={!dates.startDate}
                  className={`block w-full px-4 py-3 text-sm text-gray-900 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:ring-indigo-400 focus:border-indigo-400 transition-all ${
                    !dates.startDate ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                />
                <CalendarIcon
                  className={`h-4 w-4 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none ${
                    !dates.startDate ? "text-gray-300" : "text-gray-400"
                  }`}
                />
              </div>
            </div>
          </div>

          {dates.startDate && dates.endDate && (
            <div className="mt-4 p-3 bg-indigo-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-indigo-700">
                  {dates.startDate.toLocaleDateString()} -{" "}
                  {dates.endDate.toLocaleDateString()}
                </span>
                <span className="text-xs px-2 py-1 bg-white rounded-full text-indigo-600 font-medium">
                  {calculateRentalDays()}{" "}
                  {calculateRentalDays() === 1 ? "Day" : "Days"}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 pt-4">
          <h4 className="text-md font-medium text-gray-900 mb-2">
            Order Summary
          </h4>
          <div className="space-y-2">
            {cartItems.map((item) => (
              <div key={item._id} className="flex justify-between text-sm">
                <span>
                  {item.quantity} × {item.productId.name}
                </span>
                <span>
                  ₹{(item.productId.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
            <div className="border-t border-gray-200 pt-2 mt-2">
              <div className="flex justify-between font-medium">
                <span>Subtotal:</span>
                <span>₹{calculateSubtotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Rental Duration:</span>
                <span>
                  {calculateRentalDays()} day
                  {calculateRentalDays() !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
            <div className="border-t border-gray-200 pt-2">
              <div className="flex justify-between font-medium text-lg">
                <span>Total:</span>
                <span>₹{calculateTotal()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderStep3 = () => {
    const rentalDays = calculateRentalDays();
    const subtotal = calculateSubtotal();
    const total = calculateTotal();

    return (
      <div className="space-y-6">
        <h3 className="text-lg font-medium text-gray-900">Order Summary</h3>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Shipping Address</h4>
          <p className="text-sm">
            {formData.fullName}
            <br />
            {formData.addressLine1}
            {formData.addressLine2 && (
              <>
                <br />
                {formData.addressLine2}
              </>
            )}
            <br />
            {formData.city}, {formData.state} {formData.zipCode}
            <br />
            {formData.country}
            <br />
            {formData.phone}
          </p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Rental Period</h4>
          <p className="text-sm">
            {dates.startDate?.toLocaleDateString()} to{" "}
            {dates.endDate?.toLocaleDateString()}
            <br />({rentalDays} day{rentalDays !== 1 ? "s" : ""})
          </p>
        </div>

        <div className="border-t border-gray-200 pt-4">
          <h4 className="font-medium text-gray-900 mb-2">Order Details</h4>
          <div className="space-y-2">
            {cartItems.map((item) => (
              <div key={item._id} className="flex justify-between text-sm">
                <span>
                  {item.quantity} × {item.productId.name}
                </span>
                <span>
                  ₹{(item.productId.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
            <div className="border-t border-gray-200 pt-2 mt-2 space-y-1">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Rental Duration:</span>
                <span>
                  {rentalDays} day{rentalDays !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="flex justify-between font-medium text-lg pt-2 border-t border-gray-200 mt-2">
                <span>Total:</span>
                <span>₹{total}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div>
      {/* Payment Success Popup */}
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

      {/* Checkout Modal */}
      <div className="fixed inset-0 z-40 overflow-y-auto">
        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div
            className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
            aria-hidden="true"
            onClick={onClose}
          ></div>

          <span
            className="hidden sm:inline-block sm:align-middle sm:h-screen"
            aria-hidden="true"
          >
            &#8203;
          </span>

          <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="flex justify-between items-center mb-4">
                <h3
                  className="text-lg leading-6 font-medium text-gray-900"
                  id="modal-title"
                >
                  {currentStep === 1 && "Shipping Information"}
                  {currentStep === 2 && "Rental Dates"}
                  {currentStep === 3 && "Order Summary"}
                </h3>
                <button
                  type="button"
                  className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  onClick={onClose}
                >
                  <span className="sr-only">Close</span>
                  <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>

              {/* Progress Steps */}
              <div className="mb-6">
                <div className="flex justify-between">
                  {[1, 2, 3].map((step) => (
                    <div key={step} className="flex flex-col items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                        ${
                          currentStep >= step
                            ? "bg-indigo-600 text-white"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {step}
                      </div>
                      <span className="mt-1 text-xs text-gray-500">
                        {step === 1
                          ? "Address"
                          : step === 2
                          ? "Dates"
                          : "Summary"}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                  <div
                    className="bg-indigo-600 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${((currentStep - 1) / 2) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Error Display */}
              {(error || paymentError) && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">
                    {error || paymentError}
                  </p>
                </div>
              )}

              {/* Step Content */}
              <div className="mt-4 max-h-[60vh] overflow-y-auto pr-2 -mr-2">
                <div className="pr-2">{renderStepContent()}</div>
              </div>
            </div>

            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              {currentStep < 3 ? (
                <>
                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={isSubmitting}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "Loading..." : "Next"}
                  </button>
                  {currentStep > 1 && (
                    <button
                      type="button"
                      onClick={handlePrevious}
                      disabled={isSubmitting}
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Back
                    </button>
                  )}
                </>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Processing..." : "Proceed to Payment"}
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {currentStep === 1 ? "Cancel" : "Close"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;
