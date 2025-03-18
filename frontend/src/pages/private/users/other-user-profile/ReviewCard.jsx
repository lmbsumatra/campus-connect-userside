import React from "react";
import "./reviewCardStyles.css";
import { formatDate } from "../../../../utils/dateFormat";
import { useNavigate } from "react-router-dom";

const ReviewCard = ({ reviews }) => {
  // Function to generate stars based on rating
  const navigate = useNavigate();
  const renderStars = (rate) => {
    return Array.from({ length: rate }, (_, index) => (
      <span key={index} className="star">
        ⭐
      </span>
    ));
  };

  // Function to render reviewer information (reused across all review types)
  const renderReviewerInfo = (reviewer, createdAt) => (
    <>
      <div className="reviewer-details">
        <div className="reviewer-profpic">
          {reviewer?.student?.profilePic ? (
            <img
              src={reviewer.student.profilePic}
              alt="Reviewer's profile"
              className="profile-image"
            />
          ) : (
            <img
              src="/default-avatar.png"
              alt="Default profile"
              className="profile-image"
            />
          )}
        </div>
        <span className="reviewer-name">
          {reviewer?.fname || "Unknown"} {reviewer?.lname || ""}
        </span>
      </div>
      <div className="review-meta">{renderStars(reviewer.rate)}</div>
    </>
  );

  // Function to render item review
  const renderItemReview = (review) => {
    // Handle both rental and sell items
    const itemDetails = review.item || {};
    const itemName = itemDetails.name || "Unknown Item";
    const itemRate = itemDetails.rate || 0;
    const itemType = itemDetails.type || "rental"; // Default to rental if not specified

    return (
      <div key={review.id} className="review-card item-review">
        <div className="card-header">
          <h3 className="card-title">Item Review</h3>
        </div>
        <div className="item-details">
          <div className="item-info">
            <h4 className="item-name">{itemName}</h4>
            <span className="item-price">
              {itemRate} PHP {itemType === "rental" ? "/ day" : ""}
            </span>
          </div>
        </div>
        <div className="review-content">
          <div className="rating-container">
            {renderStars(review.rate)}
            <span className="review-date">
              • {formatDate(review.createdAt)}
            </span>
          </div>
          <p className="review-text">"{review.review}"</p>
          <div className="reviewer-block">
            {renderReviewerInfo(review.reviewer)}
          </div>
        </div>
      </div>
    );
  };

  // Function to render owner review
  const renderOwnerReview = (review) => (
    <div key={review.id} className="review-card owner-review">
      <div className="card-header">
        <h3 className="card-title">As Owner Review</h3>
      </div>
      <div className="review-content">
        <div className="rating-container">
          {renderStars(review.rate)}
          <span className="review-date">• {formatDate(review.createdAt)}</span>
        </div>
        <p className="review-text">"{review.review}"</p>
        <div className="reviewer-block">
          {renderReviewerInfo(review.reviewer)}
        </div>
      </div>
    </div>
  );

  // Function to render renter/buyer review based on transaction type
  const renderRenterReview = (review) => {
    // Determine if this is a renter or buyer based on transaction type
    const reviewerType =
      review.transactionType === "rental" ? "Renter" : "Buyer";

    return (
      <div key={review.id} className="review-card renter-review">
        <div className="card-header">
          <h3 className="card-title">As {reviewerType} Review</h3>
        </div>
        <div className="review-content">
          <div className="rating-container">
            {renderStars(review.rate)}
            <span className="review-date">
              • {formatDate(review.createdAt)}
            </span>
          </div>
          <p className="review-text">"{review.review}"</p>
          <div className="reviewer-block">
            {renderReviewerInfo(review.reviewer)}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="reviews-container">
      {reviews.length === 0 ? (
        <div className="no-reviews">No reviews available</div>
      ) : (
        reviews.map((review) => {
          switch (review.reviewType) {
            case "item":
              return renderItemReview(review);
            case "owner":
              return renderOwnerReview(review);
            case "renter":
            case "buyer":
              return renderRenterReview(review);
            default:
              return null;
          }
        })
      )}
    </div>
  );
};

export default ReviewCard;
