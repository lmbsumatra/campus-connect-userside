import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchApprovedPostById } from "../../../redux/post/approvedPostByIdSlice";
import { Modal, Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

import { formatTimeTo12Hour } from "../../../utils/timeFormat";
import Tooltip from "@mui/material/Tooltip";
import itemImage1 from "../../../assets/images/item/item_1.jpg";
import itemImage2 from "../../../assets/images/item/item_2.jpg";
import itemImage3 from "../../../assets/images/item/item_3.jpg";
import itemImage4 from "../../../assets/images/item/item_4.jpg";
import forRentIcon from "../../../assets/images/card/rent.svg";
import forSaleIcon from "../../../assets/images/card/rent.svg";
import "./postDetailStyles.css";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { selectStudentUser } from "../../../redux/auth/studentAuthSlice";
import {
  FOR_RENT,
  FOR_SALE,
  MEET_UP,
  PICK_UP,
  TO_BUY,
  TO_RENT,
} from "../../../utils/consonants";
import { showNotification } from "../../../redux/alert-popup/alertPopupSlice";
import LoadingItemDetailSkeleton from "../../../components/loading-skeleton/LoadingItemDetailSkeleton";
import UserToolbar from "../common/UserToolbar";
import ItemDescAndSpecs from "../common/ItemDescAndSpecs";
import ImageSlider from "../common/ImageSlider";
import ItemBadges from "../common/ItemBadges";

function PostDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const dispatch = useDispatch();
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedDuration, setSelectedDuration] = useState(null);
  const [showDurations, setShowDurations] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const {
    approvedPostById,
    loadingApprovedPostById,
    errorApprovedPostById,
  } = useSelector((state) => state.approvedPostById);
  const studentUser = useSelector(selectStudentUser);
  const rentalDates = approvedPostById.rentalDates || [];
  const [loading, setLoading] = useState(true);
  const [redirecting, setRedirecting] = useState(false);
  const [expandTerm, setExpandTerm] = useState(false);

  const images = [
    itemImage1,
    itemImage2,
    itemImage3,
    itemImage4,
    itemImage4,
    itemImage4,
    itemImage4,
  ];

  const handleDateClick = (dateId) => {
    const formatDate = (d) => d.toLocaleDateString("en-CA");

    const selectedRentalDate = approvedPostById.rentalDates.find(
      (rentalDate) => rentalDate.id === dateId
    );

    if (selectedRentalDate && selectedRentalDate.durations) {
      setSelectedDate(formatDate(new Date(selectedRentalDate.date)));
      setShowDurations(selectedRentalDate.durations);
    }
  };

  const handleSelectDuration = (duration) => {
    setSelectedDuration(duration);
  };

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

  const handleSelectDeliveryMethod = (method) => {
    console.log(method);
  };


  useEffect(() => {
    if (id) {
      dispatch(fetchApprovedPostById(id));
    }
  }, [id, dispatch]);

  useEffect(() => {
    if (errorApprovedPostById) {
      dispatch(
        showNotification({
          type: "error",
          title: "Error",
          text: "Item not found!",
        })
      );
    } else if (!loadingApprovedPostById && !approvedPostById) {
      dispatch(
        showNotification({
          type: "error",
          title: "Not Found",
          text: "No item found with the given ID.",
        })
      );
    }

    if (errorApprovedPostById || (!loadingApprovedPostById && !approvedPostById)) {
      setRedirecting(true); // Start the redirect process
      const timer = setTimeout(() => {
        dispatch(
          showNotification({
            type: "loading",
            title: "Redirecting",
          })
        );
      }, 5000); // Show redirect notification after 5 seconds

      return () => clearTimeout(timer); // Clean up the timeout if dependencies change
    }
  }, [errorApprovedPostById, loadingApprovedPostById, approvedPostById, dispatch]);

  useEffect(() => {
    if (redirecting) {
      const redirectTimer = setTimeout(() => {
        navigate(-1); // Redirect to previous page
      }, 6000); // Wait 6 seconds before redirect

      return () => clearTimeout(redirectTimer); // Clean up redirect timer
    }
  }, [redirecting, navigate]);

  // Show loading skeleton if still loading or redirecting
  if (loadingApprovedPostById || redirecting) {
    return <LoadingItemDetailSkeleton />;
  }

  return (
    <div className="container-content post-detail">
      <div className="post-container">
        <div className="imgs-container">
          <Tooltip
            title={`This item is ${
              approvedPostById.itemType === FOR_RENT ? FOR_RENT : FOR_SALE
            }`}
            componentsProps={{
              popper: {
                modifiers: [
                  {
                    name: "offset",
                    options: {
                      offset: [0, 0],
                    },
                  },
                ],
              },
            }}
          >
            <img
              src={
                approvedPostById.itemType === FOR_RENT
                  ? forRentIcon
                  : forSaleIcon
              }
              alt={
                approvedPostById.itemType === FOR_RENT ? FOR_RENT : FOR_SALE
              }
              className="item-type"
            />
          </Tooltip>
          <ImageSlider images={images} />
        </div>
        <div className="rental-details">
          <ItemBadges
            values={{
              college: approvedPostById?.renter?.college,
              category: approvedPostById.category,
            }}
          />
          <div className="item-title">
            <>
              <i>Looking for </i>
              {approvedPostById.name ? (
                <span className="title">{approvedPostById.name}</span>
              ) : (
                <span className="error-msg">No available name.</span>
              )}
            </>
          </div>
        
          <div className="action-btns">
         
            <button className="btn btn-rectangle secondary">Message</button>
            <button
              className="btn btn-rectangle primary"
              onClick={handleOfferClick}
            >
              {approvedPostById.itemType === TO_RENT ? "Offer" : "Buy"}
            </button>
          </div>
          <hr />
          <div className="rental-dates-durations">
            <div className="date-picker">
              <span>
                Pick a date to{" "}
                {approvedPostById.itemType === TO_RENT? "offer" : "buy"}:
              </span>
              <DatePicker
                inline
                selected={selectedDate ? new Date(selectedDate) : null}
                onChange={(date) => {
                  const rentalDate = rentalDates.find(
                    (r) =>
                      new Date(r.date).toDateString() === date.toDateString()
                  );

                  if (rentalDate) {
                    handleDateClick(rentalDate.id);
                  } else {
                    setShowDurations(null);
                    setSelectedDate(date);
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

            <div className="duration-picker group-container">
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

      <UserToolbar user={approvedPostById.owner} />

      <ItemDescAndSpecs
        specs={approvedPostById.specs}
        desc={approvedPostById.desc}
        tags={approvedPostById.tags}
      />

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
          <Button variant="primary">Confirm</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default PostDetail;