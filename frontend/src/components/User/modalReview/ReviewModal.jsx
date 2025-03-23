import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import PropTypes from "prop-types";
import StarRatings from "react-star-ratings";
import axios from "axios";
import { baseApi, defaultImages } from "../../../utils/consonants";

const ReviewModal = ({
  isOpen,
  onClose,
  item,
  selectedOption,
  handleCloseModal,
  userId,
}) => {
  const [productRating, setProductRating] = useState(0);
  const [ownerRating, setOwnerRating] = useState(0);
  const [itemReview, setItemReview] = useState("");
  const [ownerReview, setOwnerReview] = useState("");
  const [renterRating, setRenterRating] = useState(0);
  const [buyerRating, setBuyerRating] = useState(0);
  const [renterReview, setRenterReview] = useState("");
  const [buyerReview, setBuyerReview] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Determine if it's a rental or purchase transaction
  const isRental = item.transactionType === "Rental";
  const isPurchase = item.transactionType === "Sell";

  // Handle rating changes
  const handleProductRatingChange = (newRating) => {
    setProductRating(newRating);
  };

  const handleOwnerRatingChange = (newRating) => {
    setOwnerRating(newRating);
  };

  const handleRenterRatingChange = (newRating) => {
    setRenterRating(newRating);
  };

  const handleBuyerRatingChange = (newRating) => {
    setBuyerRating(newRating);
  };

  // Handle form submission
  const handleSubmit = async () => {
    // Prepare the review data
    const reviewData = [];

    if (selectedOption === "renter" || selectedOption === "buyer") {
      // When renter/buyer is rating the owner and item

      // Review for the item
      reviewData.push({
        reviewer_id: userId,
        reviewee_id: item.tx.owner_id, // Item doesn't have a user ID
        item_id: item.tx.item_id,
        review_type: "item",
        transaction_id: item.id,
        rate: productRating,
        review: itemReview,
      });

      // Review for the owner
      reviewData.push({
        reviewer_id: userId,
        reviewee_id: item.tx.owner_id,
        item_id: item.tx.item_id,
        review_type: "owner",
        transaction_id: item.id,
        rate: ownerRating,
        review: ownerReview,
      });
    } else if (selectedOption === "owner") {
      // When owner is rating the renter/buyer

      // Determine the correct ID and review type based on transaction type
      const revieweeId = isRental ? item.tx.renter_id : item.tx.buyer_id;
      const reviewType = isRental ? "renter" : "buyer";
      const rating = isRental ? renterRating : buyerRating;
      const review = isRental ? renterReview : buyerReview;

      reviewData.push({
        reviewer_id: userId,
        reviewee_id: revieweeId,
        item_id: item.tx.item_id,
        review_type: reviewType,
        transaction_id: item.id,
        rate: rating,
        review: review,
      });
    }

    setLoading(true);
    setErrorMessage("");

    try {
      for (const data of reviewData) {
        const response = await axios.post(
          `${baseApi}/review-and-rate/submit`,
          data
        );
        // console.log(response.data);
      }
      onClose();
    } catch (error) {
      console.error("Error submitting review:", error);
      setErrorMessage(
        "An error occurred while submitting your review. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      show={isOpen}
      onHide={handleCloseModal}
      onClick={(e) => e.stopPropagation()}
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
        {errorMessage && (
          <div className="alert alert-danger">{errorMessage}</div>
        )}

        {/* For Renter/Buyer (Rating and reviewing item and owner) */}
        {(selectedOption === "renter" || selectedOption === "buyer") && (
          <>
            <div className="mb-4">
              <h5>Rate Item</h5>
              <div className="d-flex mb-3">
                <img
                  src={item.tx.item.images[0] || [defaultImages]}
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
                  <p>
                    Item:{" "}
                    {isRental
                      ? item.tx.item.listing_name
                      : item.tx.item.item_for_sale_name || "No item name"}
                  </p>
                  {isRental && (
                    <>
                      <p>
                        Rental Duration:{" "}
                        {item.Duration?.rental_time_from || "N/A"}
                      </p>
                      <p>Rental Rate: {item.Listing?.rate || "N/A"} PHP</p>
                    </>
                  )}
                  {isPurchase && (
                    <p>Purchase Price: {item.Listing?.rate || "N/A"} PHP</p>
                  )}
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
              <p>
                Name: {item.tx.owner?.first_name || ""}{" "}
                {item.tx.owner?.last_name || "Owner"}
              </p>
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

        {/* For Owner (Rating the Renter/Buyer) */}
        {selectedOption === "owner" && (
          <>
            <div className="mb-4">
              <h5>Rate {isRental ? "Renter" : "Buyer"}</h5>
              <p>
                Name:{" "}
                {isRental
                  ? item.tx?.renter?.first_name || "Renter"
                  : item.tx?.buyer?.first_name || "Buyer"}
              </p>
              {isRental && (
                <p>
                  Rental Duration:{" "}
                  {item.tx?.Duration?.rental_time_from || "N/A"} -{" "}
                  {item.tx?.Duration?.rental_time_to || "N/A"}
                </p>
              )}
              <div className="d-flex align-items-center">
                <p className="mb-0 me-2">
                  Rate {isRental ? "Renter" : "Buyer"}:
                </p>
                <StarRatings
                  rating={isRental ? renterRating : buyerRating}
                  starRatedColor="gold"
                  changeRating={
                    isRental
                      ? handleRenterRatingChange
                      : handleBuyerRatingChange
                  }
                  numberOfStars={5}
                  name={isRental ? "renterRating" : "buyerRating"}
                  starDimension="20px"
                  starSpacing="2px"
                />
              </div>
            </div>

            <div className="mb-4">
              <h5>{isRental ? "Renter" : "Buyer"} Review (Optional)</h5>
              <Form.Control
                as="textarea"
                placeholder={`Write your review about the ${
                  isRental ? "renter" : "buyer"
                }...`}
                rows={3}
                value={isRental ? renterReview : buyerReview}
                onChange={(e) =>
                  isRental
                    ? setRenterReview(e.target.value)
                    : setBuyerReview(e.target.value)
                }
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
          disabled={loading}
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
    transactionType: PropTypes.oneOf(["Rental", "Sell"]).isRequired,
    Listing: PropTypes.shape({
      id: PropTypes.number.isRequired,
      listing_name: PropTypes.string.isRequired,
      rate: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    }).isRequired,
    Duration: PropTypes.shape({
      rental_time_from: PropTypes.string,
    }),
    tx: PropTypes.shape({
      item_id: PropTypes.number.isRequired,
      owner_id: PropTypes.number.isRequired,
      renter_id: PropTypes.number,
      buyer_id: PropTypes.number,
      renter: PropTypes.shape({
        first_name: PropTypes.string,
      }),
      buyer: PropTypes.shape({
        first_name: PropTypes.string,
      }),
      Duration: PropTypes.shape({
        rental_time_from: PropTypes.string,
        rental_time_to: PropTypes.string,
      }),
    }).isRequired,
    owner: PropTypes.shape({
      first_name: PropTypes.string,
      tx: PropTypes.shape({
        owner_id: PropTypes.number,
      }),
    }),
  }).isRequired,
  selectedOption: PropTypes.oneOf(["owner", "renter", "buyer"]).isRequired,
  handleCloseModal: PropTypes.func.isRequired,
  userId: PropTypes.number,
};

export default ReviewModal;
