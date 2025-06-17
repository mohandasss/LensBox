import React, { useState,useRef ,useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaGoogle, FaApple, FaFacebook } from "react-icons/fa";
import { register } from "../APIs/AuthAPI";
import PopUp from "../Components/PopUp";
import Navbar from "./Navbar";

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
  
const videoRef = useRef(null);
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

   useEffect(() => {
    const video = videoRef.current;

    const handleTimeUpdate = () => {
      if (video.currentTime >= 30) {
        video.currentTime = 0;
        video.play();
      }
    };

    if (video) {
      video.addEventListener("timeupdate", handleTimeUpdate);
    }

    return () => {
      if (video) {
        video.removeEventListener("timeupdate", handleTimeUpdate);
      }
    };
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-black">
      <Navbar/>
   <div className="relative w-full h-screen overflow-hidden">
      {/* Background Video */}
      <video
        ref={videoRef}
        src="https://res.cloudinary.com/dk5gtjb3k/video/upload/v1750171067/mgz85nxfibtftw5m3oba.mp4"
        className="absolute top-0 left-0 w-full h-full object-cover"
        autoPlay
        loop
        muted
      ></video>

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-60"></div>

      {/* Register Card */}
      <div className="relative z-10 flex justify-center items-center h-[75vh] mt-[12.5vh] px-4">
        <div className="w-full max-w-3xl bg-white bg-opacity-90 shadow-2xl rounded-xl p-8 md:p-12 backdrop-blur-md">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-4">
            Register
          </h2>
          <p className="text-center text-gray-600 mb-6">
            Enter your details to create a new account
          </p>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {["name", "email", "password", "phone", "city", "state", "zip", "country"].map((field) => (
                <div key={field}>
                  <label htmlFor={field} className="block text-sm font-medium text-gray-700 capitalize mb-1">
                    {field}
                  </label>
                  <input
                    type={field === "email" ? "email" : field === "password" ? "password" : "text"}
                    id={field}
                    name={field}
                    value={formData[field]}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-center">
              <button type="submit" className="w-full md:w-1/2 py-3 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 transition duration-300 mb-4">
                Register
              </button>
            </div>

            <p className="text-center text-gray-700 text-sm">
              Already have an account?{" "}
              <Link to="/login" className="text-green-500 hover:underline font-medium">
                Sign in
              </Link>
            </p>

            <div className="text-center mt-5">
              <p className="text-sm text-gray-600 mb-2">Or Sign in with</p>
              <div className="flex justify-center gap-4">
                {[FaGoogle, FaApple, FaFacebook].map((Icon, index) => (
                  <button key={index} className="p-2 rounded-full border border-gray-300 hover:bg-gray-100 transition duration-300">
                    <Icon className={Icon === FaGoogle ? "text-red-500" : Icon === FaApple ? "text-black" : "text-blue-600"} />
                  </button>
                ))}
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Optional Popup */}
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
    </div>
  );
};

export default Register;
