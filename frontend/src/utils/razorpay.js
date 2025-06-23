/**
 * Loads the Razorpay script dynamically
 * @returns {Promise<boolean>} Returns true if loaded successfully
 */
export const loadRazorpay = () => {
  return new Promise((resolve) => {
    // Check if Razorpay is already loaded
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    // Create script element
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    
    script.onload = () => {
      if (window.Razorpay) {
        resolve(true);
      } else {
        console.error('Razorpay SDK not available after loading');
        resolve(false);
      }
    };
    
    script.onerror = () => {
      console.error('Failed to load Razorpay SDK');
      resolve(false);
    };
    
    // Add script to the document
    document.body.appendChild(script);
  });
};

/**
 * Formats amount to paise (smallest currency unit)
 * @param {number} amount - Amount in rupees
 * @returns {number} Amount in paise
 */
export const formatAmount = (amount) => {
  return Math.round(parseFloat(amount) * 100);
};
