import React from "react";
import "./loadingOverlayStyles.css"; // Import CSS for styling

const LoadingOverlay = () => {
  return (
    <div className="loading-overlay">
      <div className="spinner"></div>
    </div>
  );
};

export default LoadingOverlay;
