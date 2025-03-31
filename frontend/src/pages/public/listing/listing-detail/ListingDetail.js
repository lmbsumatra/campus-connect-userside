import React, { useEffect, useLayoutEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchApprovedListingById } from "../../../../redux/listing/approvedListingByIdSlice.js";
import "bootstrap/dist/css/bootstrap.min.css";
import store from "../../../../store/store.js";
import { loadStripe } from "@stripe/stripe-js";

import { formatTimeTo12Hour } from "../../../../utils/timeFormat.js";
import Tooltip from "@mui/material/Tooltip";
import cartIcon from "../../../../assets/images/pdp/cart.svg";
import forRentIcon from "../../../../assets/images/card/rent.svg";
import forSaleIcon from "../../../../assets/images/card/buy.svg";
import targetIcon from "../../../../assets/images/card/target.svg";
import "./listingDetailStyles.css";
import "../confirmationModalStyles.css";
import ShowAlert from "../../../../utils/ShowAlert.js";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { selectStudentUser } from "../../../../redux/auth/studentAuthSlice.js";
import {
  baseApi,
  defaultImages,
  FOR_RENT,
  FOR_SALE,
  GCASH,
  MEET_UP,
  PICK_UP,
  TO_BUY,
} from "../../../../utils/consonants.js";
import { addCartItem, fetchCart } from "../../../../redux/cart/cartSlice.js";
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
import ConfirmationModal from "../ConfirmationModal.js";
import { fetchUnavailableDates } from "../../../../redux/dates/unavaibleDatesSlice.js";
import RentalRateCalculator from "../../common/RentalRateCalculator.jsx";

// async function getUserFullName(userId) {
//   console.log("Fetching user details for userId:", userId);
//   try {
//     const studentUser = JSON.parse(localStorage.getItem("studentUser"));
//     const token = studentUser?.token;

//     console.log(JSON.parse(localStorage.getItem("studentUser")));

//     const res = await fetch(
//       `${
//         process.env.REACT_APP_API_URL || `${baseApi}`
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
  const { user, loadingFetchUser } = useSelector((state) => state.user);
  const isVerified = user?.student?.status ?? false;
  const isEmailVerified = user?.user?.emailVerified ?? false;

  const [isPreparing, setPreparing] = useState(true);
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

  const checkIfReported = async () => {
    try {
      const response = await axios.get(`${baseApi}/api/reports/check`, {
        params: {
          reporter_id: loggedInUserId,
          reported_entity_id: approvedListingById.id,
        },
      });
      setHasReported(response.data.hasReported);
    } catch (error) {
      console.error("Error checking report:", error);
    }
  };

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

  useEffect(() => {
    checkIfReported().then((reported) => {
      if (reported) {
        navigate("/reported-warning", { replace: true });
      }
    });
  }, [navigate]);

  useLayoutEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const fromStripe = urlParams.get("from_stripe");
    const rentalId = urlParams.get("rental_id");

    if (fromStripe === "cancelled" && rentalId) {
      navigate(`/payment-cancelled?rentalId=${rentalId}`, { replace: true });
    } else {
      setPreparing(false); // Only allow rendering if no redirect happens
    }
  }, [navigate]);

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

  const handleSelectDeliveryMethod = (method) => {};

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
      console.error("Error adding item to cart:", error);
      ShowAlert(dispatch, "error", "Error", "An unexpected error occurred.");
    }
  };

  const stripePromise = loadStripe(
    "pk_test_51Qd6OGJyLaBvZZCyI1v3VC4nkJ4FnP3JqVkEeRlpth6sUUKxeaGVwsgpOKEUIiDI61ITMyzWvTYJUYshL6H4jfks00mNbCIiZP"
  ); // Replace with your actual key

  const [stripePaymentDetails, setStripePaymentDetails] = useState(null);

  const confirmRental = async () => {
    const { total } = RentalRateCalculator({
      pricePerHour: approvedListingById.rate,
      timeFrom: selectedDuration.timeFrom,
      timeTo: selectedDuration.timeTo,
    });

    try {
      const selectedDateId = approvedListingById.availableDates.find(
        (rentalDate) => rentalDate.date === selectedDate
      )?.id;

      const rentalDetails = {
        owner_id: approvedListingById.owner.id,
        renter_id: studentUser.userId,
        item_id: approvedListingById.id,
        delivery_method: approvedListingById.deliveryMethod,
        date_id: selectedDateId,
        time_id: selectedDuration.id,
        payment_mode: approvedListingById.paymentMethod,
        transaction_type: "rental",
        amount: total,
      };

      const response = await axios.post(
        `${baseApi}/rental-transaction/add`,
        rentalDetails
      );

      if (approvedListingById.paymentMethod === GCASH) {
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
      dispatch(fetchApprovedListingById(id));
    }
  }, [id, dispatch]);

  // useEffect(() => {
  //   if (loggedInUserId) {
  //     checkIfReported();
  //   }
  // }, [loggedInUserId, approvedListingById.id]);

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

  if (loadingApprovedListingById || redirecting || isPreparing) {
    return <LoadingItemDetailSkeleton />;
  }

  const handleMessageClick = async () => {
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
              type: "rent", // Add type identifier
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
      const response = await axios.post(`${baseApi}/api/reports`, reportData);

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
          {approvedListingById.isFollowingRenter && (
            <Tooltip
              title={
                approvedListingById.itemType === FOR_RENT
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
                  approvedListingById.itemType === FOR_RENT
                    ? "This item is rented by one of your followings"
                    : "This item is bought by one of your followings"
                }
                className="rented-indx"
              />
            </Tooltip>
          )}
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
              <span className="price">₱ {approvedListingById.rate} per hr</span>
            ) : (
              <span className="error-msg">No available name.</span>
            )}
          </div>

          <div className="d-flex align-items-center my-1">
            {approvedListingById.averageRating ? (
              <>
                <span className="price me-2 fs-5 fw-bold text-success">
                  {approvedListingById.averageRating.toFixed(2)}
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
                  {approvedListingById.paymentMethod === GCASH
                    ? "Online Payment"
                    : "Pay upon meetup"}
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
                        approvedListingById.deliveryMethod === PICK_UP
                          ? "selected"
                          : ""
                      }`}
                      onClick={() => handleSelectDeliveryMethod("pickup")}
                      disabled={isYou}
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

      {showModal && (
        <ConfirmationModal
          show={showModal}
          onHide={() => setShowModal(false)}
          listing={approvedListingById}
          confirm={(e) => confirmRental(e)}
          selectedDate={selectedDate}
          selectedDuration={selectedDuration}
        />
      )}
    </div>
  );
}

export default ListingDetail;
