import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import DatePicker from "react-datepicker";
import Tooltip from "@mui/material/Tooltip";

// Components
import UserToolbar from "../common/UserToolbar";
import AddItemDescAndSpecs from "../common/AddItemDescAndSpecs";
import AddItemBadges from "../common/AddItemBadges";
import AddTerms from "../common/AddTerms";
import AddImage from "../common/AddImage";
import DateDurationPicker from "../new-post/DateDurationPicker";
import LoadingItemDetailSkeleton from "../../../../components/loading-skeleton/LoadingItemDetailSkeleton";

// Constants and Utils
import { formatTimeTo12Hour } from "../../../../utils/timeFormat";
import {
  FOR_RENT,
  PAY_UPON_MEETUP,
  GCASH,
  PICK_UP,
  MEET_UP,
} from "../../../../utils/consonants";

// Redux
import { selectStudentUser } from "../../../../redux/auth/studentAuthSlice";
import { showNotification } from "../../../../redux/alert-popup/alertPopupSlice";
import { fetchUser } from "../../../../redux/user/userSlice";
import {
  blurField,
  updateField,
} from "../../../../redux/item-form/itemFormSlice";

// Assets
import cartIcon from "../../../../assets/images/pdp/cart.svg";
import itemImage1 from "../../../../assets/images/item/item_1.jpg";
import itemImage2 from "../../../../assets/images/item/item_2.jpg";
import itemImage3 from "../../../../assets/images/item/item_3.jpg";
import itemImage4 from "../../../../assets/images/item/item_4.jpg";
import forRentIcon from "../../../../assets/images/card/rent.svg";
import forSaleIcon from "../../../../assets/images/card/buy.svg";
import warningIcon from "../../../../assets/images/input-icons/warning.svg";

// Styles
import "bootstrap/dist/css/bootstrap.min.css";
import "react-datepicker/dist/react-datepicker.css";
import "./addNewItemStyles.css";
import { toast } from "react-toastify";
import axios from "axios";
import { baseApi } from "../../../../App";
import { io } from "socket.io-client";

const UNAVAILABLE_DATES = [
  new Date(2024, 11, 25), // Christmas
  new Date(2025, 0, 1), // New Year's
];

const ValidationError = ({ message }) => (
  <div className="validation error">
    <img src={warningIcon} className="icon" alt="Error indicator" />
    <span className="text">{message}</span>
  </div>
);

const FormField = ({
  label,
  id,
  value,
  onChange,
  onBlur,
  error,
  triggered,
  placeholder,
}) => (
  <div className="field-container">
    <div className="input-wrapper">
      {label && <label>{label}</label>}
      <input
        id={id}
        name={id}
        className="input"
        placeholder={placeholder}
        required
        type="text"
        value={value}
        onChange={(e) => onChange(id, e.target.value)}
        onBlur={(e) => onBlur(id, e.target.value)}
      />
    </div>
    {triggered && error && <ValidationError message={error} />}
  </div>
);

