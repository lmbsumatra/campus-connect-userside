import { useEffect } from "react";
import { fetchUserReviews } from "../../../../redux/transactions/userReview";
import { useDispatch, useSelector } from "react-redux";
import ReviewCard from "../other-user-profile/ReviewCard";

const Reviews = () => {
  const dispatch = useDispatch();
  const { studentUser } = useSelector((state) => state.studentAuth || {});
  const { userReviews, loadingUserReviews, errorUserReviews } = useSelector(
    (state) => state.userReviews
  );

  useEffect(() => {
    dispatch(fetchUserReviews(studentUser.userId)); // Fetch reviews
  }, [dispatch, studentUser.userId]);

  return (
    <div className="item-container">
      <div className="m-3">
        {loadingUserReviews ? (
          <p>Loading reviews...</p>
        ) : errorUserReviews ? (
          <p>Error loading reviews: {errorUserReviews}</p>
        ) : userReviews.length > 0 ? (
          <>
            <h2>Reviews</h2>
            <ReviewCard reviews={userReviews} />
          </>
        ) : (
          <p>No reviews available.</p>
        )}
      </div>
    </div>
  );
};

export default Reviews;
