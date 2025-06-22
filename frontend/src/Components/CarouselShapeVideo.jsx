import React from "react";

const Caruselshapevideo = () => {
  return (
    <div className="carousel-container">
      <div className="carousel-item w-full h-96 rounded-xl overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="w-full h-full object-cover"
          src="https://res.cloudinary.com/dk5gtjb3k/video/upload/v1750592654/videoplayback_p8o62d_kemhoz.mp4"
        />
      </div>
    </div>
  );
};

export default Caruselshapevideo;
