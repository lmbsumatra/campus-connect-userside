import React from "react";
import "./reviewCardStyles.css";
import { formatDate } from "../../../../utils/dateFormat";

const ReviewCard = ({ reviews }) => {
  // Function to generate stars based on rating
  const renderStars = (rate) => {
    return Array.from({ length: rate }, (_, index) => (
      <span key={index} className="star">
        ⭐
      </span>
    ));
  };

  return (
    <div className="review-container">
      {reviews.map((review) => {
        // Render item reviews
        if (review.reviewType === "item") {
          return (
            <div key={review.id} className="review-card">
              <div className="item-block">
                <span>{review.listing.name}</span>
                <span>{review.listing.rate}</span>
                <span>View Item</span>
              </div>
              <div className="user-reviews">
                <span>User Reviews</span>
                <div className="review-block">
                  <p>
                    {renderStars(review.rate)} • {formatDate(review.createdAt)}
                  </p>
                  <p>"{review.review}"</p>
                  <div className="reviewer-block">
                    <div className="reviewer-profpic">
                      {review.reviewer?.student?.profilePic ? (
                        <img
                          src={review.reviewer.student.profilePic}
                          alt="Reviewer's profile picture"
                        />
                      ) : (
                        <img
                          src="/default-avatar.png"
                          alt="Default profile picture"
                        /> // Fallback
                      )}
                    </div>
                    <span>
                      {review.reviewer?.fname || "Unknown"}{" "}
                      {review.reviewer?.lname || ""}
                    </span>
                  </div>
                </div>
                <span>View more</span>
              </div>
            </div>
          );
        }

        // Render owner reviews
        if (review.reviewType === "owner") {
          return (
            <div key={review.id} className="review-card">
                <span>Renter Review</span>
              <div className="review-block">
                <p>
                  {renderStars(review.rate)} • {formatDate(review.createdAt)}
                </p>
                <p>"{review.review}"</p>
                <div className="reviewer-block">
                  <div className="reviewer-profpic">
                    {review.reviewer?.student?.profilePic ? (
                      <img
                        src={review.reviewer.student.profilePic}
                        alt="Reviewer's profile picture"
                      />
                    ) : (
                      <img
                        src="/default-avatar.png"
                        alt="Default profile picture"
                      /> // Fallback
                    )}
                  </div>
                  <span>
                    {review.reviewer?.fname || "Unknown"}{" "}
                    {review.reviewer?.lname || ""}
                  </span>
                </div>
              </div>
            </div>
          );
        }

        // Render renter reviews
        if (review.reviewType === "renter") {
            return (
              <div key={review.id} className="review-card">
                  <span>Owner Review</span>
                <div className="review-block">
                  <p>
                    {renderStars(review.rate)} • {formatDate(review.createdAt)}
                  </p>
                  <p>"{review.review}"</p>
                  <div className="reviewer-block">
                    <div className="reviewer-profpic">
                      {review.reviewer?.student?.profilePic ? (
                        <img
                          src={review.reviewer.student.profilePic}
                          alt="Reviewer's profile picture"
                        />
                      ) : (
                        <img
                          src="/default-avatar.png"
                          alt="Default profile picture"
                        /> // Fallback
                      )}
                    </div>
                    <span>
                      {review.reviewer?.fname || "Unknown"}{" "}
                      {review.reviewer?.lname || ""}
                    </span>
                  </div>
                </div>
              </div>
            );
          }

        return null; // Return null if the reviewType doesn't match "item" or "owner"
      })}
    </div>
  );
};

export default ReviewCard;
