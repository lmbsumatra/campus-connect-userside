import React, { useEffect, useRef, useState } from "react";
import prevIcon from "../../../../assets/images/pdp/prev.svg";
import nextIcon from "../../../../assets/images/pdp/next.svg";
import removeIcon from "../../../../assets/images/input-icons/remove.svg";
import "./addImageStyles.css";

// AddImage Component
const AddImage = ({
  images = [],
  onChange,
  removedImages: initialRemovedImages = [],
}) => {
  const [currentImages, setCurrentImages] = useState(images);
  const [removedImagesList, setRemovedImagesList] =
    useState(initialRemovedImages);
  const [currentIndex, setCurrentIndex] = useState(0);
  const inputRef = useRef(null);

  // Update internal state when props change
  useEffect(() => {
    setCurrentImages(images);
  }, [images]);

  // Handle image upload
  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files); // Get the list of files
    const newImages = files.map((file) => ({
      type: "file",
      file, // Store the File object
      preview: URL.createObjectURL(file), // Create a blob URL for preview
    }));

    const updatedImages = [...currentImages, ...newImages];
    setCurrentImages(updatedImages);
    setCurrentIndex(updatedImages.length - 1);

    onChange({
      currentImages: updatedImages,
      removedImagesList,
    });
  };

  // Updated removeImage to handle both blob and file
  const removeImage = (index) => {
    const imageToRemove = currentImages[index];
    const updatedImages = currentImages.filter((_, i) => i !== index);
    const updatedRemovedImages = [...removedImagesList];

    // If it's a file, store the file in removedImagesList
    if (imageToRemove.type === "file") {
      updatedRemovedImages.push(imageToRemove.file);
    }

    setCurrentImages(updatedImages);
    setRemovedImagesList(updatedRemovedImages);
    setCurrentIndex(
      Math.max(0, Math.min(currentIndex, updatedImages.length - 1))
    );

    onChange({
      currentImages: updatedImages,
      removedImagesList: updatedRemovedImages,
    });
  };

  // Navigation functions
  const nextImage = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % currentImages.length);
  };

  const prevImage = () => {
    setCurrentIndex(
      (prevIndex) =>
        (prevIndex - 1 + currentImages.length) % currentImages.length
    );
  };

  const highlightImage = (index) => {
    setCurrentIndex(index);
  };

  return (
    <>
      {currentImages.length === 0 ? (
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

      {currentImages.length > 0 && (
        <>
          <div className="highlight">
            <div
              className="highlight-bg"
              style={{
                backgroundImage: `url(${
                  currentImages[currentIndex].type === "file"
                    ? currentImages[currentIndex].preview
                    : currentImages[currentIndex]
                })`,
              }}
            ></div>
            <img
              src={
                currentImages[currentIndex].type === "file"
                  ? currentImages[currentIndex].preview
                  : currentImages[currentIndex]
              }
              alt="Item"
              className="highlight-img"
            />
          </div>

          <div className="img-slider">
            <div className="btn-slider prev-btn" onClick={prevImage}>
              <img src={prevIcon} alt="Previous image" className="prev-btn" />
            </div>

            {[...Array(Math.min(currentImages.length, 5)).keys()].map((i) => {
              const offset =
                i - Math.floor(Math.min(currentImages.length, 5) / 2);
              const index =
                (currentIndex + offset + currentImages.length) %
                currentImages.length;

              return (
                <div
                  key={index}
                  className="slider-container"
                  style={{ position: "relative" }}
                >
                  <img
                    src={
                      currentImages[index].type === "file"
                        ? currentImages[index].preview
                        : currentImages[index]
                    }
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
