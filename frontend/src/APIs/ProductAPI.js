import axios from "axios";

const API_URL = "http://localhost:5000/api/products";
const axiosinstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const getProducts = async () => {
    const response = await axiosinstance.get("/");  
    if (response.data) {
       console.log(response.data);
       return response.data;
       
    }
    return response.data;

};


export default getProducts;
