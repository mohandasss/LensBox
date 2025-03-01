import axios from "axios";

const API_URL = "http://localhost:5000/api/cart";
const axiosinstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const addToCart = async (productId, quantity) => {
    console.log(productId, quantity);
  const response = await axiosinstance.post(`/cart`, { productId, quantity });
  return response.data;
};

export const getCart = async () => {
  const response = await axiosinstance.get(`/cart`);
  return response.data;
};

