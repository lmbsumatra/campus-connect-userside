import prevIcon from "../../../../assets/images/pdp/prev.svg";
import nextIcon from "../../../../assets/images/pdp/next.svg";
import { useState } from "react";
import "./imageSliderStyles.css";

const ImageSlider = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(1);

  const nextImage = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };
  const prevImage = () => {
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + images.length) % images.length
    );
  };
  const highlightImage = (index) => {
    setCurrentIndex(index);
  };

  return (
    <>
      <div
        className="highlight-bg"
        style={{
          backgroundImage: `url(${images[currentIndex]})`,
        }}
      ></div>

      <div className="highlight">
        <img src={images[currentIndex]} alt="Item" className="highlight-img" />
      </div>
      <div className="img-slider">
        <div className="btn-slider prev-btn" onClick={prevImage}>
          <img src={prevIcon} alt="Previous image" className="prev-btn" />
        </div>
        <img
          src={images[(currentIndex - 2 + images.length) % images.length]}
          alt="Item"
          className="item-img"
          onClick={() => highlightImage((currentIndex - 2) % images.length)}
        />
        <img
          src={images[(currentIndex - 1 + images.length) % images.length]}
          alt="Item"
          className="item-img"
          onClick={() => highlightImage((currentIndex - 1) % images.length)}
        />
        <img
          src={images[currentIndex]}
          alt="Item"
          className="item-img center"
        />
        <img
          src={images[(currentIndex + 1) % images.length]}
          alt="Item"
          className="item-img"
          onClick={() => highlightImage((currentIndex + 1) % images.length)}
        />
        <img
          src={images[(currentIndex + 2) % images.length]}
          alt="Item"
          className="item-img"
          onClick={() => highlightImage((currentIndex + 2) % images.length)}
        />
        <div className="btn-slider next-btn" onClick={nextImage}>
          <img src={nextIcon} alt="Next image" className="next-btn" />
        </div>
      </div>
    </>
  );
};

export default ImageSlider;
