import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaGoogle, FaApple, FaFacebook } from "react-icons/fa";
import { register } from "../APIs/AuthAPI";
import PopUp from "../Components/PopUp";

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
  

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

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
      phone: formData.phone,
    };

    try {
      const response = await register(dataToSend);

      if (response.success) {
        setPopupMessage(response.message);
        setShowPopup(true);

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
      } else {
        
        setPopupMessage(response.message);
        setShowPopup(true);
      }
    } catch (error) {
      console.error(error);
     
      setPopupMessage("An error occurred. Please try again.");
      setShowPopup(true);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
          {["name", "email", "password", "phone", "city", "state", "zip", "country"].map((field) => (
            <div className="mb-2" key={field}>
              <label htmlFor={field} className="block mb-1 font-medium text-gray-700 capitalize">
                {field}
              </label>
              <input
                type={field === "email" ? "email" : field === "password" ? "password" : "text"}
                id={field}
                name={field}
                value={formData[field]}
                onChange={handleChange}
                className="w-full p-1.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          ))}

          <div className="flex justify-center">
            <button type="submit" className="w-1/2 p-3 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 transition duration-300 mb-2">
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
              {[FaGoogle, FaApple, FaFacebook].map((Icon, index) => (
                <button key={index} className="p-2 rounded-full border border-gray-300 hover:bg-gray-100 transition duration-300">
                  <Icon className={Icon === FaGoogle ? "text-red-500" : Icon === FaApple ? "text-black" : "text-blue-600"} />
                </button>
              ))}
            </div>
          </div>
        </form>
      </div>

      {showPopup && (
        <div className="fixed inset-0 flex justify-center items-center z-[9999]">
          <div className="fixed inset-0 bg-black opacity-70"></div>
          <div className="relative z-[10000]">
            <PopUp 
              message={popupMessage} 
              onClose={() => setShowPopup(false)} 
              showButton={true}
              duration={10000} 
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Register;
