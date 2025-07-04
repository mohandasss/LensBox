import axios from "axios";

const API_URL = "http://localhost:5000/api/products";
const axiosinstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});


export const getHeroProducts = async () => {
    const response = await axiosinstance.get("/");  
    if (response.data) {
       // Sort products by createdAt in descending order and get top 7
       const sortedProducts = [...response.data]
         .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
         .slice(0, 7);
       console.log("Top 7 Recent Products:", sortedProducts);
       return sortedProducts;
    }
    return [];
};


export const getProducts = async () => {
    const response = await axiosinstance.get("/");  
    if (response.data) {
       console.log(response.data);
       return response.data;
       
    }
    return response.data;

};

export const searchProducts = async (selectedCategory, searchTerm) => {
  try {
    const response = await axiosinstance.post('/search', {
      searchTerm,
      selectedCategory
    });
    
    console.log("search response", response.data);
    
    // Return the data array or empty array if not found
    return response.data || [];
  } catch (error) {
    console.error('Search API error:', error);
    return []; // Return empty array on error
  }
};

export const getProduct = async (id) => {
  const response = await axiosinstance.get(`/${id}`);
  if (response.data) {
    console.log(response.data);
    return response.data;
  }
  return response.data;
};

export const getProductsByCategory = async (category) => {
  try {
    const response = await axiosinstance.get(`/category/${category}`);
    if (response.data) {
      console.log(response.data);
      return response.data;
    }
    return [];
  } catch (error) {
    console.error('Error fetching products by category:', error);
    return [];
  }
};

export const getSellerInfo = async (productId) => {
  try {
    const response = await axiosinstance.get(`/${productId}/seller`);
    if (response.data) {
      return response.data;
    }
    return null;
  } catch (error) {
    console.error('Error fetching seller info:', error);
    throw error;
  }
};

export const getRelatedProducts = async (productId) => {
  try {
    const response = await axiosinstance.get(`/${productId}/related`);
    if (response.data && response.data.data) {
      return response.data.data;
    }
    return [];
  } catch (error) {
    console.error('Error fetching related products:', error);
    return [];
  }
};

export default { 
  getProducts, 
  searchProducts, 
  getProduct, 
  getProductsByCategory, 
  getSellerInfo,
  getRelatedProducts
};
