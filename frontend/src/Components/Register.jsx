import React from "react";
import { Link } from "react-router-dom";
import { FaGoogle, FaApple, FaFacebook } from "react-icons/fa";
import { useState } from "react";
import AuthAPI from "../APIs/AuthAPI";
import PopUp from "../Components/PopUp";
import { useNavigate } from "react-router-dom";
const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    city: "",
    state: "",
    zip: "",
    country: "",
    phone: "",
  });
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [popupTitle, setPopupTitle] = useState("");
  const [popupOnClose, setPopupOnClose] = useState(null);


  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Structure the data in the required format
    const dataToSend = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      address: {
        city: formData.city,
        state: formData.state,
        zip: formData.zip,
        country: formData.country,
      },
      phone: formData.phone, // Include phone in the request
    };
  
    console.log(dataToSend); // Log the structured data
  
    try {
      const response = await AuthAPI.register(dataToSend); // Send the structured data
  
      console.log(response);
      if (response.success) {
        console.log("Registration successful, redirecting to home...");
  
        // Clear form fields
        setFormData({
          name: "",
          email: "",
          password: "",
          city: "",
          state: "",
          zip: "",
          country: "",
          phone: "",
        });
  
        // Show success popup
        setShowPopup(true);
        setPopupMessage(response.message);
        setPopupTitle("Success");
  
        // Redirect to home page after 2 seconds
        setTimeout(() => {
          navigate("/"); // Redirect to the home page
        }, 2000);
      } else {
        console.log("Registration failed:", response.message);
        setShowPopup(true);
        setPopupMessage(response.message);
        setPopupTitle("Error");
      }
    } catch (error) {
      console.log(error);
      setShowPopup(true);
      setPopupMessage("An error occurred. Please try again.");
      setPopupTitle("Error");
    }
  };
  


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gradient-to-r from-green-500 to-teal-600">
      <div className="w-full max-w-2xl bg-white shadow-lg rounded-lg p-16">
        <h2 className="text-4xl font-extrabold text-center mb-2 text-gray-800">
          Register
        </h2>
        <p className="text-center mb-3 font-medium text-gray-700">
          Enter your details to create a new account
        </p>
        <form onSubmit={handleSubmit}>
          <div className="mb-2">
            <label
              htmlFor="name"
              className="block mb-1 font-medium text-gray-700"
            >
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-1.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div className="mb-2">
            <label
              htmlFor="email"
              className="block mb-1 font-medium text-gray-700"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-1.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div className="mb-2">
            <label
              htmlFor="password"
              className="block mb-1 font-medium text-gray-700"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-1.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div className="mb-2">
            <label
              htmlFor="phone"
              className="block mb-1 font-medium text-gray-700"
            >
              Phone
            </label>
            <input
              type="text"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full p-1.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div className="mb-2">
            <label
              htmlFor="city"
              className="block mb-1 font-medium text-gray-700"
            >
              City
            </label>
            <input
              type="text"
              id="city"
              name="city"
              value={formData.city}
              onChange={handleChange}
              className="w-full p-1.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div className="mb-2">
            <label
              htmlFor="state"
              className="block mb-1 font-medium text-gray-700"
            >
              State
            </label>
            <input
              type="text"
              id="state"
              name="state"
              value={formData.state}
              onChange={handleChange}
              className="w-full p-1.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div className="mb-2">
            <label
              htmlFor="zip"
              className="block mb-1 font-medium text-gray-700"
            >
              Zip
            </label>
            <input
              type="text"
              id="zip"
              name="zip"
              value={formData.zip}
              onChange={handleChange}
              className="w-full p-1.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div className="mb-2">
            <label
              htmlFor="country"
              className="block mb-1 font-medium text-gray-700"
            >
              Country
            </label>
            <input
              type="text"
              id="country"
              name="country"
              value={formData.country}
              onChange={handleChange}
              className="w-full p-1.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div className="flex justify-center">
            <button
              type="submit"
              className="w-1/2 pt-2 p-3 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 transition duration-300 mb-2"
            >
              Register
            </button>
          </div>
          <p className="text-center text-gray-700">
            Already have an account?{" "}
            <Link to="/login" className="text-green-500 hover:underline">
              Sign in
            </Link>
          </p>
          <div className="text-center mt-4">
            <p>Or Sign in with</p>
            <div className="flex justify-center space-x-2 pt-2">
              <button className="p-2 rounded-full border border-gray-300 hover:bg-gray-100 transition duration-300">
                <FaGoogle className="text-red-500" />
              </button>

              <button className="p-2 rounded-full border border-gray-300 hover:bg-gray-100 transition duration-300">
                <FaApple className="text-black" />
              </button>
              <button className="p-2 rounded-full border border-gray-300 hover:bg-gray-100 transition duration-300">
                <FaFacebook className="text-blue-600" />
              </button>
            </div>
          </div>
        </form>
      </div>
      {showPopup && (
        <div className="fixed inset-0 flex justify-center items-center">
            <PopUp
                title={popupTitle}
                message={popupMessage}
                onClose={popupOnClose}
            />
        </div>

      )}
    </div>



  );
};


export default Register;
