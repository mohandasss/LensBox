import React, { useState, useEffect, useRef } from 'react';
import { X, Mail, Clock, CheckCircle, AlertCircle, Shield, RotateCcw } from 'lucide-react';

const OtpModal = ({ 
  isOpen, 
  onClose, 
  onVerify, 
  email = "user@example.com", 
  title = "Enter OTP", 
  subtitle = "We've sent a 6-digit code to your email",
  loading = false,
  error = null,
  resendOtp = null,
  resendLoading = false
}) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [mounted, setMounted] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      setOtp(['', '', '', '', '', '']);
      setTimeLeft(600);
      setFocusedIndex(0);
      setTimeout(() => {
        if (inputRefs.current[0]) {
          inputRefs.current[0].focus();
        }
      }, 300);
    }
  }, [isOpen]);

  useEffect(() => {
    let timer;
    if (isOpen && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isOpen, timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return; // Only allow single digit
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
      setFocusedIndex(index + 1);
    }

    // Auto-submit when all digits are filled
    if (newOtp.every(digit => digit !== '') && index === 5) {
      setTimeout(() => handleSubmit(), 100);
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      setFocusedIndex(index - 1);
    }
  };

  const handleSubmit = () => {
    const otpString = otp.join('');
    if (otpString.length === 6) {
      onVerify?.(otpString);
    }
  };

  const handleResend = () => {
    if (resendOtp && timeLeft === 0) {
      resendOtp();
      setTimeLeft(600);
    }
  };

  const isOtpComplete = otp.every(digit => digit !== '');
  const isTimeExpired = timeLeft === 0;

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-500 ${
      mounted ? 'bg-black/40 backdrop-blur-md' : 'bg-black/0'
    }`}>
      <div className={`bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-sm transform transition-all duration-700 ${
        mounted ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4'
      } border border-white/20`}>
        
        {/* Header */}
        <div className="relative p-6 pb-4">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 w-8 h-8 rounded-full bg-gray-100/80 backdrop-blur-sm flex items-center justify-center hover:bg-gray-200/80 transition-all duration-300 hover:scale-110"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>
          
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-1">{title}</h3>
            <p className="text-sm text-gray-500">{subtitle}</p>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pb-6">
          {/* Email Display */}
          <div className="bg-gray-50/80 backdrop-blur-sm rounded-2xl px-4 py-3 border border-gray-100 mb-6">
            <div className="flex items-center justify-center space-x-2">
              <Mail className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">{email}</span>
            </div>
          </div>

          {/* OTP Input */}
          <div className="mb-6">
            <div className="flex justify-between gap-2 mb-4">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={el => inputRefs.current[index] = el}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onFocus={() => setFocusedIndex(index)}
                  className={`w-12 h-12 text-center text-lg font-bold bg-gray-50/80 backdrop-blur-sm border-2 rounded-xl transition-all duration-300 ${
                    focusedIndex === index
                      ? 'border-blue-500 bg-white/90 shadow-lg scale-105'
                      : digit
                      ? 'border-green-400 bg-green-50/80 text-green-700'
                      : 'border-gray-200 hover:border-gray-300'
                  } focus:outline-none`}
                  disabled={loading}
                />
              ))}
            </div>
          </div>

          {/* Timer */}
          <div className="flex items-center justify-center mb-6">
            <div className={`flex items-center space-x-2 px-4 py-2 rounded-full backdrop-blur-sm ${
              isTimeExpired ? 'bg-red-50/80 text-red-600' : 'bg-blue-50/80 text-blue-600'
            }`}>
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">
                {timeLeft > 0 ? `Expires in ${formatTime(timeLeft)}` : 'Code expired'}
              </span>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-2xl px-4 py-3 mb-4 animate-pulse">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <span className="text-sm text-red-600 font-medium">{error}</span>
              </div>
            </div>
          )}

          {/* Success Message */}
          {isOtpComplete && !error && !loading && (
            <div className="bg-green-50/80 backdrop-blur-sm border border-green-200 rounded-2xl px-4 py-3 mb-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm text-green-600 font-medium">Ready to verify!</span>
              </div>
            </div>
          )}

          {/* Resend Button */}
          {isTimeExpired && resendOtp && (
            <button
              onClick={handleResend}
              disabled={resendLoading}
              className="w-full py-3 px-4 mb-4 bg-gray-100/80 backdrop-blur-sm text-gray-700 font-medium rounded-2xl hover:bg-gray-200/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center space-x-2"
            >
              {resendLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <RotateCcw className="w-4 h-4" />
                  <span>Resend Code</span>
                </>
              )}
            </button>
          )}

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={!isOtpComplete || loading || isTimeExpired}
            className={`w-full py-4 px-6 rounded-2xl font-semibold text-white transition-all duration-300 ${
              isOtpComplete && !loading && !isTimeExpired
                ? 'bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]'
                : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Verifying...</span>
              </div>
            ) : (
              'Verify OTP'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OtpModal;
