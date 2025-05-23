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
  const [entityType, setEntityType] = useState("");

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
    if (
      unavailableDates.unavailableDates &&
      Array.isArray(unavailableDates.unavailableDates) &&
      unavailableDates.unavailableDates.length > 0
    ) {
      const formatted = unavailableDates.unavailableDates.map((item) => ({
        date: new Date(item.date),
        reason: item.description,
      }));

      setFormattedUnavailableDates(formatted);
    } else {
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
      setPreparing(false);
    }
  }, [navigate]);

  useEffect(() => {
    if (warnSelectDateAndTime) {
    }
  }, [warnSelectDateAndTime]);

  useEffect(() => {
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

    if (isVerified === "restricted") {
      let restrictionDate = null;
      if (user?.student?.restricted_until) {
        restrictionDate = new Date(user.student.restricted_until);
      } else if (user?.student?.statusMsg) {
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

    if (isVerified === "restricted") {
      let restrictionDate = null;
      if (user?.student?.restricted_until) {
        restrictionDate = new Date(user.student.restricted_until);
      } else if (user?.student?.statusMsg) {
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
  );

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
        quantity: 1,
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
      ShowAlert(dispatch, "error", "Failed", error.response.data.message);
    }
  };

  useEffect(() => {
    if (id) {
      dispatch(fetchApprovedListingById(id));
    }
  }, [id, dispatch]);

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

    if (isVerified === "restricted") {
      let restrictionDate = null;
      if (user?.student?.restricted_until) {
        restrictionDate = new Date(user.student.restricted_until);
      } else if (user?.student?.statusMsg) {
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
            senderId: studentUser.userId,
            ownerId: approvedListingById.owner.id,
          }),
        }
      );

      if (response.ok) {
        navigate("/messages", {
          state: {
            ownerId: approvedListingById.owner.id,
            product: {
              productId: approvedListingById.id,
              name: approvedListingById.name,
              price: approvedListingById.rate,
              image: approvedListingById.images[0],
              title: approvedListingById.itemType,
              type: "rent",
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

      setHasReported(true);

      await ShowAlert(
        dispatch,
        "success",
        "Report Submitted",
        "Your report has been submitted successfully."
      );
    } catch (error) {
      console.error("Error submitting report:", error);

      await handleUnavailableDateError(dispatch, error);

      if (error.response?.status !== 403) {
        await ShowAlert(
          dispatch,
          "error",
          "Submission Failed",
          "Failed to submit the report. Please try again."
        );
      }
    }

    setShowReportModal(false);
  };

  const handleReportClick = () => {
    if (loggedInUserId) {
      const entityType = "listing";
      setShowReportModal(true);
      setEntityType(entityType);
    } else {
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

            <ReportModal
              show={showReportModal}
              handleClose={() => setShowReportModal(false)}
              handleSubmit={handleReportSubmit}
              entityType={entityType}
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

          <div className="d-flex">
            {approvedListingById.averageRating ? (
              <div className="d-flex flex-row align-items-center">
                <span className="fs-5 fw-bold text-success">
                  {approvedListingById.averageRating.toFixed(2)}
                </span>
                <span className="ms-1 text-warning">
                  <i
                    className="bi-star-fill text-warning"
                    style={{ fontSize: "1rem", verticalAlign: "middle" }}
                  />
                </span>
              </div>
            ) : (
              <span className="error-msg text-gray align-items-center">
                <i
                  className="bi-star"
                  style={{ fontSize: "1rem", verticalAlign: "middle" }}
                />{" "}
                No ratings yet
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
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);

                  const isPast = date.getTime() < today.getTime();

                  const isUnavailable = formattedUnavailableDates.some(
                    (item) =>
                      new Date(item.date).toDateString() === date.toDateString()
                  );

                  const isSelected =
                    selectedDate &&
                    date.toDateString() ===
                      new Date(selectedDate).toDateString();

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
                minDate={new Date()}
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
                      {showDurations
                        .slice()
                        .sort((a, b) => {
                          return a.timeFrom.localeCompare(b.timeFrom);
                        })
                        .map((duration) => {
                          const currentDateTime = new Date();

                          const selectedDateTime = new Date(selectedDate);

                          const [hours, minutes, seconds] =
                            duration.timeFrom.split(":");

                          selectedDateTime.setHours(
                            parseInt(hours, 10),
                            parseInt(minutes, 10),
                            parseInt(seconds, 10)
                          );

                          const isToday =
                            currentDateTime.getDate() ===
                              selectedDateTime.getDate() &&
                            currentDateTime.getMonth() ===
                              selectedDateTime.getMonth() &&
                            currentDateTime.getFullYear() ===
                              selectedDateTime.getFullYear();

                          if (isToday && selectedDateTime < currentDateTime) {
                            return null;
                          }

                          return (
                            <div key={duration.id} className="duration-item">
                              <input
                                type="checkbox"
                                id={`duration-${duration.id}`}
                                checked={
                                  selectedDuration &&
                                  selectedDuration.id === duration.id
                                }
                                onChange={() => handleSelectDuration(duration)}
                              />
                              {formatTimeTo12Hour(duration.timeFrom)} -{" "}
                              {formatTimeTo12Hour(duration.timeTo)}
                            </div>
                          );
                        })}
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
                title="Payment method has been preselected by owner."
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
                  title="Owner did not set payment method, you decide whether to meetup or pickup."
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
        tab={`listings`}
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
