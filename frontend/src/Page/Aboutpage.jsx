import React from "react";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
const Aboutpage = () => {
  return (
    <div className="min-h-screen bg-black">
      <Navbar bgBlack={true}/>
      <section className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">About LensBox</h1>
          <p className="text-lg text-gray-300 font-light max-w-2xl mx-auto">Your trusted partner for camera and lens rentals since 2015. We empower creators with the best equipment and a seamless rental experience.</p>
        </div>
        {/* Optional: Brand/Hero Image */}
        <div className="flex justify-center mb-12">
          <img src="https://res.cloudinary.com/dk5gtjb3k/image/upload/v1739017410/b860c48c-4c14-4593-8b8e-850dd8a859dc_wyucmb.jpg" alt="LensBox" className="w-40 h-40 object-cover rounded-2xl shadow-md border border-gray-100" />
        </div>
        <div className="space-y-12">
          <section>
            <h2 className="text-xl font-semibold text-white mb-2">Our Journey</h2>
            <p className="text-gray-300 text-base leading-relaxed">Founded in 2015, LensBox began with a simple vision: to make high-quality camera equipment accessible to everyone. From a small operation to a nationwide service, we now serve thousands of creators every month with the latest gear and flexible rental plans.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-white mb-2">Achievements</h2>
            <ul className="list-disc pl-5 text-gray-300 space-y-2 text-base">
              <li><strong>10,000+ Satisfied Customers:</strong> Trusted by photographers, videographers, and hobbyists across India.</li>
              <li><strong>Nationwide Reach:</strong> Serving all major cities and remote locations.</li>
              <li><strong>Innovative Rental Models:</strong> Hourly, daily, and weekly plans tailored to your needs.</li>
              <li><strong>Streamlined Experience:</strong> Book, pay, and schedule online in minutes.</li>
            </ul>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-white mb-2">Awards & Recognition</h2>
            <ul className="list-disc pl-5 text-gray-300 space-y-2 text-base">
              <li><strong>Best Equipment Rental Service 2019</strong> – Indian Photography Awards</li>
              <li><strong>Most Innovative Rental Company 2020</strong> – CreativeLens India</li>
              <li><strong>Top Industry Leader 2021</strong> – National Photography Guild</li>
            </ul>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-white mb-2">Our Vision</h2>
            <p className="text-gray-300 text-base leading-relaxed">We're committed to expanding our offerings, driving sustainability, and introducing new features like AI-powered recommendations to help you find the perfect gear for every project.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-white mb-2">Contact Us</h2>
            <ul className="list-none text-gray-300 space-y-2 text-base">
              <li><strong>Email:</strong> support@lensbox.com</li>
              <li><strong>Phone:</strong> +91-XXXX-XXXXXX</li>
              <li><strong>Address:</strong> 123 LensBox Street, Kolkata, West Bengal</li>
            </ul>
          </section>
        </div>
      </section>
      <Footer/>
    </div>
  );
};

export default Aboutpage;
