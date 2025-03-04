import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchApprovedListingById } from "../../../../redux/listing/approvedListingByIdSlice.js";
import { Modal, Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import store from "../../../../store/store.js";

import { formatTimeTo12Hour } from "../../../../utils/timeFormat.js";
import Tooltip from "@mui/material/Tooltip";
import cartIcon from "../../../../assets/images/pdp/cart.svg";
import forRentIcon from "../../../../assets/images/card/rent.svg";
import forSaleIcon from "../../../../assets/images/card/buy.svg";
import "./listingDetailStyles.css";
import "../confirmationModalStyles.css";
import ShowAlert from "../../../../utils/ShowAlert.js";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { selectStudentUser } from "../../../../redux/auth/studentAuthSlice.js";
import {
  defaultImages,
  FOR_RENT,
  FOR_SALE,
  MEET_UP,
  PICK_UP,
  TO_BUY,
} from "../../../../utils/consonants.js";
import { addCartItem } from "../../../../redux/cart/cartSlice.js";
import {
  clearNotification,
  showNotification,
} from "../../../../redux/alert-popup/alertPopupSlice.js";
import LoadingItemDetailSkeleton from "../../../../components/loading-skeleton/LoadingItemDetailSkeleton.js";
import UserToolbar from "../../common/UserToolbar.jsx";
import ItemDescAndSpecs from "../../common/ItemDescAndSpecs.jsx";
import Terms from "./Terms.jsx";
import ImageSlider from "../../common/ImageSlider.jsx";
import ItemBadges from "../../common/ItemBadges.jsx";
import { useSocket } from "../../../../context/SocketContext.js";
import axios from "axios";
import ViewToolbar from "../../common/ViewToolbar.js";
import ReportModal from "../../../../components/report/ReportModal.js";
import useHandleActionWithAuthCheck from "../../../../utils/useHandleActionWithAuthCheck.jsx";
import handleUnavailableDateError from "../../../../utils/handleUnavailableDateError.js";

// async function getUserFullName(userId) {
//   console.log("Fetching user details for userId:", userId);
//   try {
//     const studentUser = JSON.parse(localStorage.getItem("studentUser"));
//     const token = studentUser?.token;

//     console.log(JSON.parse(localStorage.getItem("studentUser")));

//     const res = await fetch(
//       `${
//         process.env.REACT_APP_API_URL || "http://localhost:3001"
//       }/user/info/${userId}`,
//       {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       }
//     );
//     if (!res.ok) throw new Error("Failed to fetch user details");
//     const data = await res.json();
//     // Access user data from the 'user' property of the response
//     const userData = data.user || {}; // Fallback to empty object if undefined
//     const { first_name, last_name } = userData;
//     return `${first_name || ""} ${last_name || ""}`.trim() || "Unknown User";
//   } catch (error) {
//     console.error("Error fetching user details:", error);
//     return "Unknown User";
//   }
// }

function ListingDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const dispatch = useDispatch();
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedDuration, setSelectedDuration] = useState(null);
  const [showDurations, setShowDurations] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const {
    approvedListingById,
    loadingApprovedListingById,
    errorApprovedListingById,
  } = useSelector((state) => state.approvedListingById);
  const studentUser = useSelector(selectStudentUser);
  const rentalDates = approvedListingById.availableDates || [];
  const [redirecting, setRedirecting] = useState(false);
  const isYou = approvedListingById?.owner?.id === studentUser?.userId;
  const [isAdmin, setIsAdmin] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const loggedInUserId = studentUser?.userId || null;
  const socket = useSocket();
  const handleActionWithAuthCheck = useHandleActionWithAuthCheck();
  const [hasReported, setHasReported] = useState(false);

  const location = useLocation();
  const { item, warnSelectDateAndTime } = location.state || {};

  useEffect(() => {
    if (warnSelectDateAndTime) {
    }
  }, [warnSelectDateAndTime]);

  useEffect(() => {
    // Retrieve isAdmin from localStorage
    // di ko alam kung ako gumawa nito, pero wala akong matandaan
    // iccomment ko muna - missy
    // const storedIsAdmin =
    //   JSON.parse(localStorage.getItem("adminUser")).role ===
    //   ("superadmin" || "admin");
    // setIsAdmin(storedIsAdmin);
    // console.log(storedIsAdmin);

    if (id) {
      dispatch(fetchApprovedListingById(id));
    }
  }, [id, dispatch]);

  const handleDateClick = (dateId) => {
    const formatDate = (d) => d.toLocaleDateString("en-CA");

    const selectedRentalDate = approvedListingById.availableDates.find(
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

  const handleSelectDeliveryMethod = (method) => {};

  const handleAddToCart = async (e, item) => {
    e.stopPropagation();

    const loadingNotify = ShowAlert(
      dispatch,
      "info",
      "Loading...",
      "Adding item to cart..."
    );

    if (!selectedDate || !selectedDuration) {
      dispatch(clearNotification(loadingNotify));
      return ShowAlert(
        dispatch,
        "error",
        "Error",
        "Please select a date and duration."
      );
    }

    console.log(approvedListingById);

    const selectedDateId = approvedListingById.availableDates.find(
      (rentalDate) => rentalDate.date === selectedDate
    )?.id;

    if (!selectedDateId) {
      // Remove the loading notification on error
      dispatch(clearNotification(loadingNotify));
      return ShowAlert(dispatch, "error", "Error", "Invalid date selection.");
    }

    try {
      await dispatch(
        addCartItem({
          userId: studentUser.userId,
          ownerId: item.owner.id,
          owner: { fname: item.owner.fname, lname: item.owner.lname },
          itemType: item.itemType === TO_BUY ? "buy" : "rent",
          dateId: selectedDateId,
          durationId: selectedDuration.id,
          itemId: item.id,
          price: item.rate,
          name: item.name,
        })
      ).unwrap();

      const { successCartMessage, errorCartMessage, warningCartMessage } =
        store.getState().cart;

      if (successCartMessage) {
        ShowAlert(dispatch, "success", "Success!", successCartMessage);
      }
      if (warningCartMessage) {
        ShowAlert(dispatch, "warning", "Warning", warningCartMessage);
      }

      if (errorCartMessage) {
        ShowAlert(dispatch, "error", "Error", errorCartMessage);
      }
    } catch (error) {
      console.error("Error adding item to cart:", error);
      ShowAlert(dispatch, "error", "Error", "An unexpected error occurred.");
    }
  };

  const confirmRental = async () => {
    try {
      const selectedDateId = approvedListingById.availableDates.find(
        (rentalDate) => rentalDate.date === selectedDate
      )?.id;

      const rentalDetails = {
        owner_id: approvedListingById.owner.id,
        renter_id: studentUser.userId,
        item_id: approvedListingById.id,
        delivery_method: approvedListingById.deliveryMethod,
        rental_date_id: selectedDateId,
        rental_time_id: selectedDuration.id,
      };

      // Create rental transaction and get rentalId
      const response = await axios.post(
        "http://localhost:3001/rental-transaction/add",
        rentalDetails
      );

      if (!response.data || !response.data.id) {
        console.error("❌ Failed to get rental ID from response", response);
        return;
      }

      const rentalId = response.data.id; // Get rentalId from response

      // const senderName = await getUserFullName(studentUser.userId);

      // const notificationData = {
      //   sender: studentUser.userId,
      //   recipient: approvedListingById.owner.id,
      //   type: "rental_request",
      //   message: `${senderName} wants to rent ${approvedListingById.name}.`,
      //   rental_id: rentalId, // Pass rentalId here
      // };

      // // Send notification
      // if (socket && socket.connected) {
      //   socket.emit("sendNotification", notificationData);
      //   console.log(
      //     "✅ Notification sent via socket with rental_id:",
      //     rentalId
      //   );
      // } else {
      //   console.warn("⚠️ Socket not connected. Using API fallback.");
      //   await axios.post(
      //     "http://localhost:3001/api/notifications/student",
      //     notificationData
      //   );
      // }

      setShowModal(false);
      ShowAlert(
        dispatch,
        "success",
        "Success",
        "Rental confirmed successfully!"
      );
    } catch (error) {
      console.error("❌ Error in confirmRental:", error);
      ShowAlert(dispatch, "error", "Error", "Failed to confirm rental.");
    }
  };

  useEffect(() => {
    if (id) {
      dispatch(fetchApprovedListingById(id));
    }
  }, [id, dispatch]);

  useEffect(() => {
    if (loggedInUserId) {
      checkIfReported();
    }
  }, [loggedInUserId, approvedListingById.id]);

  // item not found alert
  useEffect(() => {
    if (errorApprovedListingById) {
      ShowAlert(dispatch, "error", "Error", "Item not found!");
    } else if (!loadingApprovedListingById && !approvedListingById) {
      ShowAlert(dispatch, "error", "Error", "Item not found!");
    }

    if (
      errorApprovedListingById ||
      (!loadingApprovedListingById && !approvedListingById)
    ) {
      setRedirecting(true);
      const timer = setTimeout(() => {
        ShowAlert(dispatch, "loading", "Redirecting");
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [
    errorApprovedListingById,
    loadingApprovedListingById,
    approvedListingById,
    dispatch,
  ]);

  useEffect(() => {
    if (redirecting) {
      const redirectTimer = setTimeout(() => {
        navigate(-1);
      }, 3000);

      return () => clearTimeout(redirectTimer);
    }
  }, [redirecting, navigate]);

  if (loadingApprovedListingById || redirecting) {
    return <LoadingItemDetailSkeleton />;
  }

  const handleMessageClick = async () => {
    try {
      const response = await fetch(
        `${
          process.env.REACT_APP_API_URL || "http://localhost:3001"
        }/api/conversations/createConversation`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            senderId: studentUser.userId, // Logged-in user
            ownerId: approvedListingById.owner.id, // Listing owner's user ID
          }),
        }
      );

      if (response.ok) {
        // Navigate to the message page with product details
        navigate("/messages", {
          state: {
            ownerId: approvedListingById.owner.id,
            product: {
              productId: approvedListingById.id,
              name: approvedListingById.name,
              price: approvedListingById.rate,
              image: approvedListingById.images[0], // Use the first image for the product card
              title: approvedListingById.itemType,
              type: "rent" // Add type identifier
            },
          },
        });
      } else {
        const error = await response.json();
        console.error("Error creating conversation:", error.error);
      }
    } catch (err) {
      console.error("Error handling message click:", err);
    }
  };

  const handleReportSubmit = async (reason) => {
    const reportData = {
      reporter_id: loggedInUserId,
      reported_entity_id: approvedListingById.id,
      entity_type: "listing",
      reason: reason,
    };

    try {
      console.log(reportData);
      const response = await axios.post(
        "http://localhost:3001/api/reports",
        reportData
      );
      console.log("Report submitted:", response.data);

      // Update hasReported state
      setHasReported(true);

      // Show success notification
      await ShowAlert(
        dispatch,
        "success",
        "Report Submitted",
        "Your report has been submitted successfully."
      );
    } catch (error) {
      console.error("Error submitting report:", error);

      // Handle 403 error separately
      await handleUnavailableDateError(dispatch, error);

      // If it's not a 403 error, handle other errors
      if (error.response?.status !== 403) {
        await ShowAlert(
          dispatch,
          "error",
          "Submission Failed",
          "Failed to submit the report. Please try again."
        );
      }
    }

    setShowReportModal(false); // Close the modal
  };

  const handleReportClick = () => {
    if (loggedInUserId) {
      // Directly show the report modal if the user is logged in
      setShowReportModal(true);
    } else {
      // If the user is not logged in, use the authentication check
      handleActionWithAuthCheck(
        () => setShowReportModal(true),
        () =>
          ShowAlert(
            dispatch,
            "warning",
            "Action Required",
            "Please login to report this post.",
            {
              text: "Login",
              action: () => {
                navigate("/", {
                  state: { showLogin: true, authTab: "loginTab" },
                });
              },
            }
          )
      );
    }
  };

  const checkIfReported = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3001/api/reports/check`,
        {
          params: {
            reporter_id: loggedInUserId,
            reported_entity_id: approvedListingById.id,
          },
        }
      );
      setHasReported(response.data.hasReported);
    } catch (error) {
      console.error("Error checking report:", error);
    }
  };

  return (
    <div className="container-content listing-detail">
      {isYou && <ViewToolbar />}

      <div className="listing-container">
        <div className="imgs-container">
          <Tooltip
            title={`This item is ${
              approvedListingById.itemType === FOR_RENT ? FOR_RENT : FOR_SALE
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
                approvedListingById.itemType === FOR_RENT
                  ? forRentIcon
                  : forSaleIcon
              }
              alt={
                approvedListingById.itemType === FOR_RENT ? FOR_RENT : FOR_SALE
              }
              className="item-type"
            />
          </Tooltip>
          <ImageSlider
            images={
              approvedListingById.images && approvedListingById.images.length
                ? approvedListingById.images
                : [defaultImages]
            }
          />
        </div>
        <div className="rental-details">
          <div className="item-header">
            <ItemBadges
              values={{
                college: approvedListingById?.owner?.college,
                category: approvedListingById.category,
              }}
            />
            {loggedInUserId !== approvedListingById?.owner?.id &&
              !hasReported && (
                <div className="report-button">
                  <button
                    className="btn btn-rectangle danger"
                    onClick={handleReportClick}
                  >
                    Report
                  </button>
                </div>
              )}
            {hasReported && (
              <div className="report-button">
                <button className="btn btn-rectangle danger" disabled>
                  Already Reported
                </button>
              </div>
            )}

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
              {approvedListingById.name ? (
                <span className="title">{approvedListingById.name}</span>
              ) : (
                <span className="error-msg">No available name.</span>
              )}
            </>
          </div>
          <div className="item-price">
            {approvedListingById.rate ? (
              <span className="price">₱ {approvedListingById.rate}</span>
            ) : (
              <span className="error-msg">No available name.</span>
            )}
          </div>
          <div className="action-btns">
            <button
              className="btn btn-icon primary"
              onClick={(e) => handleAddToCart(e, approvedListingById)}
              disabled={isYou}
            >
              <img src={cartIcon} alt="Add to cart" />
            </button>
            <button
              className="btn btn-rectangle secondary"
              onClick={handleMessageClick}
              disabled={isYou}
            >
              Message
            </button>
            <button
              className="btn btn-rectangle primary"
              onClick={handleOfferClick}
              disabled={isYou}
            >
              {approvedListingById.itemType === FOR_RENT ? "Rent" : "Buy"}
            </button>
          </div>
          <hr />
          <div className="rental-dates-durations">
            <div className="date-picker">
              <span>
                Pick a date to{" "}
                {approvedListingById.itemType === FOR_RENT ? "rent" : "buy"}:
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
            {approvedListingById.deliveryMethod ? (
              <Tooltip
                title="Delivery method has been preselected by owner."
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
                  {approvedListingById.deliveryMethod}
                </span>
              </Tooltip>
            ) : (
              <div className="delivery-method">
                <Tooltip
                  title="Owner did not set delivery method, you decide whether to meetup or pickup."
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
                        approvedListingById.deliveryMethod === MEET_UP
                          ? "selected"
                          : ""
                      }`}
                      onClick={() => handleSelectDeliveryMethod("meetup")}
                      disabled={isYou}
                    >
                      Meet up
                    </button>
                    <button
                      className={`value ${
                        approvedListingById.deliveryMethod === PICK_UP
                          ? "selected"
                          : ""
                      }`}
                      onClick={() => handleSelectDeliveryMethod("pickup")}
                      disabled={isYou}
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

            {approvedListingById.paymentMethod ? (
              <Tooltip
                title="Delivery method has been preselected by owner."
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
                  {approvedListingById.paymentMethod}
                </span>
              </Tooltip>
            ) : (
              <div className="delivery-method">
                <Tooltip
                  title="Owner did not set delivery method, you decide whether to meetup or pickup."
                  placement="bottom"
                >
                  <div className="action-btns">
                    <button
                      className="value selected"
                      onClick={() => handleSelectDeliveryMethod("meetup")}
                      disabled={isYou}
                    >
                      Pay upon Meet up
                    </button>
                    <button
                      className={`value ${
                        approvedListingById.paymentMethod === PICK_UP
                          ? "selected"
                          : ""
                      }`}
                      onClick={() => handleSelectDeliveryMethod("pickup")}
                      disabled={isYou}
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
              {approvedListingById.itemCondition ? (
                <span className="value">
                  {approvedListingById.itemCondition}
                </span>
              ) : (
                <span className="error-msg">No item condition specified.</span>
              )}
            </div>
          </div>
          <div className="group-container terms">
            <Terms
              values={{
                lateCharges: approvedListingById.lateCharges,
                securityDeposit: approvedListingById.securityDeposit,
                repairReplacement: approvedListingById.repairReplacement,
              }}
            />
          </div>
        </div>
      </div>

      <UserToolbar
        user={approvedListingById.owner}
        isYou={
          approvedListingById.owner
            ? approvedListingById.owner.id === loggedInUserId
            : false
        }
      />

      <ItemDescAndSpecs
        specs={approvedListingById.specs}
        desc={approvedListingById.desc}
        tags={approvedListingById.tags}
      />

      {/* Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm rent transaction</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="confirmation-modal">
            <div className="item-card">
              <div className="img-container">
                <img
                  src={
                    approvedListingById.images &&
                    approvedListingById.images.length
                      ? approvedListingById.images[0]
                      : [defaultImages]
                  }
                  style={{ height: "100px", width: "100px" }}
                  alt="Item image"
                />
              </div>
              <div className="item-desc">
                <span className="value">{approvedListingById.name}</span>
                <span className="value">{approvedListingById.rate}</span>
                <span className="label">
                  Item Condition:{" "}
                  <span className="value">
                    {approvedListingById.itemCondition}
                  </span>
                </span>
              </div>
            </div>
            <div className="rental-desc">
              <span className="label">
                Delivery Method:{" "}
                <span className="value">
                  {approvedListingById.deliveryMethod}
                </span>{" "}
              </span>
              <span className="label">
                Payment Method:{" "}
                <span className="value">
                  {approvedListingById.paymentMethod}
                </span>
              </span>

              <span className="label">Date: </span>
              <span className="label">Duration:</span>
            </div>
            <div className="terms-condition">
              <span className="label">
                Late Charges:{" "}
                <span className="value">{approvedListingById.lateCharges}</span>
              </span>
              <span className="label">
                Security Deposit:{" "}
                <span className="value">
                  {approvedListingById.securityDeposit}
                </span>
              </span>
              <span className="label">
                Repair and Replacement:{" "}
                <span className="value">
                  {approvedListingById.repairReplacement}
                </span>
              </span>
            </div>
            <span>
              By confirming your rental, you agree to the platform's Policies,
              Terms and Conditions, and the terms with the other party ("Owner")
              (as shown above).
            </span>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={() => confirmRental()}>
            Confirm
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default ListingDetail;
