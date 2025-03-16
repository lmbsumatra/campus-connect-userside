import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import DatePicker from "react-datepicker";
import Tooltip from "@mui/material/Tooltip";
import { formatDateFromSelectDate } from "../../../../utils/dateFormat.js";

// Components
import UserToolbar from "../common/UserToolbar";
import AddItemDescAndSpecs from "../common/AddItemDescAndSpecs";
import AddItemBadges from "../common/AddItemBadges";
import AddImage from "../common/AddImage";
import DateDurationPicker from "../common/DateDurationPicker.jsx";
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
  updateRequestDates,
  updateField,
  validateInput,
  clearPostForm,
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
import { fetchUnavailableDates } from "../../../../redux/dates/unavaibleDatesSlice.js";

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
  const [itemType, setItemType] = useState("To Rent");
  const [redirecting, setRedirecting] = useState(false);
  const [showDateDurationPicker, setShowDateDurationPicker] = useState(false);
  const [selectedDatesDurations, setSelectedDatesDurations] = useState([]);
  const [selectedDisplayDate, setSelectedDisplayDate] = useState(null);
  const [removedImages, setRemovedImages] = useState([]);
  const [localImages, setLocalImages] = useState([]);
  const { loadingUnavailableDates, unavailableDates, errorUnavailableDates } =
    useSelector((state) => state.unavailableDates);

  const handleItemTypeChange = (newType) => {
    setItemType(newType);
  };

  useEffect(() => {
    if (userId) {
      dispatch(fetchUser(userId));
    }
  }, [userId, dispatch]);

  useEffect(() => {
    dispatch(fetchUnavailableDates());
    dispatch(clearPostForm());
  }, [dispatch]);

  const [formattedUnavailableDates, setFormattedUnavailableDates] = useState(
    []
  );

  useEffect(() => {
    if (unavailableDates && unavailableDates.length > 0) {
      setFormattedUnavailableDates(
        unavailableDates.map((item) => {
          return {
            date: new Date(item.date), // Convert string to Date object
            reason: item.description, // Keep the reason
          };
        })
      );
    }
  }, [unavailableDates]);

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
      (item) =>
        formatDateFromSelectDate(item.date) === formatDateFromSelectDate(date)
    );
    return dateItem ? dateItem.durations : [];
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
            {formatTimeTo12Hour(duration.timeFrom)} -{" "}
            {formatTimeTo12Hour(duration.timeTo)}
          </div>
        ))}
      </div>
    );
  };

  const handleSaveDatesDurations = (datesDurations) => {
    // Assuming datesDurations is an array
    const serializedDates = datesDurations.map((dateObj) => ({
      ...dateObj,
      date: formatDateFromSelectDate(dateObj.date),
    }));

    setSelectedDatesDurations(serializedDates);
    dispatch(updateRequestDates(serializedDates));
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

  const handleCategoryChange = (selectedCategory) => {
    setCategory(selectedCategory);
    dispatch(updateField({ name: "category", value: selectedCategory }));
    dispatch(blurField({ name: "category", value: selectedCategory }));
  };

  const handleImagesChange = ({ currentImages, removedImagesList }) => {
    setLocalImages(currentImages);
    setRemovedImages(removedImagesList);

    // Extract filenames
    const filenames = currentImages.map((image) => {
      if (image.file && image.file.name) {
        return image.file.name; // For files
      }
      // For blob URLs, extract a default or placeholder filename
      const blobFilename = image.preview || image;
      return (
        blobFilename.substring(blobFilename.lastIndexOf("/") + 1) || "blob-file"
      );
    });

    // Dispatch updates to Redux
    dispatch(updateField({ name: "images", value: filenames })); // Use filenames instead of full objects
    dispatch(blurField({ name: "images", value: filenames }));
  };

  const handleSubmit = async () => {
    let hasErrors = false;

    Object.keys(postDataState).forEach((key) => {
      if (key !== "isFormValid") {
        const field = postDataState[key];

        const { hasError, error } = validateInput(key, field.value);

        if (hasError) {
          hasErrors = true;
          dispatch(blurField({ name: key, value: "" }));
          dispatch(updateRequestDates(postDataState.requestDates.value));
        }
      }
    });

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

    try {
      const formData = new FormData();

      localImages
        .filter((image) => image.file instanceof File)
        .forEach((image) => {
          formData.append("upload_images", image.file);
        });

      const itemData = {
        userId: userId,
        category: postDataState.category.value,
        itemName: postDataState.itemName.value,
        desc: postDataState.desc.value,
        tags: postDataState.tags.value,
        dates: postDataState.requestDates.value,
        specs: postDataState.specs.value,
        post_type: itemType,
      };

      formData.append("post", JSON.stringify(itemData));

      console.log("FormData before submission:");
      formData.forEach((value, key) => {
        console.log(key, value);
      });

      const endpoint = itemType === TO_RENT ? "/posts/create" : "/posts/create";
      const notificationType =
        itemType === TO_RENT ? "new-post-to-rent" : "new-post-to-buy";

      ShowAlert(dispatch, "loading", "Creating post", "Please wait...");

      const response = await axios.post(`${baseApi}${endpoint}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      /* if (socket) {
        socket.emit("new-listing-notification", {
          title: `${itemType === TO_RENT ? "New Post to Rent" : "New Post to Buy"} Item`,
          owner: `${user?.first_name} ${user?.last_name}`,
          message: `posted an item to ${itemType === TO_RENT ? "rent" : "buy"}.`,
          type: notificationType,
        });
      }      
  */

      await ShowAlert(dispatch, "success", "Success", `Post added!`, {
        text: "Ok",
      });

      ShowAlert(dispatch, "loading", "Redirecting");
      // navigate(`/profile/my-posts`, { state: { redirecting: true } });
    } catch (error) {
      console.error("Error Response:", error.response?.data);
      console.error("Error Object:", error);

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
              src={itemType === "To Rent" ? forRentIcon : forSaleIcon}
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
            images={localImages}
            onChange={handleImagesChange}
            removedImages={removedImages}
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
            isPost={true}
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
              unavailableDates={formattedUnavailableDates}
              minDate={new Date()} // Prevents selecting past dates
              maxDate={
                unavailableDates?.endSemesterDates?.length > 0
                  ? new Date(unavailableDates?.endSemesterDates[0]?.date)
                  : null
              }
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
                selected={null}
                onChange={setSelectedDisplayDate}
                highlightDates={selectedDatesDurations.map(
                  (item) => new Date(item.date)
                )}
                excludeDates={formattedUnavailableDates.map(
                  (item) => new Date(item.date)
                )}
                minDate={new Date()} // Prevents selecting past dates
                maxDate={
                  unavailableDates?.endSemesterDates?.length > 0
                    ? new Date(unavailableDates?.endSemesterDates[0]?.date)
                    : null
                }
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