const AddNewItem = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const itemDataState = useSelector((state) => state.itemForm);
  const { user, loadingFetchUser, errorFetchUser } = useSelector(
    (state) => state.user
  );
  const { userId } = useSelector(selectStudentUser);
  const socket = io("http://localhost:3001");

  const itemImages = [
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
  const [redirecting, setRedirecting] = useState(false);
  const [showDateDurationPicker, setShowDateDurationPicker] = useState(false);
  const [selectedDatesDurations, setSelectedDatesDurations] = useState([]);
  const [selectedDisplayDate, setSelectedDisplayDate] = useState(null);

  useEffect(() => {
    if (userId) {
      dispatch(fetchUser(userId));
    }
  }, [userId, dispatch]);

  useEffect(() => {
    if (errorFetchUser || (!loadingFetchUser && !user)) {
      handleError();
    }
  }, [errorFetchUser, loadingFetchUser, user]);

  const handleError = () => {
    const errorMessage = errorFetchUser
      ? "User not found!"
      : "No user found with the given ID.";
    dispatch(
      showNotification({
        type: "error",
        title: "Error",
        text: errorMessage,
      })
    );

    setRedirecting(true);
    setTimeout(() => {
      dispatch(showNotification({ type: "loading", title: "Redirecting" }));
      setTimeout(() => navigate(-1), 1000);
    }, 5000);
  };

  const handleFieldChange = (name, value) => {
    dispatch(updateField({ name, value }));

    dispatch(blurField({ name, value }));
  };

  const handleFieldBlur = (name, value) => {
    dispatch(blurField({ name, value }));
  };

  const getDurationsForDate = (date) => {
    if (!date) return [];
    const dateItem = selectedDatesDurations.find(
      (item) => item.date.toDateString() === date.toDateString()
    );
    return dateItem ? dateItem.timePeriods : [];
  };

  const renderDurations = () => {
    const durations = getDurationsForDate(selectedDisplayDate);

    if (!selectedDisplayDate) {
      return <p className="select-date-message">Please select a date first.</p>;
    }

    if (durations.length === 0) {
      return (
        <p className="no-duration-message">
          No available duration for this date.
        </p>
      );
    }

    return (
      <div className="duration-list">
        {durations.map((duration, index) => (
          <div key={index} className="duration-item">
            <input type="checkbox" id={`duration-${index}`} checked readOnly />
            {formatTimeTo12Hour(duration.startTime)} -{" "}
            {formatTimeTo12Hour(duration.endTime)}
          </div>
        ))}
      </div>
    );
  };

  if (loadingFetchUser || redirecting) {
    return <LoadingItemDetailSkeleton />;
  }

  const handleSubmit = async () => {
    try {
      // Construct payload
      const isForSale = true;
      const endpoint = isForSale
        ? `${baseApi}/item-for-sale/add`
        : `${baseApi}/listings/add`;

      const payload = {
        ...(!isForSale && {
          listing: {
            category: itemDataState.category.value,
            itemName: itemDataState.itemName.value,
            price: itemDataState.price.value,
            availableDates: itemDataState.availableDates.value,
            itemCondition: itemDataState.itemCondition.value,
            deliveryMethod: itemDataState.deliveryMethod.value,
            paymentMethod: itemDataState.paymentMethod.value,
            terms: {
              lateCharges: itemDataState.lateCharges.value,
              securityDeposit: itemDataState.securityDeposit.value,
              repairReplacement: itemDataState.repairReplacement.value,
            },
            images: itemDataState.images.value,
            desc: itemDataState.desc.value,
            tags: itemDataState.tags.value,
            specs: itemDataState.specs.value,
          },
        }),
        ...(isForSale && {
          item: {
            sellerId: userId,
            category: itemDataState.category.value,
            itemName: itemDataState.itemName.value,
            itemCondition: itemDataState.itemCondition.value,
            paymentMethod: itemDataState.paymentMethod.value,
            price: itemDataState.price.value,
            images: itemDataState.images.value,
            desc: itemDataState.desc.value,
            tags: itemDataState.tags.value,
            dates: itemDataState.availableDates.value
          },
        }),
      };

      console.log(itemDataState);

      // Make API request
      const response = await axios.post(endpoint, payload);

      console.log(response);

      // Emit socket event
      if (socket) {
        const notification = {
          title: isForSale ? "New Sale Item" : "New Rental Listing",
          owner: `${user?.fname} ${user?.lname}`,
          message: isForSale
            ? "listed an item for sale."
            : "added a new rental listing.",
          type: isForSale ? "new-item-for-sale" : "new-listing",
        };

        socket.emit("new-listing-notification", notification);
      }

      // Notify success
      toast.success(`${isForSale ? "Item" : "Listing"} created successfully!`, {
        position: "top-right",
        autoClose: 3000,
      });

      // Reset form if needed
      // dispatch(resetForm());
    } catch (error) {
      console.error("Error creating listing:", error);

      toast.error("Failed to create listing. Please try again.", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const handleSaveDatesDurations = (datesDurations) => {
    setSelectedDatesDurations(datesDurations);
    dispatch(updateField({ name: "availableDates", value: datesDurations })); // Dispatch the action to save the selected dates and durations
  };

  return (
    <div className="container-content add-item-detail">
      <div className="add-item-container">
        <div className="imgs-container">
          <Tooltip title={`This item is ${itemDataState.itemType.value}`}>
            <img
              src={
                itemDataState.itemType.value === FOR_RENT
                  ? forRentIcon
                  : forSaleIcon
              }
              alt={itemDataState.itemType.value}
              className="item-type"
            />
          </Tooltip>
          <AddImage images={itemImages} />
        </div>

        <div className="rental-details">
          <AddItemBadges
            values={{
              college: user?.student?.college,
              category,
              itemType,
            }}
            onCategoryChange={setCategory}
            onItemTypeChange={(newType) => setItemType(newType)}
          />

          <FormField
            label="For rent"
            id="itemName"
            value={itemDataState.itemName.value}
            onChange={handleFieldChange}
            onBlur={handleFieldBlur}
            error={itemDataState.itemName.error}
            triggered={itemDataState.itemName.triggered}
            placeholder="Add item name"
          />

          <FormField
            label={<span className="price">$</span>}
            id="price"
            value={itemDataState.price.value}
            onChange={handleFieldChange}
            onBlur={handleFieldBlur}
            error={itemDataState.price.error}
            triggered={itemDataState.price.triggered}
            placeholder="Add price"
            className="field-container item-price"
          />

          {/* Action Buttons */}
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

          <hr />

          {/* Date Duration Section */}
          <div className="rental-dates-durations">
            <DateDurationPicker
              show={showDateDurationPicker}
              onClose={() => setShowDateDurationPicker(false)}
              onSaveDatesDurations={handleSaveDatesDurations}
              unavailableDates={UNAVAILABLE_DATES}
            />

            <div className="date-picker">
              <button
                className="btn btn-rectangle primary"
                onClick={() => setShowDateDurationPicker(true)}
              >
                Add Dates and Durations
              </button>

              <DatePicker
                inline
                selected={selectedDisplayDate}
                onChange={setSelectedDisplayDate}
                highlightDates={selectedDatesDurations.map((item) => item.date)}
                excludeDates={UNAVAILABLE_DATES}
              />
            </div>

            <div className="duration-picker group-container">
              <strong>Selected Durations:</strong>
              {renderDurations()}
            </div>
          </div>

          {/* Delivery and Payment Methods */}
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
          <div className="group-container">
            <FormField
              label="Item Condition"
              id="itemCondition"
              value={itemDataState.itemCondition.value}
              onChange={handleFieldChange}
              onBlur={handleFieldBlur}
              error={itemDataState.itemCondition.error}
              triggered={itemDataState.itemCondition.triggered}
              placeholder="Add item condition"
            />
          </div>

          <div className="group-container terms">
            <AddTerms
              values={{
                lateCharges: itemDataState?.lateCharges?.value,
                securityDeposit: itemDataState?.securityDeposit?.value,
                repairReplacement: itemDataState?.repairReplacement?.value,
              }}
            />
          </div>
        </div>
      </div>

      <UserToolbar user={user?.owner} />

      <AddItemDescAndSpecs
        specs={itemDataState?.specs?.value}
        desc={itemDataState?.desc?.value}
        tags={itemDataState?.tags?.value}
      />

      <button className="btn btn-primary" onClick={() => handleSubmit()}>
        Submit
      </button>
    </div>
  );
};

export default AddNewItem;
