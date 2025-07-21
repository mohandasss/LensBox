import axios from "axios";

const API_URL = `${process.env.REACT_APP_BACKEND_BASE_API}/api/categories`;
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

export const getAllCategories = async () => {
  const response = await axiosinstance.get(`/`);
  if (response.data) {
    return response.data.categories;
  } else {
    return [];
  }
};


