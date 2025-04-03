// Imports
import React, { useEffect, useState } from "react";
import ItemCard from "../../components/item-card/ItemCard";
import TimeoutComponent from "../../utils/TimeoutComponent";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllApprovedItemForSale } from "../../redux/item-for-sale/allApprovedItemsForSaleSlice";
import LoadingItemCardSkeleton from "../../components/loading-skeleton/loading-item-card-skeleton/LoadingItemCardSkeleton";
import { useLocation } from "react-router-dom";
import FilterToolbar from "../../components/item-filter/FilterToolbar";
import FilterFunction from "../../components/item-filter/FilterFunction";
import FilterModal from "../../components/item-filter/FilterModal";
import ResetFilters from "../../components/item-filter/ResetFilters";
import { defaultFilters } from "../../utils/consonants";
import PaginationComp from "../private/users/common/PaginationComp";

// Shop Component
const Shop = () => {
  // State Variables

  const dispatch = useDispatch();

  const { search } = useLocation();
  const searchParams = new URLSearchParams(search);

  const [showAdvancefilter, setShowAdvanceFilter] = useState(false);
  const [filters, setFilters] = useState(defaultFilters);
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);

  const keyword = searchParams.get("q")?.trim() || "";

  const {
    allApprovedItemForSale,
    loadingAllApprovedItemForSale,
    errorAllApprovedItemForSale,
  } = useSelector((state) => state.allApprovedItemForSale);

  const [filteredItems, setFilteredItems] = useState(allApprovedItemForSale);

  useEffect(() => {
    dispatch(fetchAllApprovedItemForSale(keyword));
  }, [dispatch, keyword]);

  useEffect(() => {
    setFilteredItems(allApprovedItemForSale);
    // Reset to first page when items change
    setCurrentPage(1);
  }, [allApprovedItemForSale]);

  const handleFilterChange = (updatedFilters) => {
    setFilters(updatedFilters);
    const updatedItems = FilterFunction(allApprovedItemForSale, updatedFilters);
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
  // console.log(allApprovedListings, filters);
  const showPagination =
    !loadingAllApprovedItemForSale && filteredItems.length > itemsPerPage;

  // Component JSX
  return (
    <div className="container-content page-container">
      <div className="">
        <FilterToolbar
          filters={filters}
          setFilters={setFilters}
          showPriceRange={true}
          onFilterChange={handleFilterChange}
          setShowAdvanceFilter={setShowAdvanceFilter}
          showAdvancefilter={showAdvancefilter}
          allApprovedPosts={allApprovedItemForSale}
          setFilteredItems={setFilteredItems}
        />

        {showAdvancefilter && (
          <FilterModal
            showFilterModal={showAdvancefilter}
            close={(e) => setShowAdvanceFilter(!showAdvancefilter)}
            applyFilters={handleFilterChange}
            filters={filters}
            setFilters={setFilters}
          />
        )}
      </div>

      {/* Item Display Section */}
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
          {!loadingAllApprovedItemForSale && (
            <ItemCard items={currentItems} title="For Sale" />
          )}
        </TimeoutComponent>

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
  );
};

export default Shop;
