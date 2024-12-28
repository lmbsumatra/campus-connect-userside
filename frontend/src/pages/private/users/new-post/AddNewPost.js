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
import DateDurationPicker from "../new-post/DateDurationPicker";
import LoadingItemDetailSkeleton from "../../../../components/loading-skeleton/LoadingItemDetailSkeleton";
import ShowAlert from "../../../../utils/ShowAlert.js";

// Constants and Utils
import { formatTimeTo12Hour } from "../../../../utils/timeFormat";
import { FOR_RENT, TO_RENT } from "../../../../utils/consonants";

// Redux
import { selectStudentUser } from "../../../../redux/auth/studentAuthSlice";
import { fetchUser } from "../../../../redux/user/userSlice";
import {
  blurField,
  updateAvailableDates,
  updateField,
  validateInput,
} from "../../../../redux/post-form/postFormSlice";

// Assets
import cartIcon from "../../../../assets/images/pdp/cart.svg";
import forRentIcon from "../../../../assets/images/card/rent.svg";
import forSaleIcon from "../../../../assets/images/card/buy.svg";
import warningIcon from "../../../../assets/images/input-icons/warning.svg";

// Styles
import "bootstrap/dist/css/bootstrap.min.css";
import "react-datepicker/dist/react-datepicker.css";
import "./addNewPostStyles.css";
import { ToastContainer } from "react-toastify";
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
      {label && <label className="label">{label}</label>}
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
  const postDataState = useSelector((state) => state.postForm);
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

  useEffect(() => {
    if (!userId) {
      ShowAlert(dispatch, "warning", "Warning", "You must login first!");
    }

    if (!userId) {
      setRedirecting(true); // Start the redirect process
      const timer = setTimeout(() => {
        ShowAlert(dispatch, "loading", "Redirecting");
      }, 5000); // Show redirect notification after 5 seconds

      return () => clearTimeout(timer); // Clean up the timeout if dependencies change
    }
  }, [userId, dispatch]);

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

  const handleSaveDatesDurations = (datesDurations) => {
    setSelectedDatesDurations(datesDurations);
    dispatch(updateField({ name: "availableDates", value: datesDurations }));
  };

  const handleCategoryChange = (selectedCategory) => {
    setCategory(selectedCategory);
    dispatch(updateField({ name: "category", value: selectedCategory }));
    dispatch(blurField({ name: "category", value: selectedCategory }));
  };

  const handleImagesChange = (newImages) => {
    dispatch(updateField({ name: "images", value: newImages }));
    dispatch(blurField({ name: "images", value: newImages }));
  };

  const handleSubmit = async () => {
    // Validate all fields and trigger errors if needed
    let hasErrors = false;
    console.log(postDataState);

    Object.keys(postDataState).forEach((key) => {
      if (key !== "isFormValid") {
        const field = postDataState[key];
        console.log("Validating field:", key, "Value:", field.value); // Add this
        const { hasError, error } = validateInput(key, field.value);

        if (hasError) {
          hasErrors = true;
          dispatch(
            blurField({ name: key, value: "" }) // This updates the Redux state to include the error
          );
          dispatch(updateAvailableDates());
        }
      }
    });

    console.log(postDataState);

    // Prevent submission if there are errors
    if (hasErrors) {
      ShowAlert(
        dispatch,
        "error",
        "Error",
        "Please correct the highlighted errors."
      );
      const firstError = document.querySelector(".validation.error");
      firstError?.scrollIntoView({ behavior: "smooth" });
      return;
    }

    console.log(postDataState);

    try {
      const formData = new FormData();

      // Append images to form data
      postDataState.images.value.forEach((image) =>
        formData.append("item_images", image)
      );

      // Prepare item data
      const itemData = {
        [itemType === TO_RENT ? "renterId" : "buyerId"]: userId,
        category: postDataState.category.value,
        itemName: postDataState.itemName.value,
        desc: postDataState.desc.value,
        tags: postDataState.tags.value,
        dates: postDataState.availableDates.value,
        specs: postDataState.specs.value,
      };

      formData.append("item", JSON.stringify(itemData));

      const endpoint =
        itemType === TO_RENT ? "/posts/create" : "/item-for-sale/add";
      const notificationType =
        itemType === TO_RENT ? "new-post-to-rent" : "new-post-to-buy";

      // Submit the item data
      const response = await axios.post(`${baseApi}${endpoint}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Send socket notification
      if (socket) {
        socket.emit("new-listing-notification", {
          title: `${
            itemType === TO_RENT ? "New Post to Rent" : "New Post to Buy"
          } Item`,
          owner: `${user?.fname} ${user?.lname}`,
          message: `posted an item to ${
            itemType === TO_RENT ? "rent" : "buy"
          }.`,
          type: notificationType,
        });
      }

      ShowAlert(dispatch, "loading", "Redirecting");
      navigate(`/items/${response.data.item.id}`);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Failed to create listing. Please try again.";
      ShowAlert(dispatch, "error", "Error", errorMessage);
      const firstError = document.querySelector(".validation.error");
      firstError?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="container-content add-post-detail">
      <ToastContainer />
      <div className="add-post-container">
        <div className="imgs-container">
          <Tooltip title={`This item is ${itemType}`}>
            <img
              src={itemType === FOR_RENT ? forRentIcon : forSaleIcon}
              alt={itemType}
              className="item-type"
            />
          </Tooltip>
          {postDataState.images.triggered && postDataState.images.hasError && (
            <div className="validation error d-block">
              <img src={warningIcon} className="icon" alt="Error indicator" />
              <span className="text">{postDataState.images.error}</span>
            </div>
          )}
          <AddImage
            images={postDataState.images.value}
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

          {postDataState.category.triggered &&
            postDataState.category.hasError && (
              <div className="validation error">
                <img src={warningIcon} className="icon" alt="Error indicator" />
                <span className="text">{postDataState.category.error}</span>
              </div>
            )}

          <FormField
            label="For rent"
            id="itemName"
            value={postDataState.itemName.value}
            onChange={handleFieldChange}
            onBlur={handleFieldBlur}
            error={postDataState.itemName.error}
            triggered={postDataState.itemName.triggered}
            placeholder="Add item name"
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
              {postDataState.itemType.value === FOR_RENT ? "Rent" : "Buy"}
            </button>
          </div>

          <hr />
          {postDataState.requestDates.triggered &&
            postDataState.requestDates.hasError && (
              <div className="validation error d-block">
                <img src={warningIcon} className="icon" alt="Error indicator" />
                <span className="text">
                  {" "}
                  {postDataState.requestDates.error}
                </span>
              </div>
            )}
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
      <UserToolbar user={user} />

      <AddItemDescAndSpecs
        specs={postDataState.specs.value}
        desc={postDataState.desc.value}
        tags={postDataState.tags.value}
        onSpecsChange={(newSpecs) =>
          dispatch(updateField({ name: "specs", value: newSpecs }))
        }
        onDescChange={(newDesc) => {
          dispatch(updateField({ name: "desc", value: newDesc }));
          dispatch(blurField({ name: "desc", value: newDesc }));
        }}
        onTagsChange={(newTags) => {
          dispatch(updateField({ name: "tags", value: newTags }));
          dispatch(blurField({ name: "tags", value: newTags }));
        }}
        errors={{
          specs: postDataState.specs.error,
          desc: postDataState.desc.error,
          tags: postDataState.tags.error,
        }}
        triggered={{
          specs: postDataState.specs.triggered,
          desc: postDataState.desc.triggered,
          tags: postDataState.tags.triggered,
        }}
      />
      <button className="btn btn-primary" onClick={() => handleSubmit()}>
        Submit
      </button>
    </div>
  );
};

export default AddNewPost;
