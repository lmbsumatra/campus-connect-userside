import React, { useState, useRef } from "react";
import "./addImageStyles.css"; // Keep your existing styles

const SingleImageUpload = ({ onChange }) => {
  const [currentImage, setCurrentImage] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const inputRef = useRef(null);

  const handleImageUpload = (event) => {
    const file = event.target.files[0]; // Only take the first file
    if (file) {
      const preview = URL.createObjectURL(file);
      setCurrentImage({
        type: "file",
        file,
        preview
      });
      onChange({ file, preview });
    }
  };

  const removeImage = () => {
    if (currentImage?.preview) {
      URL.revokeObjectURL(currentImage.preview);
    }
    setCurrentImage(null);
    onChange({ file: null, preview: null });
  };

  return (
    <div className="single-image-upload-container">
      {!currentImage ? (
        <div className="upload-prompt">
          <label htmlFor="singleImageUpload" className="upload-label">
            <span className="text">Click to upload image</span>
          </label>
          <input
            id="singleImageUpload"
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            ref={inputRef}
            style={{ display: "none" }}
          />
        </div>
      ) : (
        <div className="preview-container"  
        style={{ 
          position: 'relative',
          display: 'inline-block', // This ensures the container fits the content
          width: '100px',          // Match image width
          height: '100px'          // Match image height
        }}>

          <img
            src={currentImage.preview}
            alt="Preview"
            className="small-preview"
            onClick={() => setShowPopup(true)}
            style={{ 
              width: '100px', 
              height: '100px', 
              objectFit: 'cover',
              cursor: 'pointer' 
            }}
          />
          <button 
            onClick={removeImage}
            className="remove-button"
            style={{
              position: 'absolute',
              top: '0px',               // Position inside the top edge
              right: '-20px',             // Position inside the right edge
              borderRadius: '50%',
              border: 'none',
              backgroundColor: 'rgba(255, 0, 0, 0.8)',
              color: 'white',
              width: '20px',
              height: '20px',
              padding: '0',
              lineHeight: '1',
              fontSize: '16px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10
            }}
          >
            ×
          </button>
        </div>
      )}

      {/* Popup Modal */}
      {showPopup && currentImage && (
        <div 
          className="image-popup-overlay"
          onClick={() => setShowPopup(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
          }}
        >
          <div 
            className="popup-content"
            style={{
              position: 'relative',
              maxWidth: '90%',
              maxHeight: '90%'
            }}
          >
            <img
              src={currentImage.preview}
              alt="Full size preview"
              style={{
                maxWidth: '100%',
                maxHeight: '90vh',
                objectFit: 'contain'
              }}
            />
            <button 
              onClick={() => setShowPopup(false)}
              style={{
                position: 'absolute',
                top: '-40px',
                right: '-40px',
                background: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '30px',
                height: '30px',
                cursor: 'pointer'
              }}
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SingleImageUpload;