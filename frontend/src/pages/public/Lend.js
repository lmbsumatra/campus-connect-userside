import React from "react";
import BorrowingPost from "../../components/post-card/PostCard";
import FAB from "../../components/common/fab/FAB";
import useFetchApprovedItems from "../../hooks/useFetchApprovedItems";
import { baseApi } from "../../App";

const Lend = () => {
  const baseUrl = "http://localhost:3001";

  // Fetch borrowing posts (approved posts for lending)
  const { items: posts, loading: loadingPosts, error: errorPosts } = useFetchApprovedItems(`${baseApi}/posts/approved`);

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
      {errorPosts && <p>Error loading borrowing posts: {errorPosts}</p>}
      {loadingPosts && <p>Loading borrowing posts...</p>}
      <BorrowingPost borrowingPosts={posts} title="Lend" />

      {/* Floating Action Button (FAB) */}
      <FAB icon="+" onClick={handleFabClick} />
    </div>
  );
};

export default Lend;
