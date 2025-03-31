import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchApprovedItemForSaleById } from "../../../redux/item-for-sale/approvedItemForSaleByIdSlice";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";

import { formatTimeTo12Hour } from "../../../utils/timeFormat";
import Tooltip from "@mui/material/Tooltip";
import cartIcon from "../../../assets/images/pdp/cart.svg";
import forRentIcon from "../../../assets/images/card/rent.svg";
import targetIcon from "../../../assets/images/card/target.svg";
import forSaleIcon from "../../../assets/images/card/buy.svg";
import "./itemForSaleDetailStyles.css";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { selectStudentUser } from "../../../redux/auth/studentAuthSlice";
import {
  baseApi,
  defaultImages,
  FOR_RENT,
  FOR_SALE,
  GCASH,
  MEET_UP,
  PICK_UP,
} from "../../../utils/consonants";
import { addCartItem, fetchCart } from "../../../redux/cart/cartSlice";
import { showNotification } from "../../../redux/alert-popup/alertPopupSlice";
import LoadingItemDetailSkeleton from "../../../components/loading-skeleton/LoadingItemDetailSkeleton";
import UserToolbar from "../common/UserToolbar";
import ItemDescAndSpecs from "../common/ItemDescAndSpecs";
import ImageSlider from "../common/ImageSlider";
import ItemBadges from "../common/ItemBadges";
import ReportModal from "../../../components/report/ReportModal";
import useHandleActionWithAuthCheck from "../../../utils/useHandleActionWithAuthCheck";
import ShowAlert from "../../../utils/ShowAlert";
import handleUnavailableDateError from "../../../utils/handleUnavailableDateError";
import ViewToolbar from "../common/ViewToolbar";
import ConfirmationModal from "./ConfirmationModal";
import store from "../../../store/store";
import { fetchUnavailableDates } from "../../../redux/dates/unavaibleDatesSlice";

