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

const Rent = () => {
  const location = useLocation();

  // Data Constants
  const baseUrl = "http://localhost:3001";

  const dispatch = useDispatch();

  const { search } = useLocation();
  const searchParams = new URLSearchParams(search);
  const [showAdvancefilter, setShowAdvanceFilter] = useState(false);

  const keyword = searchParams.get("q")?.trim() || "";

  // Fetch listings data (approved items for rent)
  const {
    allApprovedListings,
    loadingAllApprovedListings,
    errorAllApprovedListings,
  } = useSelector((state) => state.allApprovedListings);

  const [filteredItems, setFilteredItems] = useState(allApprovedListings);
  const [filters, setFilters] = useState(defaultFilters);

  useEffect(() => {
    dispatch(fetchAllApprovedListings(keyword));
  }, [dispatch]);

  useEffect(() => {
    setFilteredItems(allApprovedListings);
  }, [allApprovedListings]);

  const handleFilterChange = (filters) => {
    const updatedItems = FilterFunction(allApprovedListings, filters);
    setFilteredItems(updatedItems);
  };

  return (
    <>
      <div className="container-content">
        <div className="row">
          <FilterToolbar
            filters={filters} // 🔥 Pass filters state
            setFilters={setFilters} // 🔥 Pass setFilters to update
            showPriceRange={true}
            onFilterChange={handleFilterChange}
          />

          <button
            className="btn btn-rectangle primary"
            onClick={() => setShowAdvanceFilter(!showAdvancefilter)}
          >
            Advance Filter
          </button>

          <ResetFilters
            setFilteredItems={setFilteredItems}
            setFilters={setFilters} // 🔥 Reset filters properly
            allApprovedPosts={allApprovedListings}
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

          {/* Listings Display */}
          <div className="col-md-10">
            <TimeoutComponent
              timeoutDuration={5000}
              fallback={
                <div className="card-container vertical">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <LoadingItemCardSkeleton key={index} />
                  ))}
                </div>
              }
            >
              {!loadingAllApprovedListings && (
                <ItemCard items={filteredItems} title="Listings" />
              )}
            </TimeoutComponent>
            {/* Loading and Error Handling for Listings */}
            {loadingAllApprovedListings && <p>Loading listings...</p>}
            {errorAllApprovedListings && (
              <p>Error loading listings: {errorAllApprovedListings}</p>
            )}

            <div className="container-content">
              {errorAllApprovedListings && (
                <p>Error loading listings: {errorAllApprovedListings}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Rent;
