import prevIcon from "../../../../assets/images/pdp/prev.svg";
import nextIcon from "../../../../assets/images/pdp/next.svg";
import { useRef, useState } from "react";
import "./imageSliderStyles.css";

const AddImage = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(1);
  const [image, setImages] = useState([]);
  const [uploadedImage, setUploadedImage] = useState(null);
  const inputRef = useRef(null);

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
  const handleImageUpload = (event) => {
    const uploadedFiles = Array.from(event.target.files);
    const newImages = uploadedFiles.map((file) => URL.createObjectURL(file));
    setImages((prevImages) => [...prevImages, ...newImages]);
    if (currentIndex === -1 && newImages.length > 0) {
      setCurrentIndex(0); // Set the first image as current
    }
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const imageURL = URL.createObjectURL(file);
      setUploadedImage(imageURL);
    }
  };

  return (
    <>
      <div
        className="highlight-bg"
        style={{
          backgroundImage: `url(${images[currentIndex]})`,
        }}
      ></div>
      <div className="upload-image">
        <div className="add-image-container">
          <label
            htmlFor="imageUpload"
            className={`image-upload-label ${uploadedImage ? "has-image" : ""}`}
          >
            {uploadedImage ? (
              <>
                <img
                  src={uploadedImage}
                  alt="Preview"
                  className="image-preview"
                />
                <div className="hover-overlay">Click to change photo</div>
              </>
            ) : (
              <span className="placeholder-text">Click to upload photo</span>
            )}
          </label>

          <input
            id="imageUpload"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            ref={inputRef}
            style={{ display: "none" }}
          />
        </div>
      </div>

      <div className="highlight">
        <img src={images[currentIndex]} alt="Item" className="highlight-img" />
      </div>
      <div className="img-slider">
        <div className="btn-slider prev-btn" onClick={prevImage}>
          <img src={prevIcon} alt="Previous image" className="prev-btn" />
        </div>
        {images.length > 0 &&
          [...Array(Math.min(images.length, 5)).keys()].map((i) => {
            const offset = i - Math.floor(Math.min(images.length, 5) / 2);
            const index =
              (currentIndex + offset + images.length) % images.length;
            return (
              <img
                key={index}
                src={images[index]}
                alt="Item"
                className={`item-img ${offset === 0 ? "center" : ""}`}
                onClick={() => highlightImage(index)}
              />
            );
          })}

        <div className="btn-slider next-btn" onClick={nextImage}>
          <img src={nextIcon} alt="Next image" className="next-btn" />
        </div>
      </div>
    </>
  );
};

export default AddImage;
