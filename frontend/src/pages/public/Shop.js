// Imports
import React, { useEffect, useState } from "react";
import ItemCard from "../../components/item-card/ItemCard";
import TimeoutComponent from "../../utils/TimeoutComponent";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllApprovedItemForSale } from "../../redux/item-for-sale/allApprovedItemsForSaleSlice";
import LoadingItemCardSkeleton from "../../components/loading-skeleton/loading-item-card-skeleton/LoadingItemCardSkeleton";

// Shop Component
const Shop = () => {
  // State Variables
  const [categoryFilter, setCategoryFilter] = useState("COE");
  const [rateFilter, setRateFilter] = useState("1");
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchAllApprovedItemForSale());
  }, [dispatch]);

  const {
    allApprovedItemForSale,
    loadingAllApprovedItemForSale,
    errorAllApprovedItemForSale,
  } = useSelector((state) => state.allApprovedItemForSale);

  // Event Handlers for Filters
  const handleCategoryChange = (e) => setCategoryFilter(e.target.value);
  const handleRateChange = (e) => setRateFilter(e.target.value);

  // Component JSX
  return (
    <div className="container-content">
      <div className="row">
        {/* Filters Section */}
        <div className="col-md-2">
          <h5>Filters</h5>
          <div className="mb-3">
            <label className="form-label">By Category</label>
            <select
              className="form-select"
              value={categoryFilter}
              onChange={handleCategoryChange}
            >
              <option value="COE">COE</option>
              <option value="CIT">CIT</option>
              <option value="COS">COS</option>
              <option value="CLA">CLA</option>
              <option value="CE">CE</option>
              <option value="CAFA">CAFA</option>
            </select>
          </div>
          <div className="mb-3">
            <label className="form-label">By Rate</label>
            <select
              className="form-select"
              value={rateFilter}
              onChange={handleRateChange}
            >
              <option value="1">1 star</option>
              <option value="2">2 star</option>
              <option value="3">3 star</option>
              <option value="4">4 star</option>
              <option value="5">5 star</option>
            </select>
          </div>
        </div>

        {/* Item Display Section */}
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
            {!loadingAllApprovedItemForSale && (
              <ItemCard items={allApprovedItemForSale} title="For Sale" />
            )}
          </TimeoutComponent>
        </div>
      </div>
    </div>
  );
};

export default Shop;
