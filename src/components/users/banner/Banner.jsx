import React from "react";
import Slider from "react-slick";
import "./bannerStyles.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const Banner = () => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2000,
  };

  const slides = [
    {
      title: "Want to lend a hand?",
      subtitle: "Rent out your stuff!",
      buttonText: "Rent out now!",
      link: "#",
    },
    {
      title: "Looking some items to rent?",
      subtitle: "Rent here!",
      buttonText: "Rent now!",
      link: "#",
    },
    {
      title: "Ready to sell?",
      subtitle: "Buy and sell easily!",
      buttonText: "Start Selling!",
      link: "#",
    },
  ];

  return (
    <div className="container-content">
      <Slider {...settings}>
        {slides.map((slide, index) => (
          <div key={index} className="banner">
            <div className="text-white">
              <h5 className="text-light">{slide.title}</h5>
              <h1 className="fw-bold">{slide.subtitle}</h1>
            </div>
            <div className="d-flex align-items-center">
              <button className="btn btn-rounded primary">
                {slide.buttonText}
              </button>
              <a href={slide.link}>Learn More</a>
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default Banner;
