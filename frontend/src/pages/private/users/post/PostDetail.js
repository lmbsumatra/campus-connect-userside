import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchApprovedPostById } from "../../../../redux/post/approvedPostByIdSlice";
import { Modal, Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

import { useAuth } from "../../../../context/AuthContext";
import { formatTimeTo12Hour } from "../../../../utils/timeFormat";
import Tooltip from "@mui/material/Tooltip";
import Skeleton from "react-loading-skeleton"; // Import Skeleton
import "react-loading-skeleton/dist/skeleton.css"; // Import skeleton styles

import userProfilePicture from "../../../../assets/images/icons/user-icon.svg";
import prevIcon from "../../../../assets/images/pdp/prev.svg";
import nextIcon from "../../../../assets/images/pdp/next.svg";
import itemImage1 from "../../../../assets/images/item/item_1.jpg";
import itemImage2 from "../../../../assets/images/item/item_2.jpg";
import itemImage3 from "../../../../assets/images/item/item_3.jpg";
import itemImage4 from "../../../../assets/images/item/item_4.jpg";
import forRentIcon from "../../../../assets/images/card/rent.svg";
import "./postDetailStyles.css";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { selectStudentUser } from "../../../../redux/auth/studentAuthSlice";
import axios from "axios";

function PostDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const [currentIndex, setCurrentIndex] = useState(1);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedDuration, setSelectedDuration] = useState(null);
  const [showDurations, setShowDurations] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const { approvedPostById, loadingApprovedPostById, errorApprovedPostById } =
    useSelector((state) => state.approvedPostById);
  const studentUser = useSelector(selectStudentUser);
  const { userId } = studentUser;
  const rentalDates = approvedPostById.rentalDates || [];
  const [loading, setLoading] = useState(true);

  const images = [
    itemImage1,
    itemImage2,
    itemImage3,
    itemImage4,
    itemImage4,
    itemImage4,
    itemImage4,
  ];

  useEffect(() => {
    if (id) {
      dispatch(fetchApprovedPostById(id));
    }

    const timer = setTimeout(() => {
      setLoading(false); // After 5 seconds, set loading to false to show content
    }, 5000); // 5000ms = 5 seconds

    return () => clearTimeout(timer);
  }, [dispatch, id]);

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

  const handleDateClick = (dateId) => {
    const selectedRentalDate = approvedPostById.rentalDates.find(
      (rentalDate) => rentalDate.id === dateId
    );

    if (selectedRentalDate && selectedRentalDate.durations) {
      setSelectedDate(selectedRentalDate.date);
      setShowDurations(selectedRentalDate.durations);
    }
  };

  const handleSelectDuration = (duration) => {
    setSelectedDuration(duration);
  };

  console.log(selectedDate, showDurations);

  const availableDates = rentalDates
    .filter((rentalDate) => rentalDate.status === "available")
    .map((rentalDate) => new Date(rentalDate.date));

  const handleOfferClick = async () => {
    if (selectedDate && selectedDuration) {
      setShowModal(true);
    } else {
      alert("Please select a date and duration before offering.");
    }
  };
  const handleConfirmOffer = async () => {
    if (selectedDate && selectedDuration) {
      try {
        const response = await axios.post("http://localhost:3001/api/send");
        alert("Email sent!");
      } catch (err) {
        alert(err);
      }
    } else {
      alert("Please select a date and duration before offering.");
    }
  };

  if (loading) {
    return (
      <div className="container-content post-detail">
        <div className="post-container">
          <div className="imgs-container">
            <Skeleton height={200} />
            <Skeleton count={3} width={60} style={{ marginTop: "10px" }} />
          </div>
          <div className="rental-details">
            <Skeleton width={100} height={30} />
            <Skeleton count={2} height={20} style={{ marginTop: "10px" }} />
            <Skeleton height={50} style={{ marginTop: "20px" }} />
            <Skeleton height={20} style={{ marginTop: "10px" }} />
            <Skeleton count={3} height={20} style={{ marginTop: "10px" }} />
          </div>
        </div>
        <div className="post-container renter-info">
          <Skeleton width={60} height={60} circle />
          <Skeleton width={120} height={20} style={{ marginTop: "10px" }} />
          <Skeleton width={80} height={30} style={{ marginTop: "10px" }} />
        </div>
        <div className="post-container post-desc">
          <Skeleton width={200} height={20} />
          <Skeleton count={4} height={20} style={{ marginTop: "10px" }} />
        </div>
      </div>
    );
  }

  if (errorApprovedPostById) {
    return <p>Error: {errorApprovedPostById}</p>;
  }

  if (!approvedPostById) {
    return <p>Item not found</p>;
  }

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
                      offset: [0, -10],
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
          <div
            className="highlight-bg"
            style={{
              backgroundImage: `url(${images[currentIndex]})`,
            }}
          ></div>

          <div className="highlight">
            <img
              src={images[currentIndex]}
              alt="Item"
              className="highlight-img"
            />
          </div>
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
          <div className="item-title">
            <p>
              <i>Looking for </i>
              {approvedPostById.name ? (
                <span className="title">{approvedPostById.name}</span>
              ) : (
                <span className="error-msg">No available name.</span>
              )}
            </p>
          </div>
          <div className="action-btns">
            <button className="btn btn-rectangle secondary">Message</button>
            <button
              className="btn btn-rectangle primary"
              onClick={handleOfferClick}
            >
              Offer
            </button>
          </div>
          <hr />
          <div className="rental-dates-durations">
            <div className="date-picker">
              <span>Pick a date to offer:</span>
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
                    handleDateClick(clickedDateId);
                  }
                  setSelectedDate(date);
                  const rentalDate = rentalDates.find(
                    (r) =>
                      new Date(r.date).toDateString() === date.toDateString()
                  );
                  if (rentalDate && rentalDate.status === "available") {
                    setShowDurations(rentalDate.durations);
                  } else {
                    setShowDurations(null);
                  }
                }}
                highlightDates={availableDates}
                dayClassName={(date) => {
                  return availableDates.some(
                    (d) => d.toDateString() === date.toDateString()
                  )
                    ? "bg-green"
                    : "";
                }}
              />
            </div>
            <div className="duration-picker">
              <strong>Available Durations:</strong>
              <div>
                {selectedDate ? (
                  showDurations && showDurations.length > 0 ? (
                    <div className="duration-list">
                      {showDurations.map((duration) => (
                        <div key={duration.id} className="duration-item">
                          <input
                            type="checkbox"
                            id={`duration-${duration.id}`}
                            onChange={() => handleSelectDuration(duration)}
                          />
                          {formatTimeTo12Hour(duration.timeFrom)} -{" "}
                          {formatTimeTo12Hour(duration.timeTo)}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="no-duration-message">
                      No available duration for this date.
                    </p>
                  )
                ) : (
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
          <img
            src={userProfilePicture}
            alt="Profile picture"
            className="profile-avatar"
          />
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
        <label className="sub-section-label">Description</label>
        <p>{approvedPostById.desc}</p>

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

      {/* Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Offer</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            <strong>Date:</strong> {new Date(selectedDate).toDateString()}
          </p>
          <p>
            <strong>Duration:</strong>
            {selectedDuration
              ? selectedDuration.timeFrom && selectedDuration.timeTo
                ? `${selectedDuration.timeFrom} - ${selectedDuration.timeTo}`
                : "Invalid duration"
              : "Nooooooooooo"}
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={() => handleConfirmOffer()}>
            Confirm
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default PostDetail;
