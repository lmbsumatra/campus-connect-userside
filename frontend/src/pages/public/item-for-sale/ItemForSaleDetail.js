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
import gearIcon from "../../../assets/images/card/gear.svg";
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
import QuantityControl from "./QuantityControl";

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
  const [quantity, setQuantity] = useState(1);

  const studentUser = useSelector(selectStudentUser);
  const isYou = approvedItemForSaleById?.seller?.id === studentUser?.userId;
  const rentalDates = approvedItemForSaleById.rentalDates || [];
  const [redirecting, setRedirecting] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const loggedInUserId = studentUser?.userId || null;
  const handleActionWithAuthCheck = useHandleActionWithAuthCheck();
  const [hasReported, setHasReported] = useState(false);
  const [entityType, setEntityType] = useState("");

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
      if (!selectedDate || !selectedDuration || !quantity) {
        dispatch(
          showNotification({
            type: "error",
            title: "Error",
            text: "Please select a date, duration, and quantity before buying.",
          })
        );
        return;
      }
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
    dispatch(
      showNotification({
        type: "loading",
        title: "Processing...",
        text: "Adding item to cart...",
      })
    );

    if (!selectedDate || !selectedDuration || !quantity) {
      dispatch(
        showNotification({
          type: "error",
          title: "Error",
          text: "Please select a date, duration, and quantity before adding to cart.",
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
          price: item.price * quantity,
          name: item.name,
          quantity: quantity || 0,
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

  const confirmRental = async () => {
    try {
      const selectedDateId = approvedItemForSaleById.rentalDates.find(
        (rentalDate) => rentalDate.date === selectedDate
      )?.id;

      const rentalDetails = {
        owner_id: approvedItemForSaleById.seller.id,
        buyer_id: loggedInUserId,
        item_id: approvedItemForSaleById.id,
        delivery_method: approvedItemForSaleById.deliveryMethod || "meetup",
        date_id: selectedDateId,
        time_id: selectedDuration.id,
        payment_mode: approvedItemForSaleById.paymentMethod,
        isFromCart: false,
        transaction_type: "sell",
        amount: approvedItemForSaleById.price * quantity,
        quantity: quantity || 1,
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
      setRedirecting(true);
      const timer = setTimeout(() => {
        dispatch(
          showNotification({
            type: "loading",
            title: "Redirecting",
          })
        );
      }, 5000);

      return () => clearTimeout(timer);
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
        navigate(-1);
      }, 6000);

      return () => clearTimeout(redirectTimer);
    }
  }, [redirecting, navigate]);

  if (loadingApprovedItemForSaleById || redirecting) {
    return <LoadingItemDetailSkeleton />;
  }

  const handleMessageSellerClick = async () => {
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
        }/api/conversations/createBySeller`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            senderId: studentUser.userId,
            sellerId: approvedItemForSaleById.seller.id,
          }),
        }
      );

      if (response.ok) {
        navigate("/messages", {
          state: {
            sellerId: approvedItemForSaleById.seller.id,
            product: {
              productId: approvedItemForSaleById.id,
              name: approvedItemForSaleById.name,
              price: approvedItemForSaleById.price,
              image: approvedItemForSaleById.images[0],
              title: approvedItemForSaleById.itemType,
              type: "shop",
            },
          },
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
      reporter_id: loggedInUserId,
      reported_entity_id: approvedItemForSaleById.id,
      entity_type: "sale",
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
      const entityType = "sale";
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

          {approvedItemForSaleById.hasRepresentative && (
            <Tooltip
              title={`This item is sold by ${approvedItemForSaleById?.organization?.name} organization.`}
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
                src={approvedItemForSaleById?.organization?.logo || gearIcon}
                alt={`This item is sold by ${approvedItemForSaleById?.organization?.name} organization`}
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

          <div className="d-flex">
            {approvedItemForSaleById.averageRating ? (
              <div className="d-flex flex-row align-items-center">
                <span className="fs-5 fw-bold text-success">
                  {approvedItemForSaleById.averageRating.toFixed(2)}
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

          <QuantityControl
            quantity={quantity}
            setQuantity={setQuantity}
            min={1}
            max={approvedItemForSaleById?.stock || 0}
          />

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
        tab={`for-sale`}
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
          quantity={quantity}
        />
      )}
    </div>
  );
}

export default ItemForSaleDetail;