function ItemForSaleDetail() {
  const { user, loadingFetchUser } = useSelector((state) => state.user);
  const isVerified = user?.student?.status ?? false;
  const isEmailVerified = user?.user?.emailVerified ?? false;

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
  const isYou = approvedItemForSaleById?.seller?.id === studentUser?.userId;
  const rentalDates = approvedItemForSaleById.rentalDates || [];
  const [redirecting, setRedirecting] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const loggedInUserId = studentUser?.userId || null;
  const handleActionWithAuthCheck = useHandleActionWithAuthCheck();
  const [hasReported, setHasReported] = useState(false);

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
    if (!studentUser) {
      handleActionWithAuthCheck("");
      return;
    }
    // Ban check
    if (isVerified === "banned") {
      ShowAlert(
        dispatch,
        "warning",
        "Account Banned",
        "Your account is permanently banned. You cannot make offers.",
        { text: "Ok" }
      );
      return;
    }

    // Restricted status check (regardless of date)
    if (isVerified === "restricted") {
      // Try to get the restriction end date
      let restrictionDate = null;
      if (user?.student?.restricted_until) {
        restrictionDate = new Date(user.student.restricted_until);
      } else if (user?.student?.statusMsg) {
        // Try to extract from statusMsg
        const dateMatch = user.student.statusMsg.match(
          /restricted until ([^\.]+)/i
        );
        if (dateMatch && dateMatch[1]) {
          try {
            restrictionDate = new Date(dateMatch[1].trim());
          } catch (e) {
            console.error("Failed to parse date from statusMsg:", e);
          }
        }
      }

      // Check if the restriction is still active
      const isCurrentlyRestricted =
        restrictionDate &&
        !isNaN(restrictionDate.getTime()) &&
        restrictionDate > new Date();

      if (isCurrentlyRestricted) {
        ShowAlert(
          dispatch,
          "warning",
          "Account Restricted",
          `Your account is temporarily restricted until ${restrictionDate.toLocaleString()}. You cannot make offers at this time.`,
          { text: "Ok" }
        );
      } else {
        // Restriction expired but status still "restricted"
        ShowAlert(
          dispatch,
          "warning",
          "Account Status Issue",
          "Your account has a restriction status that needs attention. Please contact support or check your profile.",
          {
            text: "View Profile",
            action: () => navigate("/profile/edit-profile"),
          }
        );
      }
      return;
    }

    // Other status checks (pending, flagged, etc.)
    if (isVerified !== "verified" || isEmailVerified !== true) {
      ShowAlert(
        dispatch,
        "warning",
        "Access Denied",
        "You must be verified to proceed.",
        {
          text: "View Profile",
          action: () => {
            navigate("/profile/edit-profile");
          },
        }
      );
      return;
    }
    if (selectedDate && selectedDuration) {
      setShowModal(true);
    } else {
      alert("Please select a date and duration before offering.");
    }
  };

  const handleSelectDeliveryMethod = (method) => {
    // console.log(method);
  };

  const handleAddToCart = async (e, item) => {
    e.stopPropagation();

    if (!studentUser) {
      handleActionWithAuthCheck("");
      return;
    }

    // Ban check
    if (isVerified === "banned") {
      ShowAlert(
        dispatch,
        "warning",
        "Account Banned",
        "Your account is permanently banned. You cannot add items to cart.",
        { text: "Ok" }
      );
      return;
    }

    // Restricted status check (regardless of date)
    if (isVerified === "restricted") {
      // Try to get the restriction end date
      let restrictionDate = null;
      if (user?.student?.restricted_until) {
        restrictionDate = new Date(user.student.restricted_until);
      } else if (user?.student?.statusMsg) {
        // Try to extract from statusMsg
        const dateMatch = user.student.statusMsg.match(
          /restricted until ([^\.]+)/i
        );
        if (dateMatch && dateMatch[1]) {
          try {
            restrictionDate = new Date(dateMatch[1].trim());
          } catch (e) {
            console.error("Failed to parse date from statusMsg:", e);
          }
        }
      }

      // Check if the restriction is still active
      const isCurrentlyRestricted =
        restrictionDate &&
        !isNaN(restrictionDate.getTime()) &&
        restrictionDate > new Date();

      if (isCurrentlyRestricted) {
        ShowAlert(
          dispatch,
          "warning",
          "Account Restricted",
          `Your account is temporarily restricted until ${restrictionDate.toLocaleString()}. You cannot add to cart at this time.`,
          { text: "Ok" }
        );
      } else {
        // Restriction expired but status still "restricted"
        ShowAlert(
          dispatch,
          "warning",
          "Account Status Issue",
          "Your account has a restriction status that needs attention. Please contact support or check your profile.",
          {
            text: "View Profile",
            action: () => navigate("/profile/edit-profile"),
          }
        );
      }
      return;
    }

    // Other status checks (pending, flagged, etc.)
    if (isVerified !== "verified" || isEmailVerified !== true) {
      ShowAlert(
        dispatch,
        "warning",
        "Access Denied",
        "You must be verified to proceed.",
        {
          text: "View Profile",
          action: () => {
            navigate("/profile/edit-profile");
          },
        }
      );
      return;
    }
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
          ownerId: item.seller.id,
          owner: { fname: item.seller.lname, lname: item.seller.lname },
          itemType: item.itemType === FOR_SALE ? "buy" : "rent",
          dateId: selectedDateId,
          durationId: selectedDurationId,
          itemId: item.id,
          price: item.price,
          name: item.name,
        })
      ).then(() => {
        dispatch(fetchCart());
      });

      const { successCartMessage, errorCartMessage, warningCartMessage } =
        store.getState().cart;

      if (successCartMessage) {
        ShowAlert(dispatch, "success", "Success!", successCartMessage);
      }
      if (warningCartMessage) {
        ShowAlert(dispatch, "warning", "Already in Cart", warningCartMessage);
      }
      if (errorCartMessage) {
        ShowAlert(dispatch, "error", "Error", errorCartMessage);
      }
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

  const [stripePaymentDetails, setStripePaymentDetails] = useState(null);
  const { loadingUnavailableDates, unavailableDates, errorUnavailableDates } =
    useSelector((state) => state.unavailableDates);

  useEffect(() => {
    dispatch(fetchUnavailableDates());
  }, [dispatch]);

  const [formattedUnavailableDates, setFormattedUnavailableDates] = useState(
    []
  );

  useEffect(() => {
    console.log("unavailableDates before processing:", unavailableDates);

    if (
      unavailableDates.unavailableDates &&
      Array.isArray(unavailableDates.unavailableDates) &&
      unavailableDates.unavailableDates.length > 0
    ) {
      const formatted = unavailableDates.unavailableDates.map((item) => ({
        date: new Date(item.date),
        reason: item.description,
      }));

      console.log("Formatted unavailable dates:", formatted);
      setFormattedUnavailableDates(formatted);
    } else {
      console.log("No valid unavailableDates found.");
      setFormattedUnavailableDates([]);
    }
  }, [unavailableDates]);

  const confirmRental = async () => {
    try {
      const selectedDateId = approvedItemForSaleById.rentalDates.find(
        (rentalDate) => rentalDate.date === selectedDate
      )?.id;

      const rentalDetails = {
        owner_id: approvedItemForSaleById.seller.id,
        buyer_id: loggedInUserId,
        item_id: approvedItemForSaleById.id,
        delivery_method: approvedItemForSaleById.deliveryMethod || "meetup", // Default to meetup if not specified
        date_id: selectedDateId,
        time_id: selectedDuration.id,
        payment_mode: approvedItemForSaleById.paymentMethod,
        isFromCart: false,
        transaction_type: "sell",
        amount: approvedItemForSaleById.price,
      };

      const response = await axios.post(
        `${baseApi}/rental-transaction/add`,
        rentalDetails
      );

      if (approvedItemForSaleById.paymentMethod === GCASH) {
        if (!response.data.clientSecret || !response.data.paymentIntentId) {
          ShowAlert(dispatch, "error", "Error", "Failed to setup payment.");
          return;
        }

        // Store payment details in state instead of localStorage
        setStripePaymentDetails({
          paymentIntentId: response.data.paymentIntentId,
          clientSecretFromState: response.data.clientSecret,
          rentalId: response.data.id,
          userId: loggedInUserId,
        });

        setShowModal(false);
        navigate("/payment", {
          state: {
            paymentIntentId: response.data.paymentIntentId,
            clientSecretFromState: response.data.clientSecret,
            rentalId: response.data.id,
            userId: loggedInUserId,
          },
        });
      } else {
        setShowModal(false);
        ShowAlert(
          dispatch,
          "success",
          "Success",
          "Rental confirmed successfully!"
        );
        navigate("/profile/transactions/renter/requests");
      }
    } catch (error) {
      console.error("Error in confirmRental:", error);
      ShowAlert(dispatch, "error", "Error", "Failed to confirm rental.");
    }
  };

  useEffect(() => {
    if (id) {
      dispatch(fetchApprovedItemForSaleById(id));
    }
  }, [id, dispatch]);

  useEffect(() => {
    if (loggedInUserId) {
      checkIfReported();
    }
  }, [loggedInUserId, approvedItemForSaleById.id]);

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

    if (
      errorApprovedItemForSaleById ||
      (!loadingApprovedItemForSaleById && !approvedItemForSaleById)
    ) {
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
  }, [
    errorApprovedItemForSaleById,
    loadingApprovedItemForSaleById,
    approvedItemForSaleById,
    dispatch,
  ]);

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
    if (!studentUser) {
      handleActionWithAuthCheck("");
      return;
    }

    // Ban check
    if (isVerified === "banned") {
      ShowAlert(
        dispatch,
        "warning",
        "Account Banned",
        "Your account is permanently banned. You cannot send messages.",
        { text: "Ok" }
      );
      return;
    }

    // Restricted status check (regardless of date)
    if (isVerified === "restricted") {
      // Try to get the restriction end date
      let restrictionDate = null;
      if (user?.student?.restricted_until) {
        restrictionDate = new Date(user.student.restricted_until);
      } else if (user?.student?.statusMsg) {
        // Try to extract from statusMsg
        const dateMatch = user.student.statusMsg.match(
          /restricted until ([^\.]+)/i
        );
        if (dateMatch && dateMatch[1]) {
          try {
            restrictionDate = new Date(dateMatch[1].trim());
          } catch (e) {
            console.error("Failed to parse date from statusMsg:", e);
          }
        }
      }

      // Check if the restriction is still active
      const isCurrentlyRestricted =
        restrictionDate &&
        !isNaN(restrictionDate.getTime()) &&
        restrictionDate > new Date();

      if (isCurrentlyRestricted) {
        ShowAlert(
          dispatch,
          "warning",
          "Account Restricted",
          `Your account is temporarily restricted until ${restrictionDate.toLocaleString()}. You cannot send messages at this time.`,
          { text: "Ok" }
        );
      } else {
        // Restriction expired but status still "restricted"
        ShowAlert(
          dispatch,
          "warning",
          "Account Status Issue",
          "Your account has a restriction status that needs attention. Please contact support or check your profile.",
          {
            text: "View Profile",
            action: () => navigate("/profile/edit-profile"),
          }
        );
      }
      return;
    }

    // Other status checks (pending, flagged, etc.)
    if (isVerified !== "verified" || isEmailVerified !== true) {
      ShowAlert(
        dispatch,
        "warning",
        "Access Denied",
        "You must be verified to proceed.",
        {
          text: "View Profile",
          action: () => {
            navigate("/profile/edit-profile");
          },
        }
      );
      return;
    }

    try {
      const response = await fetch(
        `${
          process.env.REACT_APP_API_URL || `${baseApi}`
        }/api/conversations/createBySeller`,
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
          state: {
            sellerId: approvedItemForSaleById.seller.id,
            product: {
              productId: approvedItemForSaleById.id, // Add product ID
              name: approvedItemForSaleById.name,
              price: approvedItemForSaleById.price,
              image: approvedItemForSaleById.images[0],
              title: approvedItemForSaleById.itemType,
              type: "shop", // Add type identifier
            },
          }, // Pass sellerId to MessagePage
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
      const response = await axios.post(`${baseApi}/api/reports`, reportData); // API endpoint
      // Update hasReported state
      setHasReported(true);

      // Show success notification instead of alert
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
      const response = await axios.get(`${baseApi}/api/reports/check`, {
        params: {
          reporter_id: loggedInUserId,
          reported_entity_id: approvedItemForSaleById.id,
        },
      });
      setHasReported(response.data.hasReported);
    } catch (error) {
      console.error("Error checking report:", error);
    }
  };

  return (
    <div className="container-content itemforsale-detail">
      {isYou && <ViewToolbar />}
      <div className="itemforsale-container">
        <div className="imgs-container">
          <Tooltip
            title={`This item is ${
              approvedItemForSaleById.itemType === FOR_RENT
                ? FOR_RENT
                : FOR_SALE
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
                approvedItemForSaleById.itemType === FOR_RENT
                  ? FOR_RENT
                  : FOR_SALE
              }
              className="item-type"
            />
          </Tooltip>

          {approvedItemForSaleById.isFollowingBuyer && (
            <Tooltip
              title={
                approvedItemForSaleById.itemType === FOR_RENT
                  ? "This item is rented by one of your followings"
                  : "This item is bought by one of your followings"
              }
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
                src={targetIcon}
                alt={
                  approvedItemForSaleById.itemType === FOR_RENT
                    ? "This item is rented by one of your followings"
                    : "This item is bought by one of your followings"
                }
                className="rented-indx"
              />
            </Tooltip>
          )}
          <ImageSlider
            images={
              approvedItemForSaleById.images &&
              approvedItemForSaleById.images.length
                ? approvedItemForSaleById.images
                : [defaultImages]
            }
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
            {loggedInUserId !== approvedItemForSaleById?.seller?.id &&
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
          <div className="d-flex align-items-center my-1">
            {approvedItemForSaleById.averageRating ? (
              <>
                <span className="price me-2 fs-5 fw-bold text-success">
                  {approvedItemForSaleById.averageRating.toFixed(2)}
                </span>
                <div className="">
                  {"("}
                  <i
                    className="bi-star-fill text-warning"
                    style={{ fontSize: "1 rem" }}
                  />
                </div>
                {")"}
              </>
            ) : (
              <span className="error-msg text-gray fs-5">
                <i className="bi-star" style={{ fontSize: "1 rem" }} /> No
                ratings yet
              </span>
            )}
          </div>

          <div className="action-btns">
            <button
              className="btn btn-icon primary"
              onClick={(e) => handleAddToCart(e, approvedItemForSaleById)}
              disabled={isYou}
            >
              <img src={cartIcon} alt="Add to cart" />
            </button>
            <button
              className="btn btn-rectangle secondary"
              onClick={handleMessageSellerClick}
              disabled={isYou}
            >
              Message
            </button>
            <button
              className="btn btn-rectangle primary"
              onClick={handleOfferClick}
              disabled={isYou}
            >
              {approvedItemForSaleById.itemType === FOR_RENT ? "Rent" : "Buy"}
            </button>
          </div>
          <hr />
          <div className="rental-dates-durations">
            <div className="date-picker">
              <span>
                Pick a date to{" "}
                {approvedItemForSaleById.itemType === FOR_RENT ? "rent" : "buy"}
                :
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
                dayClassName={(date) => {
                  // Get today's date with time set to midnight for proper comparison
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);

                  // Check if this date is in the past
                  const isPast = date.getTime() < today.getTime();

                  // Check if this date is in the unavailable dates
                  const isUnavailable = formattedUnavailableDates.some(
                    (item) =>
                      new Date(item.date).toDateString() === date.toDateString()
                  );

                  // Check if this is the selected date
                  const isSelected =
                    selectedDate &&
                    date.toDateString() ===
                      new Date(selectedDate).toDateString();

                  // Apply appropriate class based on conditions
                  if (isSelected) {
                    return "bg-blue";
                  } else if (
                    availableDates.some(
                      (d) => d.toDateString() === date.toDateString()
                    ) &&
                    !isPast &&
                    !isUnavailable
                  ) {
                    return "bg-green";
                  } else {
                    return "";
                  }
                }}
                excludeDates={formattedUnavailableDates.map(
                  (item) => new Date(item.date)
                )}
                minDate={new Date()} // Prevents selecting past dates
                maxDate={
                  unavailableDates?.endSemesterDates?.length > 0
                    ? new Date(unavailableDates?.endSemesterDates[0]?.date)
                    : null
                }
                shouldCloseOnSelect={false}
                formatWeekDay={(nameOfDay) => nameOfDay.slice(0, 1)}
                calendarClassName="custom-calendar"
                todayButton={null}
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
                  {approvedItemForSaleById.paymentMethod === GCASH
                    ? "Online Payment"
                    : "Pay upon meetup"}
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
                      Meetup
                    </button>
                    <button
                      className={`value ${
                        approvedItemForSaleById.paymentMethod === PICK_UP
                          ? "selected"
                          : ""
                      }`}
                      onClick={() => handleSelectDeliveryMethod("pickup")}
                    >
                      Pickup
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

      <UserToolbar
        user={approvedItemForSaleById.seller}
        isYou={
          approvedItemForSaleById.seller
            ? approvedItemForSaleById.seller.id === loggedInUserId
            : false
        }
      />

      <ItemDescAndSpecs
        specs={approvedItemForSaleById.specs}
        desc={approvedItemForSaleById.desc}
        tags={approvedItemForSaleById.tags}
      />

      {showModal && (
        <ConfirmationModal
          show={showModal}
          onHide={() => setShowModal(false)}
          itemforsale={approvedItemForSaleById}
          confirm={(e) => confirmRental(e)}
          selectedDate={selectedDate}
          selectedDuration={selectedDuration}
        />
      )}
    </div>
  );
}

export default ItemForSaleDetail;
