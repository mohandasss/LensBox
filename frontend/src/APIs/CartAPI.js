import axios from "axios";

const API_URL = "http://localhost:5000/api/cart";
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

export const addToCart = async (productId, quantity, userId) => {
  console.log(productId, quantity, userId);
  const response = await axiosInstance.post(`/`, {
    productId,
    quantity,
    userId,
  });
  console.log(response.data);

  return response.data;
};

export const getCart = async (userId) => {
  try {
    const response = await axiosInstance.get(`/${userId}`);
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching cart:", error);
    throw error;
  }
};


export const RemoveCartItem = async (cartId, productId) => {
  console.log(cartId, productId);
  const response = await axiosInstance.delete(`/${cartId}/${productId}`);
  console.log(response.data);

  return response.data;
}

export const updateCartItem = async (cartId, productId, quantity) => {
  console.log(cartId, productId, quantity);
  const response = await axiosInstance.put(`/${cartId}/${productId}`, {
    quantity,
  });
  console.log(response.data);
  return response.data; 
}


