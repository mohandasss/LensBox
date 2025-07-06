import React, { useState, useEffect } from 'react';
import { X, Lock, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';

const PasswordResetModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  email = "user@example.com",
  loading = false,
  error = null
}) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
    }
  }, [isOpen]);

  const handleSubmit = () => {
    if (newPassword === confirmPassword && newPassword.length >= 8) {
      onSubmit?.(newPassword);
    }
  };

  const isPasswordValid = newPassword.length >= 8;
  const doPasswordsMatch = newPassword === confirmPassword && confirmPassword.length > 0;
  const canSubmit = isPasswordValid && doPasswordsMatch && newPassword !== '';

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
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-1">Reset Password</h3>
            <p className="text-sm text-gray-500">Create a new secure password</p>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pb-6">
          <div className="space-y-5">
            
            {/* Email Display */}
            <div className="bg-gray-50/80 backdrop-blur-sm rounded-2xl px-4 py-3 border border-gray-100">
              <div className="text-center">
                <span className="text-sm font-medium text-gray-700">{email}</span>
              </div>
            </div>

            {/* New Password */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 px-1">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-4 bg-gray-50/80 backdrop-blur-sm border border-gray-200 rounded-2xl focus:border-blue-500 focus:bg-white/90 focus:outline-none transition-all duration-300 text-gray-900 placeholder-gray-400"
                  placeholder="Enter new password"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              
              {newPassword && (
                <div className={`flex items-center space-x-2 px-1 transition-all duration-300 ${
                  isPasswordValid ? 'text-green-600' : 'text-red-500'
                }`}>
                  {isPasswordValid ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <AlertCircle className="w-4 h-4" />
                  )}
                  <span className="text-xs font-medium">
                    {isPasswordValid ? 'Strong password' : 'At least 8 characters required'}
                  </span>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 px-1">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-4 bg-gray-50/80 backdrop-blur-sm border border-gray-200 rounded-2xl focus:border-blue-500 focus:bg-white/90 focus:outline-none transition-all duration-300 text-gray-900 placeholder-gray-400"
                  placeholder="Confirm new password"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              
              {confirmPassword && (
                <div className={`flex items-center space-x-2 px-1 transition-all duration-300 ${
                  doPasswordsMatch ? 'text-green-600' : 'text-red-500'
                }`}>
                  {doPasswordsMatch ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <AlertCircle className="w-4 h-4" />
                  )}
                  <span className="text-xs font-medium">
                    {doPasswordsMatch ? 'Passwords match' : 'Passwords must match'}
                  </span>
                </div>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-2xl px-4 py-3 animate-pulse">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <span className="text-sm text-red-600 font-medium">{error}</span>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canSubmit || loading}
              className={`w-full py-4 px-6 rounded-2xl font-semibold text-white transition-all duration-300 ${
                canSubmit && !loading
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]'
                  : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Resetting Password...</span>
                </div>
              ) : (
                'Reset Password'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PasswordResetModal;