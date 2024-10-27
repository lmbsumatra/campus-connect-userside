// React Imports
import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";

// Component Imports
import NavBar from "../../components/navbar/navbar/NavBar";
import ListingItem from "../../components/listings/ListingItem";
import ItemList from "../../components/itemlisting/ItemList";

// Asset Imports
import item1 from "../../assets/images/item/item_1.jpg";
import ownerImg from "../../assets/images/icons/user-icon.svg";

const Rent = () => {
  const location = useLocation();
  // Data Constants
  const [listings, setListings] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchItem = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/listings/info`);
        console.log("Response data:", response.data);

        setListings(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, []);
  return (
    <>
      <div className="container-content">
        <div className="row">
          <div className="col-md-2">
            <h5>Filters</h5>
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
            <Link to="/add-item" className="btn btn-primary no-fill">
              Add New Item
            </Link>
          </div>
          <div className="col-md-10">
            <ItemList listings={listings} title="Rent" />
          </div>
        </div>
      </div>
    </>
  );
};

export default Rent;
