import React, { useState } from "react";
import TableComponent from "../../../../components/Table/TableComponent";
import "./postDashboard.css";
import useFetchAllPostsData from "../../../../utils/FetchAllPostsData";
import { formatDate } from "../../../../utils/dateFormat";
import SortFilterComponent from "../../../../components/SortAndFilter/SortFilterComponent";
import { useNavigate } from "react-router-dom";
import { ItemStatus } from "../../../../utils/Status";

const PostDashboard = () => {
  const [sortOption, setSortOption] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

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
  const navigate = useNavigate();

  if (loading) return <p>Loading posts...</p>;
  if (error) return <p>Error: {error}</p>;

  const handleView = (postId) => {
    navigate(`/admin/posts/post-approval/${postId}`)
  };

  const handleEdit = (postId) => {
    console.log(`Editing post with ID: ${postId}`);
  };

  const handleDelete = (postId) => {
    console.log(`Deleting post with ID: ${postId}`);
  };
  // Prepare data for TableComponent
  const data = posts.map((post) => {
    const { label, className } = ItemStatus(post.status);
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

  // Function to filter and sort the posts
  const getFilteredAndSortedData = () => {
    let filteredData = posts;

    if (statusFilter) {
      filteredData = filteredData.filter(post => post.status === statusFilter);
    }

    if (categoryFilter) {
      filteredData = filteredData.filter(post => post.category === categoryFilter);
    }

    if (sortOption) {
      filteredData = [...filteredData].sort((a, b) => {
        switch (sortOption) {
          case 'title':
            return a.post_item_name.localeCompare(b.post_item_name);
          case 'renter':
            return `${a.renter.first_name} ${a.renter.last_name}`.localeCompare(
              `${b.renter.first_name} ${b.renter.last_name}`
            );
          case 'date':
            return new Date(a.created_at) - new Date(b.created_at);
          default:
            return 0;
        }
      });
    }

    return filteredData;
  };


  return (
    <div className="admin-content-container">
      <div className="row">
        {/* Left Side: Recent Posts */}
        <div className="col-lg-12">
          <div className="recent-posts-header p-3 mb-3">
            <h4>Recent Posts</h4>

            {/* Sorting and Filtering Component */}
            <SortFilterComponent
              sortOption={sortOption}
              onSortChange={setSortOption}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              categoryFilter={categoryFilter}
              onCategoryFilterChange={setCategoryFilter}
            />
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
