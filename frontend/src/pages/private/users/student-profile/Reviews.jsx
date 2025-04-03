import { useEffect, useState } from "react";
import { fetchUserReviews } from "../../../../redux/transactions/userReview";
import { useDispatch, useSelector } from "react-redux";
import ReviewCard from "../other-user-profile/ReviewCard";
import PaginationComp from "../common/PaginationComp";

const Reviews = () => {
  const dispatch = useDispatch();
  const { studentUser } = useSelector((state) => state.studentAuth || {});
  const { userReviews, loadingUserReviews, errorUserReviews } = useSelector(
    (state) => state.userReviews
  );

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8); // Show 1 review per page

  // Fetch reviews on component mount
  useEffect(() => {
    dispatch(fetchUserReviews(studentUser.userId));
  }, [dispatch, studentUser.userId]);

  // Slice the reviews array to get only the current page's reviews
  const indexOfLastItem = currentPage * itemsPerPage; // Index of the last review to display
  const indexOfFirstItem = indexOfLastItem - itemsPerPage; // Index of the first review to display
  const currentItems = userReviews.slice(indexOfFirstItem, indexOfLastItem); // Get current page's reviews

  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo(0, 0); // Scroll to top when page changes
  };

  const showPagination = userReviews.length > itemsPerPage; // Show pagination if there are more reviews than items per page

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
            {/* Display reviews */}
            <ReviewCard reviews={currentItems} />

            {/* Pagination */}
            {showPagination && (
              <div className="pagination-wrapper">
                <PaginationComp
                  currentPage={currentPage}
                  totalItems={userReviews.length}
                  itemsPerPage={itemsPerPage}
                  onPageChange={handlePageChange}
                  siblingCount={1}
                  className="mt-4"
                />
              </div>
            )}
          </>
        ) : (
          <p>No reviews available.</p>
        )}
      </div>
    </div>
  );
};

export default Reviews;
