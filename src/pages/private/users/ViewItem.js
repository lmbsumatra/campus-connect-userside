import React, { useState } from "react";
import { useParams } from "react-router-dom";
import "../../../components/itemlisting/itemStyles.css";
import userProfilePicture from "../../../assets/images/icons/user-icon.svg";
import itemImage from "../../../assets/images/item/item_1.jpg";
import { formatDate } from "../../../utils/dateFormat";
import { formatTimeTo12Hour } from "../../../utils/timeFormat";
import FetchItemForSaleData from "../../../utils/FetchItemForSaleData";

function ViewItem() {
  const { id } = useParams();
  const { selectedItem, loading, error, tags } = FetchItemForSaleData({ id }); // Use the component

  const [selectedDate, setSelectedDate] = useState(null);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  if (!selectedItem) {
    return <p>Item not found</p>;
  }

  const {
    itemImage: itemImageUrl = itemImage,
    rating = 0,
    price = "0",
    available_dates = [],
    userProfilePicture: userProfilePic = userProfilePicture,
    userName = "Unknown User",
    userRating = 0,
    description = "No description available.",
  } = selectedItem;

  let specifications = {};
  if (typeof selectedItem.specifications === "string") {
    try {
      specifications = JSON.parse(selectedItem.specifications);
    } catch (error) {
      console.error("Error parsing specifications:", error);
      specifications = {};
    }
  } else if (typeof selectedItem.specifications === "object") {
    specifications = selectedItem.specifications;
  }

  const itemSpecifications = Object.entries(specifications).map(
    ([key, value]) => ({
      label: key || "N/A",
      value: value || "N/A",
    })
  );

  return (
    <div>
      <div className="py-4 px-2 m-0 rounded row bg-white">
        <div className="col-md-6 item-image">
          <img src={itemImageUrl} alt="Item" className="img-container img-fluid" />
        </div>
        <div className="col-md-6 item-desc">
          <button className="btn btn-rounded thin">{selectedItem.category}</button>
          <div className="d-flex justify-content-between align-items-center">
            <p className="mb-0"><i>Item for sale </i><strong>{selectedItem.item_for_sale_name}</strong></p>
            <p className="mb-0"><strong>{rating}</strong></p>
          </div>
          <span className="price">₱{price}/hr</span>
          <div className="d-flex justify-content-end">
            <button className="btn btn-rectangle secondary no-fill me-2">Message</button>
            <button className="btn btn-rectangle primary no-fill me-2">Borrow</button>
          </div>

          <hr />

          <p>
            <strong>Available Dates</strong>
            {available_dates.map((date) => (
              <button key={date.id} className="btn btn-rounded thin me-2 ms-2" onClick={() => setSelectedDate(date.date)}>
                {formatDate(date.date)}
              </button>
            ))}
          </p>

          <div>
            <p>
              <strong>Available Times</strong> {selectedDate ? formatDate(selectedDate) : <i>Please select a preferred date</i>}:
            </p>
            {(selectedDate &&
              available_dates.find((rental) => rental.date === selectedDate)?.durations?.map((duration) => (
                <button key={duration.id} className="btn btn-rounded thin me-2 ms-2">
                  {`${formatTimeTo12Hour(duration.rental_time_from)} - ${formatTimeTo12Hour(duration.rental_time_to)}`}
                </button>
              ))) || <p>No times available</p>}
          </div>

          <div>
            <p>
              <strong>Payment Mode:</strong>
              <button className="btn btn-rounded primary thin ms-2">
                {selectedItem.payment_mode === "payment upon meetup" ? "Upon meetup" : "Gcash"}
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

          <div className="form-check">
            <input className="form-check-input" type="checkbox" id="flexCheckDefault" />
            <label className="form-check-label" htmlFor="flexCheckDefault">
              I agree to the rental terms set by the owner
            </label>
          </div>
        </div>
      </div>

      <div className="user-info mt-5 bg-white">
        <div className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            <img src={userProfilePic} alt="Profile" className="profile-pic me-2" />
            <div>
              <a href={`/userprofile/${userName}`} className="text-dark small text-decoration-none">
              {selectedItem.seller.first_name}  {selectedItem.seller.last_name}
              </a>
            </div>
          </div>
          <div className="rating">
            <span>Rating:</span>
            {"★".repeat(Math.floor(userRating))}
            {"☆".repeat(5 - Math.floor(userRating))}
          </div>
          <button className="btn btn-rectangle secondary me-2">View Listings</button>
          <button className="btn btn-rectangle secondary me-2">View Profile</button>
        </div>
      </div>

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
                <td><strong>{spec.label}</strong></td>
                <td>{spec.value}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <hr />

        <h4>Item Description</h4>
        <p>{description}</p>
        <div>
          <strong>Tags:</strong>
          {Array.isArray(tags) && tags.length > 0 ? (
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

export default ViewItem;
