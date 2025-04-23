// React Imports
import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { baseApi } from "../../App";

// Component Imports
import ItemCard from "../../components/item-card/ItemCard";

// Hook Imports
import useFetchApprovedItems from "../../hooks/useFetchApprovedItems";
import LoadingItemCardSkeleton from "../../components/loading-skeleton/loading-item-card-skeleton/LoadingItemCardSkeleton";
import { useDispatch, useSelector } from "react-redux";
import TimeoutComponent from "../../utils/TimeoutComponent";
import { fetchAllApprovedListings } from "../../redux/listing/allApprovedListingsSlice";
import FilterToolbar from "../../components/item-filter/FilterToolbar";
import FilterFunction from "../../components/item-filter/FilterFunction";
import FilterModal from "../../components/item-filter/FilterModal";
import ResetFilters from "../../components/item-filter/ResetFilters";
import { defaultFilters } from "../../utils/consonants";
import PaginationComp from "../private/users/common/PaginationComp";

const Rent = () => {
  const location = useLocation();
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);

  const dispatch = useDispatch();

  const { search } = useLocation();
  const searchParams = new URLSearchParams(search);
  const [showAdvancefilter, setShowAdvanceFilter] = useState(false);

  const keyword = searchParams.get("q")?.trim() || "";
  const {
    allApprovedListings,
    loadingAllApprovedListings,
    errorAllApprovedListings,
  } = useSelector((state) => state.allApprovedListings);

  const [filteredItems, setFilteredItems] = useState(allApprovedListings);
  const [filters, setFilters] = useState(defaultFilters);
  const [currentKeyword, setCurrentKeyword] = useState("");

  useEffect(() => {
    dispatch(fetchAllApprovedListings({ keyword }));
  }, [dispatch]);

  useEffect(() => {
    if (keyword !== currentKeyword) {
      setCurrentKeyword(keyword);
      dispatch(fetchAllApprovedListings({ keyword }));
      setFilters({ ...defaultFilters });
    }
  }, [dispatch, keyword, currentKeyword]);

  useEffect(() => {
    setFilteredItems(allApprovedListings);
    // Reset to first page when items change
    setCurrentPage(1);
  }, [allApprovedListings]);

  const handleFilterChange = (filters) => {
    const updatedItems = FilterFunction(allApprovedListings, filters);
    setFilteredItems(updatedItems);
    // Reset to first page when filters change
    setCurrentPage(1);
  };

  // Get current items for pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = (
    Array.isArray(filteredItems) ? filteredItems : []
  ).slice(indexOfFirstItem, indexOfLastItem);

  // Change page
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    // Scroll to top when page changes
    // window.scrollTo(0, 0);
  };
  // console.log(allApprovedListings, filters);
  const showPagination =
    !loadingAllApprovedListings && filteredItems.length > itemsPerPage;

  return (
    <>
      <div className="container-content page-container">
        <div className="">
          <FilterToolbar
            filters={filters}
            setFilters={setFilters}
            showPriceRange={true}
            onFilterChange={handleFilterChange}
            setShowAdvanceFilter={setShowAdvanceFilter}
            showAdvancefilter={showAdvancefilter}
            allApprovedPosts={allApprovedListings}
            setFilteredItems={setFilteredItems}
          />

          {showAdvancefilter && (
            <FilterModal
              showFilterModal={showAdvancefilter}
              close={(e) => setShowAdvanceFilter(!showAdvancefilter)}
              applyFilters={handleFilterChange}
              filters={filters}
              setFilters={setFilters}
              isListingsPage={true}
            />
          )}
        </div>

        <div className="items-section">
          <TimeoutComponent
            timeoutDuration={1000}
            fallback={
              <div className="card-container vertical">
                {Array.from({ length: 6 }).map((_, index) => (
                  <LoadingItemCardSkeleton key={index} />
                ))}
              </div>
            }
          >
            {!loadingAllApprovedListings && (
              <ItemCard items={currentItems} title="Listings" />
            )}
          </TimeoutComponent>
          {loadingAllApprovedListings && <p>Loading listings...</p>}
          {errorAllApprovedListings && (
            <p>Error loading listings: {errorAllApprovedListings}</p>
          )}

          <div className="container-content">
            {errorAllApprovedListings && (
              <p>Error loading listings: {errorAllApprovedListings}</p>
            )}
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
      </div>
    </>
  );
};

export default Rent;
