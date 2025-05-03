import React, { useState, useEffect } from "react";
import "./style.css";
import { useParams } from "react-router-dom";
import axios from "axios";
import userProfilePicture from "../../assets/images/icons/user-icon.svg";
import itemImage from "../../assets/images/item/item_1.jpg";
import { formatDate } from "../../../utils/dateFormat";
import { formatTimeTo12Hour } from "../../../utils/timeFormat";
import { baseApi } from "../../../utils/consonants";

function ViewPost() {
  const { id } = useParams();
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tags, setTags] = useState([]);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const response = await axios.get(
          `${baseApi}/listings/${id}`
        );
        // console.log("Response data:", response.data);

        setSelectedItem(response.data);

        const fetchedTags = response.data.tags;
        // console.log("Fetched tags:", fetchedTags);

        let parsedTags = [];
        if (Array.isArray(fetchedTags)) {
          parsedTags = fetchedTags;
        } else if (typeof fetchedTags === "string") {
          try {
            parsedTags = JSON.parse(fetchedTags);
          } catch (parseError) {
            parsedTags = fetchedTags.split(",").map((tag) => tag.trim());
          }
        }
        // console.log("parsedTags tags:", parsedTags);

        setTags(parsedTags);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [id]);

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
    itemCategory = "N/A",
    title = "N/A",
    rating = 0,
    price = "0",
    availableDates = [],
    availableDuration = [],
    lateCharges = "0",
    securityDeposit = "0",
    repairAndReplacement = "N/A",
    userProfilePicture: userProfilePic = userProfilePicture,
    userName = "Unknown User",
    userRating = 0,
    itemDescription = "No description available.",
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
      <div className="container-content">
        <div className="item-container row bg-white">
          <div className="col-md-6 item-image">
            <img
              src={itemImageUrl}
              alt="Item"
              className="img-container img-fluid"
            />
          </div>

          <div className="col-md-6 item-desc">
            <button className="btn btn-rounded thin">
              {selectedItem.category}
            </button>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <p className="mb-0">
                <strong>{selectedItem.listing_name}</strong>
              </p>
              <p className="mb-0">
                <strong>{rating}</strong>
              </p>
            </div>
            <span className="price">₱{selectedItem.rate}/hr</span>
            <div className="mt-5 d-flex justify-content-end">
              <button className="btn btn-rectangle secondary no-fill me-2">
                Message
              </button>
              <button className="btn btn-rectangle primary no-fill me-2">
                Borrow
              </button>
            </div>

            <hr />

            <p>
              <strong>Available Dates</strong>
              {selectedItem.rental_dates.map((dateObj) => (
                <button
                  key={dateObj.rental_date}
                  className="btn btn-rounded thin me-2 ms-2"
                  onClick={() => setSelectedDate(dateObj.rental_date)}
                >
                  {formatDate(dateObj.rental_date)}
                </button>
              ))}
            </p>

            <div>
              <p>
                <strong>Available Times</strong> {selectedDate? formatDate(selectedDate): <i>Please select a preferred date</i>}:
              </p>
              {(selectedDate &&
                selectedItem.rental_dates
                  .find((date) => date.rental_date === selectedDate)
                  ?.durations?.map((duration, index) => (
                    <button
                      key={index}
                      className="btn btn-rounded thin me-2 ms-2"
                    >
                      {`${formatTimeTo12Hour(duration.rental_time_from)} - ${formatTimeTo12Hour(duration.rental_time_to)}`}
                    </button>
                  ))) || <p>No times available</p>}
            </div>

            <div>
              <p>
                <strong>Available Duration</strong> {selectedDate}:
              </p>
              <div>
                {availableDuration.map((time, index) => (
                  <button
                    key={index}
                    className="btn btn-rounded thin me-2 ms-2"
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>

            <p>
              <strong>Late Charges:</strong> ₱{selectedItem.late_charges}/hr
            </p>
            <p>
              <strong>Security Deposit:</strong> ₱
              {selectedItem.security_deposit}
            </p>
            <p>
              <strong>Repair and Replacement:</strong>{" "}
              {selectedItem.repair_replacement}
            </p>

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
                  {selectedItem.delivery_mode === "pickup"
                    ? "Pickup"
                    : "Meetup"}
                </button>
              </p>
            </div>

            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                id="flexCheckDefault"
              />
              <label className="form-check-label" htmlFor="flexCheckDefault">
                I agree to the rental terms set by the owner
              </label>
            </div>
          </div>
        </div>

        <div className="user-info mt-5 bg-white">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <img
                src={userProfilePic}
                alt="Profile"
                className="profile-pic me-2"
              />
              <div>
                <a
                  href={`/userprofile/${userName}`}
                  className="text-dark small text-decoration-none"
                >
                  {userName}
                </a>
              </div>
            </div>
            <div className="rating">
              <span>Rating:</span>
              {"★".repeat(Math.floor(userRating))}
              {"☆".repeat(5 - Math.floor(userRating))}
            </div>
            <button className="btn btn-rectangle secondary me-2">
              View Listings
            </button>
            <button className="btn btn-rectangle secondary me-2">
              View Profile
            </button>
          </div>
        </div>

        <div className="item-specs mt-5 bg-white">
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

          <h4>Item Description</h4>
          <p>{selectedItem.description}</p>
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
    </div>
  );
}

export default ViewPost;
