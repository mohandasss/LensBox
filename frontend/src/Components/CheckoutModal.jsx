
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
} from "@heroicons/react/24/outline";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { createOrder, verifyPayment } from "../APIs/CheckoutAPI";
import { loadRazorpay, formatAmount } from "../utils/razorpay";
import { verifyToken } from "../APIs/AuthAPI";
import { clearCart } from "../APIs/CartAPI";
import PaymentSuccess from "./PaymentSuccess";
import { AnimatePresence } from "framer-motion";

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
    <div className={`mb-6 ${className}`}>
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
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [paymentError, setPaymentError] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);

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

  const [dates, setDates] = useState({
    startDate: null,
    endDate: null,
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

      if (initialValues.startDate || initialValues.endDate) {
        setDates({
          startDate: initialValues.startDate ? new Date(initialValues.startDate) : null,
          endDate: initialValues.endDate ? new Date(initialValues.endDate) : null,
        });
      }
    }
  }, [initialValues]);

  // Simple input change handler without debouncing
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

    setError("");
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  }, [currentStep, validateStep1, dates]);

  const handlePrevious = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setError("");
    }
  }, [currentStep]);

  const handleDateChange = useCallback((field, date) => {
    setDates((prev) => ({
      ...prev,
      [field]: date,
    }));

    if (error && date) {
      setError("");
    }
  }, [error]);

  const calculateRentalDays = useCallback(() => {
    if (!dates.startDate || !dates.endDate) return 0;
    const diffTime = Math.abs(dates.endDate - dates.startDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
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

           const paymentConfirmationResponse = await paymentConfirmation(verificationResponse.orderId);
           console.log("Payment Confirmation Response:", paymentConfirmationResponse);
            setPaymentSuccess(true);
            
            const timer = setTimeout(() => {
              onClose();
              navigate("/orders");
            }, 4000);

            return () => clearTimeout(timer);
          } catch (error) {
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
            setIsSubmitting(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
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
      <div className="flex items-center space-x-4 mb-8">
        <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100">
          <TruckIcon className="h-7 w-7 text-indigo-600" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Shipping Information</h3>
          <p className="text-gray-600 mt-1">Where should we deliver your equipment?</p>
        </div>
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
          placeholder="Enter your full name"
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
          placeholder="Enter your phone number"
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
        placeholder="Enter your street address"
      />

      <InputField
        id="addressLine2"
        name="addressLine2"
        label="Landmark (Optional)"
        value={formData.addressLine2}
        onChange={handleInputChange}
        icon={MapPinIcon}
        placeholder="Nearby landmark or apartment details"
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
          placeholder="Enter city"
        />
        <InputField
          id="state"
          name="state"
          label="State"
          value={formData.state}
          onChange={handleInputChange}
          error={errors.state}
          icon={MapIcon}
          placeholder="Enter state"
        />
        <InputField
          id="zipCode"
          name="zipCode"
          label="PIN Code"
          value={formData.zipCode}
          onChange={handleInputChange}
          error={errors.zipCode}
          icon={MapPinIcon}
          placeholder="6-digit PIN"
        />
      </div>

      <div className="mb-6">
        <label htmlFor="country" className="block text-sm font-semibold text-gray-700 mb-2">
          Country
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <MapPinIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </div>
          <select
            id="country"
            name="country"
            value={formData.country}
            onChange={handleInputChange}
            disabled
            className="block w-full pl-12 pr-4 py-3 text-gray-900 bg-gray-50 border-2 border-gray-200 rounded-xl cursor-not-allowed"
          >
            <option>India</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => {
    const today = new Date();
    const maxDate = new Date();
    maxDate.setMonth(today.getMonth() + 3);

    return (
      <div className="space-y-8">
        <div className="flex items-center space-x-4 mb-8">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100">
            <CalendarIcon className="h-7 w-7 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">Select Rental Period</h3>
            <p className="text-gray-600 mt-1">Choose your rental dates</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Start Date
            </label>
            <div className="relative">
              <input
                type="date"
                min={today.toISOString().split("T")[0]}
                value={dates.startDate ? dates.startDate.toISOString().split("T")[0] : ""}
                onChange={(e) => {
                  const date = e.target.value ? new Date(e.target.value) : null;
                  handleDateChange("startDate", date);
                }}
                className="block w-full px-4 py-3 text-gray-900 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
              <CalendarIcon className="h-5 w-5 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              End Date
            </label>
            <div className="relative">
              <input
                type="date"
                min={dates.startDate ? dates.startDate.toISOString().split("T")[0] : today.toISOString().split("T")[0]}
                max={maxDate.toISOString().split("T")[0]}
                value={dates.endDate ? dates.endDate.toISOString().split("T")[0] : ""}
                onChange={(e) => {
                  const date = e.target.value ? new Date(e.target.value) : null;
                  handleDateChange("endDate", date);
                }}
                disabled={!dates.startDate}
                className={`block w-full px-4 py-3 text-gray-900 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all ${
                  !dates.startDate ? "opacity-50 cursor-not-allowed bg-gray-50" : ""
                }`}
              />
              <CalendarIcon className={`h-5 w-5 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none ${
                !dates.startDate ? "text-gray-300" : "text-gray-400"
              }`} />
            </div>
          </div>
        </div>

        {dates.startDate && dates.endDate && (
          <div className="mt-6 p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl border border-indigo-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-indigo-700">
                  {dates.startDate.toLocaleDateString()} - {dates.endDate.toLocaleDateString()}
                </p>
                <p className="text-xs text-indigo-600 mt-1">Rental Period Selected</p>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white text-indigo-700 border border-indigo-200">
                  {calculateRentalDays()} {calculateRentalDays() === 1 ? "Day" : "Days"}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white border-2 border-gray-100 rounded-xl p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h4>
          <div className="space-y-3">
            {cartItems.map((item) => (
              <div key={item._id} className="flex justify-between items-center py-2">
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
        <div className="flex items-center space-x-4 mb-8">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100">
            <CheckIcon className="h-7 w-7 text-green-600" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">Order Summary</h3>
            <p className="text-gray-600 mt-1">Review your order before payment</p>
          </div>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
            <TruckIcon className="h-5 w-5 mr-2 text-gray-600" />
            Shipping Address
          </h4>
          <div className="text-gray-700 leading-relaxed">
            <p className="font-medium">{formData.fullName}</p>
            <p>{formData.addressLine1}</p>
            {formData.addressLine2 && <p>{formData.addressLine2}</p>}
            <p>{formData.city}, {formData.state} {formData.zipCode}</p>
            <p>{formData.country}</p>
            <p className="text-indigo-600 font-medium">{formData.phone}</p>
          </div>
        </div>

        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-6">
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
            <CalendarIcon className="h-5 w-5 mr-2 text-indigo-600" />
            Rental Period
          </h4>
          <div className="text-gray-700">
            <p className="font-medium">
              {dates.startDate?.toLocaleDateString()} to {dates.endDate?.toLocaleDateString()}
            </p>
            <p className="text-indigo-600 font-medium">
              ({rentalDays} day{rentalDays !== 1 ? "s" : ""})
            </p>
          </div>
        </div>

        <div className="bg-white border-2 border-gray-100 rounded-xl p-6">
          <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
            <CreditCardIcon className="h-5 w-5 mr-2 text-gray-600" />
            Order Details
          </h4>
          <div className="space-y-3">
            {cartItems.map((item) => (
              <div key={item._id} className="flex justify-between items-center py-2">
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
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Duration:</span>
                <span>{rentalDays} day{rentalDays !== 1 ? "s" : ""}</span>
              </div>
              <div className="flex justify-between text-2xl font-bold text-gray-900 pt-4 border-t-2 border-gray-200">
                <span>Total Amount:</span>
                <span className="text-green-600">₹{total}</span>
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
                  <h2 className="text-2xl font-bold text-gray-900">
                    {currentStep === 1 && "Shipping Information"}
                    {currentStep === 2 && "Rental Dates"}
                    {currentStep === 3 && "Order Summary"}
                  </h2>
                  <p className="text-gray-600 mt-1">
                    Step {currentStep} of 3
                  </p>
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

              {/* Progress Steps */}
              <div className="mb-8">
                <div className="flex justify-between items-center">
                  {[
                    { step: 1, label: "Address", icon: TruckIcon },
                    { step: 2, label: "Dates", icon: CalendarIcon },
                    { step: 3, label: "Payment", icon: CreditCardIcon }
                  ].map(({ step, label, icon: StepIcon }) => (
                    <div key={step} className="flex flex-col items-center relative">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold transition-all
                        ${currentStep >= step
                          ? "bg-indigo-600 text-white shadow-lg scale-110"
                          : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {currentStep > step ? (
                          <CheckIcon className="h-6 w-6" />
                        ) : (
                          <StepIcon className="h-6 w-6" />
                        )}
                      </div>
                      <span className={`mt-2 text-sm font-medium ${
                        currentStep >= step ? "text-indigo-600" : "text-gray-500"
                      }`}>
                        {label}
                      </span>
                      {step < 3 && (
                        <div className={`absolute top-6 -right-16 w-32 h-0.5 ${
                          currentStep > step ? "bg-indigo-600" : "bg-gray-200"
                        }`} />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Error Display */}
              {(error || paymentError) && (
                <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-xl">
                  <p className="text-sm text-red-700 font-medium">
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
