// src/pages/RentProgress.js
import React from "react";
import NavBar from "../../components/navbar/navbar/NavBar";
import Footer from "../../components/footer/Footer";
import "./RentProgress.css"; // Import the CSS file
import item1 from "../../assets/images/item/item_1.jpg"; // Import the image

function RentProgress() {
  return (
    <div>
      <NavBar />
    <div className="rent-progress">
      <div className="progress-container">
        <h2>Transaction ID: JSX123445</h2>
        <span className="status">Status: Completed</span>
        <div className="progress-tracker">
          <div className="step completed">
            <div className="bullet"></div>
            <p>June 10 2024<br/>Item Requested</p>
          </div>
          <div className="step completed">
            <div className="bullet"></div>
            <p>June 10 2024<br/>Request Accepted</p>
          </div>
          <div className="step completed">
            <div className="bullet"></div>
            <p>June 10 2024<br/>Handed Over</p>
          </div>
          <div className="step completed">
            <div className="bullet"></div>
            <p>June 10 2024<br/>Return</p>
          </div>
          <div className="step completed">
            <div className="bullet"></div>
            <p>June 10 2024<br/>Completed</p>
          </div>
          <div className="step completed">
            <div className="bullet"></div>
            <p>June 10 2024<br/>Review</p>
          </div>
        </div>
        <div className="transaction-details">
          <h3>Transaction Details</h3>
          <div className="item-info">
            <img src={item1} alt="Calculus Text Book" />
            <div>
              <p><strong>Item:</strong> Calculus Text Book</p>
              <p><strong>Rental Period:</strong> June 10 - June 10</p>
              <p><strong>Rental Rate:</strong> 10php</p>
              <p><strong>Total Cost:</strong> 10php</p>
            </div>
          </div>
        </div>
        <div className="delivery-info">
          <h3>Delivery Information</h3>
          <p><strong>Location:</strong> TUP-M CIT Building</p>
          <p><strong>Method:</strong> Meetup</p>
        </div>
        <div className="owner-info">
          <h3>Owner/Borrower Information</h3>
          <p><strong>Name:</strong> Owner name</p>
          <p><strong>Rating:</strong> <span className="rating">★★★★★</span></p>
          <button className="btn btn-primary no-fill me-2">
              <span className="text-gradient">Message</span>
          </button>
        </div>
      </div>
      
    </div>
      <Footer />
    </div>
  );
}

export default RentProgress;
