import prevIcon from "../../../../assets/images/pdp/prev.svg";
import nextIcon from "../../../../assets/images/pdp/next.svg";
import removeIcon from "../../../../assets/images/input-icons/remove.svg"; // Import your remove icon
import { useRef, useState } from "react";
import "./imageSliderStyles.css";

const AddImage = ({ images = [], onChange }) => {
  const [currentIndex, setCurrentIndex] = useState(0); // Initialize currentIndex to 0
  const [uploadedImages, setUploadedImages] = useState(images); // State to hold uploaded images (URLs for preview)
  const [imageFiles, setImageFiles] = useState([]); // State to hold actual file objects
  const inputRef = useRef(null);

  // Go to next image in the slider
  const nextImage = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % uploadedImages.length);
  };

  // Go to previous image in the slider
  const prevImage = () => {
    setCurrentIndex(
      (prevIndex) =>
        (prevIndex - 1 + uploadedImages.length) % uploadedImages.length
    );
  };

  // Highlight a selected image in the slider
  const highlightImage = (index) => {
    setCurrentIndex(index);
  };

  const handleImageUpload = (event) => {
    const uploadedFiles = Array.from(event.target.files);
    const newImageUrls = uploadedFiles.map((file) => URL.createObjectURL(file)); // Create preview URLs

    setUploadedImages((prevImages) => {
      const updatedImages = [...prevImages, ...newImageUrls];
      setCurrentIndex(updatedImages.length - 1);
      return updatedImages;
    });

    setImageFiles((prevFiles) => {
      const updatedFiles = [...prevFiles, ...uploadedFiles];
      onChange?.(updatedFiles); // Notify parent with the actual files
      return updatedFiles;
    });
  };

  // Remove image from the uploadedImages and imageFiles array
  const removeImage = (index) => {
    setUploadedImages((prevImages) => {
      const updatedImages = prevImages.filter((_, i) => i !== index);
      return updatedImages;
    });

    setImageFiles((prevFiles) => {
      const updatedFiles = prevFiles.filter((_, i) => i !== index);
      onChange?.(updatedFiles); // Notify parent component
      return updatedFiles;
    });

    if (currentIndex === index && uploadedImages.length > 1) {
      // Adjust the currentIndex if we remove the current image
      setCurrentIndex((prevIndex) => (prevIndex === 0 ? 0 : prevIndex - 1));
    } else if (uploadedImages.length === 1) {
      setCurrentIndex(0); // If it's the last image, set currentIndex to 0
    }
  };

  return (
    <>
      {/* Image Upload Section */}
      <div className="upload-image">
        <label
          htmlFor="imageUpload"
          className={`image-upload-label ${
            uploadedImages.length ? "has-image" : ""
          }`}
          style={{ display: "block", width: "100%", height: "100%" }} // Makes the entire div clickable
        >
          <div className="add-image-container">
            <span className="placeholder-text">Click to upload images</span>
          </div>
        </label>

        <input
          id="imageUpload"
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          ref={inputRef}
          style={{ display: "none" }}
          multiple // Allow multiple file uploads
        />
      </div>

      {/* Slider */}
      {uploadedImages.length > 0 && (
        <>
          <div className="highlight">
            <img
              src={uploadedImages[currentIndex]}
              alt="Item"
              className="highlight-img"
            />
          </div>

          <div className="img-slider">
            <div className="btn-slider prev-btn" onClick={prevImage}>
              <img src={prevIcon} alt="Previous image" className="prev-btn" />
            </div>

            {/* Render the current subset of images */}
            {uploadedImages.length > 0 &&
              [...Array(Math.min(uploadedImages.length, 5)).keys()].map((i) => {
                const offset =
                  i - Math.floor(Math.min(uploadedImages.length, 5) / 2);
                const index =
                  (currentIndex + offset + uploadedImages.length) %
                  uploadedImages.length;
                return (
                  <div
                    key={index}
                    className="slider-container"
                    style={{ position: "relative" }}
                  >
                    <img
                      src={uploadedImages[index]}
                      alt="Item"
                      className={`item-img ${offset === 0 ? "center" : ""}`}
                      style={{
                        height: "100%",
                        width: "60px",
                        cursor: "pointer",
                      }}
                      onClick={() => highlightImage(index)} // Click to set as current image
                    />
                    <img
                      alt="Remove image button"
                      src={removeIcon}
                      style={{
                        height: "24px",
                        width: "24px",
                        cursor: "pointer",
                        position: "absolute",
                        top: "5px",
                        right: "5px",
                        zIndex: 10,
                      }}
                      onClick={() => removeImage(index)} // Remove image when clicked
                      className="btn btn-icon secondary red"
                    />
                  </div>
                );
              })}

            <div className="btn-slider next-btn" onClick={nextImage}>
              <img src={nextIcon} alt="Next image" className="next-btn" />
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default AddImage;
