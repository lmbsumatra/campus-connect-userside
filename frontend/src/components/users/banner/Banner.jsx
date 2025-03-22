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
    autoplaySpeed: 3000,
  };

  const slides = [
    {
      title: "Want to lend a hand?",
      subtitle: "Rent out your materials",
      imageClass: "banner-img-lend",
    },
    {
      title: "Need school supplies?",
      subtitle: "Rent affordably",
      imageClass: "banner-img-rent",
    },
    {
      title: "Buy & Sell Textbooks",
      subtitle: "Save money easily",
      imageClass: "banner-img-sell",
    },
  ];

  return (
    <div className="container-content">
      <Slider {...settings}>
        {slides.map((slide, index) => (
          <div key={index} className={`banner ${slide.imageClass}`}>
            <div className="text-white">
              <h5 className="text-light">{slide.title}</h5>
              <h1 className="fw-bold">{slide.subtitle}</h1>
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default Banner;