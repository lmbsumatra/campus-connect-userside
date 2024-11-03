import React, { useEffect, useState } from "react";
import axios from "axios"; // Import axios for API calls
import "./RentProgress.css"; // Import the CSS file
import item1 from "../../assets/images/item/item_1.jpg"; // Import the image
import { useAuth } from "../../context/AuthContext";
import { useParams } from "react-router-dom";

function RentProgress({  }) {
  const [transaction, setTransaction] = useState(null);
  const [error, setError] = useState(null);
  const {userId} = useAuth; 
  const {id} = useParams();

  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        console.log(id)
        const response = await axios.get(`http://localhost:3001/rental-transaction/${id}`);
        setTransaction(response.data);
        console.log(response.data)
      } catch (err) {
        setError(err.response ? err.response.data.error : "An error occurred while fetching the transaction.");
      }
    };

    fetchTransaction();
  }, [id]);

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!transaction) {
    return <div>Loading...</div>; // Optionally, show a loading indicator
  }

  return (
    <div>
      <div className="rent-progress">
        <div className="progress-container">
          <h2>Transaction ID: {transaction.id}</h2>
          <span className="status">Status: {transaction.rental.status}</span>
          <div className="progress-tracker">
            {/* Loop through the transaction steps dynamically if you have them */}
            {/* {transaction.history.map((step, index) => (
              <div key={index} className={`step ${step.completed ? "completed" : ""}`}>
                <div className="bullet"></div>
                <p>
                  {step.date}
                  <br />
                  {step.description}
                </p>
              </div>
            ))} */}
          </div>
          <div className="transaction-details">
            <h3>Transaction Details</h3>
            <div className="item-info">
              <img src={item1} alt="Item" />
              <div>
                <p>
                  <strong>Item:</strong> {transaction.rental.Listing.listing_name}
                </p>
                <p>
                  <strong>Rental Period:</strong> {transaction.rental.RentalDate.date}
                </p>
                <p>
                  <strong>Rental Rate:</strong> {transaction.rental.Listing.rate} php
                </p>
                <p>
                  <strong>Total Cost:</strong> {/*{transaction.totalCost} */}php
                </p>
              </div>
            </div>
          </div>
          <div className="delivery-info">
            <h3>Delivery Information</h3>
            <p>
              <strong>Location:</strong> 
            </p>
            <p>
              <strong>Method:</strong> {transaction.rental.delivery_method}
            </p>
          </div>
          <div className="owner-info">
            <h3>Owner/Borrower Information</h3>
            <p>
              <strong>Name:</strong> {transaction.rental.owner.first_name}
            </p>
            <p>
              <strong>Rating:</strong> <span className="rating">★★★★★</span>
            </p>
            <button className="btn btn-rectangle secondary">
              Message
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RentProgress;
