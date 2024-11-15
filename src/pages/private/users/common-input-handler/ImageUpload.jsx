import { useState, useEffect } from "react";

import itemForSaleIcon from "../../../../assets/images/card/sale.png";

export const ImageUpload = ({
  data = { images: [] },
  setData,
  isForSale,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageURLs, setImageURLs] = useState([]);

  const handleAddImage = (e) => {
    const files = Array.from(e.target.files);

    setData((prevData) => ({
      ...prevData,
      images: [...prevData.images, ...files],
    }));

    setCurrentImageIndex((prevIndex) => Math.min(prevIndex, files.length - 1));
    e.target.value = "";
  };

  const handleRemoveImage = (index) => {
    setData((prevData) => {
      const newImages = prevData.images.filter((_, i) => i !== index);
      const newImageURLs = imageURLs.filter((_, i) => i !== index);

      setImageURLs(newImageURLs);

      return { ...prevData, images: newImages };
    });

    setCurrentImageIndex((prevIndex) => {
      if (data.images.length === 1) return 0;
      if (index < prevIndex) return prevIndex - 1;
      if (index === prevIndex && prevIndex > 0) return prevIndex - 1;
      return prevIndex;
    });
  };

  useEffect(() => {
    return () => {
      imageURLs.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [imageURLs]);

  const handleSmallImageClick = (index) => {
    setCurrentImageIndex(index);
  };

  return (
    <div>
      <div className="bg-white relative">
        <div
          className="image-preview"
          onClick={() => document.getElementById("imageInput").click()}
        >
          {isForSale && (
            <img
              src={itemForSaleIcon}
              className="sale-icon"
              alt="Item for sale icon/indication"
            />
          )}

          {data.images.length === 0 ? (
            "Click here to add an image."
          ) : (
            <>
              <img
                src={URL.createObjectURL(data.images[currentImageIndex])}
                alt="Preview"
              />
              <div className="overlay">
                <span className="overlay-text">
                  Click here to upload more images
                </span>
              </div>
            </>
          )}
        </div>
        <input
          type="file"
          id="imageInput"
          style={{ display: "none" }}
          accept="image/*"
          multiple
          onChange={handleAddImage}
        />
      </div>
      <div className="small-image-previews">
        {data.images.map((image, index) => (
          <div key={index} className="small-image-container">
            <img
              src={URL.createObjectURL(image)}
              alt={`Thumbnail ${index}`}
              className={`small-image ${
                currentImageIndex === index ? "active" : ""
              }`}
              onClick={() => handleSmallImageClick(index)}
            />
            <button
              className="btn btn-danger btn-remove"
              onClick={() => handleRemoveImage(index)}
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
