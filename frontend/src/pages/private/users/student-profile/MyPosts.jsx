import { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useAuth } from "../../../../context/AuthContext";
import BorrowingPost from "../../../../components/post-card/PostCard";
import TimeoutComponent from "../../../../utils/TimeoutComponent";
import LoadingPostCardSkeleton from "../../../../components/loading-skeleton/loading-post-card-skeleton/LoadingPostCardSkeleton";
import Toolbar from "../../../../components/toolbar/Toolbar";
import {
  fetchAllPostsByUser,
  deletePostById,
} from "../../../../redux/post/allPostsByUserSlice";
import ShowAlert from "../../../../utils/ShowAlert";
import PaginationComp from "../common/PaginationComp";

function MyPosts() {
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);

  const [error, setError] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [viewType, setViewType] = useState("card");
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredItems, setFilteredItems] = useState([]);

  const dispatch = useDispatch();
  const { studentUser } = useAuth();
  const { userId } = studentUser;
  const { allPostsByUser, loadingAllPostsByUser, errorAllPostsUser } =
    useSelector((state) => state.allPostsByUser);

  useEffect(() => {
    if (userId) {
      dispatch(fetchAllPostsByUser(userId));
    }
  }, [userId, dispatch]);

  useEffect(() => {
    if (allPostsByUser) {
      setFilteredItems(allPostsByUser);
      // Reset to first page when filters change
      setCurrentPage(1);
    }
  }, [allPostsByUser]);

  useEffect(() => {
    if (errorAllPostsUser) {
      setError(errorAllPostsUser);
    }
  }, [errorAllPostsUser]);

  const handleDelete = useCallback(
    async (postId) => {
      try {
        ShowAlert(dispatch, "loading", "Deleting...");
        await dispatch(deletePostById({ userId, postId })).unwrap();
        ShowAlert(dispatch, "success", "Post deleted successfully!");
        dispatch(fetchAllPostsByUser(userId));
      } catch (error) {
        console.error("Error deleting post:", error);
        ShowAlert(
          dispatch,
          "error",
          "Error",
          error?.message || "Failed to delete post!"
        );
      }
    },
    [dispatch, userId]
  );

  const handleBulkDelete = useCallback(async () => {
    if (!selectedItems.length) {
      ShowAlert(dispatch, "warning", "No posts selected for deletion");
      return;
    }

    try {
      ShowAlert(dispatch, "loading", "Deleting selected posts...");
      await Promise.all(
        selectedItems.map((postId) =>
          dispatch(deletePostById({ userId, postId })).unwrap()
        )
      );

      ShowAlert(dispatch, "success", "Selected posts deleted successfully!");
      setSelectedItems([]);
      dispatch(fetchAllPostsByUser(userId));
    } catch (error) {
      console.error("Error deleting posts:", error);
      ShowAlert(
        dispatch,
        "error",
        "Error",
        error?.message || "Failed to delete posts!"
      );
    }
  }, [selectedItems, dispatch, userId]);

  // Get current items for pagination
  const indexOfLastItem = currentPage * itemsPerPage; // 1, 2, 3
  const indexOfFirstItem = indexOfLastItem - itemsPerPage; // 0, 1, 2
  const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);

  // Change page
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };
  // console.log(allApprovedListings, filters);
  const showPagination =
    !loadingAllPostsByUser && filteredItems.length > itemsPerPage;

  return (
    <div className="item-container">
      {error ? (
        <div>Error: {error}</div>
      ) : (
        <>
          <Toolbar
            selectedItems={selectedItems}
            onSelectAll={() => {
              setSelectedItems(
                selectedItems.length === allPostsByUser.length
                  ? []
                  : allPostsByUser.map((post) => post.id)
              );
            }}
            onViewToggle={() =>
              setViewType((prev) => (prev === "card" ? "table" : "card"))
            }
            viewType={viewType}
            onAction={handleBulkDelete}
            items={allPostsByUser}
            onSearch={setSearchTerm}
            filterOptions={setFilteredItems}
            isPostPage={true}
          />

          <div className="card-items-container">
            <TimeoutComponent
              timeoutDuration={1000}
              fallback={
                <div className="card-container">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <LoadingPostCardSkeleton key={index} />
                  ))}
                </div>
              }
            >
              <BorrowingPost
                borrowingPosts={currentItems}
                title="Looking for..."
                isProfileVisit={false}
                onDelete={handleDelete}
                selectedItems={selectedItems}
                onSelectItem={(postId) => {
                  setSelectedItems((prev) =>
                    prev.includes(postId)
                      ? prev.filter((id) => id !== postId)
                      : [...prev, postId]
                  );
                }}
                viewType={viewType}
                isYou={true}
              />
            </TimeoutComponent>
          </div>
        </>
      )}
      {/* Pagination */}
      {showPagination && (
        <div className="pagination-wrapper">
          <PaginationComp
            currentPage={currentPage}
            totalItems={filteredItems.length}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            siblingCount={1}
            className="mt-4"
          />
        </div>
      )}
    </div>
  );
}

export default MyPosts;
