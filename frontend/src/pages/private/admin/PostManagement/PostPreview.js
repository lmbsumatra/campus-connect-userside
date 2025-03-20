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
import "./listingPreviewStyles.css";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { selectStudentUser } from "../../../../redux/auth/studentAuthSlice.js";
import {
  defaultImages,
  TO_RENT,
  TO_BUY,
  GCASH,
  MEET_UP,
  PICK_UP,
} from "../../../../utils/consonants.js";
import { addCartItem } from "../../../../redux/cart/cartSlice.js";
import {
  clearNotification,
  showNotification,
} from "../../../../redux/alert-popup/alertPopupSlice.js";
import LoadingItemDetailSkeleton from "../../../../components/loading-skeleton/LoadingItemDetailSkeleton.js";
import UserToolbar from "../common/UserToolbar.jsx";
import ItemDescAndSpecs from "../common/ItemDescAndSpecs.jsx";
import ImageSlider from "../common/ImageSlider.jsx";
import ItemBadges from "../common/ItemBadges.jsx";
import { useSocket } from "../../../../context/SocketContext.js";
import axios from "axios";
import ViewToolbar from "../common/ViewToolbar.js";
import ReportModal from "../../../../components/report/ReportModal.js";
import ShowAlert from "../../../../utils/ShowAlert.js";
import { fetchAdminPostById } from "../../../../redux/post/adminPostByIdSlice.js";

function ListingDetail({ selectedItem, loading, error, isAdmin = false }) {
  const { user, loadingFetchUser } = useSelector((state) => state.user);
  const isVerified = user?.student?.status ?? false;

  const [isPreparing, setPreparing] = useState(true);
  const navigate = useNavigate();
  const { id } = useParams();
  const dispatch = useDispatch();
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedDuration, setSelectedDuration] = useState(null);
  const [showDurations, setShowDurations] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const studentUser = useSelector(selectStudentUser);

  const [redirecting, setRedirecting] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const loggedInUserId = studentUser?.userId || null;
  const socket = useSocket();
  const [hasReported, setHasReported] = useState(false);

  const location = useLocation();
  const { item, warnSelectDateAndTime } = location.state || {};

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
    if (id) {
      dispatch(fetchAdminPostById({ id: id }));
    }
  }, [id, dispatch]);

  const rentalDates = selectedItem?.requestDates || [];

  const handleDateClick = (dateId) => {
    const formatDate = (d) => d.toLocaleDateString("en-CA");

    const selectedRentalDate = selectedItem.requestDates.find(
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

  const requestDates = rentalDates
    .filter((rentalDate) => rentalDate.status === "available")
    .map((rentalDate) => new Date(rentalDate.date));

  useEffect(() => {
    if (error) {
      ShowAlert(dispatch, "error", "Error", "Item not found!");
    }
    if (error) {
      setRedirecting(true);
      const timer = setTimeout(() => {
        ShowAlert(dispatch, "loading", "Redirecting");
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [error, loading, selectedItem, dispatch]);

  useEffect(() => {
    if (redirecting) {
      const redirectTimer = setTimeout(() => {
        navigate(-1);
      }, 3000);

      return () => clearTimeout(redirectTimer);
    }
  }, [redirecting, navigate]);

  if (loading || redirecting || isPreparing) {
    return <LoadingItemDetailSkeleton />;
  }

  return (
    <div className="container-content-admin listing-detail">
      {isAdmin && <ViewToolbar />}

      <div className="listing-container">
        <div className="imgs-container">
          <Tooltip
            title={`This item is ${
              selectedItem?.itemType === TO_RENT ? TO_RENT : TO_BUY
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
                selectedItem?.itemType === TO_RENT ? forRentIcon : forSaleIcon
              }
              alt={selectedItem?.itemType === TO_RENT ? TO_RENT : TO_BUY}
              className="item-type"
            />
          </Tooltip>
          <ImageSlider
            images={
              selectedItem.images && selectedItem.images.length
                ? selectedItem.images
                : [defaultImages]
            }
          />
        </div>
        <div className="rental-details">
          <div className="item-header">
            <ItemBadges
              values={{
                college: selectedItem?.renter?.college,
                category: selectedItem.category,
              }}
            />
            {loggedInUserId !== selectedItem?.renter?.id && !hasReported && (
              <div className="report-button">
                <button className="btn btn-rectangle danger">Report</button>
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
            />
          </div>

          <div className="item-title">
            <>
              <i>{selectedItem.itemType === TO_RENT ? "To Rent" : "To Buy"} </i>
              {selectedItem.itemName ? (
                <span className="title">{selectedItem.itemName}</span>
              ) : (
                <span className="error-msg">No available name.</span>
              )}
            </>
          </div>

          <div className="action-btns">
            <button className="btn btn-icon primary" disabled={isAdmin}>
              <img src={cartIcon} alt="Add to cart" />
            </button>
            <button className="btn btn-rectangle secondary" disabled={isAdmin}>
              Message
            </button>
            <button className="btn btn-rectangle primary" disabled={isAdmin}>
              {selectedItem.itemType === TO_RENT ? "Rent" : "Sell"}
            </button>
          </div>
          <hr />
          <div className="rental-dates-durations">
            <div className="date-picker">
              <span>
                Pick a date to{" "}
                {selectedItem.itemType === TO_RENT ? "rent" : "sell"}:
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
                highlightDates={requestDates}
                dayClassName={(date) => {
                  return requestDates.some(
                    (d) => d.toDateString() === date.toDateString()
                  )
                    ? "bg-green"
                    : "";
                }}
              />
            </div>

            <div className="duration-picker group-container">
              <strong>Request Durations:</strong>
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

      <UserToolbar user={selectedItem.renter} isAdmin={true} />

      <ItemDescAndSpecs
        specs={selectedItem.specs}
        desc={selectedItem.desc}
        tags={selectedItem.tags}
      />
    </div>
  );
}

export default ListingDetail;
