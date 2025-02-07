import React from "react";
import { Link } from "react-router-dom";
import { FaGoogle, FaApple, FaFacebook } from "react-icons/fa";

const Login = () => {
  return (
    <div className="flex justify-center items-center h-screen bg-gradient-to-r from-blue-500 to-purple-600">
      <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-8">
        <h2 className="text-4xl font-extrabold text-center mb-4 text-gray-800">Login</h2>
        <p className="text-center mb-8 font-medium text-gray-700">
          Enter your details to sign in to your account
        </p>
        <form>
          <div className="mb-6">
            <label
              htmlFor="email"
              className="block mb-2 font-medium text-gray-700"
            >
              Email
            </label>
            <input
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
          <div className="text-center mb-6 text-gray-600">— Or Sign in with —</div>
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
            Don't have an account?{" "}
            <Link to="/register" className="text-blue-500 hover:underline">
              Register Now
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
