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
  FOR_RENT,
  FOR_SALE,
  GCASH,
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
import UserToolbar from "../common/UserToolbar.jsx";
import ItemDescAndSpecs from "../common/ItemDescAndSpecs.jsx";
import ImageSlider from "../common/ImageSlider.jsx";
import ItemBadges from "../common/ItemBadges.jsx";
import { useSocket } from "../../../../context/SocketContext.js";
import axios from "axios";
import ViewToolbar from "../common/ViewToolbar.js";
import ReportModal from "../../../../components/report/ReportModal.js";
import useHandleActionWithAuthCheck from "../../../../utils/useHandleActionWithAuthCheck.jsx";
import handleUnavailableDateError from "../../../../utils/handleUnavailableDateError.js";
import ShowAlert from "../../../../utils/ShowAlert.js";
import { fetchAdminListingById } from "../../../../redux/listing/adminListingByIdSlice.js";

function ItemForSalePreview({ selectedItem, loading, error, isAdmin = false }) {
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
      dispatch(fetchAdminListingById({ id: id }));
    }
  }, [id, dispatch]);

  const rentalDates = selectedItem?.availableDates || [];

  const handleDateClick = (dateId) => {
    const formatDate = (d) => d.toLocaleDateString("en-CA");

    const selectedRentalDate = selectedItem.availableDates.find(
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

  console.log(selectedItem);

  return (
    <div className="container-content-admin listing-detail">
      {isAdmin && <ViewToolbar />}

      <div className="listing-container">
        <div className="imgs-container">
          <Tooltip
            title={`This item is ${
              selectedItem.itemType === FOR_RENT ? FOR_RENT : FOR_SALE
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
                selectedItem.itemType === FOR_RENT ? forRentIcon : forSaleIcon
              }
              alt={selectedItem.itemType === FOR_RENT ? FOR_RENT : FOR_SALE}
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
                college: selectedItem?.seller?.college,
                category: selectedItem.category,
              }}
            />
            {loggedInUserId !== selectedItem?.owner?.id && !hasReported && (
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
              <i>For rent </i>
              {selectedItem.itemName ? (
                <span className="title">{selectedItem.itemName}</span>
              ) : (
                <span className="error-msg">No available name.</span>
              )}
            </>
          </div>
          <div className="item-price">
            {selectedItem.price ? (
              <span className="price">₱ {selectedItem.price}</span>
            ) : (
              <span className="error-msg">No available price.</span>
            )}
          </div>
          <div className="action-btns">
            <button className="btn btn-icon primary" disabled={isAdmin}>
              <img src={cartIcon} alt="Add to cart" />
            </button>
            <button className="btn btn-rectangle secondary" disabled={isAdmin}>
              Message
            </button>
            <button className="btn btn-rectangle primary" disabled={isAdmin}>
              {selectedItem.itemType === FOR_RENT ? "Rent" : "Buy"}
            </button>
          </div>
          <hr />
          <div className="rental-dates-durations">
            <div className="date-picker">
              <span>
                Pick a date to{" "}
                {selectedItem.itemType === FOR_RENT ? "rent" : "buy"}:
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
            {selectedItem.deliveryMethod ? (
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
                  {selectedItem.deliveryMethod}
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
                        selectedItem.deliveryMethod === MEET_UP
                          ? "selected"
                          : ""
                      }`}
                      disabled={isAdmin}
                    >
                      Meet up
                    </button>
                    <button
                      className={`value ${
                        selectedItem.deliveryMethod === PICK_UP
                          ? "selected"
                          : ""
                      }`}
                      disabled={isAdmin}
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

            {selectedItem.paymentMethod ? (
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
                  {selectedItem.paymentMethod}
                </span>
              </Tooltip>
            ) : (
              <div className="delivery-method">
                <Tooltip
                  title="Owner did not set delivery method, you decide whether to meetup or pickup."
                  placement="bottom"
                >
                  <div className="action-btns">
                    <button className="value selected" disabled={isAdmin}>
                      Pay upon Meet up
                    </button>
                    <button
                      className={`value ${
                        selectedItem.paymentMethod === PICK_UP ? "selected" : ""
                      }`}
                      disabled={isAdmin}
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
              {selectedItem.itemCondition ? (
                <span className="value">{selectedItem.itemCondition}</span>
              ) : (
                <span className="error-msg">No item condition specified.</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <UserToolbar user={selectedItem.seller} isAdmin={true} />

      <ItemDescAndSpecs
        specs={selectedItem.specs}
        desc={selectedItem.desc}
        tags={selectedItem.tags}
      />
    </div>
  );
}

export default ItemForSalePreview;
