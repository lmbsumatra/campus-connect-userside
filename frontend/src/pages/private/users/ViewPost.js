// React imports
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { baseApi } from "../../../App";

// Custom hooks and utility functions
import useFetchItemByParam from "../../../hooks/useFetchItemByParam";
import { formatDate } from "../../../utils/dateFormat";
import { formatTimeTo12Hour } from "../../../utils/timeFormat";

// Assets
import userProfilePicture from "../../../assets/images/icons/user-icon.svg";
import itemImage from "../../../assets/images/item/item_1.jpg";
import { useAuth } from "../../../context/AuthContext";
import UserToolbar from "../../../components/users/user-toolbar/UserToolbar";

function ViewPost() {
  const { studentUser } = useAuth();
  const { userId } = studentUser;
  // Retrieve the post ID from the URL params
  const { id } = useParams();

  // State to manage the selected rental date
  const [selectedDate, setSelectedDate] = useState(null);

  // Base API URL
  const baseUrl = "http://localhost:3001";

  // Fetch the selected post using the custom hook
  const {
    selectedItem: selectedPost,
    loading,
    error,
    tags,
  } = useFetchItemByParam(`${baseApi}/posts/available/${id}`);

  // Loading and error handling
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!selectedPost) return <p>Item not found</p>;

  // Destructure the properties of the fetched post
  const {
    itemImage: itemImageUrl = itemImage,
    post_item_name = "N/A",
    rental_dates = [],
    userProfilePicture: userProfilePic = userProfilePicture,
    renter = {},
    userRating = 0,
    description = "No description available.",
  } = selectedPost;

  const isProfileVisit = userId === renter.user_id ? true : false;
  
  // Parse item specifications (handle both string and object formats)
  let specifications = {};
  if (typeof selectedPost.specifications === "string") {
    try {
      specifications = JSON.parse(selectedPost.specifications);
    } catch (error) {
      console.error("Error parsing specifications:", error);
      specifications = {};
    }
  } else if (typeof selectedPost.specifications === "object") {
    specifications = selectedPost.specifications;
  }

  // Convert specifications object into a displayable format (label, value pairs)
  const itemSpecifications = Object.entries(specifications).map(
    ([key, value]) => ({
      label: key || "N/A",
      value: value || "N/A",
    })
  );

  return (
    <div>
      {/* Item Header Section */}
      <div className="py-4 px-2 m-0 rounded row bg-white">
        <div className="col-md-6 item-image">
          <img
            src={itemImageUrl}
            alt="Item"
            className="img-container img-fluid"
          />
        </div>

        <div className="col-md-6 item-desc">
          <button className="btn btn-rounded thin" disabled>
            {selectedPost.category}
          </button>
          <div className="d-flex justify-content-between align-items-center m-0 p-0">
            <p>
              <i>Looking for </i>
              <strong>{post_item_name}</strong>
            </p>
          </div>
          <div className="d-flex justify-content-end">
            <button className="btn btn-rectangle secondary no-fill me-2">
              Message
            </button>
            <button className="btn btn-rectangle primary no-fill me-2">
              Offer
            </button>
          </div>

          <hr />

          {/* Rental Dates Section */}
          <p>
            <strong>Request Dates</strong>
            {rental_dates.map((rental) => (
              <button
                key={rental.date}
                className="btn btn-rounded thin me-2 ms-2"
                onClick={() => setSelectedDate(rental.date)}
              >
                {formatDate(rental.date)}
              </button>
            ))}
          </p>

          {/* Request Times Section */}
          <div>
            <p>
              <strong>Request Times</strong>{" "}
              {selectedDate ? (
                formatDate(selectedDate)
              ) : (
                <i>Please select a preferred date</i>
              )}
              :
            </p>
            {(selectedDate &&
              rental_dates
                .find((rental) => rental.date === selectedDate)
                ?.durations?.map((duration, index) => (
                  <button
                    key={index}
                    className="btn btn-rounded thin me-2 ms-2"
                  >
                    {`${formatTimeTo12Hour(
                      duration.rental_time_from
                    )} - ${formatTimeTo12Hour(duration.rental_time_to)}`}
                  </button>
                ))) || <p>No times available</p>}
          </div>
        </div>
      </div>

      <UserToolbar
        userProfilePic={userProfilePic}
        user={renter}
        isProfileVisit={isProfileVisit}
        userRating={userRating}
        buttonText1="View Posts"
        buttonText2="View Profile"
        activeTab="Posts"
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

        {/* Item Description Section */}
        <h4>Item Description</h4>
        <p>{description}</p>

        {/* Tags Section */}
        <div>
          <strong>Tags:</strong>
          {Array.isArray(tags) && tags.length > 0 ? (
            <div className="tags-container d-flex gap-2">
              {tags.map((tag, index) => (
                <button key={index} className="btn btn-rounded thin" disabled>
                  {tag}
                </button>
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

export default ViewPost;
