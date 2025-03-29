import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchApprovedPostById } from "../../../redux/post/approvedPostByIdSlice";
import { Modal, Button } from "react-bootstrap";
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

  const [offerPrice, setOfferPrice] = useState("");

  const [offerImage, setOfferImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [imageError, setImageError] = useState(false);
  const isYou = approvedPostById?.renter?.id === studentUser?.userId;

  // State variables for offer details
  const [deliveryMethod, setDeliveryMethod] = useState(MEET_UP);
  const [paymentMethod, setPaymentMethod] = useState(PAY_UPON_MEETUP);
  const [itemCondition, setItemCondition] = useState("");
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

    if (!selectedDate || !selectedDuration) {
      alert("Please select a date and duration before offering.");
      return;
    }

    // Validate price is positive and not empty
    if (!offerPrice || parseFloat(offerPrice) <= 0) {
      alert("Please enter a valid price greater than zero.");
      return;
    }

    // Validate image is uploaded
    if (!offerImage) {
      setImageError(true);
      alert("Please upload an item image.");
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
        // Navigate to the message page with product details
        navigate("/messages", {
          state: {
            renterId: approvedPostById.renter.id,
            product: {
              name: approvedPostById.name,
              image: approvedPostById.images[0], // Use the first image for the product card
              title: approvedPostById.itemType,
              productId: approvedPostById.id,
              type: "post", // Add type identifier
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

  const handleConfirmOffer = async () => {
    try {
      let imageUrl = approvedPostById.images?.[0] || defaultImages[0];

      // Upload image if exists
      if (offerImage) {
        const formData = new FormData();
        formData.append("upload_images", offerImage); // Must match Multer field name

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

        // Get URL from Cloudinary response
        imageUrl = uploadResponse.data.urls[0];
      }

      // Then create conversation
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

      // Get the selected date ID from the rentalDates array
      const selectedDateId = approvedPostById.rentalDates.find(
        (rentalDate) => rentalDate.date === selectedDate
      )?.id;

      // Prepare offer details with Cloudinary URL and additional fields
      const offerDetails = {
        name: approvedPostById.name,
        image: imageUrl,
        price: offerPrice,
        title: "Offer",
        status: `Date: ${new Date(
          selectedDate
        ).toLocaleDateString()}\nDuration: ${selectedDuration.timeFrom} - ${
          selectedDuration.timeTo
        }`,
        productId: approvedPostById.id,
        type: "post",
        // Add new fields
        deliveryMethod: deliveryMethod,
        paymentMethod: paymentMethod,
        itemCondition: itemCondition,
        terms: approvedPostById.itemType === TO_RENT ? termsValues : null,
        // Add date_id and time_id for transaction creation
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

      setShowModal(false);
    } catch (error) {
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
    }
  }, [id, dispatch]);

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
    errorApprovedPostById,
    loadingApprovedPostById,
    approvedPostById,
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
    // try {
    //   const response = await axios.get(
    //     `${baseApi}/api/reports/check`,
    //     {
    //       params: {
    //         reporter_id: loggedInUserId,
    //         reported_entity_id: approvedPostById.id,
    //       },
    //     }
    //   );
    //   setHasReported(response.data.hasReported);
    // } catch (error) {
    //   console.error("Error checking report:", error);
    // }
  };

  return (
    <div className="container-content post-detail">
      {isYou && <ViewToolbar />}
      <div
        className="post-container"
        data-item-type={approvedPostById.itemType}
      >
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
              handleClose={() => setShowReportModal(false)} // Close the modal
              handleSubmit={handleReportSubmit} // Submit the report
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
                minDate={new Date()} // Prevents selecting past dates
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
                    // Only allow positive numbers
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
                    setImageError(false); // Clear error when image is uploaded
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
                      disabled={!studentUser?.hasStripe} // Ensures the button is disabled if hasStripe is false or undefined
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
                <input
                  className="input"
                  placeholder="Add item condition"
                  type="text"
                  value={itemCondition}
                  onChange={(e) => setItemCondition(e.target.value)}
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
              : "No duration selected"}
          </p>
          <p>
            <strong>
              {approvedPostById.itemType === TO_RENT ? "Rental Fee" : "Price"}:
            </strong>{" "}
            ₱{offerPrice}
          </p>
          <p>
            <strong>Delivery Method:</strong>{" "}
            {deliveryMethod === MEET_UP ? "Meet up" : "Pick up"}
          </p>
          <p>
            <strong>Payment Method:</strong>{" "}
            {paymentMethod === GCASH ? "Gcash" : "Pay upon meetup"}
          </p>
          <p>
            <strong>Item Condition:</strong> {itemCondition || "Not specified"}
          </p>

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
                      <strong>Late Charges:</strong> {termsValues.lateCharges}
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
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleConfirmOffer}>
            Confirm
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
