import React, { useState } from "react";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import { motion } from "framer-motion";

const ContactPage = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [feedbackType, setFeedbackType] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFeedback("");
    setFeedbackType("");
    try {
      const res = await fetch("/api/mail/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, message })
      });
      const data = await res.json();
      if (data.success) {
        setFeedback("Message sent successfully!");
        setFeedbackType("success");
        setEmail("");
        setMessage("");
      } else {
        setFeedback(data.message || "Failed to send message.");
        setFeedbackType("error");
      }
    } catch (err) {
      setFeedback("Failed to send message. Please try again later.");
      setFeedbackType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <Navbar bgBlack={true} />
      <div className="flex flex-col items-center justify-center py-20 px-4 md:px-8 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-light text-white mb-4 tracking-tight">Get in Touch</h1>
          <div className="w-12 h-0.5 bg-violet-600 mx-auto mb-6"></div>
          <p className="text-lg text-gray-300 font-light">We'd love to hear from you</p>
        </div>
        {/* Contact Form */}
        <form className="w-full max-w-lg bg-white p-10 rounded-2xl border border-gray-100 shadow-md" onSubmit={handleSubmit}>
          <div className="mb-8">
            <label className="block text-xs font-medium text-gray-700 mb-3 tracking-widest uppercase" htmlFor="email">
              Email Address
            </label>
            <input
              className="w-full p-4 bg-white text-gray-900 border-0 border-b border-gray-200 focus:border-violet-600 focus:outline-none transition-all duration-300 text-lg font-light placeholder-gray-400"
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div className="mb-10">
            <label className="block text-xs font-medium text-gray-700 mb-3 tracking-widest uppercase" htmlFor="message">
              Message
            </label>
            <textarea
              className="w-full p-4 bg-white text-gray-900 border-0 border-b border-gray-200 focus:border-violet-600 focus:outline-none transition-all duration-300 h-32 resize-none text-lg font-light placeholder-gray-400"
              id="message"
              placeholder="Tell us what's on your mind..."
              value={message}
              onChange={e => setMessage(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          {feedback && (
            <div className={`mb-6 text-center text-${feedbackType === 'success' ? 'green' : 'red'}-600 font-medium`}>
              {feedback}
            </div>
          )}
          <div className="text-center">
            <button
              className="w-full py-4 px-8 bg-violet-600 text-white font-medium tracking-widest uppercase text-xs rounded-full hover:bg-violet-700 transition-all duration-300 disabled:opacity-60"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send Message'}
            </button>
          </div>
        </form>
      </div>
      <Footer />
    </div>
  );
};

export default ContactPage;