import React, { useState, useEffect } from "react";
import TableComponent from "../../../../components/Table/TableComponent";
import "./postDashboard.css";
import useFetchAllPostsData from "../../../../utils/FetchAllPostsData";
import { formatDate } from "../../../../utils/dateFormat";
import { useNavigate } from "react-router-dom";
import { ItemStatus } from "../../../../utils/Status";
import SearchBarComponent from "../../../../components/Search/SearchBarComponent"; // Import SearchBar
import PaginationComponent from "../../../../components/Pagination/PaginationComponent"; // Import Pagination Component
import {
  TopPostUsers,
  PostStatusDistribution,
  PostsByCategory,
  PostsGrowth,
} from "../../../../components/Analytics/PostAnalyticsComponent";

const PostDashboard = () => {
  const [searchQuery, setSearchQuery] = useState(""); // Search query state
  const [sortOptions, setSortOptions] = useState({}); // Sort options state
  const [filterOptions, setFilterOptions] = useState({}); // Filter options state
  const [currentPage, setCurrentPage] = useState(1); // Current page state
  const [postsPerPage] = useState(10); // Posts per page
  const [originalData, setOriginalData] = useState([]); // State for storing original data

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

  useEffect(() => {
    if (posts.length) {
      setOriginalData(posts);
    }
  }, [posts]);

  if (loading) return <p>Loading posts...</p>;
  if (error) return <p>Error: {error}</p>;

  const handleView = (postId) => {
    navigate(`/admin/posts/post-approval/${postId}`);
  };

  const handleEdit = (postId) => {
    console.log(`Editing post with ID: ${postId}`);
  };

  const handleDelete = (postId) => {
    console.log(`Deleting post with ID: ${postId}`);
  };

  const getStatusInfo = (status) => {
    const { label, className } = ItemStatus(status);
    return { label, className };
  };

  const handleSortChange = (column, order) => {
    if (order === "default") {
      setSortOptions({});
    } else {
      setSortOptions({ [column]: order });
    }
  };

  const handleFilterChange = (column, value) => {
    setFilterOptions({ ...filterOptions, [column]: value });
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const getFilteredData = () => {
    let filteredData = originalData;

    // Normalize the search query by trimming and reducing multiple spaces to a single space
    const normalizedSearchQuery = searchQuery
      .trim()
      .replace(/\s+/g, " ") // Replace multiple spaces with a single space
      .toLowerCase(); // Convert search query to lowercase

    // Apply search filter
    if (normalizedSearchQuery) {
      filteredData = filteredData.filter((post) => {
        // Normalize the fields for comparison
        const normalizedPostItemName = post.post_item_name.toLowerCase();
        const normalizedCategory = post.category.toLowerCase();
        const fullRenterName =
          `${post.renter?.first_name} ${post.renter?.last_name}`.toLowerCase();
        const normalizedDateAdded = formatDate(post.created_at).toLowerCase(); // Format the date and convert to lowercase

        return (
          normalizedPostItemName.includes(normalizedSearchQuery) || // Title search
          normalizedCategory.includes(normalizedSearchQuery) || // Category search
          fullRenterName.includes(normalizedSearchQuery) || // Renter search
          normalizedDateAdded.includes(normalizedSearchQuery) // Date Added search
        );
      });
    }

    // Apply Category filter
    if (filterOptions["Category"]) {
      filteredData = filteredData.filter(
        (post) => post.category === filterOptions["Category"]
      );
    }

    // Apply Status filter
    if (filterOptions["Status"]) {
      filteredData = filteredData.filter(
        (post) => post.status === filterOptions["Status"]
      );
    }

    return filteredData;
  };

  const sortedData = () => {
    let sorted = [...getFilteredData()];

    if (Object.keys(sortOptions).length > 0) {
      if (sortOptions["Title"]) {
        sorted = sorted.sort((a, b) =>
          sortOptions["Title"] === "asc"
            ? a.post_item_name.localeCompare(b.post_item_name)
            : b.post_item_name.localeCompare(a.post_item_name)
        );
      }

      if (sortOptions["Date Added"]) {
        sorted = sorted.sort((a, b) =>
          sortOptions["Date Added"] === "newest"
            ? new Date(b.created_at) - new Date(a.created_at)
            : new Date(a.created_at) - new Date(b.created_at)
        );
      }

      // Add sorting logic for Renter column
      if (sortOptions["Renter"]) {
        sorted = sorted.sort((a, b) => {
          const renterA =
            `${a.renter?.first_name} ${a.renter?.last_name}`.toLowerCase();
          const renterB =
            `${b.renter?.first_name} ${b.renter?.last_name}`.toLowerCase();

          return sortOptions["Renter"] === "asc"
            ? renterA.localeCompare(renterB)
            : renterB.localeCompare(renterA);
        });
      }
    }

    return sorted;
  };

  const sortedFilteredData = sortedData();

  // Pagination logic
  const totalItems = sortedFilteredData.length;
  const totalPages = Math.ceil(totalItems / postsPerPage);

  const displayedData = sortedFilteredData.slice(
    (currentPage - 1) * postsPerPage,
    currentPage * postsPerPage
  );

  const data = displayedData.map((post) => {
    const { label, className } = getStatusInfo(post.status);
    return [
      <div className="thumbnail-placeholder"></div>,
      post.post_item_name,
      post.category,
      <>
        {post.renter?.first_name} {post.renter?.last_name}
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
        <div className="col-lg-8">
          <div className="recent-posts-header p-3 mb-3">
            <h4>Recent Posts</h4>

            {/* Search Bar Component */}
            <SearchBarComponent
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />

            {/* Table Component */}
            <TableComponent
              headers={headers}
              data={data}
              onSortChange={handleSortChange}
              onFilterChange={handleFilterChange}
            />

            {/* Pagination Component */}
            <PaginationComponent
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        </div>

        {/* Right Side: Widgets */}
        <div className="col-lg-4">
          {/* Analytics Widgets */}
          <PostsByCategory posts={posts} />
          <PostsGrowth posts={posts} />
          <PostStatusDistribution posts={posts} />
          <TopPostUsers posts={posts} />
        </div>
      </div>
    </div>
  );
};

export default PostDashboard;
