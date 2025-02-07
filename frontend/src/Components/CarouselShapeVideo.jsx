import React from "react";

const Caruselshapevideo = () => {
  return (
    <div>
      <div className="carousel-container">
        <div className="carousel-item w-full h-96 rounded-xl overflow-hidden">
          <video
            autoPlay
            loop
            className="w-full h-full object-cover"
            src="https://res.cloudinary.com/dk5gtjb3k/video/upload/v1738910251/videoplayback_p8o62d.webm"
          ></video>
        </div>
      </div>
    </div>
  );
};

export default Caruselshapevideo;
