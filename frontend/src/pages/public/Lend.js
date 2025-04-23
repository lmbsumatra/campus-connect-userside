import React, { useEffect, useState } from "react";
import PostCard from "../../components/post-card/PostCard";
import FAB from "../../components/common/fab/FAB";
import useFetchApprovedItems from "../../hooks/useFetchApprovedItems";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllApprovedPosts } from "../../redux/post/allApprovedPostsSlice";
import TimeoutComponent from "../../utils/TimeoutComponent";
import LoadingPostCardSkeleton from "../../components/loading-skeleton/loading-post-card-skeleton/LoadingPostCardSkeleton";
import { useLocation } from "react-router-dom";
import FilterToolbar from "../../components/item-filter/FilterToolbar";
import FilterFunction from "../../components/item-filter/FilterFunction";
import FilterModal from "../../components/item-filter/FilterModal";
import { defaultFilters } from "../../utils/consonants";
import PaginationComp from "../private/users/common/PaginationComp";
// Make sure this path is correct and the CSS file exists
import "../private/users/common/paginationStyles.css";

const Lend = () => {
  const dispatch = useDispatch();
  const { search } = useLocation();
  const searchParams = new URLSearchParams(search);
  const [showAdvancefilter, setShowAdvanceFilter] = useState(false);
  const keyword = searchParams.get("q")?.trim() || "";

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [currentKeyword, setCurrentKeyword] = useState("");

  useEffect(() => {
    dispatch(fetchAllApprovedPosts({ keyword }));
  }, [dispatch, keyword]); // Added keyword as dependency

  useEffect(() => {
    if (keyword !== currentKeyword) {
      setCurrentKeyword(keyword);
      dispatch(fetchAllApprovedPosts({ keyword }));
      setFilters({ ...defaultFilters });
    }
  }, [dispatch, keyword, currentKeyword]);

  const { allApprovedPosts, loadingAllApprovedPosts, errorAllApprovedPosts } =
    useSelector((state) => state.allApprovedPosts);

  const [filteredItems, setFilteredItems] = useState([]);
  const [filters, setFilters] = useState(defaultFilters);

  useEffect(() => {
    if (allApprovedPosts && allApprovedPosts.length > 0) {
      setFilteredItems(allApprovedPosts);
      // Reset to first page when items change
      setCurrentPage(1);
    }
  }, [allApprovedPosts]);

  const handleFilterChange = (filters) => {
    const updatedItems = FilterFunction(allApprovedPosts, filters, false);
    setFilteredItems(updatedItems);
    // Reset to first page when filters change
    setCurrentPage(1);
  };

  // Get current items for pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);

  // Change page
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    // Scroll to top when page changes
    window.scrollTo(0, 0);
  };

  // Check if pagination should be displayed
  const showPagination =
    !loadingAllApprovedPosts &&
    filteredItems &&
    filteredItems.length > itemsPerPage;

  return (
    <div className="container-content page-container">
      {/* Filters Section */}
      <div className="">
        {errorAllApprovedPosts && (
          <p>Error loading borrowing posts: {errorAllApprovedPosts}</p>
        )}
        {loadingAllApprovedPosts && <p>Loading borrowing posts...</p>}
        <div className="">
          <FilterToolbar
            filters={filters}
            setFilters={setFilters}
            showPriceRange={false}
            onFilterChange={handleFilterChange}
            setShowAdvanceFilter={setShowAdvanceFilter}
            showAdvancefilter={showAdvancefilter}
            allApprovedPosts={allApprovedPosts}
            setFilteredItems={setFilteredItems}
            isPost={true}
          />

          {showAdvancefilter && (
            <FilterModal
              showFilterModal={showAdvancefilter}
              close={() => setShowAdvanceFilter(false)}
              applyFilters={handleFilterChange}
              filters={filters}
              setFilters={setFilters}
              isPost={true}
            />
          )}
        </div>
      </div>

      {/* Items Section */}
      <div className="items-section">
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
          {!loadingAllApprovedPosts && (
            <PostCard
              borrowingPosts={currentItems} // Changed to use currentItems for pagination
              isYou={false}
              title="Looking for..."
            />
          )}
        </TimeoutComponent>
      </div>

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
};

export default Lend;
