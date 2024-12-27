import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import DatePicker from "react-datepicker";
import Tooltip from "@mui/material/Tooltip";

// Components
import UserToolbar from "../common/UserToolbar";
import AddItemDescAndSpecs from "../common/AddItemDescAndSpecs";
import AddItemBadges from "../common/AddItemBadges";
import AddImage from "../common/AddImage";
import DateDurationPicker from "./DateDurationPicker";
import LoadingItemDetailSkeleton from "../../../../components/loading-skeleton/LoadingItemDetailSkeleton";

// Constants and Utils
import { formatTimeTo12Hour } from "../../../../utils/timeFormat";
import {
  FOR_RENT,
  TO_RENT,
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

const AddNewPost = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const itemDataState = useSelector((state) => state.itemForm);
  const { user, loadingFetchUser, errorFetchUser } = useSelector(
    (state) => state.user
  );
  const { userId } = useSelector(selectStudentUser);
  const socket = io("http://localhost:3001", {
    transports: ["polling", "websocket"],
  });

  const [category, setCategory] = useState("");
  const [itemType, setItemType] = useState("For Rent");
  const [redirecting, setRedirecting] = useState(false);
  const [showDateDurationPicker, setShowDateDurationPicker] = useState(false);
  const [selectedDatesDurations, setSelectedDatesDurations] = useState([]);
  const [selectedDisplayDate, setSelectedDisplayDate] = useState(null);

  const handleItemTypeChange = (newType) => {
    setItemType(newType);
    console.log(itemType);
  };

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
    console.log(itemDataState);
    try {
      const formData = new FormData();

      // Append images to form data
      itemDataState.images.value.forEach((image) =>
        formData.append("item_images", image)
      );

      // Prepare item data
      const itemData = {
        [itemType == TO_RENT ? "renterId" : "buyerId"]: userId,
        category: itemDataState.category.value,
        itemName: itemDataState.itemName.value,
        price: itemDataState.price.value,
        desc: itemDataState.desc.value,
        tags: itemDataState.tags.value,
        dates: itemDataState.availableDates.value,
        specs: itemDataState.specs.value,
      };

      formData.append(
        itemType == FOR_RENT ? "to rent" : "to buy",
        JSON.stringify(itemData)
      );

      const endpoint =
        itemType == FOR_RENT ? "/listings/add" : "/item-for-sale/add";
      const notificationType =
        itemType == FOR_RENT ? "new-item-for-rent" : "new-item-for-sale";

      // Submit the item data
      const response = await axios.post(`${baseApi}${endpoint}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Send socket notification
      if (socket) {
        socket.emit("new-listing-notification", {
          title: `${itemType == FOR_RENT ? "New Rental" : "New Sale"} Item`,
          owner: `${user?.fname} ${user?.lname}`,
          message: `listed an item for ${
            itemType == FOR_RENT ? "rent" : "sale"
          }.`,
          type: notificationType,
        });
      }

      // Success message
      toast.success("Item created successfully!", {
        position: "top-right",
        autoClose: 3000,
      });
      navigate(`/items/${response.data.item.id}`);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Failed to create listing. Please try again.";
      toast.error(errorMessage, { position: "top-right", autoClose: 3000 });

      // Scroll to first error if validation error
      const firstError = document.querySelector(".validation.error");
      firstError?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleSaveDatesDurations = (datesDurations) => {
    setSelectedDatesDurations(datesDurations);
    dispatch(updateField({ name: "availableDates", value: datesDurations })); // Dispatch the action to save the selected dates and durations
  };

  const handleCategoryChange = (selectedCategory) => {
    dispatch(updateField({ name: "category", value: selectedCategory }));
    dispatch(blurField({ name: "category", value: selectedCategory }));
  };

  const handleImagesChange = (newImages) => {
    dispatch(updateField({ name: "images", value: newImages }));
    dispatch(blurField({ name: "images", value: newImages }));
  };

  return (
    <div className="container-content add-item-detail">
      <div className="add-item-container">
        <div className="imgs-container">
          <Tooltip title={`This item is ${itemType}`}>
            <img
              src={itemType === FOR_RENT ? forRentIcon : forSaleIcon}
              alt={itemType}
              className="item-type"
            />
          </Tooltip>
          <AddImage
            images={itemDataState.images.value}
            onChange={handleImagesChange}
          />
        </div>

        <div className="rental-details">
          <AddItemBadges
            values={{
              college: user?.student?.college,
              category,
              itemType,
            }}
            onItemTypeChange={handleItemTypeChange}
            onCategoryChange={handleCategoryChange}
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

export default AddNewPost;
