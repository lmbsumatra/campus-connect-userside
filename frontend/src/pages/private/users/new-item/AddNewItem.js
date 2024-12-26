import React, { useEffect, useReducer, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
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
import warningIcon from "../../../../assets/images/input-icons/warning.svg";
import "./addNewItemStyles.css";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { selectStudentUser } from "../../../../redux/auth/studentAuthSlice.js";
import {
  FOR_RENT,
  FOR_SALE,
  GCASH,
  MEET_UP,
  PAY_UPON_MEETUP,
  PICK_UP,
  TO_BUY,
} from "../../../../utils/consonants.js";
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
import { fetchUser } from "../../../../redux/user/userSlice.js";
import AddItemBadges from "../common/AddItemBadges.jsx";
import AddTerms from "../common/AddTerms.jsx";
import {
  blurField,
  updateField,
} from "../../../../redux/item-form/itemFormSlice.js";

function AddNewItem() {
  const itemDataState = useSelector((state) => state.itemForm);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedDuration, setSelectedDuration] = useState(null);
  const [showDurations, setShowDurations] = useState(null);
  const { user, loadingFetchUser, errorFetchUser } = useSelector(
    (state) => state.user
  );
  const { userId } = useSelector(selectStudentUser);
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

  const [category, setCategory] = useState("");
  const [itemType, setItemType] = useState("For Rent");

  const handleCategoryChange = (newCategory) => {
    setCategory(newCategory);
    console.log("Selected Category:", newCategory);
  };

  const handleItemTypeChange = (newItemType) => {
    setItemType(newItemType);
    console.log("Selected Item Type:", newItemType);
  };

  const handleSelectDeliveryMethod = (method) => {};

  useEffect(() => {
    if (userId) {
      dispatch(fetchUser(userId));
    }
  }, [userId, dispatch]);

  useEffect(() => {
    if (errorFetchUser) {
      dispatch(
        showNotification({
          type: "error",
          title: "Error",
          text: "User not found!",
        })
      );
    } else if (!loadingFetchUser && !user) {
      dispatch(
        showNotification({
          type: "error",
          title: "Not Found",
          text: "No user found with the given ID.",
        })
      );
    }

    if (errorFetchUser || (!loadingFetchUser && !user)) {
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
  }, [errorFetchUser, loadingFetchUser, user, dispatch]);

  useEffect(() => {
    if (redirecting) {
      const redirectTimer = setTimeout(() => {
        navigate(-1); // Redirect to previous page
      }, 6000); // Wait 6 seconds before redirect

      return () => clearTimeout(redirectTimer); // Clean up redirect timer
    }
  }, [redirecting, navigate]);

  if (loadingFetchUser || redirecting) {
    return <LoadingItemDetailSkeleton />;
  }

  return (
    <div className="container-content add-item-detail">
      <div className="add-item-container">
        <div className="imgs-container">
          <Tooltip
            title={`This item is ${
              itemDataState.itemType.value === FOR_RENT ? FOR_RENT : FOR_SALE
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
                itemDataState.itemType.value === FOR_RENT
                  ? forRentIcon
                  : forSaleIcon
              }
              alt={
                itemDataState.itemType.value === FOR_RENT ? FOR_RENT : FOR_SALE
              }
              className="item-type"
            />
          </Tooltip>
          <ImageSlider images={images} />
        </div>
        <div className="rental-details">
          <AddItemBadges
            values={{
              college: user?.student?.college,
              category: category,
              itemType: itemType,
            }}
            onCategoryChange={handleCategoryChange}
            onItemTypeChange={(newItemType) =>
              console.log("Item Type:", newItemType)
            }
          />

          <div className="field-container item-title">
            <div className="input-wrapper">
              <label>For rent </label>
              <input
                id="itemName"
                name="itemName"
                className="input"
                placeholder="Add item name"
                required
                type="text"
                value={itemDataState.itemName.value}
                onChange={(e) =>
                  dispatch(
                    updateField({ name: "itemName", value: e.target.value })
                  )
                }
                onBlur={(e) => {
                  dispatch(
                    blurField({ name: "itemName", value: e.target.value })
                  );
                }}
              />
            </div>
            {itemDataState.itemName.triggered &&
              itemDataState.itemName.hasError && (
                <div className="validation error">
                  <img
                    src={warningIcon}
                    className="icon"
                    alt="Error on last name"
                  />
                  <span className="text">{itemDataState.itemName.error}</span>
                </div>
              )}
          </div>
          <div className="field-container item-price">
            <div className="input-wrapper">
              <label className="price">₱ </label>
              <input
                id="price"
                name="price"
                className="input"
                placeholder="Add price"
                required
                type="text"
                value={itemDataState.price.value}
                onChange={(e) =>
                  dispatch(
                    onInputChange({ name: "price", value: e.target.value })
                  )
                }
                onBlur={(e) => {
                  dispatch(onBlur({ name: "price", value: e.target.value }));
                }}
              />
            </div>
            {itemDataState.price.triggered && itemDataState.price.hasError && (
              <div className="validation error">
                <img
                  src={warningIcon}
                  className="icon"
                  alt="Error on last name"
                />
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
              <button className="btn btn-rectangle primary" disabled>
                {itemDataState.itemType.value === FOR_RENT ? "Rent" : "Buy"}
              </button>
            </div>
          </Tooltip>
          <hr />
          <div className="rental-dates-durations">
            <div className="date-picker">
              <span>
                Pick a date to{" "}
                {itemDataState.itemType.value === FOR_RENT ? "rent" : "buy"}:
              </span>
              <DatePicker
                inline
                selected={selectedDate ? new Date(selectedDate) : null}
                onChange={(date) => {
                  // const rentalDate = rentalDates.find(
                  //   (r) =>
                  //     new Date(r.date).toDateString() === date.toDateString()
                  // );
                  // if (rentalDate) {
                  //   handleDateClick(rentalDate.id);
                  // } else {
                  //   setShowDurations(null);
                  //   setSelectedDate(date);
                  // }
                }}
                // highlightDates={availableDates}
                // dayClassName={(date) => {
                //   return availableDates.some(
                //     (d) => d.toDateString() === date.toDateString()
                //   )
                //     ? "bg-green"
                //     : "";
                // }}
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
                            // onChange={() => handleSelectDuration(duration)}
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
                      itemDataState.deliveryMethod.value === MEET_UP
                        ? "selected"
                        : ""
                    }`}
                    onClick={() =>
                      dispatch(
                        updateField({ name: "deliveryMethod", value: MEET_UP })
                      )
                    }
                  >
                    Meet up
                  </button>
                  <button
                    className={`value ${
                      itemDataState.deliveryMethod.value === PICK_UP
                        ? "selected"
                        : ""
                    }`}
                    onClick={() =>
                      dispatch(
                        updateField({ name: "deliveryMethod", value: PICK_UP })
                      )
                    }
                  >
                    Pick up
                  </button>
                </div>
              </Tooltip>
            </div>
          </div>

          <div className="group-container payment-method ">
            <label className="label">Payment Method</label>
            <div className="delivery-method">
              <Tooltip
                title="Owner did not set delivery method, you decide whether to meetup or pickup."
                placement="bottom"
              >
                <div className="action-btns">
                  <button
                    className={`value ${
                      itemDataState.paymentMethod.value === GCASH
                        ? "selected"
                        : ""
                    }`}
                    onClick={() =>
                      dispatch(
                        updateField({ name: "paymentMethod", value: GCASH })
                      )
                    }
                  >
                    Pay upon Meet up
                  </button>
                  <button
                    className={`value ${
                      itemDataState.paymentMethod.value === PAY_UPON_MEETUP
                        ? "selected"
                        : ""
                    }`}
                    onClick={() =>
                      dispatch(
                        updateField({
                          name: "paymentMethod",
                          value: PAY_UPON_MEETUP,
                        })
                      )
                    }
                  >
                    Gcash
                  </button>
                </div>
              </Tooltip>
            </div>
          </div>

          <div className="field-container item-condition">
            <div className="input-wrapper">
              <label className="label">Item Condition</label>
              <input
                id="itemCondition"
                name="itemCondition"
                className="input"
                placeholder="Add item condition"
                required
                type="text"
                value={itemDataState.itemCondition.value}
                onChange={(e) =>
                  dispatch(
                    updateField({
                      name: "itemCondition",
                      value: e.target.value,
                    })
                  )
                }
                onBlur={(e) =>
                  dispatch(
                    blurField({
                      name: "itemCondition",
                      value: e.target.value,
                    })
                  )
                }
              />
            </div>
            {itemDataState.itemCondition.triggered &&
              itemDataState.itemCondition.hasError && (
                <div className="validation error">
                  <img
                    src={warningIcon}
                    className="icon"
                    alt="Error on last name"
                  />
                  <span className="text">
                    {itemDataState.itemCondition.error}
                  </span>
                </div>
              )}
          </div>

          <AddTerms
            values={{
              lateCharges: itemDataState?.lateCharges?.value,
              securityDeposit: itemDataState?.securityDeposit?.value,
              repairReplacement: itemDataState?.repairReplacement?.value,
            }}
          />
        </div>
      </div>

      <UserToolbar user={user?.owner} />

      <AddItemDescAndSpecs
        specs={itemDataState?.specs?.value}
        desc={itemDataState?.desc?.value}
        tags={itemDataState?.tags?.value}
      />
    </div>
  );
}

export default AddNewItem;
