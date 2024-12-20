import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchApprovedPostById } from "../../../../redux/post/approvedPostByIdSlice";

// Custom hooks and utility functions
import { useAuth } from "../../../../context/AuthContext";
import { formatDate } from "../../../../utils/dateFormat";
import { formatTimeTo12Hour } from "../../../../utils/timeFormat";
import Tooltip from "@mui/material/Tooltip";

// Assets
import userProfilePicture from "../../../../assets/images/icons/user-icon.svg";
import prevIcon from "../../../../assets/images/pdp/prev.svg";
import nextIcon from "../../../../assets/images/pdp/next.svg";
import itemImage1 from "../../../../assets/images/item/item_1.jpg";
import itemImage2 from "../../../../assets/images/item/item_2.jpg";
import itemImage3 from "../../../../assets/images/item/item_3.jpg";
import itemImage4 from "../../../../assets/images/item/item_4.jpg";
import forRentIcon from "../../../../assets/images/card/rent.svg";
import UserToolbar from "../../../../components/users/user-toolbar/UserToolbar";
import "./postDetailStyles.css";

import { computeDuration } from "../../../../utils/timeFormat";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

function PostDetail() {
  const [currentIndex, setCurrentIndex] = useState(1);
  const [college, setCollege] = useState("CIE");
  const { id } = useParams(); // Get the post ID from URL params
  const dispatch = useDispatch();
  const [selectedDate, setSelectedDate] = useState(null);
  const [showDurations, setShowDurations] = useState(null); // For showing durations

  // Fetch post details using the ID from the URL
  useEffect(() => {
    if (id) {
      dispatch(fetchApprovedPostById(id)); // Dispatch action to fetch post details by ID
    }
  }, [dispatch, id]);

  // Fetching post details from Redux store
  const { approvedPostById, loadingApprovedPostById, errorApprovedPostById } =
    useSelector((state) => state.approvedPostById);

  const { studentUser } = useAuth();
  const { userId } = studentUser;

  // Images for the slider
  const images = [
    itemImage1,
    itemImage2,
    itemImage3,
    itemImage4,
    itemImage4,
    itemImage4,
    itemImage4,
  ];

  // Navigation for image slider
  const nextImage = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };
  const prevImage = () => {
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + images.length) % images.length
    );
  };
  const highlightImage = (index) => {
    setCurrentIndex(index);
  };

  // Handle loadingApprovedPostById and errorApprovedPostById states
  if (loadingApprovedPostById) {
    return <p>Loading...</p>; // Show loadingApprovedPostById state
  }

  if (errorApprovedPostById) {
    return <p>Error: {errorApprovedPostById}</p>; // Show errorApprovedPostById if any
  }

  if (!approvedPostById) {
    return <p>Item not found</p>;
  }

  const rentalDates = approvedPostById.rentalDates || [];

  // Handle the date click event
  const handleDateClick = (dateId) => {
    const selectedRentalDate = approvedPostById.rentalDates.find(
      (rentalDate) => rentalDate.id === dateId
    );

    console.log(
      "Selected Rental Date's Durations:",
      selectedRentalDate.durations
    ); // Debugging line

    if (selectedRentalDate && selectedRentalDate.durations) {
      setSelectedDate(selectedRentalDate.date);
      setShowDurations(selectedRentalDate.durations); // Update the state with durations
    }
  };

  // Create an array of available dates for highlighting
  const availableDates = rentalDates
    .filter((rentalDate) => rentalDate.status === "available")
    .map((rentalDate) => new Date(rentalDate.date));

  const highlightStyle = {
    backgroundImage: `url(${images[0]})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    filter: "blur(15px)",
    position: "absolute",
    top: 0,
    left: 0,
    height: "100%",
    width: "100%",
    zIndex: 0,
  };

  return (
    <div className="container-content post-detail">
      <div className="post-container">
        <div className="imgs-container">
        <Tooltip
              title={"This is a tooltip"}
              componentsProps={{
                popper: {
                  modifiers: [
                    {
                      name: "offset",
                      options: {
                        offset: [0, -10], // Adjust tooltip position
                      },
                    },
                  ],
                },
              }}
            >
              <img
                src={forRentIcon}
                alt={`Item is for rent`}
                className="item-type"
              />
            </Tooltip>
          {/* Blurred background layer */}
          <div
            className="highlight-bg"
            style={{
              backgroundImage: `url(${images[currentIndex]})`,
            }}
          ></div>

          {/* Highlighted image container */}
          <div className="highlight">
            <img
              src={images[currentIndex]}
              alt="Item"
              className="highlight-img"
            />
            
          </div>
          {/* Image Slider */}
          <div className="img-slider">
            <div className="btn-slider prev-btn" onClick={prevImage}>
              <img src={prevIcon} alt="Previous image" className="prev-btn" />
            </div>
            <img
              src={images[(currentIndex - 2 + images.length) % images.length]}
              alt="Item"
              className="item-img"
              onClick={() => highlightImage((currentIndex - 2) % images.length)}
            />
            <img
              src={images[(currentIndex - 1 + images.length) % images.length]}
              alt="Item"
              className="item-img"
              onClick={() => highlightImage((currentIndex - 1) % images.length)}
            />
            <img
              src={images[currentIndex]}
              alt="Item"
              className="item-img center"
            />
            <img
              src={images[(currentIndex + 1) % images.length]}
              alt="Item"
              className="item-img"
              onClick={() => highlightImage((currentIndex + 1) % images.length)}
            />
            <img
              src={images[(currentIndex + 2) % images.length]}
              alt="Item"
              className="item-img"
              onClick={() => highlightImage((currentIndex + 2) % images.length)}
            />
            <div className="btn-slider next-btn" onClick={nextImage}>
              <img src={nextIcon} alt="Next image" className="next-btn" />
            </div>
          </div>
        </div>

        {/* Post Description */}
        <div className="rental-details">
          <div className="college-badge">
            <Tooltip title="This item is from CAFA." placement="bottom">
              <img
                src={require(`../../../../assets/images/colleges/CAFA.png`)}
                alt="College"
                style={{ height: "24px", width: "24px" }}
              />
              {approvedPostById.college && (
                <span>{approvedPostById.college}</span>
              )}
            </Tooltip>
          </div>
          <div className="d-flex justify-content-between align-items-center m-0 p-0">
            <p>
              <i>Looking for </i>
              {approvedPostById.name && (
                <strong>{approvedPostById.name}</strong>
              )}
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
          <div className="rental-dates-durations">
            <div className="date-picker">
              <span>Pick a date to offer:</span>
              {/* Inline DatePicker with available dates highlighted */}
              <DatePicker
                inline
                selected={selectedDate ? new Date(selectedDate) : null}
                onChange={(date) => {
                  const clickedDateId = rentalDates.find(
                    (rentalDate) =>
                      new Date(rentalDate.date).toDateString() ===
                      date.toDateString()
                  )?.id;

                  if (clickedDateId) {
                    handleDateClick(clickedDateId); // Call the handleDateClick function
                  }
                  setSelectedDate(date); // Update selected date
                  // Find the corresponding rental date
                  const rentalDate = rentalDates.find(
                    (r) =>
                      new Date(r.date).toDateString() === date.toDateString()
                  );
                  if (rentalDate && rentalDate.status === "available") {
                    setShowDurations(rentalDate.durations); // Show durations for the selected date
                  } else {
                    setShowDurations(null); // No durations if date is not available
                  }
                }} // Update selected date
                highlightDates={availableDates} // Highlight available dates
                dayClassName={(date) => {
                  // Add custom styling to available dates
                  return availableDates.some(
                    (d) => d.toDateString() === date.toDateString()
                  )
                    ? "bg-green"
                    : "";
                }}
              />
            </div>
            {/* Displaying durations if available */}
            <div className="duration-picker">
              <strong>Available Durations:</strong>
              <div>
                {selectedDate ? (
                  showDurations && showDurations.length > 0 ? (
                    // Show durations if they exist
                    <div className="duration-list">
                      {showDurations.map((duration) => (
                        <div key={duration.id} className="duration-item">
                          <span>
                            {formatTimeTo12Hour(duration.timeFrom)} -{" "}
                            {formatTimeTo12Hour(duration.timeTo)}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    // Show "No available duration" if no durations exist
                    <p className="no-duration-message">
                      No available duration for this date.
                    </p>
                  )
                ) : (
                  // Show "Please select a date" if no date is selected
                  <p className="select-date-message">
                    Please select a date first.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="post-container renter-info">
        <div className="user-link">
          <img src={""} alt="Profile picture" className="profile-avatar" />
          <div>
            <a href={``} className="username">
              {approvedPostById.renter &&
              approvedPostById.renter.fname &&
              approvedPostById.renter.lname
                ? `${approvedPostById.renter.fname} ${approvedPostById.renter.lname}`
                : "You"}
            </a>
          </div>
        </div>
        <div className="rating-label">Rating</div>
        <button className="btn btn-rectangle primary">View Listings</button>
        <button className="btn btn-rectangle secondary">View Profile</button>
      </div>

      {/* Item Specifications Section */}
      <div className="post-container post-desc">
        <label className="sub-section-label">Specifications</label>
        <table className="specifications-table" role="table">
          <tbody>
            {(() => {
              try {
                const specs = approvedPostById.specs
                  ? Object.entries(JSON.parse(approvedPostById.specs))
                  : [];

                if (specs.length === 0) {
                  return (
                    <tr>
                      <td colSpan="2">No specifications available.</td>
                    </tr>
                  );
                }

                return specs.map(([key, value]) => (
                  <tr key={key}>
                    <td className="key">
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </td>
                    <td className="value">{value}</td>
                  </tr>
                ));
              } catch (error) {
                console.error("Failed to parse specs:", error);
                return (
                  <tr>
                    <td colSpan="2">Error loading specifications.</td>
                  </tr>
                );
              }
            })()}
          </tbody>
        </table>

        {/* Item Description Section */}
        <label className="sub-section-label">Description</label>
        <p>{approvedPostById.desc}</p>

        {/* Tags Rendering */}
        <div className="tags-holder">
          <i>Tags: </i>
          {approvedPostById.tags && approvedPostById.tags !== "undefined" ? (
            JSON.parse(approvedPostById.tags).map((tag, index) => (
              <div key={index} className="tag">
                {tag}
              </div>
            ))
          ) : (
            <p>No tags available</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default PostDetail;
