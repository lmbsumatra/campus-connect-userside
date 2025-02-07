// React Imports
import React, { useEffect } from "react";
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

const Rent = () => {
  const location = useLocation();

  // Data Constants
  const baseUrl = "http://localhost:3001";

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchAllApprovedListings());
  }, [dispatch]);

  // Fetch listings data (approved items for rent)
  const {
    allApprovedListings,
    loadingAllApprovedListings,
    errorAllApprovedListings,
  } = useSelector((state) => state.allApprovedListings);

  return (
    <>
      <div className="container-content">
        <div className="row">
          {/* Filters Sidebar */}
          <div className="col-md-2">
            <h5>Filters</h5>

            {/* Category Filter */}
            <div className="mb-3">
              <label className="form-label">By Category</label>
              <select className="form-select">
                <option value="COE">COE</option>
                <option value="CIT">CIT</option>
                <option value="COS">COS</option>
                <option value="CLA">CLA</option>
                <option value="CE">CE</option>
                <option value="CAFA">CAFA</option>
              </select>
            </div>

            {/* Rate Filter */}
            <div className="mb-3">
              <label className="form-label">By Rate</label>
              <select className="form-select">
                <option value="1">1 star</option>
                <option value="2">2 star</option>
                <option value="3">3 star</option>
                <option value="4">4 star</option>
                <option value="5">5 star</option>
              </select>
            </div>
          </div>

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
                <ItemCard items={allApprovedListings} title="Listings" />
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
