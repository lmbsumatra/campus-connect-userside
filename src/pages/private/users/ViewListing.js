// React imports
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

// Custom hooks and utility functions
import { formatDate } from "../../../utils/dateFormat";
import { formatTimeTo12Hour } from "../../../utils/timeFormat";
import useFetchItemByParam from "../../../hooks/useFetchItemByParam";
import { useAuth } from "../../../context/AuthContext";

// Assets
import "../../../components/itemlisting/itemStyles.css";
import userProfilePicture from "../../../assets/images/icons/user-icon.svg";
import itemImage from "../../../assets/images/item/item_1.jpg";
import UserToolbar from "../../../components/users/user-toolbar/UserToolbar";

function ViewListing() {
  // Retrieve the post ID from the URL params
  const { id } = useParams();

  // State to manage the selected rental date and time
  const [selectedDate, setSelectedDate] = useState(null);
  const [rentalDetails, setRentalDetails] = useState({
    selectedDate: null,
    selectedTime: null,
    rental_date_id: null,
    rental_time_id: null,
    agreedToTerms: false,
  });

  // Base API URL
  const baseUrl = "http://localhost:3001";

  // Fetch the selected post using the custom hook
  const { selectedItem, loading, error, tags } = useFetchItemByParam(
    `${baseUrl}/listings/available/${id}`
  );

  // Retrieve student user details from authentication context
  const { studentUser } = useAuth();
  const { userId } = studentUser;

  // Handle rental request submission
  const handleRentalRequest = async () => {
    const { selectedDate, selectedTime, agreedToTerms } = rentalDetails;

    // Check if both date and time are selected
    if (!selectedDate || !selectedTime) {
      alert("Please select both a date and a time.");
      return;
    }

    // Ensure user agrees to terms
    if (!agreedToTerms) {
      alert("You must agree to the rental terms.");
      return;
    }
    try {
      const response = await axios.post(
        "http://localhost:3001/rental-transaction/add",
        {
          owner_id: selectedItem.owner_id,
          renter_id: studentUser.userId,
          item_id: selectedItem.id,
          rental_date_id: rentalDetails.rental_date_id,
          rental_time_id: rentalDetails.rental_time_id,
          status: "Requested",
          delivery_method: selectedItem.delivery_mode,
        }
      );

      if (response.status === 201) {
        alert("Rental request submitted successfully!");
      }
    } catch (error) {
      console.error("Error creating rental:", error);

      // Check if the error response exists and contains the expected error message
      if (error.response && error.response.data && error.response.data.error) {
        alert(error.response.data.error); // Display the error message from the backend
      } else {
        // Default error message if it's an unknown error or no specific error message
        alert("Failed to create rental request. Please try again.");
      }
    }
  };

  // Loading, error, and fallback handling
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!selectedItem) return <p>Item not found</p>;

  // Parse item specifications (handle both string and object formats)
  const specifications =
    typeof selectedItem.specifications === "string"
      ? JSON.parse(selectedItem.specifications) || {}
      : selectedItem.specifications || {};

  const itemSpecifications = Object.entries(specifications).map(
    ([key, value]) => ({
      label: key || "N/A",
      value: value || "N/A",
    })
  );

  const isProfileVisit = userId === selectedItem.owner.user_id ? true : false;

  // Render the component
  return (
    <div>
      {/* Item Details Section */}
      <div className="py-4 px-2 m-0 rounded row bg-white">
        <div className="col-md-6 item-image">
          <img src={itemImage} alt="Item" className="img-container img-fluid" />
        </div>

        <div className="col-md-6 item-desc">
          {/* Category Button */}
          <button className="btn btn-rounded thin">
            {selectedItem.category}
          </button>

          {/* Item Name and Rating */}
          <div className="d-flex justify-content-between align-items-center">
            <p className="mb-0">
              <strong>{selectedItem.listing_name}</strong>
            </p>
            <p className="mb-0">
              <strong>{selectedItem.rating}</strong>
            </p>
          </div>

          {/* Item Rate and Action Buttons */}
          <span className="price">₱{selectedItem.rate}/hr</span>
          <div className="d-flex justify-content-end">
            <button className="btn btn-rectangle secondary no-fill me-2">
              Message
            </button>
            <button
              className="btn btn-rectangle primary no-fill me-2"
              onClick={handleRentalRequest}
            >
              Rent
            </button>
          </div>

          <hr />

          {/* Rental Dates Section */}
          <p>
            <strong>Available Dates</strong>
            {selectedItem.rental_dates.map((rental) => (
              <button
                key={rental.id}
                className={`btn btn-rounded thin ${
                  rental.date === rentalDetails.selectedDate ? "primary" : ""
                } me-2 ms-2`}
                onClick={() =>
                  setRentalDetails((prev) => ({
                    ...prev,
                    selectedDate: rental.date,
                    rental_date_id: rental.id,
                  }))
                }
              >
                {formatDate(rental.date)}
              </button>
            ))}
          </p>

          {/* Available Times Section */}
          <div>
            <p>
              <strong>Available Times</strong>{" "}
              {rentalDetails.selectedDate ? (
                formatDate(rentalDetails.selectedDate)
              ) : (
                <i>Please select a preferred date</i>
              )}
              :
            </p>
            {(rentalDetails.selectedDate &&
              selectedItem.rental_dates
                .find((rental) => rental.date === rentalDetails.selectedDate)
                ?.durations?.map((duration) => (
                  <button
                    key={duration.id}
                    className={`btn btn-rounded thin me-2 ms-2 ${
                      rentalDetails.selectedTime === duration.rental_time_from
                        ? "primary"
                        : ""
                    }`}
                    onClick={() =>
                      setRentalDetails((prev) => ({
                        ...prev,
                        selectedTime: duration.rental_time_from,
                        rental_time_id: duration.id,
                      }))
                    }
                  >
                    {`${formatTimeTo12Hour(
                      duration.rental_time_from
                    )} - ${formatTimeTo12Hour(duration.rental_time_to)}`}
                  </button>
                ))) || <p>No times available</p>}
          </div>

          {/* Terms and Agreement Section */}
          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              id="flexCheckDefault"
              checked={rentalDetails.agreedToTerms}
              onChange={() =>
                setRentalDetails((prev) => ({
                  ...prev,
                  agreedToTerms: !prev.agreedToTerms,
                }))
              }
            />
            <label className="form-check-label" htmlFor="flexCheckDefault">
              I agree to the rental terms set by the owner
            </label>
          </div>

          {/* Additional Information */}
          <p>
            <strong>Late Charges:</strong> ₱{selectedItem.late_charges}/hr
          </p>
          <p>
            <strong>Security Deposit:</strong> ₱{selectedItem.security_deposit}
          </p>
          <p>
            <strong>Repair and Replacement:</strong>{" "}
            {selectedItem.repair_replacement}
          </p>

          {/* Payment and Delivery Mode */}
          <div>
            <p>
              <strong>Payment Mode:</strong>
              <button className="btn btn-rounded primary thin ms-2">
                {selectedItem.payment_mode === "payment upon meetup"
                  ? "Upon meetup"
                  : "Gcash"}
              </button>
            </p>
          </div>
          <div>
            <p>
              <strong>Delivery:</strong>
              <button className="btn btn-rounded primary thin ms-2">
                {selectedItem.delivery_mode === "pickup" ? "Pickup" : "Meetup"}
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* User Info Section */}
      <UserToolbar
        userProfilePic={selectedItem.userProfilePic || userProfilePicture}
        user={selectedItem?.owner}
        isProfileVisit={isProfileVisit}
        userRating={selectedItem.userRating}
        buttonText1="View Listings"
        buttonText2="View Profile"
        activeTab="Listings"
      />

      {/* Item Specifications Section */}
      <div className="item-specs mt-5 p-4 bg-white">
        <h4>Item Specifications</h4>
        <table className="specifications-table">
          <thead>
            <tr>
              <th>Specification</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            {itemSpecifications.map((spec, index) => (
              <tr key={index}>
                <td>
                  <strong>{spec.label}</strong>
                </td>
                <td>{spec.value}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <hr />

        {/* Item Description and Tags */}
        <h4>Item Description</h4>
        <p>{selectedItem.description}</p>
        <div>
          <strong>Tags:</strong>
          {tags.length > 0 ? (
            <div className="tags-container">
              {tags.map((tag, index) => (
                <span key={index} className="badge bg-primary me-2">
                  {tag}
                </span>
              ))}
            </div>
          ) : (
            <p>No tags available</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default ViewListing;
