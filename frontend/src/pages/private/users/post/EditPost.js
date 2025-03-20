import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import DatePicker from "react-datepicker";
import Tooltip from "@mui/material/Tooltip";
import { formatDateFromSelectDate } from "../../../../utils/dateFormat.js";
import UserToolbar from "../common/UserToolbar.jsx";
import AddItemDescAndSpecs from "../common/AddItemDescAndSpecs.jsx";
import AddItemBadges from "../common/AddItemBadges.jsx";
import AddImage from "../common/AddImage.jsx";
import DateDurationPicker from "../common/DateDurationPicker.jsx";
import LoadingItemDetailSkeleton from "../../../../components/loading-skeleton/LoadingItemDetailSkeleton.js";
import ShowAlert from "../../../../utils/ShowAlert.js";
import { formatTimeTo12Hour } from "../../../../utils/timeFormat.js";
import { FOR_SALE, getStatusClass, TO_RENT } from "../../../../utils/consonants.js";
import { selectStudentUser } from "../../../../redux/auth/studentAuthSlice.js";
import { showNotification } from "../../../../redux/alert-popup/alertPopupSlice.js";
import { fetchUser } from "../../../../redux/user/userSlice.js";

import cartIcon from "../../../../assets/images/pdp/cart.svg";
import forRentIcon from "../../../../assets/images/card/rent.svg";
import forSaleIcon from "../../../../assets/images/card/buy.svg";
import warningIcon from "../../../../assets/images/input-icons/warning.svg";
import "bootstrap/dist/css/bootstrap.min.css";
import "react-datepicker/dist/react-datepicker.css";
import { toast, ToastContainer } from "react-toastify";
import axios from "axios";
import { baseApi } from "../../../../App.js";
import { io } from "socket.io-client";
import BreadCrumb from "../../../../components/breadcrumb/BreadCrumb.jsx";
import { fetchListingById } from "../../../../redux/listing/listingByIdSlice.js";
import ComparisonView from "../item/ComparisonView.jsx";
import { Modal } from "react-bootstrap";
import {
  editItemBreadcrumbs,
  editPostBreadcrumbs,
} from "../../../../utils/Breadcrumbs.js";
import { fetchItemForSaleById } from "../../../../redux/item-for-sale/itemForSaleByIdSlice.js";
import { fetchUnavailableDates } from "../../../../redux/dates/unavaibleDatesSlice.js";
import "./addNewPostStyles.css";
import { fetchApprovedPostById } from "../../../../redux/post/approvedPostByIdSlice.js";
import { fetchPostById } from "../../../../redux/post/postByIdSlice.js";
import {
  populatePostData,
  blurField,
  clearItemForm,
  // generateSampleData,
  updateAvailableDates,
  updateField,
  validateInput,
} from "../../../../redux/post-form/postFormSlice.js";

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
  type = "text",
  options = [],
}) => (
  <div className="field-container">
    <div className="input-wrapper">
      {label && <label className="label">{label}</label>}

      {type === "select" ? (
        <select
          id={id}
          name={id}
          className="input"
          value={value}
          required
          onChange={(e) => onChange(id, e.target.value)}
          onBlur={(e) => onBlur(id, e.target.value)}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={id}
          name={id}
          className="input"
          placeholder={placeholder}
          required
          type={type}
          value={value}
          onChange={(e) => onChange(id, e.target.value)}
          onBlur={(e) => onBlur(id, e.target.value)}
        />
      )}
    </div>
    {triggered && error && <ValidationError message={error} />}
  </div>
);

