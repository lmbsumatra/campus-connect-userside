// React Imports
import React from "react";
import { Link, useLocation } from "react-router-dom";

// Component Imports
import ItemList from "../../components/itemlisting/ItemList";

// Hook Imports
import useFetchApprovedItems from "../../hooks/useFetchApprovedItems";

const Rent = () => {
  const location = useLocation();

  // Data Constants
  const baseUrl = "http://localhost:3001";

  // Fetch listings data (approved items for rent)
  const { items: listings, loading: loadingListings, error: errorListings } = useFetchApprovedItems(`${baseUrl}/listings/available`);

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

            {/* Add New Item Button */}
            <Link to="/add-item" className="btn btn-primary no-fill">
              Add New Item
            </Link>
          </div>

          {/* Listings Display */}
          <div className="col-md-10">
            {/* Loading and Error Handling for Listings */}
            {loadingListings && <p>Loading listings...</p>}
            {errorListings && <p>Error loading listings: {errorListings}</p>}
            
            {/* Render the listings */}
            <ItemList listings={listings} title="Rent" />
          </div>
        </div>
      </div>
    </>
  );
};

export default Rent;
