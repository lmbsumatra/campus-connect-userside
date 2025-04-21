import React from "react";
import ReactDOM from "react-dom";
import { Modal, Button } from "react-bootstrap";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./PhotoIDPolicy.css";
import sampleID1 from "../,./../../src/assets/images/IDs/TUP ID.png";
import sampleID2 from "../,./../../src/assets/images/IDs/TUP ID2.png";
import sampleID3 from "../,./../../src/assets/images/IDs/TUP ID3.png";
import sampleImage from "../,./../../src/assets/images/IDs/imagewcard.png";
import sampleImage2 from "../,./../../src/assets/images/IDs/imagewcard2.png";

const ShowPhotoWithIdAndScannedIdPolicy = ({
  show,
  onClose,
  message,
  images = [],
}) => {
  // Slider settings
  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    adaptiveHeight: false,
    autoplay: false,
  };

  // Guidelines for different ID types
  const guidelines = {
    photoWithId: {
      dos: [
        "Ensure the ID is clear and visible next to your face",
        "Use proper lighting to avoid shadows or glare",
        "Keep the focus on the ID and your face",
      ],
      donts: [
        "Don't obscure important details on the ID",
        "Don't apply filters or heavy edits to the photo",
      ],
    },
    scannedId: {
      dos: [
        "Ensure the ID is clear, readable and well-lit",
        "Use proper orientation (upright, not tilted)",
        "Place the ID on a flat, unobtrusive surface",
      ],
      donts: [
        "Don't crop or cover any part of the ID",
        "Don't take blurry or low-quality photos",
      ],
    },
  };

  // Determine which guidelines to show based on message content
  const guidelineType = message.includes("together with your ID")
    ? "photoWithId"
    : "scannedId";
  const currentGuidelines = guidelines[guidelineType];

  // Select appropriate sample images based on ID type
  const sampleImages =
    guidelineType === "photoWithId"
      ? [sampleImage, sampleImage2]
      : [sampleID1, sampleID2, sampleID3];

  if (!show) return null;

  return ReactDOM.createPortal(
    <Modal
      show={show}
      onHide={onClose}
      centered
      style={{ zIndex: 2000 }}
      size="sm"
      dialogClassName="id-policy-dialog"
    >
      <Modal.Header closeButton>
        <h6> Why is this information collected?</h6>
      </Modal.Header>
      <Modal.Body className="id-policy-modal">
        <p className="policy-message">{message}</p>

        <div className="id-guidelines">
          <div className="guidelines-section do-section">
            <div className="section-icon check-icon">✓</div>
            <ul className="guidelines-list">
              {currentGuidelines.dos.map((item, index) => (
                <li key={`do-${index}`}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="guidelines-section dont-section">
            <div className="section-icon x-icon">✕</div>
            <ul className="guidelines-list">
              {currentGuidelines.donts.map((item, index) => (
                <li key={`dont-${index}`}>{item}</li>
              ))}
            </ul>
          </div>
        </div>

        <p className="example-title">Examples:</p>
        <div className="slider-container">
          <Slider {...sliderSettings}>
            {sampleImages.map((image, index) => (
              <div key={index} className="example-slide">
                <img
                  src={image}
                  alt={`Example ${index + 1}`}
                  className="example-image"
                />
              </div>
            ))}
          </Slider>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" size="sm" onClick={onClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>,
    document.body
  );
};

export default ShowPhotoWithIdAndScannedIdPolicy;
