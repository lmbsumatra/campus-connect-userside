import prevIcon from "../../../assets/images/pdp/prev.svg";
import nextIcon from "../../../assets/images/pdp/next.svg";
import { useState } from "react";
import "./imageSliderStyles.css";
import { defaultImages } from "../../../utils/consonants";

const ImageSlider = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Get the maximum number of images to show (5 in this case)
  const maxImagesToShow = 5;

  // Navigate to the next image
  const nextImage = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  // Navigate to the previous image
  const prevImage = () => {
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + images.length) % images.length
    );
  };

  // Highlight the clicked image
  const highlightImage = (index) => {
    setCurrentIndex(index);
  };

  // If no images available, show a placeholder
  if (images.length === 0) {
    return <div>No images available</div>;
  }

  return (
    <>
      <div
        className="highlight-bg"
        style={{
          backgroundImage: `url(${images[currentIndex]})`,
        }}
      ></div>

      <div className="highlight">
        <img
          src={images[currentIndex]}
          alt="Item"
          className="highlight-img"
          onError={(e) => {
            e.target.onerror = null; // Prevent infinite loop
            e.target.src = [defaultImages]; // Provide a backup fallback image
          }}
        />
      </div>

      <div className="img-slider">
        <div className="btn-slider prev-btn" onClick={prevImage}>
          <img src={prevIcon} alt="Previous image" className="prev-btn" />
        </div>

        {[...Array(Math.min(images.length, maxImagesToShow)).keys()].map(
          (i) => {
            const offset =
              i - Math.floor(Math.min(images.length, maxImagesToShow) / 2);
            const index =
              (currentIndex + offset + images.length) % images.length;

            return (
              <div
                key={index}
                className="slider-container"
                style={{ position: "relative" }}
              >
                <img
                  src={images[index]}
                  alt="Item"
                  className={`item-img ${offset === 0 ? "center" : ""}`}
                  style={{
                    height: "100%",
                    width: "60px",
                    cursor: "pointer",
                  }}
                  onClick={() => highlightImage(index)}
                  onError={(e) => {
                    e.target.onerror = null; // Prevent infinite loop
                    e.target.src = [defaultImages]; // Provide a backup fallback image
                  }}
                />
              </div>
            );
          }
        )}

        <div className="btn-slider next-btn" onClick={nextImage}>
          <img src={nextIcon} alt="Next image" className="next-btn" />
        </div>
      </div>
    </>
  );
};

export default ImageSlider;
