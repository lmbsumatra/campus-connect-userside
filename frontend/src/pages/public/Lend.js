import React, { useEffect } from "react";
import PostCard from "../../components/post-card/PostCard";
import FAB from "../../components/common/fab/FAB";
import useFetchApprovedItems from "../../hooks/useFetchApprovedItems";
import { baseApi } from "../../App";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllApprovedPosts } from "../../redux/post/allApprovedPostsSlice";
import TimeoutComponent from "../../utils/TimeoutComponent";
import LoadingPostCardSkeleton from "../../components/loading-skeleton/loading-post-card-skeleton/LoadingPostCardSkeleton";
import { useLocation } from "react-router-dom";

const Lend = () => {
  const dispatch = useDispatch();

  const { search } = useLocation();
  const searchParams = new URLSearchParams(search);

  const keyword = searchParams.get("q")?.trim() || "";

  useEffect(() => {
    dispatch(fetchAllApprovedPosts(keyword));
  }, [dispatch]);

  const { allApprovedPosts, loadingAllApprovedPosts, errorAllApprovedPosts } =
    useSelector((state) => state.allApprovedPosts);

  // Handle Floating Action Button (FAB) click
  const handleFabClick = (action) => {
    if (action === "add-item") {
      console.log("Add Item button clicked");
    } else if (action === "create-post") {
      console.log("Create Post button clicked");
    }
  };

  return (
    <div className="container-content">
      {/* Display Borrowing Posts */}
      {errorAllApprovedPosts && (
        <p>Error loading borrowing posts: {errorAllApprovedPosts}</p>
      )}
      {loadingAllApprovedPosts && <p>Loading borrowing posts...</p>}
      <TimeoutComponent
        timeoutDuration={5000}
        fallback={
          <div className="card-container">
            {Array.from({ length: 4 }).map((_, index) => (
              <LoadingPostCardSkeleton key={index} />
            ))}
          </div>
        }
      >
        {!loadingAllApprovedPosts && (
          <PostCard borrowingPosts={allApprovedPosts} title="Lend" />
        )}
      </TimeoutComponent>

      {/* Floating Action Button (FAB) */}
      <FAB icon="+" onClick={handleFabClick} />
    </div>
  );
};

export default Lend;