const EditPost = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const postDataState = useSelector((state) => state.postForm);
  const { user, loadingFetchUser } = useSelector((state) => state.user);
  const { userId, role } = useSelector(selectStudentUser);
  const location = useLocation();
  const { id } = useParams();
  const [itemType, setItemType] = useState("");

  const socket = io("http://localhost:3001", {
    transports: ["polling", "websocket"],
  });
  const [category, setCategory] = useState("");
  const [showDateDurationPicker, setShowDateDurationPicker] = useState(false);
  const [selectedDatesDurations, setSelectedDatesDurations] = useState([]);
  const [selectedDisplayDate, setSelectedDisplayDate] = useState(null);
  const [localImages, setLocalImages] = useState([]);
  const [removedImages, setRemovedImages] = useState([]);
  const [originalData, setOriginalData] = useState(null);
  const [showComparison, setShowComparison] = useState(false);
  const [unavailableDates, setUnavailableDates] = useState([]);
  const [removedDates, setRemovedDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [redirecting, setRedirecting] = useState(false);
  const [error, setError] = useState(null);

  const [postData, setPostData] = useState(null);

  const { postById, loadingPostById, errorPostById } = useSelector(
    (state) => state.postById
  );

  // Fetch unavailable dates
  useEffect(() => {
    dispatch(fetchUnavailableDates());
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

  // Fetch post data by ID
  useEffect(() => {
    if (id) {
      dispatch(fetchPostById({ userId, postId: id }));
    }
  }, [dispatch, userId, id]);

  // Handle post data loading state and errors
  useEffect(() => {
    setLoading(loadingPostById);
    setError(errorPostById);

    // When post data is loaded and not in loading state
    if (!loadingPostById && postById && !errorPostById) {
      setPostData(postById);
    }
  }, [postById, loadingPostById, errorPostById]);

  // Populate form with post data once it's available
  useEffect(() => {
    if (!loading && postData) {
      const initialData = {
        ...postData,
        images: postData.images,
        requestDates: postData.requestDates,
      };
      setOriginalData(initialData);
      dispatch(populatePostData(postData));

      // Set itemType from the post data
      setItemType(postData.itemType);

      // Set category from the post data
      if (postData.category) {
        setCategory(postData.category);
      }

      const newSelectedDatesDurations = [];
      const unavailableDatesArray = [];

      if (postData.requestDates && Array.isArray(postData.requestDates)) {
        postData.requestDates.forEach((dateItem) => {
          if (dateItem.date) {
            // Filter dates where the status is not "available"
            const isAvailable = dateItem.status === "available";

            // If not available, add it to the unavailableDatesArray array
            if (!isAvailable) {
              unavailableDatesArray.push(new Date(dateItem.date));
            }

            // Add selected dates and durations to the newSelectedDatesDurations
            if (isAvailable) {
              newSelectedDatesDurations.push({
                date: new Date(dateItem.date),
                durations: dateItem.durations.map((duration) => ({
                  timeFrom: duration.timeFrom,
                  timeTo: duration.timeTo,
                })),
              });
            }
          }
        });

        // Set the state for both selectedDatesDurations and unavailableDates
        setSelectedDatesDurations(newSelectedDatesDurations);
        setUnavailableDates(unavailableDatesArray);
      }

      // Set local images from post data
      // Handle images properly
      let processedImages = [];

      if (postData.images) {
        // Check if images is a string that needs parsing
        if (typeof postData.images === "string") {
          try {
            // First try direct parsing
            processedImages = JSON.parse(postData.images);
          } catch (e) {
            // If that fails, it might be a double-stringified JSON
            try {
              // Remove the outer quotes and unescape the inner quotes
              const cleanString = postData.images
                .replace(/^"(.*)"$/, "$1")
                .replace(/\\/g, "");
              processedImages = JSON.parse(cleanString);
            } catch (innerError) {
              // If both parsing attempts fail, log the error and use as is
              console.error("Error parsing images:", innerError);
              processedImages = postData.images;
            }
          }
        } else if (Array.isArray(postData.images)) {
          // If it's already an array, use it directly
          processedImages = postData.images;
        }
      }

      // Set local images with the processed data
      setLocalImages(processedImages);
    }
  }, [loading, postData, dispatch]);

  // Update category if changed in the form state
  useEffect(() => {
    if (postDataState.category && postDataState.category.value !== category) {
      setCategory(postDataState.category.value);
    }
  }, [postDataState.category?.value, category]);

  // Update itemType if changed in the form state
  useEffect(() => {
    if (postDataState.itemType && postDataState.itemType.value !== itemType) {
      setItemType(postDataState.itemType.value);
    }
  }, [postDataState.itemType?.value, itemType]);

  // Set local images from postDataState when available
  useEffect(() => {
    if (postDataState.images?.value && localImages.length === 0) {
      setLocalImages(postDataState.images.value);
    }
  }, [postDataState.images?.value, localImages.length]);

  // Fetch user data
  useEffect(() => {
    if (userId) {
      dispatch(fetchUser(userId));
    }
  }, [userId, dispatch]);

  // Handle errors and redirect if needed
  useEffect(() => {
    const handleError = async () => {
      if (!loading && error) {
        await ShowAlert(dispatch, "error", "Error", "Item not found!", {
          text: "Ok",
        });
        setRedirecting(true);

        ShowAlert(dispatch, "loading", "Redirecting");

        setTimeout(() => {
          navigate("/profile", { state: { redirecting: true } });
        }, 3000);
      }
    };

    handleError();
  }, [loading, error, dispatch, navigate]);

  if (
    loading ||
    !postData ||
    error ||
    loadingFetchUser ||
    (!loading && error)
  ) {
    return <LoadingItemDetailSkeleton />;
  }

  const handleImagesChange = ({ currentImages, removedImagesList }) => {
    setLocalImages(currentImages);
    setRemovedImages(removedImagesList);

    // If you're only supposed to have 5 images max, check here
    if (currentImages.length > 5) {
      ShowAlert(dispatch, "error", "Error", "Maximum of 5 images only.");
      return; // Exit early if too many images
    }

    // Extract filenames safely
    const filenames = currentImages.map((image) => {
      // Handle File objects
      if (image.file && image.file.name) {
        return image.file.name;
      }
      // Handle string URLs
      if (typeof image === "string") {
        return image.substring(image.lastIndexOf("/") + 1) || "image.jpg";
      }
      // Handle objects with preview property
      if (image.preview && typeof image.preview === "string") {
        return (
          image.preview.substring(image.preview.lastIndexOf("/") + 1) ||
          "preview.jpg"
        );
      }
      // Fallback
      return "image.jpg";
    });

    // Now dispatch the properly formatted filenames
    dispatch(updateField({ name: "images", value: filenames }));
    dispatch(blurField({ name: "images", value: filenames }));
  };

  // const handleGenerateData = () => {
  //   dispatch(generateSampleData());
  // };

  const handleItemTypeChange = (newType) => {
    setItemType(newType);
    dispatch(updateField({ name: "itemType", value: newType }));
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

  const handleSaveDatesDurations = (datesDurations, removed) => {
    // Format the datesDurations as required
    const serializedDates = datesDurations.map((dateObj) => ({
      date: formatDateFromSelectDate(dateObj.date),
      durations: dateObj.durations,
      status: "available",
    }));

    // Format the removed dates to 'yy-mm-dd'
    const formattedRemovedDates = removed.map((removedDate) => {
      return formatDateFromSelectDate(removedDate.date);
    });

    // Set the formatted removed dates
    setRemovedDates(formattedRemovedDates);

    // Set the selected dates and durations
    setSelectedDatesDurations(datesDurations);

    // Update the available dates in the form state
    dispatch(updateAvailableDates(serializedDates));
  };

  const handleCategoryChange = (selectedCategory) => {
    setCategory(selectedCategory);
    dispatch(updateField({ name: "category", value: selectedCategory }));
    dispatch(blurField({ name: "category", value: selectedCategory }));
  };

  const handleSubmit = async () => {
    try {
      // Check if postDataState is defined
      if (!postDataState) {
        console.error("postDataState is not defined");
        ShowAlert(
          dispatch,
          "error",
          "Error",
          "Form data is not ready. Please try again."
        );
        return;
      }

      // Log the state for debugging
      // console.log("Current postDataState:", postDataState);
      // console.log("Current postData:", postData);

      let hasErrors = false;
      const errors = {};

      // Validate all fields
      Object.keys(postDataState).forEach((key) => {
        if (key !== "isFormValid") {
          // Skip rental-specific fields for sale items
          if (
            postData.itemType === FOR_SALE &&
            ["lateCharges", "repairReplacement", "securityDeposit"].includes(
              key
            )
          ) {
            return;
          }

          const field = postDataState[key];
          // Add a check to ensure field exists before accessing its value
          if (field && field.value !== undefined) {
            const { hasError, error } = validateInput(key, field.value);

            if (hasError) {
              hasErrors = true;
              errors[key] = error;
              dispatch(
                blurField({
                  name: key,
                  value: field.value,
                  itemType: postData.itemType,
                })
              );

              if (key === "requestDates") {
                dispatch(updateAvailableDates(field.value));
              }
            }
          } else {
            // Handle the case where field is undefined or doesn't have a value property
            console.warn(`Field ${key} is undefined or missing value property`);
            // Optionally set a default error for this field
            hasErrors = true;
            errors[key] = `Field ${key} is required`;
          }
        }
      });

      if (hasErrors) {
        ShowAlert(
          dispatch,
          "error",
          "Validation Error",
          "Please correct the highlighted errors."
        );
        const firstError = document.querySelector(".validation.error");
        firstError?.scrollIntoView({ behavior: "smooth" });
        return;
      }

      // Validate images
      if (!localImages || !localImages.length) {
        ShowAlert(
          dispatch,
          "error",
          "Image Required",
          "Please upload at least one image"
        );
        return;
      }

      // Prepare form data for submission
      const formData = new FormData();

      // Add new images to upload
      if (localImages && Array.isArray(localImages)) {
        localImages
          .filter((image) => image.file instanceof File)
          .forEach((image) => formData.append("upload_images", image.file));
      }

      // Add removed images to the form data
      if (removedImages && Array.isArray(removedImages)) {
        removedImages.forEach((image) => {
          formData.append("remove_images", image);
        });
      }

      // Prepare the post data object with optional chaining to prevent errors
      const postDataToSubmit = {
        itemId: id,
        userId: userId,
        category: postDataState.category?.value || "",
        itemName: postDataState.itemName?.value || "",
        desc: postDataState.desc?.value || "",
        tags: postDataState.tags?.value || [],
        dates: postDataState.requestDates?.value || [],
        toRemoveDates: removedDates || [],
        specs: postDataState.specs?.value || {},
        itemType: postData?.itemType || "FOR_SALE", // Include itemType in the submission with default
      };

      // Add rental-specific fields if applicable
      if (postData?.itemType === TO_RENT) {
        postDataToSubmit.lateCharges = postDataState.lateCharges?.value || 0;
        postDataToSubmit.securityDeposit =
          postDataState.securityDeposit?.value || 0;
        postDataToSubmit.repairReplacement =
          postDataState.repairReplacement?.value || "";
      }

      formData.append("item", JSON.stringify(postDataToSubmit));

      // Determine the correct endpoint based on item type
      const endpoint = `http://localhost:3001/posts/users/19/update/46`;

      // console.log("Submitting to endpoint:", endpoint);

      // Debug the form data being sent
      // console.log("Form data being sent:", {
      //   url: endpoint,
      //   formDataEntries: [...formData.entries()].map((entry) => ({
      //     key: entry[0],
      //     value:
      //       entry[0] === "To Rent" || entry[0] === "To Buy"
      //         ? JSON.parse(entry[1])
      //         : entry[1] instanceof File
      //         ? `File: ${entry[1].name}`
      //         : entry[1],
      //   })),
      // });

      // Show loading notification
      ShowAlert(dispatch, "loading", "Submitting changes", "Please wait...");

      // Make the API request with a timeout
      const response = await axios.patch(endpoint, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 30000, // 30 seconds timeout
      });

      // console.log("API response:", response);

      // Send notification if successful
      if (socket) {
        const notification = {
          title: `Updated post!`,
          owner: {
            name: user?.user?.fname + " " + user?.user?.lname || "User",
          },
          message: "has updated their post.",
          type: "update-post-notification",
        };
        socket.emit(notification.type, notification);
      }

      // Show success notification
      ShowAlert(
        dispatch,
        "success",
        "Success",
        `Looking for post updated successfully!`
      );

      // Navigate to the item detail page
      // setTimeout(() => {
      //   navigate(`/posts/46`);
      // }, 2000);
    } catch (error) {
      // Log detailed error information
      console.error("Submission error:", error);
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        response: error.response?.data,
      });

      ShowAlert(dispatch, "error", "Error", "Request failed or timed out.");

      const errorMessage =
        error.response?.data?.message || "Failed to update. Please try again.";
      ShowAlert(dispatch, "error", "Error", errorMessage);
    } finally {
      // Reset any loading state if needed
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  return (
    <div className="container-content add-item-detail">
      <BreadCrumb breadcrumbs={editPostBreadcrumbs({ itemType })} />
      {postData.statusMessage && (
        <div className={`alert py-2 ${getStatusClass(postData.status)}`}>
          {postData.status}
          {": "}
          {postData.statusMessage}
        </div>
      )}
      {/* <button onClick={handleGenerateData}>Generate Sample Data</button> */}
      <div className="add-item-container">
        <div className="imgs-container">
          <Tooltip title={`This item is ${postData.itemType}`}>
            <img
              src={postData.itemType === TO_RENT ? forRentIcon : forSaleIcon}
              alt={postData.itemType}
              className="item-type"
            />
          </Tooltip>
          {postDataState.images?.triggered &&
            postDataState.images?.hasError && (
              <ValidationError message={postDataState.images.error} />
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
              itemType: postData.itemType,
            }}
            isEditPage={true}
            onItemTypeChange={handleItemTypeChange}
            onCategoryChange={handleCategoryChange}
          />
          {postDataState.category?.triggered &&
            postDataState.category?.hasError && (
              <div className="validation error">
                <img src={warningIcon} className="icon" alt="Error indicator" />
                <span className="text">{postDataState.category.error}</span>
              </div>
            )}

          <FormField
            label={postData.itemType === TO_RENT ? "To Rent" : "To Buy"}
            id="itemName"
            value={postDataState.itemName?.value || ""}
            onChange={handleFieldChange}
            onBlur={handleFieldBlur}
            error={postDataState.itemName?.error}
            triggered={postDataState.itemName?.triggered}
            placeholder="Add post item name"
          />

          {/* Action Buttons */}
          <Tooltip
            title="Buttons are disabled for preview purposes."
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
              <button className="btn btn-icon primary" disabled>
                <img src={cartIcon} alt="Add to cart" />
              </button>
              <button className="btn btn-rectangle secondary" disabled>
                Message
              </button>
              <button className="btn btn-rectangle primary" disabled>
                Offer
              </button>
            </div>
          </Tooltip>

          <hr />

          {postDataState.requestDates?.triggered &&
            postDataState.requestDates?.hasError && (
              <div className="validation error d-block">
                <img src={warningIcon} className="icon" alt="Error indicator" />
                <span className="text">{postDataState.requestDates.error}</span>
              </div>
            )}

          {/* Date Duration Section */}
          <div className="rental-dates-durations">
            <DateDurationPicker
              show={showDateDurationPicker}
              onClose={() => setShowDateDurationPicker(false)}
              onSaveDatesDurations={handleSaveDatesDurations}
              unavailableDates={[
                ...formattedUnavailableDates, // Add the hardcoded unavailable dates
                ...formattedUnavailableDates.map((item) => new Date(item.date)), // Add dynamically determined unavailable dates
              ]}
              selectedDatesDurations={selectedDatesDurations}
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
                highlightDates={selectedDatesDurations.map(
                  (item) => new Date(item.date)
                )}
                excludeDates={formattedUnavailableDates.map(
                  (item) => new Date(item.date)
                )}
                dayClassName={(date) => {
                  const dateWithoutTime = new Date(
                    date.getFullYear(),
                    date.getMonth(),
                    date.getDate()
                  ); // Normalize to date without time
                  const unavailableDateWithoutTime = unavailableDates.map(
                    (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate()) // Normalize to date without time
                  );

                  if (
                    unavailableDateWithoutTime.some(
                      (d) => d.getTime() === dateWithoutTime.getTime()
                    )
                  ) {
                    return "bg-danger"; // Mark the unavailable dates with bg-danger
                  } else if (
                    selectedDatesDurations.some(
                      (d) => date.getTime() === new Date(d.date).getTime()
                    )
                  ) {
                    return "bg-blue"; // Mark the highlighted dates with bg-blue
                  } else {
                    return "bg-green"; // Mark other available dates with bg-green
                  }
                }}
              />
            </div>

            <div className="duration-picker group-container">
              <strong>Selected Durations:</strong>
              {renderDurations()}
            </div>
          </div>
        </div>
      </div>
      <UserToolbar user={user?.user} isYou={true} />

      <AddItemDescAndSpecs
        specs={postDataState.specs?.value || []}
        desc={postDataState.desc?.value || ""}
        tags={postDataState.tags?.value || []}
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
          specs: postDataState.specs?.error,
          desc: postDataState.desc?.error,
          tags: postDataState.tags?.error,
        }}
        triggered={{
          specs: postDataState.specs?.triggered,
          desc: postDataState.desc?.triggered,
          tags: postDataState.tags?.triggered,
        }}
      />

      <button
        className="btn btn-secondary mr-4"
        onClick={() => setShowComparison(true)}
      >
        Submit Changes
      </button>

      <Modal
        show={showComparison}
        onHide={() => setShowComparison(false)}
        contentLabel="Changes Comparison"
      >
        <Modal.Header closeButton>
          <Modal.Title>Review Changes</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ComparisonView
            originalData={originalData}
            currentData={postDataState}
          />
        </Modal.Body>
        <Modal.Footer>
          <button
            className="btn btn-secondary"
            onClick={() => setShowComparison(false)}
          >
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSubmit}>
            Confirm and Submit
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default EditPost;
