import React, { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  updateField,
  blurField,
} from "../../../../redux/item-form/itemFormSlice";
import prevIcon from "../../../../assets/images/pdp/prev.svg";
import nextIcon from "../../../../assets/images/pdp/next.svg";
import removeIcon from "../../../../assets/images/input-icons/remove.svg";
import warningIcon from "../../../../assets/images/input-icons/warning.svg";
import "./addImageStyles.css";

const AddImage = ({ images = [] }) => {
  const dispatch = useDispatch();
  const itemDataState = useSelector((state) => state.itemForm);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [uploadedImages, setUploadedImages] = useState(images);
  const [imageFiles, setImageFiles] = useState([]);
  const inputRef = useRef(null);

  const updateReduxImages = (updatedFiles) => {
    // Dispatch updated images to the Redux store
    dispatch(updateField({ name: "images", value: updatedFiles }));
    // Optionally trigger blur for validation
    dispatch(blurField({ name: "images", value: updatedFiles }));
  };

  const nextImage = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % uploadedImages.length);
  };

  const prevImage = () => {
    setCurrentIndex(
      (prevIndex) =>
        (prevIndex - 1 + uploadedImages.length) % uploadedImages.length
    );
  };

  const highlightImage = (index) => {
    setCurrentIndex(index);
  };

  const handleImageUpload = (event) => {
    const uploadedFiles = Array.from(event.target.files);
    const newImageUrls = uploadedFiles.map((file) => URL.createObjectURL(file));

    setUploadedImages((prevImages) => {
      const updatedImages = [...prevImages, ...newImageUrls];
      setCurrentIndex(updatedImages.length - 1);
      return updatedImages;
    });

    setImageFiles((prevFiles) => {
      const updatedFiles = [...prevFiles, ...uploadedFiles];
      updateReduxImages(updatedFiles); // Update Redux store
      return updatedFiles;
    });
  };

  const removeImage = (index) => {
    setUploadedImages((prevImages) => {
      const updatedImages = prevImages.filter((_, i) => i !== index);

      setCurrentIndex((prevIndex) => {
        if (updatedImages.length === 0) {
          return 0;
        } else if (prevIndex >= index) {
          return Math.max(prevIndex - 1, 0);
        } else {
          return prevIndex;
        }
      });

      return updatedImages;
    });

    setImageFiles((prevFiles) => {
      const updatedFiles = prevFiles.filter((_, i) => i !== index);
      updateReduxImages(updatedFiles); // Update Redux store
      return updatedFiles;
    });
  };

  return (
    <>
      {uploadedImages.length === 0 ? (
        <div className="no-image">
          <label htmlFor="imageUpload" className="image-upload-label">
            <span className="text">Click here to upload</span>
          </label>

          <input
            id="imageUpload"
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            ref={inputRef}
            style={{ display: "none" }}
            multiple
          />
        </div>
      ) : (
        <div className="upload-image">
          <label htmlFor="imageUpload" className="image-upload-label">
            <span className="text">Add more images</span>
          </label>
          <input
            id="imageUpload"
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            ref={inputRef}
            style={{ display: "none" }}
            multiple
          />
        </div>
      )}

      {uploadedImages.length > 0 && (
        <>
          <div className="highlight">
            <div
              className="highlight-bg"
              style={{
                backgroundImage: `url(${uploadedImages[currentIndex]})`,
              }}
            ></div>
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

            {[...Array(Math.min(uploadedImages.length, 5)).keys()].map((i) => {
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
                    onClick={() => highlightImage(index)}
                  />
                  <img
                    alt="Remove image button"
                    src={removeIcon}
                    onClick={() => removeImage(index)}
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
