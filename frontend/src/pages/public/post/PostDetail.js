import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchApprovedPostById } from "../../../redux/post/approvedPostByIdSlice";
import { Modal, Button, Spinner } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";

import { formatTimeTo12Hour } from "../../../utils/timeFormat";
import Tooltip from "@mui/material/Tooltip";
import itemImage1 from "../../../assets/images/item/item_1.jpg";
import itemImage2 from "../../../assets/images/item/item_2.jpg";
import itemImage3 from "../../../assets/images/item/item_3.jpg";
import itemImage4 from "../../../assets/images/item/item_4.jpg";
import forRentIcon from "../../../assets/images/card/rent.svg";
import forSaleIcon from "../../../assets/images/card/buy.svg";
import "./postDetailStyles.css";
import expandIcon from "../../../assets/images/pdp/plus.svg";
import infoIcon from "../../../assets/images/input-icons/info.svg";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { selectStudentUser } from "../../../redux/auth/studentAuthSlice";
import {
  defaultImages,
  FOR_RENT,
  FOR_SALE,
  MEET_UP,
  PICK_UP,
  TO_BUY,
  TO_RENT,
  PAY_UPON_MEETUP,
  GCASH,
  CONDITIONS,
  baseApi,
} from "../../../utils/consonants";
import AddTerms from "../../private/users/common/AddTerms";

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

import SingleImageUpload from "../../private/users/common/SingleImageUpload";
import ItemCard from "../../../components/item-card/ItemCard";
import { fetchPostMatchedItems } from "../../../redux/post/postMatchedItems";
import ViewToolbar from "../common/ViewToolbar";
import { useSystemConfig } from "../../../context/SystemConfigProvider";
import { fetchUnavailableDates } from "../../../redux/dates/unavaibleDatesSlice";

