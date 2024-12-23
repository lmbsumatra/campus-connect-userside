import React, { useEffect, useReducer, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchApprovedListingById } from "../../../../redux/listing/approvedListingByIdSlice.js";
import { Modal, Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import store from "../../../../store/store.js";
import {
  UPDATE_FORM,
  onInputChange,
  onBlur,
} from "../../../../hooks/input-reducers/itemFormInputReducer.jsx";

import { formatTimeTo12Hour } from "../../../../utils/timeFormat.js";
import Tooltip from "@mui/material/Tooltip";
import cartIcon from "../../../../assets/images/pdp/cart.svg";
import itemImage1 from "../../../../assets/images/item/item_1.jpg";
import itemImage2 from "../../../../assets/images/item/item_2.jpg";
import itemImage3 from "../../../../assets/images/item/item_3.jpg";
import itemImage4 from "../../../../assets/images/item/item_4.jpg";
import forRentIcon from "../../../../assets/images/card/rent.svg";
import forSaleIcon from "../../../../assets/images/card/buy.svg";
import "./addNewItemStyles.css";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { selectStudentUser } from "../../../../redux/auth/studentAuthSlice.js";
import {
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
import UserToolbar from "../common/UserToolbar.jsx";
import Terms from "../listing/listing-detail/Terms.jsx";
import ImageSlider from "../common/ImageSlider.jsx";
import ItemBadges from "../common/ItemBadges.jsx";
import axios from "axios";
import AddItemDescAndSpecs from "../common/AddItemDescAndSpecs.jsx";

const initialState = {
  category: { value: "", triggered: false, hasError: true, error: "" },
  itemName: { value: "", triggered: false, hasError: true, error: "" },
  price: { value: "", triggered: false, hasError: true, error: "" },
  availableDates: {
    value: [],
    triggered: false,
    hasError: false,
    error: "",
  },
  deliveryMethod: { value: "", triggered: false, hasError: true, error: "" },
  paymentMethod: { value: "", triggered: false, hasError: true, error: "" },
  itemCondition: { value: "", triggered: false, hasError: true, error: "" },
  lateCharges: { value: "", triggered: false, hasError: true, error: "" },
  securityDeposit: { value: "", triggered: false, hasError: true, error: "" },
  repairReplacement: { value: "", triggered: false, hasError: true, error: "" },

  images: { value: [], triggered: false, hasError: false, error: "" }, // Array of images
  desc: { value: "", triggered: false, hasError: false, error: "" }, // Array of tags
  tags: { value: [], triggered: false, hasError: false, error: "" }, // Array of tags
  specs: { value: {}, triggered: false, hasError: false, error: "" }, // Object for specs

  isFormValid: false,
};

const formsReducer = (state, action) => {
  switch (action.type) {
    case UPDATE_FORM:
      return {
        ...state,
        [action.data.name]: {
          ...state[action.data.name],
          value: action.data.value,
          hasError: action.data.hasError,
          error: action.data.error,
          validations:
            action.data.validations || state[action.data.name].validations,
          triggered: action.data.triggered,
        },
        isFormValid: action.data.isFormValid,
      };
    default:
      return state;
  }
};

function AddNewItem() {
  const [itemDataState, dispatch] = useReducer(formsReducer, initialState);
  const navigate = useNavigate();
  const { id } = useParams();
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
  const rentalDates = approvedListingById.rentalDates || [];
  const [redirecting, setRedirecting] = useState(false);

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

    const selectedRentalDate = approvedListingById.rentalDates.find(
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

    const ShowAlert = (type, title, text) =>
      dispatch(showNotification({ type, title, text }));

    const loadingNotify = ShowAlert(
      "info",
      "Loading...",
      "Adding item to cart..."
    );

    if (!selectedDate || !selectedDuration) {
      dispatch(clearNotification(loadingNotify));
      return ShowAlert("error", "Error", "Please select a date and duration.");
    }

    const selectedDateId = approvedListingById.rentalDates.find(
      (rentalDate) => rentalDate.date === selectedDate
    )?.id;

    if (!selectedDateId) {
      // Remove the loading notification on error
      dispatch(clearNotification(loadingNotify));
      return ShowAlert("error", "Error", "Invalid date selection.");
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
        ShowAlert("success", "Success!", successCartMessage);
      }
      if (warningCartMessage) {
        ShowAlert("warning", "Warning", warningCartMessage);
      }

      if (errorCartMessage) {
        ShowAlert("error", "Error", errorCartMessage);
      }
    } catch (error) {
      console.error("Error adding item to cart:", error);
      ShowAlert("error", "Error", "An unexpected error occurred.");
    }
  };

  const confirmRental = async () => {
    const selectedDateId = approvedListingById.rentalDates.find(
      (rentalDate) => rentalDate.date === selectedDate
    )?.id;

    console.log(approvedListingById);

    const rentalDetails = {
      owner_id: approvedListingById.owner.id,
      renter_id: studentUser.userId,
      item_id: approvedListingById.id,
      delivery_method: approvedListingById.deliveryMethod,
      rental_date_id: selectedDateId,
      rental_time_id: selectedDuration.id,
    };
    try {
      await axios.post(
        "http://localhost:3001/rental-transaction/add",
        rentalDetails
      );
    } catch (error) {
      return error;
    }
  };

  useEffect(() => {
    if (id) {
      dispatch(fetchApprovedListingById(id));
    }
  }, [id, dispatch]);

  useEffect(() => {
    if (errorApprovedListingById) {
      dispatch(
        showNotification({
          type: "error",
          title: "Error",
          text: "Item not found!",
        })
      );
    } else if (!loadingApprovedListingById && !approvedListingById) {
      dispatch(
        showNotification({
          type: "error",
          title: "Not Found",
          text: "No item found with the given ID.",
        })
      );
    }

    if (
      errorApprovedListingById ||
      (!loadingApprovedListingById && !approvedListingById)
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
    errorApprovedListingById,
    loadingApprovedListingById,
    approvedListingById,
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

  if (loadingApprovedListingById || redirecting) {
    return <LoadingItemDetailSkeleton />;
  }

  return (
    <div className="container-content listing-detail">
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
          <ImageSlider images={images} />
        </div>
        <div className="rental-details">
          <ItemBadges
            values={{
              college: approvedListingById?.owner?.college,
              category: approvedListingById.category,
            }}
          />
          <div className="item-title">
            <>
              <i>For rent </i>
              <input
                id="itemName"
                name="itemName"
                className="input"
                placeholder="Add item name"
                required
                type="text"
                value={itemDataState.itemName.value}
                onChange={(e) =>
                  onInputChange(
                    "itemName",
                    e.target.value,
                    dispatch,
                    itemDataState
                  )
                }
                onBlur={(e) => {
                  onBlur("itemName", e.target.value, dispatch, itemDataState);
                }}
              />
              {itemDataState.itemName.triggered &&
                itemDataState.itemName.hasError && (
                  <div className="validation error">
                    <img src={""} className="icon" alt="Error on last name" />
                    <span className="text">{itemDataState.itemName.error}</span>
                  </div>
                )}
            </>
          </div>
          <div className="item-price">
            <span className="price">₱ </span>
            <input
              id="price"
              name="price"
              className="input"
              placeholder="Add price"
              required
              type="text"
              value={itemDataState.price.value}
              onChange={(e) =>
                onInputChange("price", e.target.value, dispatch, itemDataState)
              }
              onBlur={(e) => {
                onBlur("price", e.target.value, dispatch, itemDataState);
              }}
            />
            {itemDataState.price.triggered && itemDataState.price.hasError && (
              <div className="validation error">
                <img src={""} className="icon" alt="Error on last name" />
                <span className="text">{itemDataState.price.error}</span>
              </div>
            )}
          </div>
          <Tooltip title="Buttons disabled for preview purposes.">
            <div className="action-btns">
              <button className="btn btn-icon primary" disabled>
                <img src={cartIcon} alt="Add to cart" />
              </button>
              <button className="btn btn-rectangle secondary" disabled>
                Message
              </button>
              <button
                className="btn btn-rectangle primary"
                onClick={handleOfferClick}
                disabled
              >
                {approvedListingById.itemType === FOR_RENT ? "Rent" : "Buy"}
              </button>
            </div>
          </Tooltip>
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

          <Terms
            values={{
              lateCharges: approvedListingById.lateCharges,
              securityDeposit: approvedListingById.securityDeposit,
              repairReplacement: approvedListingById.repairReplacement,
            }}
          />
        </div>
      </div>

      <UserToolbar user={approvedListingById.owner} />

      <AddItemDescAndSpecs
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
                  src={images[0]}
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

export default AddNewItem;
