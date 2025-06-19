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
    localStorage.setItem("token", response.data.token);
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
  try {
    const response = await axiosinstance.post("/login", userData);
    localStorage.setItem("token", response.data.token);
    return response.data;
  } catch (error) {
    throw error;
  }
};

  
const updateUser = async (token, updatedData) => {
  try {
    const response = await axiosinstance.put("/updateprofile", updatedData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const deleteUser = async (userId) => {
  try {
    const response = await axiosinstance.delete(`/deleteuser/${userId}`);
    return response;
  } catch (error) {
    console.log(error);
    throw error;
  }
};






const verifyToken = async (token) => {
  try {
    const response = await axiosinstance.get("/check", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.log(error);

    throw error;
  }
};

export { register, login, updateUser, deleteUser, verifyToken };
