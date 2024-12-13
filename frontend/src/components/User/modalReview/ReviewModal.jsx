import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import PropTypes from "prop-types";
import StarRatings from "react-star-ratings";
import axios from "axios"; // We'll use axios to make the API request

const ReviewModal = ({
  isOpen,
  onClose,
  item,
  selectedOption,
  handleCloseModal,
  userId
}) => {
  const [productRating, setProductRating] = useState(0); // Rating for the item (Product)
  const [ownerRating, setOwnerRating] = useState(0); // Rating for the owner
  const [itemReview, setItemReview] = useState(""); // Review for the item by the renter
  const [ownerReview, setOwnerReview] = useState(""); // Review for the owner by the renter
  const [remarks, setRemarks] = useState(""); // Additional remarks from the owner
  const [renterRating, setRenterRating] = useState(0); // Rating for the renter (Owner's perspective)
  const [renterReview, setRenterReview] = useState(""); // Review for the renter by the owner
  const [loading, setLoading] = useState(false); // State to handle loading during API request
  const [errorMessage, setErrorMessage] = useState(""); // To display any error messages

  // Handlers for rating changes
  const handleProductRatingChange = (newRating) => {
    setProductRating(newRating);
  };

  const handleOwnerRatingChange = (newRating) => {
    setOwnerRating(newRating);
  };

  const handleRenterRatingChange = (newRating) => {
    setRenterRating(newRating);
  };

  // Handle form submission
  const handleSubmit = async () => {
    // Prepare the review data
    const reviewData = [];
  
    // For Renter: submit two reviews (item and owner)
    if (selectedOption === "Renter") {
      // Review for the item
      reviewData.push({
        reviewer_id: item.renter.user_id,
        reviewee_id: item.owner.user_id,
        item_id: item.Listing.id,
        review_type: "item",  // Rating for the item
        transaction_id: item.id,
        rate: productRating,
        review: itemReview,  // Item review
      });
  
      // Review for the owner
      reviewData.push({
        reviewer_id: item.renter.user_id,
        reviewee_id: item.owner.user_id,
        item_id:  item.Listing.id,
        review_type: "owner",  // Rating for the owner
        transaction_id: item.id,
        rate: ownerRating,
        review: ownerReview,  // Owner review
      });
    } else if (selectedOption === "Owner") {
      // For Owner: Only one review (renter)
      reviewData.push({
        reviewer_id: item.owner.user_id,
        reviewee_id: item.renter.user_id,
        item_id:  item.Listing.id,
        review_type: "renter",  // Rating for the renter
        transaction_id: item.id,
        rate: renterRating,
        review: renterReview || remarks,  // Renter review or remarks
      });
    }
  
    setLoading(true); // Set loading state to true while waiting for the API response
    setErrorMessage(""); // Clear previous error message
  
    try {
      // Assuming you're submitting the reviews to your API endpoint
      for (const data of reviewData) {
        // Use a loop to handle multiple reviews for the renter (item and owner)
        const response = await axios.post("http://localhost:3001/review-and-rate/submit", data);
        console.log(response.data); // Log the response (for debugging)
      }
      onClose(); // Close modal on success
    } catch (error) {
      console.error("Error submitting review:", error);
      setErrorMessage("An error occurred while submitting your review. Please try again.");
    } finally {
      setLoading(false); // Set loading state to false after API response
    }
  };
  

  return (
    <Modal
      show={isOpen}
      onHide={handleCloseModal}
      onClick={(e) => e.stopPropagation()} // Prevent click event propagation here
    >
      <Modal.Header
        closeButton
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
      >
        <Modal.Title>Review and Rate</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {errorMessage && <div className="alert alert-danger">{errorMessage}</div>} {/* Show error message if any */}

        {/* For Renter (Rating and reviewing item and owner) */}
        {selectedOption === "Renter" && (
          <>
            <div className="mb-4">
              <h5>Rate Item</h5>
              <div className="d-flex mb-3">
                <img
                  src={item.image || "/default-image.jpg"}
                  alt="Item"
                  className="me-3"
                  style={{
                    width: "100px",
                    height: "100px",
                    objectFit: "cover",
                    borderRadius: "5px",
                  }}
                />
                <div>
                  <p>Item: {item.Listing.listing_name}</p>
                  <p>Rental Period: {item.RentalDate.date}</p>
                  <p>Rental Duration: {item.Duration.rental_time_from}</p>
                  <p>Rental Rate: 10 PHP</p>
                  <div className="d-flex align-items-center">
                    <p className="mb-0 me-2">Rate Item:</p>
                    <StarRatings
                      rating={productRating}
                      starRatedColor="gold"
                      changeRating={handleProductRatingChange}
                      numberOfStars={5}
                      name="productRating"
                      starDimension="20px"
                      starSpacing="2px"
                    />
                  </div>
                </div>
              </div>
              <div className="mb-4">
                <h5>Item Review (Optional)</h5>
                <Form.Control
                  as="textarea"
                  placeholder="Write your review about the item..."
                  rows={3}
                  value={itemReview}
                  onChange={(e) => setItemReview(e.target.value)}
                />
              </div>
            </div>

            <div className="mb-4">
              <h5>Rate Owner</h5>
              <p>Name: {item.owner ? item.owner.first_name : "Owner"}</p>
              <div className="d-flex align-items-center">
                <p className="mb-0 me-2">Rate Owner:</p>
                <StarRatings
                  rating={ownerRating}
                  starRatedColor="gold"
                  changeRating={handleOwnerRatingChange}
                  numberOfStars={5}
                  name="ownerRating"
                  starDimension="20px"
                  starSpacing="2px"
                />
              </div>
            </div>

            <div className="mb-4">
              <h5>Owner Review (Optional)</h5>
              <Form.Control
                as="textarea"
                placeholder="Write your review about the owner..."
                rows={3}
                value={ownerReview}
                onChange={(e) => setOwnerReview(e.target.value)}
              />
            </div>
          </>
        )}

        {/* For Owner (Rating the Renter and optional remarks) */}
        {selectedOption === "Owner" && (
          <>
            <div className="mb-4">
              <h5>Rate Renter</h5>
              <p>Name: {item.renter ? item.renter.first_name : "Renter"}</p>
              <p>Rental Duration: {item.Duration.rental_time_from}</p>
              <div className="d-flex align-items-center">
                <p className="mb-0 me-2">Rate Renter:</p>
                <StarRatings
                  rating={renterRating}
                  starRatedColor="gold"
                  changeRating={handleRenterRatingChange}
                  numberOfStars={5}
                  name="renterRating"
                  starDimension="20px"
                  starSpacing="2px"
                />
              </div>
            </div>

            <div className="mb-4">
              <h5>Overall Remarks (Optional)</h5>
              <Form.Control
                as="textarea"
                placeholder="Type something about the renter..."
                rows={3}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
              />
            </div>
          </>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button className="btn btn-primary no-fill me-2" onClick={onClose}>
          Cancel
        </Button>
        <Button
          className="btn btn-primary filled"
          onClick={handleSubmit}
          disabled={loading} // Disable submit button while loading
        >
          {loading ? "Submitting..." : "Submit"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

// Prop types validation
ReviewModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  item: PropTypes.shape({
    id: PropTypes.number.isRequired,
    image: PropTypes.string,
    Listing: PropTypes.shape({
      listing_name: PropTypes.string.isRequired,
    }).isRequired,
    RentalDate: PropTypes.shape({
      date: PropTypes.string.isRequired,
    }).isRequired,
    owner: PropTypes.shape({
      first_name: PropTypes.string.isRequired,
      user_id: PropTypes.number.isRequired,
    }),
    renter: PropTypes.shape({
      first_name: PropTypes.string.isRequired,
      user_id: PropTypes.number.isRequired,
    }),
  }).isRequired,
  selectedOption: PropTypes.oneOf(["Owner", "Renter"]).isRequired,
  // handleCloseModal: PropTypes.func.isRequired,
  // transactionId: PropTypes.number.isRequired,
  // reviewerId: PropTypes.number.isRequired,
};

export default ReviewModal;
