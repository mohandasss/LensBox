import axios from "axios";

const API_URL = "http://localhost:5000/api/subscribe";

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    
  },
})

export const subscribe = async (email) => {
  try {
    const response = await axiosInstance.post("/", { email });
    return response.data;
  } catch (error) {
    console.error("Error subscribing to newsletter:", error);
    throw error;
  }
};
