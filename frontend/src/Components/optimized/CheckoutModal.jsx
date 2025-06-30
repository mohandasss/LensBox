import * as React from 'react';
import { useState, useEffect, useCallback, useMemo, memo } from "react";
import { useNavigate } from "react-router-dom";
import config from "../secretfront";
import { paymentConfirmation } from "../../APIs/SubscriberAPI";
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
import { createOrder, verifyPayment } from "../../APIs/CheckoutAPI";
import { loadRazorpay, formatAmount } from "../../utils/razorpay";
import { verifyToken } from "../../APIs/AuthAPI";
import { clearCart } from "../../APIs/CartAPI";
import PaymentSuccess from "./PaymentSuccess";

// Memoized Input Component
const InputField = memo(({ id, name, label, type = "text", value, onChange, error, icon: Icon, placeholder }) => (
  <div className="space-y-1">
    <label htmlFor={id} className="block text-sm font-medium text-gray-700">
      {label}
    </label>
    <div className="relative">
      {Icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon className="h-5 w-5 text-gray-400" aria-hidden="true" />
        </div>
      )}
      <input
        type={type}
        name={name}
        id={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`block w-full ${Icon ? 'pl-10' : 'pl-3'} pr-3 py-3 border-0 border-b-2 border-gray-200 focus:border-indigo-600 focus:ring-0 sm:text-sm hover:border-gray-300 transition-colors duration-200 bg-transparent`}
      />
    </div>
    {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
  </div>
));

const CheckoutModal = memo(({ isOpen, onClose, cartItems, onCheckout, initialValues = {} }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [paymentError, setPaymentError] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  
  // Form state
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

  // Date state
  const [dates, setDates] = useState({
    startDate: null,
    endDate: null,
  });

  const [errors, setErrors] = useState({});

  // Memoized handlers
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  const handleDateChange = useCallback((date, field) => {
    setDates(prev => ({
      ...prev,
      [field]: date
    }));
  }, []);

  // Navigation handlers
  const handleNext = useCallback(() => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
      setError("");
    }
  }, [currentStep]);

  const handlePrevious = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    setError("");
  }, []);

  // Validation function
  const validateCurrentStep = useCallback(() => {
    // Add validation logic here
    return true;
  }, [currentStep, formData, dates]);

  // Memoized step components
  const renderStep1 = useMemo(() => {
    return (
      <div className="space-y-2">
        {/* Step 1 content */}
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
          {/* Add other input fields */}
        </div>
      </div>
    );
  }, [formData, errors, handleInputChange]);

  // Add other step renders as useMemo
  const renderStep2 = useMemo(() => {
    // Step 2 implementation
    return <div>Step 2 Content</div>;
  }, [dates, handleDateChange]);

  const renderStep3 = useMemo(() => {
    // Step 3 implementation
    return <div>Step 3 Content</div>;
  }, [formData, dates]);

  // Memoized step content
  const stepContent = useMemo(() => {
    switch (currentStep) {
      case 1: return renderStep1;
      case 2: return renderStep2;
      case 3: return renderStep3;
      default: return null;
    }
  }, [currentStep, renderStep1, renderStep2, renderStep3]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          aria-hidden="true"
          onClick={onClose}
        />

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
          &#8203;
        </span>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
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
                        ${currentStep >= step ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-600"}`}
                    >
                      {step}
                    </div>
                    <span className="text-xs mt-1">
                      {step === 1 ? "Shipping" : step === 2 ? "Dates" : "Review"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="mt-4">
              {stepContent}
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            {currentStep < 3 ? (
              <>
                <button
                  type="button"
                  onClick={handleNext}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Next
                </button>
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={handlePrevious}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Previous
                  </button>
                )}
              </>
            ) : (
              <button
                type="button"
                onClick={handlePayment}
                disabled={isSubmitting}
                className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm ${
                  isSubmitting
                    ? 'bg-indigo-400 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500'
                }`}
              >
                {isSubmitting ? 'Processing...' : 'Complete Order'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

export default CheckoutModal;
