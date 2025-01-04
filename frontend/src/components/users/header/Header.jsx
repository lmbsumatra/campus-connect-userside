import React, { useState, useEffect } from "react";
import "./style.css";

const Header = () => {
  const slides = [
    {
      title: "Unlock the Freedom of Peer-to-Peer Renting",
      description: "Discover a world of affordable, convenient, and sustainable rentals for students like you.",
      image: "https://res.cloudinary.com/campusconnectcl/image/upload/v1736014721/cc_header/wmykjlqkn1eot8otj70l.jpg",
    },
    {
      title: "Rent Smarter, Live Better",
      description: "Access premium rentals at student-friendly prices with just a click.",
      image: "https://res.cloudinary.com/campusconnectcl/image/upload/v1736014721/cc_header/oippbgaym1rut45pb3xi.jpg",
    },
    {
      title: "Your Perfect Rental Awaits",
      description: "Join the revolution of seamless peer-to-peer renting today!",
      image: "https://res.cloudinary.com/campusconnectcl/image/upload/v1736014722/cc_header/cwtocuwwcjx1koasftjq.jpg",
    },
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-slide functionality
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000); // Change slide every 5 seconds
    return () => clearInterval(interval);
  }, [slides.length]);

  return (
    <header
    style={{
      background: `
        linear-gradient(to bottom, rgba(88, 104, 143, 0.5), rgba(255, 146, 87, 0.3)),
        url(${slides[currentSlide].image}) no-repeat center center/cover
      `,
    }}
  >
  
      <div className="header-content">
        <h1 className="sub-title">{slides[currentSlide].title}</h1>
        <p className="sub-description text-light">
          {slides[currentSlide].description}
        </p>
      </div>
      <div className="slider-controls">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`slider-dot ${index === currentSlide ? "active" : ""}`}
            onClick={() => setCurrentSlide(index)}
          />
        ))}
      </div>
    </header>
  );
};

export default Header;
