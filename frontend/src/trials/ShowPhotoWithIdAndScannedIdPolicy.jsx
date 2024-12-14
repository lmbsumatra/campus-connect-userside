import React from "react";
import { Modal, Button } from "react-bootstrap";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

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
    arrows: true,
  };

  return (
    <Modal show={show} onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>Why is this information collected?</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>{message}</p>
        {images.length > 0 && (
          <div>
            <label htmlFor="" className="label">
              Examples
            </label>
            <div className="m-3">
              <Slider {...sliderSettings}>
                {images.map((image, index) => (
                  <div key={index}>
                    <img
                      src={image}
                      alt={`Example ${index + 1}`}
                      style={{
                        width: "100%",
                        height: "auto",
                        borderRadius: "8px",
                      }}
                    />
                  </div>
                ))}
              </Slider>
            </div>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ShowPhotoWithIdAndScannedIdPolicy;
