import axios from "axios";

const API_URL = `${process.env.REACT_APP_BACKEND_BASE_API}/api`;

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${localStorage.getItem("token")}`,
  },
})

export const subscribe = async (email) => {
  try {
    const response = await axiosInstance.post("/mail/welcome", { email });
    return response.data;
  } catch (error) {
    console.error("Error subscribing to newsletter:", error);
    throw error;
  }
};

export const paymentConfirmation = async (orderId) => {
  try {
    const response = await axiosInstance.post("/mail/purchase-confirmation", { orderId });
    return response.data;
  } catch (error) {
    console.error("Error subscribing to newsletter:", error);
    throw error;
  }
};
 



export const broadcastByAdmin = async(tittle, message)=>{
  try {
    const response = await axiosInstance.post("/mail/broadcast", { tittle, message });
    return response.data;
  } catch (error) {
    console.error("Error subscribing to newsletter:", error);
    throw error;
  }
}


