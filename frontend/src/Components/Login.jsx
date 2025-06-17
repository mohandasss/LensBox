import { Link, useNavigate } from "react-router-dom";
import { FaGoogle, FaApple, FaFacebook } from "react-icons/fa";
import { login } from "../APIs/AuthAPI";
import React, { useRef, useEffect, useState } from "react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await login({ email, password });
      console.log(response);
      navigate("/");
    } catch (error) {
      setError(error.response.data.message);
    } finally {
      setLoading(false);
    }
  };

  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;

    if (!video) return;

    // Set initial start time at 3s
    video.currentTime = 20;

    // Play once metadata is loaded
    const handleLoaded = () => {
      video.play();
    };

    // Loop back to 3s when reaching 33s
    const handleTimeUpdate = () => {
      if (video.currentTime >= 43) {
        video.currentTime = 20;
        video.play(); // Ensure continuous playback
      }
    };

    video.addEventListener("loadedmetadata", handleLoaded);
    video.addEventListener("timeupdate", handleTimeUpdate);

    return () => {
      video.removeEventListener("loadedmetadata", handleLoaded);
      video.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, []);

  const navigate = useNavigate();
  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* 🔁 Background Video */}
      <video
        ref={videoRef}
        muted
        className="absolute top-0 left-0 w-full h-full object-cover z-0"
        playsInline
      >
        <source
          src="https://res.cloudinary.com/dk5gtjb3k/video/upload/v1750170682/mvpxxk2fdmzwyzgxp7kz.mp4"
          type="video/mp4"
        />
      </video>

      {/* 🔲 Dark Overlay */}
      <div className="absolute top-0 left-0 w-full h-full bg-black/60 z-10" />

      {/* 📦 Login Card */}
      <div className="relative z-20 flex justify-center items-center h-full px-4">
        <div className="w-full max-w-md bg-white shadow-2xl rounded-lg p-8">
          <h2 className="text-4xl font-extrabold text-center mb-4 text-gray-800">
            Login
          </h2>
          <p className="text-center mb-8 font-medium text-gray-700">
            Enter your details to sign in to your account
          </p>

          <form onSubmit={handleLogin}>
            <div className="mb-6">
              <label
                htmlFor="email"
                className="block mb-2 font-medium text-gray-700"
              >
                Email
              </label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                id="email"
                className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="mb-6">
              <label
                htmlFor="password"
                className="block mb-2 font-medium text-gray-700"
              >
                Password
              </label>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                id="password"
                className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              className="w-full p-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition duration-300 mb-6"
            >
              Sign in
            </button>

            <div className="text-center mb-6 text-gray-600">
              — Or Sign in with —
            </div>

            <div className="flex justify-center space-x-6 mb-6">
              <button className="p-3 rounded-full border border-gray-300 hover:bg-gray-100 transition duration-300">
                <FaGoogle className="text-red-500" />
              </button>
              <button className="p-3 rounded-full border border-gray-300 hover:bg-gray-100 transition duration-300">
                <FaApple className="text-black" />
              </button>
              <button className="p-3 rounded-full border border-gray-300 hover:bg-gray-100 transition duration-300">
                <FaFacebook className="text-blue-600" />
              </button>
            </div>

            <p className="text-center text-gray-700">
              Don&apos;t have an account?{" "}
              <Link to="/register" className="text-blue-500 hover:underline">
                Register Now
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
