import axios from "axios";

const API_URL = `${process.env.REACT_APP_BACKEND_BASE_API}/api/orders`;

const axiosinstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

// Get Orders
export const getOrders = async (userId) => {
  try {
    console.log("userId IS ", userId);

    const { data } = await axiosinstance.get(`/${userId}`);
    console.log(data.orders);

    return data.orders;
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
};

// Download Invoice
export const downloadInvoice = async (orderId) => {
    try {
      const response = await axiosinstance.get(`/${orderId}/invoice`, { // Make sure this matches your backend route
        responseType: "blob", // important for file downloads
      });
  
      console.log('Invoice download response:', response);
      
      // Create blob and download
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `invoice-${orderId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      // Clean up the URL object
      window.URL.revokeObjectURL(url);
      
      return { success: true };
    } catch (error) {
      console.error("Error downloading invoice:", error);
      throw error;
    }
  };
