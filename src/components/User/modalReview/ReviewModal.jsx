import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import PropTypes from 'prop-types';
import StarRatings from 'react-star-ratings';

const ReviewModal = ({ isOpen, onClose, item }) => {
  const [productRating, setProductRating] = useState(0); // Rating for the product
  const [ownerRating, setOwnerRating] = useState(0); // Rating for the owner/borrower
  const [remarks, setRemarks] = useState(''); // Additional remarks from the user

  // Handler for updating the product rating
  const handleProductRatingChange = (newRating) => {
    setProductRating(newRating);
  };

  // Handler for updating the owner/borrower rating
  const handleOwnerRatingChange = (newRating) => {
    setOwnerRating(newRating);
  };

  // Handler for form submission
  const handleSubmit = () => {
    // Handle form submission logic here
    console.log('Product Rating:', productRating); // Log product rating
    console.log('Owner Rating:', ownerRating); // Log owner/borrower rating
    console.log('Remarks:', remarks); // Log additional remarks
    onClose(); // Close the modal after submission
  };

  return (
    <Modal show={isOpen} onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>Review and Rate</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="mb-4">
          <h5>Rate Product</h5>
          <div className="d-flex mb-3">
          <img src={item.image} alt="Product" className="me-3" style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '5px' }} />
            <div>
              <p>Item: {item.title}</p>
              <p>Rental Period: {item.rentalPeriod}</p>
              <p>Rental Rate: 10php</p>
              <div className="d-flex align-items-center">
                <p className="mb-0 me-2">Rate Product:</p>
                <StarRatings
                  rating={productRating} // Current rating for the product
                  starRatedColor="gold" // Color of the rated stars
                  changeRating={handleProductRatingChange} // Function to call on rating change
                  numberOfStars={5} // Total number of stars
                  name='productRating' // Name of the rating component
                  starDimension="20px" // Size of each star
                  starSpacing="2px" // Spacing between stars
                />
              </div>
            </div>
          </div>
        </div>
        <div className="mb-4">
          <h5>Owner/Borrower</h5>
          <p>Name: {item.borrower || item.lender}</p>
          <div className="d-flex align-items-center">
            <p className="mb-0 me-2">Rate Owner/Borrower:</p>
            <StarRatings
              rating={ownerRating} // Current rating for the owner/borrower
              starRatedColor="gold" // Color of the rated stars
              changeRating={handleOwnerRatingChange} // Function to call on rating change
              numberOfStars={5} // Total number of stars
              name='ownerRating' // Name of the rating component
              starDimension="20px" // Size of each star
              starSpacing="2px" // Spacing between stars
            />
          </div>
        </div>
        <div className="mb-4">
          <h5>Overall Remarks (Optional)</h5>
          <Form.Control
            as="textarea"
            placeholder="Type something..."
            rows={3}
            value={remarks} // Current value of remarks
            onChange={(e) => setRemarks(e.target.value)} // Update remarks state on change
          />
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button className="btn btn-primary no-fill me-2" onClick={onClose}>Cancel</Button>
        <Button className="btn btn-primary filled" onClick={handleSubmit}>Submit</Button>
      </Modal.Footer>
    </Modal>
  );
};

// Prop types validation
ReviewModal.propTypes = {
  isOpen: PropTypes.bool.isRequired, // Indicates whether the modal is open or not
  onClose: PropTypes.func.isRequired, // Function to call when closing the modal
  item: PropTypes.shape({
    image: PropTypes.string.isRequired, // Image URL of the item
    title: PropTypes.string.isRequired, // Title of the item
    rentalPeriod: PropTypes.string.isRequired, // Rental period of the item
    borrower: PropTypes.string, // Name of the borrower
    lender: PropTypes.string, // Name of the lender
  }).isRequired,
};

export default ReviewModal;
