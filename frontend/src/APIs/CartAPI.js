import axios from "axios";

const API_URL = `${process.env.REACT_APP_BACKEND_BASE_API}/api/cart`;
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

export const addToCart = async (productId, quantity, userId) => {
  console.log( "data idhar hai",  productId, quantity, userId);
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


export const RemoveCartItem = async (userId, productId) => {
  console.log(userId, productId);
  const response = await axiosInstance.delete(`/${userId}/${productId}`);
  console.log(response.data);

  return response.data;
}

export const updateCartItem = async (userId, productId, quantity) => {
  try {
    console.log('Updating cart item:', { userId, productId, quantity });
    
    if (!userId || !productId || quantity == null) {
      throw new Error('Missing required fields for cart update');
    }

    const response = await axiosInstance.put(`/${userId}/${productId}`, {
      quantity: Number(quantity)
    });
    
    console.log('Update cart response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error updating cart item:', {
      error: error.response?.data || error.message,
      status: error.response?.status
    });
    throw error;
  }
};

export const clearCart = async (userId) => {
  try {
    const response = await axiosInstance.delete(`/${userId}`);
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Error clearing cart:", error);
    throw error;
  }
}