function PostDetail() {
  const { user, loadingFetchUser } = useSelector((state) => state.user);
  const isVerified = user?.student?.status ?? false;
  const isEmailVerified = user?.user?.emailVerified ?? false;
  const { config } = useSystemConfig();

  const navigate = useNavigate();
  const { id } = useParams();
  const dispatch = useDispatch();
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedDuration, setSelectedDuration] = useState(null);
  const [showDurations, setShowDurations] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const { approvedPostById, loadingApprovedPostById, errorApprovedPostById } =
    useSelector((state) => state.approvedPostById);
  const { postMatchedItems, loadingPostMatchedItems, errorPostMatchedItems } =
    useSelector((state) => state.postMatchedItems);
  const studentUser = useSelector(selectStudentUser);
  const rentalDates = approvedPostById.rentalDates || [];
  const [loading, setLoading] = useState(true);
  const [redirecting, setRedirecting] = useState(false);
  const [expandTerm, setExpandTerm] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const loggedInUserId = studentUser?.userId || null;
  const handleActionWithAuthCheck = useHandleActionWithAuthCheck();
  const [hasReported, setHasReported] = useState(false);
  const [entityType, setEntityType] = useState("");

  const [offerPrice, setOfferPrice] = useState("");

  const [offerImage, setOfferImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [imageError, setImageError] = useState(false);
  const isYou = approvedPostById?.renter?.id === studentUser?.userId;

  const [deliveryMethod, setDeliveryMethod] = useState(MEET_UP);
  const [paymentMethod, setPaymentMethod] = useState(PAY_UPON_MEETUP);
  const [itemCondition, setItemCondition] = useState("");
  const [location, setLocation] = useState("");
  const [stock, setStock] = useState(1);
  const [termsValues, setTermsValues] = useState({
    lateCharges: "",
    securityDeposit: "",
    repairReplacement: "",
  });

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

    if (approvedPostById.itemType === TO_BUY && !user?.user?.isRepresentative) {
      ShowAlert(
        dispatch,
        "warning",
        "Not Eligible",
        "Only representatives or organization members can sell items.",
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

    if (approvedPostById.itemType === TO_BUY && (!stock || stock < 1)) {
      ShowAlert(
        dispatch,
        "warning",
        "Invalid Stock",
        "Please enter a valid stock quantity greater than zero."
      );
      return;
    }

    if (!selectedDate || !selectedDuration) {
      ShowAlert(
        dispatch,
        "warning",
        "Missing Selection",
        "Please select a date and duration before offering."
      );
      return;
    }

    if (!offerPrice || parseFloat(offerPrice) <= 0) {
      ShowAlert(
        dispatch,
        "warning",
        "Invalid Price",
        "Please enter a valid price greater than zero."
      );
      return;
    }

    if (!itemCondition) {
      ShowAlert(
        dispatch,
        "warning",
        "Missing Item Condition",
        "Please select an item condition."
      );
      return;
    }

    if (!location) {
      ShowAlert(
        dispatch,
        "warning",
        "Missing Location",
        "Please enter a location for meetup/pickup."
      );
      return;
    }

    if (!offerImage) {
      setImageError(true);
      ShowAlert(
        dispatch,
        "warning",
        "Image Required",
        "Please upload an item image."
      );
      return;
    }

    setImageError(false);
    setShowModal(true);
  };

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
        }/api/conversations/createConversationPost`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            senderId: studentUser.userId,
            renterId: approvedPostById.renter.id,
          }),
        }
      );

      if (response.ok) {
        navigate("/messages", {
          state: {
            renterId: approvedPostById.renter.id,
            product: {
              name: approvedPostById.name,
              image: approvedPostById.images[0],
              title: approvedPostById.itemType,
              productId: approvedPostById.id,
              type: "post",
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

  const handleExpandTerms = () => {
    setExpandTerm(!expandTerm);
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

  const handleConfirmOffer = async () => {
    try {
      setIsSubmitting(true);
      let imageUrl = approvedPostById.images?.[0] || defaultImages[0];

      if (offerImage) {
        const formData = new FormData();
        formData.append("upload_images", offerImage);

        const uploadResponse = await axios.post(
          `${
            process.env.REACT_APP_API_URL || `${baseApi}`
          }/api/posts/upload-offer-image`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        imageUrl = uploadResponse.data.urls[0];
      }

      const createConversationResponse = await fetch(
        `${
          process.env.REACT_APP_API_URL || `${baseApi}`
        }/api/conversations/createConversationPost`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            senderId: studentUser.userId,
            renterId: approvedPostById.renter.id,
          }),
        }
      );

      const conversation = await createConversationResponse.json();

      const selectedDateId = approvedPostById.rentalDates.find(
        (rentalDate) => rentalDate.date === selectedDate
      )?.id;

      const offerDetails = {
        name: approvedPostById.name,
        image: imageUrl,
        price: offerPrice,
        offerPrice: offerPrice,
        title: "Offer",
        status: `Date: ${new Date(
          selectedDate
        ).toLocaleDateString()}\nDuration: ${selectedDuration.timeFrom} - ${
          selectedDuration.timeTo
        }`,
        productId: approvedPostById.id,
        type: "post",

        deliveryMethod: deliveryMethod,
        paymentMethod: paymentMethod,
        itemCondition: itemCondition,
        location: location,
        terms: approvedPostById.itemType === TO_RENT ? termsValues : null,

        stock: approvedPostById.itemType === TO_BUY ? stock : null,

        date_id: selectedDateId,
        time_id: selectedDuration.id,
      };

      navigate("/messages", {
        state: {
          renterId: approvedPostById.renter.id,
          product: offerDetails,
          isOffer: true,
        },
      });

      setIsSubmitting(false);
      setShowModal(false);
    } catch (error) {
      setIsSubmitting(false);
      console.error("Error handling offer:", error);
      dispatch(
        showNotification({
          type: "error",
          title: "Error",
          text: "Failed to send offer. Please try again.",
        })
      );
    }
  };

  useEffect(() => {
    if (id) {
      dispatch(fetchApprovedPostById(id));
      dispatch(fetchPostMatchedItems(id));
      dispatch(fetchUnavailableDates());
    }
  }, [id, dispatch]);

  const checkIfReported = async () => {
    try {
      const response = await axios.get(`${baseApi}/api/reports/check`, {
        params: {
          reporter_id: loggedInUserId,
          reported_entity_id: approvedPostById.id,
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
  }, [loggedInUserId, approvedPostById.id]);

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

    if (
      errorApprovedPostById ||
      (!loadingApprovedPostById && !approvedPostById)
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
    errorApprovedPostById,
    loadingApprovedPostById,
    approvedPostById,
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

  if (loadingApprovedPostById || redirecting) {
    return <LoadingItemDetailSkeleton />;
  }

  const handleReportSubmit = async (reason) => {
    const reportData = {
      reporter_id: loggedInUserId,
      reported_entity_id: approvedPostById.id,
      entity_type: "post",
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
      const entityType = "post";
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
    <div className="container-content post-detail">
      {isYou && <ViewToolbar />}
      <div
        className="post-container"
        data-item-type={approvedPostById.itemType}
        style={{ position: "relative" }}
      >
        {approvedPostById.itemType === TO_BUY &&
          !user?.user?.isRepresentative && (
            <div className="restriction-overlay">
              <div className="restriction-message">
                Not eligible to sell an item. Only representatives or
                organization members can sell.
              </div>
            </div>
          )}
        <div className="imgs-container">
          <Tooltip
            title={`This item is ${
              approvedPostById.itemType === TO_RENT ? TO_RENT : TO_BUY
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
                approvedPostById.itemType === TO_RENT
                  ? forRentIcon
                  : forSaleIcon
              }
              alt={approvedPostById.itemType === TO_RENT ? TO_RENT : TO_BUY}
              className="item-type"
            />
          </Tooltip>
          <ImageSlider
            images={
              approvedPostById.images && approvedPostById.images.length
                ? [approvedPostById.images]
                : [defaultImages]
            }
          />
        </div>
        <div className="rental-details">
          <div className="item-header">
            <ItemBadges
              values={{
                college: approvedPostById?.renter?.college,
                category: approvedPostById.category,
              }}
            />
            {loggedInUserId !== approvedPostById?.renter?.id &&
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
              handleClose={() => setShowReportModal(false)}
              handleSubmit={handleReportSubmit}
              entityType={entityType}
            />
          </div>
          <div className="item-title">
            <>
              <i>
                <span className="title">
                  {approvedPostById?.renter
                    ? approvedPostById.renter.fname
                    : "User"}{" "}
                </span>
                is Looking for{" "}
              </i>
              {approvedPostById.name ? (
                <span className="title">{approvedPostById.name}</span>
              ) : (
                <span className="error-msg">No available name.</span>
              )}
            </>
          </div>

          <div className="action-btns">
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
              {approvedPostById.itemType === TO_RENT ? "Offer" : "SELL"}
            </button>
          </div>
          <hr />
          <div className="rental-dates-durations">
            <div className="date-picker">
              <span>
                Pick a date to{" "}
                {approvedPostById.itemType === TO_RENT ? "offer" : "buy"}:
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
                minDate={new Date()}
                maxDate={
                  unavailableDates?.endSemesterDates?.length > 0
                    ? new Date(unavailableDates?.endSemesterDates[0]?.date)
                    : null
                }
                excludeDates={formattedUnavailableDates.map(
                  (item) => new Date(item.date)
                )}
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
                        .map((duration) => (
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

            {/* Offer Details Section - Moved closer to duration picker */}
            <div className="offer-details-section mt-3">
              <div className="form-group">
                <label>
                  {approvedPostById.itemType === TO_RENT
                    ? "Rental Fee"
                    : "Price"}
                </label>
                <input
                  type="number"
                  className="form-control"
                  value={offerPrice}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value);
                    if (e.target.value === "" || (!isNaN(value) && value > 0)) {
                      setOfferPrice(e.target.value);
                    }
                  }}
                  min="0.01"
                  step="0.01"
                  placeholder={`Enter ${
                    approvedPostById.itemType === TO_RENT
                      ? "rental fee"
                      : "price"
                  }`}
                />
                {offerPrice && parseFloat(offerPrice) <= 0 && (
                  <small className="text-danger">
                    Price must be greater than zero
                  </small>
                )}
              </div>

              <div className="form-group">
                <label>
                  Upload Item Image <span className="text-danger">*</span>
                </label>
                <SingleImageUpload
                  onChange={({ file, preview }) => {
                    setOfferImage(file);
                    setImagePreview(preview);
                    setImageError(false);
                  }}
                />
                {imageError && (
                  <small className="text-danger">Please upload an image</small>
                )}
              </div>
            </div>

            {/* Delivery Method */}
            <div className="group-container delivery-method">
              <label className="label">Delivery Method</label>
              <div className="delivery-method">
                <div className="action-btns">
                  <button
                    className={`value ${
                      deliveryMethod === MEET_UP ? "selected" : ""
                    }`}
                    onClick={() => setDeliveryMethod(MEET_UP)}
                  >
                    Meet up
                  </button>
                  <button
                    className={`value ${
                      deliveryMethod === PICK_UP ? "selected" : ""
                    }`}
                    onClick={() => setDeliveryMethod(PICK_UP)}
                  >
                    Pick up
                  </button>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="group-container payment-method">
              <label className="label">Payment Method</label>
              <div className="delivery-method">
                <div className="action-btns">
                  <Tooltip
                    title={`${
                      studentUser?.hasStripe === false
                        ? "This is disabled. You must have a Stripe account first. Create one by going to /profile/dashboard."
                        : ""
                    }`}
                  >
                    <button
                      className={`value ${
                        paymentMethod === GCASH ? "selected" : ""
                      }`}
                      onClick={() => setPaymentMethod(GCASH)}
                      disabled={!studentUser?.hasStripe}
                    >
                      Online Payment
                    </button>
                  </Tooltip>

                  <button
                    className={`value ${
                      paymentMethod === PAY_UPON_MEETUP ? "selected" : ""
                    }`}
                    onClick={() => setPaymentMethod(PAY_UPON_MEETUP)}
                  >
                    Pay upon meetup
                  </button>
                </div>
              </div>
            </div>

            {/* Item Condition */}
            <div className="group-container item-condition">
              <label className="label">Item Condition</label>
              <div className="input-wrapper">
                <select
                  className="input"
                  value={itemCondition}
                  onChange={(e) => setItemCondition(e.target.value)}
                >
                  <option value="" disabled>
                    Select item condition
                  </option>
                  {CONDITIONS.map((condition) => (
                    <option key={condition} value={condition}>
                      {condition}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {approvedPostById.itemType === TO_BUY && (
              <div className="group-container stock">
                <label className="label">Stock</label>
                <div className="input-wrapper">
                  <input
                    className="input"
                    placeholder="Enter stock quantity"
                    type="number"
                    min="1"
                    value={stock}
                    onChange={(e) => {
                      const inputValue = e.target.value;

                      if (inputValue === "") {
                        setStock("");
                        return;
                      }

                      const value = parseInt(inputValue);
                      if (!isNaN(value) && value > 0) {
                        setStock(value);
                      }
                    }}
                    onBlur={() => {
                      if (
                        stock === "" ||
                        isNaN(parseInt(stock)) ||
                        parseInt(stock) <= 0
                      ) {
                        setStock(1);
                      }
                    }}
                  />
                </div>
              </div>
            )}
            {/* Location Field */}
            <div className="group-container location">
              <label className="label">Location (for meetup / pick up)</label>
              <div className="input-wrapper">
                <input
                  className="input"
                  placeholder="Add location"
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
            </div>

            {/* Terms and Conditions - Only show for rental posts */}
            {approvedPostById.itemType === TO_RENT && (
              <div className="group-container terms-group">
                <label className="sub-section-label">
                  Terms and Condition
                  <button
                    className={`expand-btn ${expandTerm ? "expand" : ""}`}
                    onClick={handleExpandTerms}
                  >
                    <img src={expandIcon} alt="Expand terms and condition" />
                  </button>
                </label>

                <div className="terms-container">
                  {expandTerm && (
                    <div className="terms-popup">
                      <div className="term late-charges">
                        <label className="label">Late Charges</label>
                        <div className="input-wrapper">
                          <input
                            className="input"
                            placeholder="Add late charges"
                            type="text"
                            value={termsValues.lateCharges}
                            onChange={(e) =>
                              setTermsValues({
                                ...termsValues,
                                lateCharges: e.target.value,
                              })
                            }
                          />
                          <button className="btn btn-icon secondary">
                            <img src={infoIcon} alt="Information" />
                          </button>
                        </div>
                      </div>
                      <div className="term deposit">
                        <label className="label">Security Deposit</label>
                        <div className="input-wrapper">
                          <input
                            className="input"
                            placeholder="Add security deposit"
                            type="text"
                            value={termsValues.securityDeposit}
                            onChange={(e) =>
                              setTermsValues({
                                ...termsValues,
                                securityDeposit: e.target.value,
                              })
                            }
                          />
                          <button className="btn btn-icon secondary">
                            <img src={infoIcon} alt="Information" />
                          </button>
                        </div>
                      </div>
                      <div className="term repair-replacement">
                        <label className="label">Repair and Replacement</label>
                        <div className="input-wrapper">
                          <input
                            className="input"
                            placeholder="Add repair and replacement"
                            type="text"
                            value={termsValues.repairReplacement}
                            onChange={(e) =>
                              setTermsValues({
                                ...termsValues,
                                repairReplacement: e.target.value,
                              })
                            }
                          />
                          <button className="btn btn-icon secondary">
                            <img src={infoIcon} alt="Information" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <UserToolbar
        user={approvedPostById.renter}
        isYou={
          approvedPostById.renter
            ? approvedPostById.renter.id === loggedInUserId
            : false
        }
      />

      <ItemDescAndSpecs
        specs={approvedPostById.specs}
        desc={approvedPostById.desc}
        tags={approvedPostById.tags}
      />

      {/* Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {approvedPostById.itemType === TO_RENT
              ? "Confirm Rental Offer"
              : "Confirm Sale Offer"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="confirmation-modal">
            <div className="item-card">
              <div className="item-desc">
                <p>
                  <strong>Date:</strong> {new Date(selectedDate).toDateString()}
                </p>
                <p>
                  <strong>Duration:</strong>
                  {selectedDuration
                    ? selectedDuration.timeFrom && selectedDuration.timeTo
                      ? `${selectedDuration.timeFrom} - ${selectedDuration.timeTo}`
                      : "Invalid duration"
                    : "No duration selected"}
                </p>
                <p>
                  <strong>
                    {approvedPostById.itemType === TO_RENT
                      ? "Rental Fee"
                      : "Price"}
                    :
                  </strong>{" "}
                  ₱{offerPrice}
                </p>
                {approvedPostById.itemType === TO_BUY && (
                  <p>
                    <strong>Stock:</strong> {stock}
                  </p>
                )}
                <p>
                  <strong>Delivery Method:</strong>{" "}
                  {deliveryMethod === MEET_UP ? "Meet up" : "Pick up"}
                </p>
                <p>
                  <strong>Payment Method:</strong>{" "}
                  {paymentMethod === GCASH
                    ? "Online Payment"
                    : "Pay upon meetup"}
                </p>
                <p>
                  <strong>Item Condition:</strong>{" "}
                  {itemCondition || "Not specified"}
                </p>
                <p>
                  <strong>Location:</strong> {location || "Not specified"}
                </p>
              </div>

              {/* Terms and Conditions in Modal - only for rental posts */}
              {approvedPostById.itemType === TO_RENT &&
                (termsValues.lateCharges ||
                  termsValues.securityDeposit ||
                  termsValues.repairReplacement) && (
                  <div className="terms-summary">
                    <strong>Terms and Conditions:</strong>
                    <ul>
                      {termsValues.lateCharges && (
                        <li>
                          <strong>Late Charges:</strong>{" "}
                          {termsValues.lateCharges}
                        </li>
                      )}
                      {termsValues.securityDeposit && (
                        <li>
                          <strong>Security Deposit:</strong>{" "}
                          {termsValues.securityDeposit}
                        </li>
                      )}
                      {termsValues.repairReplacement && (
                        <li>
                          <strong>Repair and Replacement:</strong>{" "}
                          {termsValues.repairReplacement}
                        </li>
                      )}
                    </ul>
                  </div>
                )}

              {imagePreview && (
                <div className="mt-3">
                  <strong>Item Image:</strong>
                  <img
                    src={imagePreview}
                    alt="Offer preview"
                    style={{ width: "150px", display: "block" }}
                    className="mt-2"
                  />
                </div>
              )}
            </div>

            <div className="note mt-3">
              <p>
                By sending this{" "}
                {approvedPostById.itemType === TO_RENT ? "rental" : "sale"}{" "}
                offer, you agree to the platform's Policies and Terms. The
                recipient can accept your offer, initiating a transaction with
                the details above.
              </p>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleConfirmOffer} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                Processing...
              </>
            ) : (
              `Send ${approvedPostById.itemType === TO_RENT ? "Offer" : "Sale Offer"}`
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      <div>
        <ItemCard
          items={postMatchedItems ? postMatchedItems : []}
          title="Matched Items!"
        />
      </div>
    </div>
  );
}

export default PostDetail;
