import React from "react";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
const Aboutpage = () => {
  return (
    <div className="min-h-screen bg-black">
        <Navbar/>

      <div className="flex flex-col md:flex-row items-start justify-between max-w-7xl mx-auto px-4 py-12 gap-8">
        {/* Left Column - Text Content */}
        <div className="md:w-1/2 space-y-6">
          <h1 className="text-2xl font-bold mb-6 text-white font-['Playfair_Display'] leading-tight">
            ✨ About LensBox 📸
          </h1>
          <p className="text-gray-400 text-sm leading-relaxed font-['Inter']">
            Welcome to LensBox 🎯, your trusted partner for all things camera
            and lens rentals. Since our establishment in 2015, we have become
            one of the leading rental services for photographers 📸, filmmakers
            🎥, and enthusiasts alike. Whether you're capturing a special event,
            shooting a documentary, or simply exploring photography as a hobby,

            LensBox offers the finest camera equipment to elevate your craft.
          </p>

          <div>
            <h2 className="text-xl font-semibold mb-4 text-white font-['Playfair_Display']">
              🚀 Our Journey
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed font-['Inter']">
              Founded in 2015, LensBox began with a simple vision: to make
              high-quality camera equipment accessible to everyone, no matter
              their skill level or budget. What started as a small operation
              with just a handful of cameras has since evolved into a
              full-fledged, nationwide rental service catering to thousands of


              customers every month. Over the years, we've forged strong
              relationships with some of the most respected camera and lens
              manufacturers, ensuring that our customers have access to the
              latest and most advanced equipment. From DSLR cameras to
              cinema-grade lenses, we have it all. 🌟
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4 text-white font-['Playfair_Display']">
              🏆 Our Achievements
            </h2>
                <ul className="list-disc pl-5 text-gray-400 space-y-3 text-sm leading-relaxed font-['Inter']">



              <li>
                <strong>🎯 Thousands of Satisfied Customers:</strong> Over
                10,000 photographers, videographers, and hobbyists trust us.
              </li>
              <li>
                <strong>🗺️ Nationwide Reach:</strong> From the bustling streets
                of Kolkata to the serene landscapes of the North, LensBox is
                available across India.
              </li>
              <li>
                <strong>💡 Innovative Rental Models:</strong> With the
                introduction of flexible rental plans, we revolutionized the
                industry by offering hourly, daily, and weekly rental options,
                all tailored to suit individual needs.
              </li>
              <li>
                <strong>📱 Streamlined Experience:</strong> Our user-friendly
                website and mobile app allow you to book, pay, and schedule your
                rentals with just a few clicks.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4 text-white font-['Playfair_Display']">
              🌟 Awards & Recognition
            </h2>
            <ul className="list-disc pl-5 text-gray-400 space-y-3 text-sm leading-relaxed font-['Inter']">



              <li>
                <strong>🏆 Best Equipment Rental Service 2019</strong> – Awarded
                by the Indian Photography Awards for our exceptional customer
                service and quality.
              </li>
              <li>
                <strong>💫 Most Innovative Rental Company 2020</strong> –
                Recognized by CreativeLens India for our flexible pricing models
                and easy-to-use booking system.
              </li>
              <li>
                <strong>👑 Top Industry Leader 2021</strong> – Awarded by the
                National Photography Guild for setting new standards in the
                equipment rental space.
              </li>
            </ul>
          </div>

          <div>
                    <h2 className="text-xl font-semibold mb-4 text-white font-['Playfair_Display']">
              ✅Our Future Vision
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed font-['Inter']">



              Looking ahead, we aim to continue expanding our product offerings
              and reach, ensuring that LensBox remains at the forefront of the
              camera rental industry. We're committed to sustainability 🌱 and
              innovation 💡. We're working on introducing new features like an
              advanced AI recommendation engine to help customers choose the
              perfect equipment based on their needs.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4 text-white font-['Playfair_Display']">
              📞 Contact Us
            </h2>

            <p className="text-gray-400 text-sm leading-relaxed font-['Inter']">
              Have questions? We're here to help! 🤝
            </p>


                <ul className="list-none text-gray-400 space-y-3 text-sm leading-relaxed font-['Inter']">
              <li>
                <strong>📧 Email:</strong> support@lensbox.com
              </li>


              <li>
                <strong>📱 Phone:</strong> +91-XXXX-XXXXXX
              </li>
              <li>
                <strong>📍 Address:</strong> 123 LensBox Street, Kolkata, West
                Bengal
              </li>
            </ul>
          </div>
        </div>

        {/* Right Column - Images */}
        <div className="md:w-1/2 space-y-6">
          <img
            src="https://res.cloudinary.com/dk5gtjb3k/image/upload/v1739017410/b860c48c-4c14-4593-8b8e-850dd8a859dc_wyucmb.jpg"
            alt="LensBox Office"
            className="w-full rounded-lg shadow-lg"
          />
          <div className="grid grid-cols-2 gap-4">
            <img
              src="https://res.cloudinary.com/dk5gtjb3k/image/upload/v1739017410/4a1054e8-ee8d-4910-ba2f-caa648ee901f_uzmiwp.jpg"
              alt="Camera Equipment"
              className="w-full h-[450px] object-cover rounded-lg shadow-lg"
            />
            <img
              src="https://res.cloudinary.com/dk5gtjb3k/image/upload/v1739017410/Mehr_Erfolg_des_eigenen_Business_xvtbjn.jpg"
              alt="Our Team"
              className="w-full rounded-lg shadow-lg"
            />
           
          </div>
        </div>
      </div>
      <Footer/>
    </div>
  );
};


export default Aboutpage;
