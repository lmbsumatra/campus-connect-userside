import React, { useState, useEffect } from "react";
// import "./style.css"; // Uncomment if you have a CSS file to import
import { useParams } from "react-router-dom";
import userProfilePicture from "../../../assets/images/icons/user-icon.svg";
import itemImage from "../../../assets/images/item/item_1.jpg";
import { formatDate } from "../../../utils/dateFormat";
import { formatTimeTo12Hour } from "../../../utils/timeFormat";
import axios from "axios";

function ViewPost() {
  const { id } = useParams();
  const [selectedPost, setSelectedPost] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tags, setTags] = useState([]);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/posts/${id}`);
        setSelectedPost(response.data);

        const fetchedTags = response.data.tags;
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

  if (!selectedPost) {
    return <p>Item not found</p>;
  }

  const {
    itemImage: itemImageUrl = itemImage,
    post_item_name = "N/A",
    rental_dates = [],
    userProfilePicture: userProfilePic = userProfilePicture,
    renter = {},
    userRating = 0,
    description = "No description available.",
  } = selectedPost;

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
            <img src={itemImageUrl} alt="Item" className="img-container img-fluid" />
          </div>

          <div className="col-md-6 item-desc">
            <button className="btn btn-rounded thin">
              {selectedPost.category}
            </button>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <p className="mb-0">
                <i>Looking for </i>
                <strong>{post_item_name}</strong>
              </p>
            </div>
            <div className="mt-5 d-flex justify-content-end">
              <button className="btn btn-rectangle secondary no-fill me-2">Message</button>
              <button className="btn btn-rectangle primary no-fill me-2">Offer</button>
            </div>

            <hr />

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

            <div>
              <p>
                <strong>Request Times</strong>{" "}
                {selectedDate ? formatDate(selectedDate) : <i>Please select a preferred date</i>}:
              </p>
              {selectedDate &&
                rental_dates
                  .find((rental) => rental.date === selectedDate)
                  ?.durations?.map((duration, index) => (
                    <button key={index} className="btn btn-rounded thin me-2 ms-2">
                      {`${formatTimeTo12Hour(duration.rental_time_from)} - ${formatTimeTo12Hour(duration.rental_time_to)}`}
                    </button>
                  )) || <p>No times available</p>}
            </div>
          </div>
        </div>

        <div className="user-info mt-5 bg-white">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <img src={userProfilePic} alt="Profile" className="profile-pic me-2" />
              <div>
                <a href={`/userprofile/${renter.first_name}`} className="text-dark small text-decoration-none">
                  {renter.first_name}
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
                  <span key={index} className="badge bg-primary me-2">{tag}</span>
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
