import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchApprovedItemForSaleById } from "../../../redux/item-for-sale/approvedItemForSaleByIdSlice";
import { Modal, Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";

import { formatTimeTo12Hour } from "../../../utils/timeFormat";
import Tooltip from "@mui/material/Tooltip";
import cartIcon from "../../../assets/images/pdp/cart.svg";
import itemImage1 from "../../../assets/images/item/item_1.jpg";
import itemImage2 from "../../../assets/images/item/item_2.jpg";
import itemImage3 from "../../../assets/images/item/item_3.jpg";
import itemImage4 from "../../../assets/images/item/item_4.jpg";
import forRentIcon from "../../../assets/images/card/rent.svg";
import forSaleIcon from "../../../assets/images/card/buy.svg";
import "./itemForSaleDetailStyles.css";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { selectStudentUser } from "../../../redux/auth/studentAuthSlice";
import {
  defaultImages,
  FOR_RENT,
  FOR_SALE,
  MEET_UP,
  PICK_UP,
  TO_RENT,
} from "../../../utils/consonants";
import { addCartItem } from "../../../redux/cart/cartSlice";
import { showNotification } from "../../../redux/alert-popup/alertPopupSlice";
import LoadingItemDetailSkeleton from "../../../components/loading-skeleton/LoadingItemDetailSkeleton";
import UserToolbar from "../common/UserToolbar";
import ItemDescAndSpecs from "../common/ItemDescAndSpecs";
import ImageSlider from "../common/ImageSlider";
import ItemBadges from "../common/ItemBadges";
import ReportModal from "../../../components/report/ReportModal";

function ItemForSaleDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const dispatch = useDispatch();
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedDuration, setSelectedDuration] = useState(null);
  const [showDurations, setShowDurations] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const {
    approvedItemForSaleById,
    loadingApprovedItemForSaleById,
    errorApprovedItemForSaleById,
  } = useSelector((state) => state.approvedItemForSaleById);
  const studentUser = useSelector(selectStudentUser);
  const rentalDates = approvedItemForSaleById.rentalDates || [];
  const [redirecting, setRedirecting] = useState(false);
  const [expandTerm, setExpandTerm] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const loggedInUserId = studentUser.userId;

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

    const selectedRentalDate = approvedItemForSaleById.rentalDates.find(
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

  const handleAddToCart = async (e, item) => {
    console.log(item)
    e.stopPropagation();

    dispatch(
      showNotification({
        type: "loading",
        title: "Processing...",
        text: "Adding item to cart...",
      })
    );

    if (!selectedDate || !selectedDuration) {
      dispatch(
        showNotification({
          type: "error",
          title: "Error",
          text: "Please select a date and duration before adding to cart.",
        })
      );
      return;
    }

    const selectedDateId = approvedItemForSaleById.rentalDates.find(
      (rentalDate) => rentalDate.date === selectedDate
    )?.id;
    if (!selectedDateId) {
      dispatch(
        showNotification({
          type: "error",
          title: "Error",
          text: "Invalid date selection.",
        })
      );
      return;
    }

    const selectedDurationId = selectedDuration.id;
    

    try {
      await dispatch(
        addCartItem({
          userId: studentUser.userId,
          ownerId:  item.seller.id,
          owner: { fname: item.seller.lname, lname: item.seller.lname },
          itemType:
            item.itemType === TO_RENT ? "rent" : "buy",
          dateId: selectedDateId,
          durationId: selectedDurationId,
          itemId: item.id,
          price: item.price,
          name: item.name,
        })
      );

      dispatch(
        showNotification({
          type: "success",
          title: "Success!",
          text: "Item added to cart successfully!",
        })
      );
    } catch (error) {
      dispatch(
        showNotification({
          type: "error",
          title: "Error",
          text: "Failed to add item to cart.",
        })
      );
    }
  };

  useEffect(() => {
    if (id) {
      dispatch(fetchApprovedItemForSaleById(id));
    }
  }, [id, dispatch]);

  useEffect(() => {
    if (errorApprovedItemForSaleById) {
      dispatch(
        showNotification({
          type: "error",
          title: "Error",
          text: "Item not found!",
        })
      );
    } else if (!loadingApprovedItemForSaleById && !approvedItemForSaleById) {
      dispatch(
        showNotification({
          type: "error",
          title: "Not Found",
          text: "No item found with the given ID.",
        })
      );
    }

    if (errorApprovedItemForSaleById || (!loadingApprovedItemForSaleById && !approvedItemForSaleById)) {
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
  }, [errorApprovedItemForSaleById, loadingApprovedItemForSaleById, approvedItemForSaleById, dispatch]);

  useEffect(() => {
    if (redirecting) {
      const redirectTimer = setTimeout(() => {
        navigate(-1); // Redirect to previous page
      }, 6000); // Wait 6 seconds before redirect

      return () => clearTimeout(redirectTimer); // Clean up redirect timer
    }
  }, [redirecting, navigate]);

  // Show loading skeleton if still loading or redirecting
  if (loadingApprovedItemForSaleById || redirecting) {
    return <LoadingItemDetailSkeleton />;
  }

  const handleMessageSellerClick = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || "http://localhost:3001"}/api/conversations/createBySeller`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            senderId: studentUser.userId, // Logged-in user
            sellerId: approvedItemForSaleById.seller.id, // Seller's user ID
          }),
        }
      );
  
      if (response.ok) {
        navigate("/messages", {
          state: { sellerId: approvedItemForSaleById.seller.id }, // Pass sellerId to MessagePage
        });
      } else {
        const error = await response.json();
        console.error("Error creating conversation with seller:", error.error);
      }
    } catch (err) {
      console.error("Error handling message seller click:", err);
    }
  };

  const handleReportSubmit = async (reason) => {
    const reportData = {
      reporter_id: loggedInUserId, // ID of the logged-in user
      reported_entity_id: approvedItemForSaleById.id, // ID of the item being reported
      entity_type: "sale", // Type of entity being reported
      reason: reason, // Reason for the report
    };

    try {
      console.log(reportData);
      const response = await axios.post("http://localhost:3001/api/reports", reportData); // API endpoint
      console.log("Report submitted:", response.data);
      alert("Report submitted successfully!");
    } catch (error) {
      console.error("Error submitting report:", error);
      alert("Failed to submit the report.");
    }

    setShowReportModal(false); // Close the modal
  };
  

  return (
    <div className="container-content itemforsale-detail">
      <div className="itemforsale-container">

        <div className="imgs-container">
          <Tooltip
            title={`This item is ${
              approvedItemForSaleById.itemType === FOR_RENT ? FOR_RENT : FOR_SALE
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
                approvedItemForSaleById.itemType === FOR_RENT
                  ? forRentIcon
                  : forSaleIcon
              }
              alt={
                approvedItemForSaleById.itemType === FOR_RENT ? FOR_RENT : FOR_SALE
              }
              className="item-type"
            />
          </Tooltip>
          <ImageSlider
            images={approvedItemForSaleById.images && approvedItemForSaleById.images.length ? approvedItemForSaleById.images : [defaultImages]}
          />
        </div>
        <div className="rental-details">
        <div className="item-header">
          <ItemBadges
            values={{
              college: approvedItemForSaleById?.seller?.college,
              category: approvedItemForSaleById.category,
            }}
          />
          <div className="report-button">
            <button
              className="btn btn-rectangle danger"
              onClick={() => setShowReportModal(true)} // Open the modal
            >
              Report
            </button>
          </div>

          {/* Report Modal */}
          <ReportModal
            show={showReportModal}
            handleClose={() => setShowReportModal(false)} // Close the modal
            handleSubmit={handleReportSubmit} // Submit the report
          />
        </div>
          <div className="item-title">
            <>
              <i>For rent </i>
              {approvedItemForSaleById.name ? (
                <span className="title">{approvedItemForSaleById.name}</span>
              ) : (
                <span className="error-msg">No available name.</span>
              )}
            </>
          </div>
          <div className="item-price">
            {approvedItemForSaleById.price ? (
              <span className="price">₱ {approvedItemForSaleById.price}</span>
            ) : (
              <span className="error-msg">No available name.</span>
            )}
          </div>
          <div className="action-btns">
            <button
              className="btn btn-icon primary"
              onClick={(e) => handleAddToCart(e, approvedItemForSaleById)}
            >
              <img src={cartIcon} alt="Add to cart" />
            </button>
            <button className="btn btn-rectangle secondary" onClick={handleMessageSellerClick}>
              Message</button>
            <button
              className="btn btn-rectangle primary"
              onClick={handleOfferClick}
            >
              {approvedItemForSaleById.itemType === FOR_RENT ? "Rent" : "Buy"}
            </button>
          </div>
          <hr />
          <div className="rental-dates-durations">
            <div className="date-picker">
              <span>
                Pick a date to{" "}
                {approvedItemForSaleById.itemType === FOR_RENT ? "rent" : "buy"}:
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

          <div className="group-container delivery-method ">
            <label className="label">Delivery Method</label>
            {approvedItemForSaleById.deliveryMethod ? (
              <Tooltip
                title="Delivery method has been preselected by seller."
                placement="bottom"
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
                <span className="value selected">
                  {approvedItemForSaleById.deliveryMethod}
                </span>
              </Tooltip>
            ) : (
              <div className="delivery-method">
                <Tooltip
                  title="seller did not set delivery method, you decide whether to meetup or pickup."
                  placement="bottom"
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
                  <div className="action-btns">
                    <button
                      className={`value ${
                        approvedItemForSaleById.deliveryMethod === MEET_UP
                          ? "selected"
                          : ""
                      }`}
                      onClick={() => handleSelectDeliveryMethod("meetup")}
                    >
                      Meet up
                    </button>
                    <button
                      className={`value ${
                        approvedItemForSaleById.deliveryMethod === PICK_UP
                          ? "selected"
                          : ""
                      }`}
                      onClick={() => handleSelectDeliveryMethod("pickup")}
                    >
                      Pick up
                    </button>
                  </div>
                </Tooltip>
              </div>
            )}
          </div>

          <div className="group-container payment-method ">
            <label className="label">Payment Method</label>

            {approvedItemForSaleById.paymentMethod ? (
              <Tooltip
                title="Delivery method has been preselected by seller."
                placement="bottom"
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
                <span className="value selected">
                  {approvedItemForSaleById.paymentMethod}
                </span>
              </Tooltip>
            ) : (
              <div className="delivery-method">
                <Tooltip
                  title="seller did not set delivery method, you decide whether to meetup or pickup."
                  placement="bottom"
                >
                  <div className="action-btns">
                    <button
                      className="value selected"
                      onClick={() => handleSelectDeliveryMethod("meetup")}
                    >
                      Pay upon Meet up
                    </button>
                    <button
                      className={`value ${
                        approvedItemForSaleById.paymentMethod === PICK_UP
                          ? "selected"
                          : ""
                      }`}
                      onClick={() => handleSelectDeliveryMethod("pickup")}
                    >
                      Gcash
                    </button>
                  </div>
                </Tooltip>
              </div>
            )}
          </div>

          <div className="group-container item-condition">
            <label className="label">Item Condition</label>
            <div>
              {approvedItemForSaleById.itemCondition ? (
                <span className="value">
                  {approvedItemForSaleById.itemCondition}
                </span>
              ) : (
                <span className="error-msg">No item condition specified.</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <UserToolbar user={approvedItemForSaleById.seller} />

      <ItemDescAndSpecs
        specs={approvedItemForSaleById.specs}
        desc={approvedItemForSaleById.desc}
        tags={approvedItemForSaleById.tags}
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

export default ItemForSaleDetail;
