// Imports
import React, { useState } from "react";
import { Link } from "react-router-dom";
import useFetchApprovedItems from "../../hooks/useFetchApprovedItems";
import ItemList from "../../components/itemlisting/ItemList";
import { baseApi } from "../../App";

// Shop Component
const Shop = () => {
  // State Variables
  const [categoryFilter, setCategoryFilter] = useState("COE");
  const [rateFilter, setRateFilter] = useState("1");

  // API Base URL
  const baseUrl = "http://localhost:3001";

  // Construct URL for Fetching Data
  // const fetchUrl = `${baseUrl}/item-for-sale/info?category=${categoryFilter}&rate=${rateFilter}`;

  // Fetch Listings Data (approved items for sale or rent)
  const { items, loading, error } = useFetchApprovedItems(`${baseApi}/item-for-sale/available`);

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
          {loading ? (
            <div>Loading items...</div>
          ) : error ? (
            <div>Error: {error}</div>
          ) : (
            <ItemList items={items} title="Shop" />
          )}
        </div>
      </div>
    </div>
  );
};

export default Shop;
