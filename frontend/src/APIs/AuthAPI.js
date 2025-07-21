import axios from "axios";

const API_URL = `${process.env.REACT_APP_BACKEND_BASE_API}/api/auth`;
const axiosinstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const register = async (submissionData) => {
  try {
    const response = await axiosinstance.post("/register", submissionData,{
       headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    console.log(response);
    
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

const uploadAvatar = async (formData, token) => {
  try {
    const response = await axiosinstance.put(`/uploadavatar`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        "Authorization": `Bearer ${token}`
      }
    });

    return response.data; // this contains the profilePic or whatever the backend sends
  } catch (error) {
    console.log("Upload avatar error:", error);
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

// OTP Registration endpoints
const requestRegisterOtp = async (userData) => {
  try {
    const response = await axiosinstance.post("/register/request-otp", userData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const verifyRegisterOtp = async (otpData) => {
  try {
    const response = await axiosinstance.post("/register/verify-otp", otpData);
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
    }
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Forgot Password endpoints
const requestForgotOtp = async (email) => {
  try {
    const response = await axiosinstance.post("/forgot/request-otp", { email });
    return response.data;
  } catch (error) {
    throw error;
  }
};

const verifyForgotOtp = async (email, otp) => {
  try {
    const response = await axiosinstance.post("/forgot/verify-otp", { email, otp });
    return response.data;
  } catch (error) {
    throw error;
  }
};

const resetPassword = async (email, otp, newPassword) => {
  try {
    const response = await axiosinstance.post("/forgot/reset-password", { 
      email, 
      otp, 
      newPassword 
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export { 
  register, 
  login, 
  updateUser, 
  deleteUser, 
  verifyToken, 
  uploadAvatar,
  requestRegisterOtp,
  verifyRegisterOtp,
  requestForgotOtp,
  verifyForgotOtp,
  resetPassword
};
