import axios from "axios";

const API_URL = "http://localhost:5000/api/products";
const axiosinstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const getProducts = async () => {
    const response = await axiosinstance.get("/");  
    if (response.data) {
       console.log(response.data);
       return response.data;
       
    }
    return response.data;

};

export const searchProducts = async (searchParams) => {
  const response = await axiosinstance.post("/search", searchParams); 
  if (response.data) {
    console.log(response.data);
    return response.data;
  }
  return response.data;
};

export const getProduct = async (id) => {
  const response = await axiosinstance.get(`/${id}`);
  if (response.data) {
    console.log(response.data);
    return response.data;
  }
  return response.data;
};

export default { getProducts, searchProducts, getProduct };
