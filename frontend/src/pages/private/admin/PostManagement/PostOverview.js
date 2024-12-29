import React, { useState, useEffect } from "react";
import TableComponent from "../../../../components/Table/TableComponent";
import "./postDashboard.css";
import useFetchAllPostsData from "../../../../utils/FetchAllPostsData";
import { formatDate } from "../../../../utils/dateFormat";
import { useNavigate } from "react-router-dom";
import SearchBarComponent from "../../../../components/Search/SearchBarComponent";
import PaginationComponent from "../../../../components/Pagination/PaginationComponent";
import { ItemStatus } from "../../../../utils/Status";
import CardComponent from "../../../../components/Table/CardComponent"; 


const PostDashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOptions, setSortOptions] = useState({});
  const [filterOptions, setFilterOptions] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage] = useState(10);
  const [originalData, setOriginalData] = useState([]);
  const [viewMode, setViewMode] = useState("table");

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

  // Set original data when posts are fetched
  useEffect(() => {
    if (posts.length) {
      setOriginalData(posts);
    }
  }, [posts]);

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
      setSortOptions((prevSortOptions) => {
        const newSortOptions = { [column]: order };
        return newSortOptions;
      });
    }
  };

  const handleFilterChange = (column, value) => {
    setFilterOptions((prevFilters) => {
      return { ...prevFilters, [column]: value };
    });
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

  // Get the sorted and filtered data
  const sortedFilteredData = sortedData();

  // Pagination logic
  const totalPosts = sortedFilteredData.length;
  const totalPages = Math.ceil(totalPosts / postsPerPage);

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
        {post.renter?.first_name || ""} {post.renter?.last_name || ""}
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

  const handleSwitchView = (view) => {
    setViewMode(view);
  };

  return (
    <div className="admin-content-container">
      <div className="row">
        <div className="col-lg-12">
          <div className="recent-posts-header p-3 mb-3">
            <h4>Recent Posts</h4>

            {/* Loading or Error Message */}
            {loading && <p>Loading posts...</p>}
            {error && <p>Error: {error}</p>}

            {/* Search Bar Component */}
            <SearchBarComponent
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />

       {/* View switcher */}
       <div className="admin-view-toggle">
            <button onClick={() => handleSwitchView("table")} className={`btn btn-secondary mb-4 ${viewMode === "table" ? "active" : ""}`}>Table View</button>
            <button onClick={() => handleSwitchView("card")} className={`btn btn-secondary mb-4 ${viewMode === "card" ? "active" : ""}`}>Card View</button>
          </div>

          {/* Conditionally render Table or Card View */}
          {viewMode === "table" ? (
            <TableComponent
              headers={headers}
              data={data}
              onSortChange={handleSortChange}
              onFilterChange={handleFilterChange}
            />
          ) : (
            <CardComponent data={data} headers={headers}/>

          )}

            {/* Pagination Component */}
            <PaginationComponent
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDashboard;
