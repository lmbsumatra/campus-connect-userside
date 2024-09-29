
import React from 'react';
import NavBar from '../../components/navbar/navbar/NavBar';
import ListingItem from '../../components/listings/ListingItem';
import Footer from '../../components/footer/Footer';
import { Link } from 'react-router-dom';

function Listings() {
  return (
    <>
      <NavBar />
      <div className="custom-container">
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
            <Link to="/add-item" className="btn btn-primary no-fill">Add New Item</Link>
          </div>
          <div className="col-md-10">
            <ListingItem />
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default Listings;