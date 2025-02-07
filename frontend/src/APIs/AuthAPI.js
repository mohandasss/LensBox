import axios from "axios";

const API_URL = "http://localhost:5000/api/auth";
const axiosinstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const register = async (userData) => {
  try {
    const response = await axiosinstance.post("/register", userData);
    return response.data;
  } catch (error) {
    if (error.response) {
      console.error("Server responded with a status:", error.response.status);
      console.error("Response data:", error.response.data);
    } else if (error.request) {
      console.error("No response received:", error.request);
    } else {
      console.error("Error setting up request:", error.message);
    }
    throw error; 
  }
};

const login = async (userData) => {
  const response = await axiosinstance.post("/login", userData);
  return response.data;
};

export default { register, login };

