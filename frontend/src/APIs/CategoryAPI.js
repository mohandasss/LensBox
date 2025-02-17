import axios from "axios";

const API_URL = "http://localhost:5000/api/categories";
const axiosinstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const getCategoriesById = async (id) => {
  const response = await axiosinstance.get(`/${id}`);
  if (response.data) {
    return response.data;
  }
  else {
    return response.data;
  }
};


