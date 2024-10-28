import React from "react";
import TableComponent from "../../../../components/Table/TableComponent";
import "./postDashboard.css";
import useFetchAllPostsData from "../../../../utils/FetchAllPostsData";
import { formatDate } from "../../../../utils/dateFormat";

const PostDashboard = () => {
  const headers = [
    "Thumbnail",
    "Title",
    "Category",
    "Renter",
    "Date Added",
    "Status",
    "Action",
  ];

  const { posts, error, loading } = useFetchAllPostsData();

  if (loading) return <p>Loading posts...</p>;
  if (error) return <p>Error: {error}</p>;

  const handleView = (postId) => {
    console.log(`Editing post with ID: ${postId}`);
  };

  const handleEdit = (postId) => {
    console.log(`Editing post with ID: ${postId}`);
  };

  const handleDelete = (postId) => {
    console.log(`Deleting post with ID: ${postId}`);
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case "posted":
        return { label: "Posted", className: "bg-success text-white" };
      case "flagged":
        return { label: "Flagged", className: "bg-warning text-dark" };
      case "offered":
        return { label: "Offered", className: "bg-info text-white" };
      case "pending":
        return { label: "Pending", className: "bg-secondary text-white" };
      case "removed":
        return { label: "Removed", className: "bg-danger text-white" };
      default:
        return { label: "Unknown", className: "bg-light text-dark" };
    }
  };

  // Prepare data for TableComponent
  const data = posts.map((post) => {
    const { label, className } = getStatusInfo(post.status);
    return [
      <div className="thumbnail-placeholder"></div>,
      post.post_item_name,
      post.category,
      <>
        {post.renter.first_name} {post.renter.last_name}
      </>,
      formatDate(post.created_at),
      <span className={`badge ${className}`}>{label}</span>,
      <div className="d-flex flex-column align-items-center gap-1">
        <button
          className="btn btn-action view"
          onClick={() => handleView(post.id)}
        >
          View
        </button>
        <button
          className="btn btn-action edit"
          onClick={() => handleEdit(post.id)}
        >
          Edit
        </button>
        <button
          className="btn btn-action delete"
          onClick={() => handleDelete(post.id)}
        >
          Delete
        </button>
      </div>,
    ];
  });

  return (
    <div className="admin-content-container">
      <div className="row">
        {/* Left Side: Recent Posts */}
        <div className="col-lg-12">
          <div className="recent-posts-header p-3 mb-3">
            <h4>Recent Posts</h4>
            <TableComponent
              headers={headers}
              data={data}
              // statusColumnIndex={5}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDashboard;
