import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import DatePicker from "react-datepicker";
import Tooltip from "@mui/material/Tooltip";
import { formatDateFromSelectDate } from "../../../../utils/dateFormat.js";
import UserToolbar from "../common/UserToolbar.jsx";
import AddItemDescAndSpecs from "../common/AddItemDescAndSpecs.jsx";
import AddItemBadges from "../common/AddItemBadges.jsx";
import AddTerms from "../common/AddTerms.jsx";
import AddImage from "../common/AddImage.jsx";
import DateDurationPicker from "../common/DateDurationPicker.jsx";
import LoadingItemDetailSkeleton from "../../../../components/loading-skeleton/LoadingItemDetailSkeleton.js";
import ShowAlert from "../../../../utils/ShowAlert.js";
import { formatTimeTo12Hour } from "../../../../utils/timeFormat.js";
import { useSystemConfig } from "../../../../context/SystemConfigProvider.js";
import {
  FOR_RENT,
  PAY_UPON_MEETUP,
  GCASH,
  PICK_UP,
  MEET_UP,
  FOR_SALE,
  getStatusClass,
  MY_LISTINGS,
  MY_ITEMS,
  baseApi,
} from "../../../../utils/consonants.js";
import { selectStudentUser } from "../../../../redux/auth/studentAuthSlice.js";
import { showNotification } from "../../../../redux/alert-popup/alertPopupSlice.js";
import { fetchUser } from "../../../../redux/user/userSlice.js";
import {
  blurField,
  clearItemForm,
  generateSampleData,
  populateItemData,
  updateAvailableDates,
  updateField,
  validateInput,
} from "../../../../redux/item-form/itemFormSlice.js";
import cartIcon from "../../../../assets/images/pdp/cart.svg";
import forRentIcon from "../../../../assets/images/card/rent.svg";
import forSaleIcon from "../../../../assets/images/card/buy.svg";
import warningIcon from "../../../../assets/images/input-icons/warning.svg";
import "bootstrap/dist/css/bootstrap.min.css";
import "react-datepicker/dist/react-datepicker.css";
import "./addNewItemStyles.css";
import { toast, ToastContainer } from "react-toastify";
import axios from "axios";
import { io } from "socket.io-client";
import BreadCrumb from "../../../../components/breadcrumb/BreadCrumb.jsx";

import { fetchListingById } from "../../../../redux/listing/listingByIdSlice.js";
import ComparisonView from "./ComparisonView.jsx";
import { Modal } from "react-bootstrap";
import { editItemBreadcrumbs } from "../../../../utils/Breadcrumbs.js";
import { fetchItemForSaleById } from "../../../../redux/item-for-sale/itemForSaleByIdSlice.js";
import { fetchUnavailableDates } from "../../../../redux/dates/unavaibleDatesSlice.js";

const ValidationError = ({ message }) => (
  <div className="validation error">
    <img src={warningIcon} className="warning-icon" alt="Error indicator" />
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
  item_type = FOR_RENT,
}) => (
  <div className="field-container">
    <div className="input-wrapper d-flex align-items-center">
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
        <>
          {" "}
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
          {id === "price" && item_type === FOR_RENT && (
            <p className="no-wrap pt-2" style={{ whiteSpace: "nowrap" }}>
              per hour
            </p>
          )}
        </>
      )}
    </div>
    {triggered && error && <ValidationError message={error} />}
  </div>
);
const EditItem = () => {
  const { user, loadingFetchUser } = useSelector((state) => state.user);
  const isVerified = user?.student?.status ?? false;
  const isEmailVerified = user?.user?.emailVerified ?? false;

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { config } = useSystemConfig();
  const itemDataState = useSelector((state) => state.itemForm);
  // console.log(itemDataState);
  const { userId, role } = useSelector(selectStudentUser);
  const location = useLocation();
  const { id } = useParams();
  // console.log(id);
  const { loadingUnavailableDates, unavailableDates, errorUnavailableDates } =
    useSelector((state) => state.unavailableDates);

  const socket = io(`${baseApi}`, {
    withCredentials: true,
    transports: ["websocket", "polling"], // explicitly set both if needed
  });

  const [category, setCategory] = useState("");

  // getting item type
  const urlPath = location.pathname;
  const isForSaleUrl = urlPath.includes("/profile/my-for-sale");
  const isForRentUrl = urlPath.includes("/profile/my-listings");
  const [itemType, setItemType] = useState(
    isForSaleUrl ? FOR_SALE : isForRentUrl ? FOR_RENT : null
  );

  // const itemData = location?.state?.item || {};

  const [showDateDurationPicker, setShowDateDurationPicker] = useState(false);
  const [selectedDatesDurations, setSelectedDatesDurations] = useState([]);
  const [selectedDisplayDate, setSelectedDisplayDate] = useState(null);
  const [localImages, setLocalImages] = useState([]);
  const [removedImages, setRemovedImages] = useState([]);
  const [originalData, setOriginalData] = useState(null);
  const [showComparison, setShowComparison] = useState(false);
  const [removedDates, setRemovedDates] = useState([]);
  const [removedDurations, setRemovedDurations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [redirecting, setRedirecting] = useState(false);
  const [error, setError] = useState(null);

  const [itemData, setItemData] = useState();

  const { itemForSaleById, loadingItemForSaleById, errorItemForSaleById } =
    useSelector((state) => state.itemForSaleById);

  const { listingById, loadingListingById, errorListingById } = useSelector(
    (state) => state.listingById
  );

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

  useEffect(() => {
    if (id) {
      if (isForSaleUrl) {
        dispatch(fetchItemForSaleById({ userId, itemForSaleId: id }));
      } else if (isForRentUrl) {
        dispatch(fetchListingById({ userId, listingId: id }));
      }
    }
  }, [dispatch, isForSaleUrl, isForRentUrl, userId, id]);

  useEffect(() => {
    setLoading(true);
    setError(null);

    if (isForSaleUrl) {
      if (errorItemForSaleById) {
        setError(errorItemForSaleById);
        setLoading(false);
      } else if (!loadingItemForSaleById && itemForSaleById) {
        setItemData(itemForSaleById);
        setError(null);
        setLoading(false);
      }
    } else if (isForRentUrl) {
      if (errorListingById) {
        setError(errorListingById);
        setLoading(false);
      } else if (!loadingListingById && listingById) {
        setItemData(listingById);
        setError(null);
        setLoading(false);
      }
    }
  }, [
    isForSaleUrl,
    isForRentUrl,
    itemForSaleById,
    listingById,
    loadingItemForSaleById,
    loadingListingById,
    errorItemForSaleById,
    errorListingById,
  ]);

  // console.log("Item Data:", itemData);
  const dataInitialized = useRef(false);
  useEffect(() => {
    if (!loading && itemData && !dataInitialized.current) {
      // Use a ref to track if we've already initialized the data
      dataInitialized.current = true;

      const initialData = {
        ...itemData,
        images: itemData.images,
        availableDates: itemData.availableDates,
      };
      setOriginalData(initialData);
      dispatch(populateItemData(itemData));

      const newSelectedDatesDurations = [];
      const unavailableDates = [];

      // Check the structure of the availableDates
      const availableDatesArray = Array.isArray(itemData.availableDates)
        ? itemData.availableDates
        : [];

      availableDatesArray.forEach((dateItem) => {
        if (dateItem && dateItem.date) {
          // Filter dates where the status is not "available"
          const isAvailable = dateItem.status === "available";

          // If not available, add it to the unavailableDates array
          if (!isAvailable) {
            unavailableDates.push(new Date(dateItem.date));
          }

          // Add selected dates and durations to the newSelectedDatesDurations
          if (isAvailable) {
            newSelectedDatesDurations.push({
              date: new Date(dateItem.date),
              durations: Array.isArray(dateItem.durations)
                ? dateItem.durations.map((duration) => ({
                    timeFrom: duration.timeFrom,
                    timeTo: duration.timeTo,
                  }))
                : [],
            });
          }
        }
      });

      // Set the state for both selectedDatesDurations and unavailableDates
      setSelectedDatesDurations(newSelectedDatesDurations);
      // setUnavailableDates(unavailableDates);
    }
  }, [loading, itemData]); // Remove itemDataState from the dependency array

  useEffect(() => {
    if (itemDataState.category && itemDataState.category.value !== category) {
      setCategory(itemDataState.category.value);
    }
  }, [itemDataState.category.value, category]);

  useEffect(() => {
    if (itemDataState.itemType && itemDataState.itemType.value !== itemType) {
      setItemType(itemDataState.itemType.value);
    }
  }, [itemDataState.itemType.value, itemType]);

  useEffect(() => {
    // Check if itemData is available and itemDataState.images has value
    if (itemData && itemDataState.images?.value && localImages.length === 0) {
      // Only set localImages once when initially loading the data
      setLocalImages(itemDataState.images.value);
    }
  }, [itemData, itemDataState.images?.value, localImages.length]); // Depend on itemData and itemDataState.images

  useEffect(() => {
    if (userId) {
      dispatch(fetchUser(userId));
    }
  }, [userId, dispatch]);

  // item not found alert add here
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
    !itemData ||
    error ||
    loadingFetchUser ||
    (!loading && error)
  ) {
    return <LoadingItemDetailSkeleton />;
  }

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

  const handleGenerateData = () => {
    dispatch(generateSampleData());
  };

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

  const handleSaveDatesDurations = (
    datesDurations,
    removedDates,
    removedDurations
  ) => {
    // Format the datesDurations as required
    const serializedDates = datesDurations.map((dateObj) => ({
      date: formatDateFromSelectDate(dateObj.date),
      durations: dateObj.durations,
    }));

    // Format the removed dates to 'yy-mm-dd'
    const formattedRemovedDates = removedDates.map((removedDate) =>
      formatDateFromSelectDate(removedDate.date)
    );

    // Format the removed durations
    const formattedRemovedDurations = removedDurations.map((durationObj) => ({
      date: formatDateFromSelectDate(durationObj.date),
      duration: durationObj.duration,
    }));

    // Set the formatted removed dates
    setRemovedDates(formattedRemovedDates);
    setRemovedDurations(formattedRemovedDurations);

    // Dispatch the action for the selected dates
    setSelectedDatesDurations(datesDurations);
    dispatch(updateAvailableDates(serializedDates));

    // Log the formatted removed dates and durations for debugging
    console.log("Formatted Removed Dates:", formattedRemovedDates);
    console.log("Formatted Removed Durations:", formattedRemovedDurations);
  };

  const handleCategoryChange = (selectedCategory) => {
    setCategory(selectedCategory);
    dispatch(updateField({ name: "category", value: selectedCategory }));
    dispatch(blurField({ name: "category", value: selectedCategory }));
  };

  const handleSubmit = async () => {
    // Ban check
    if (isVerified === "banned") {
      ShowAlert(
        dispatch,
        "warning",
        "Account Banned",
        "Your account is permanently banned. You cannot edit listings.",
        { text: "Ok" }
      );
      return;
    }

    // Restricted status check (regardless of date)
    if (isVerified === "restricted") {
      // Try to get the restriction end date
      let restrictionDate = null;
      if (user?.student?.restricted_until) {
        restrictionDate = new Date(user.student.restricted_until);
      } else if (user?.student?.statusMsg) {
        // Try to extract from statusMsg
        const dateMatch = user.student.statusMsg.match(
          /restricted until ([^\.]+)/i
        );
        if (dateMatch && dateMatch[1]) {
          try {
            restrictionDate = new Date(dateMatch[1].trim());
          } catch (e) {
            console.error("Failed to parse date from statusMsg:", e);
          }
        }
      }

      // Check if the restriction is still active
      const isCurrentlyRestricted =
        restrictionDate &&
        !isNaN(restrictionDate.getTime()) &&
        restrictionDate > new Date();

      if (isCurrentlyRestricted) {
        ShowAlert(
          dispatch,
          "warning",
          "Account Restricted",
          `Your account is temporarily restricted until ${restrictionDate.toLocaleString()}. You cannot edit listings at this time.`,
          { text: "Ok" }
        );
      } else {
        // Restriction expired but status still "restricted"
        ShowAlert(
          dispatch,
          "warning",
          "Account Status Issue",
          "Your account has a restriction status that needs attention. Please contact support or check your profile.",
          {
            text: "View Profile",
            action: () => navigate("/profile/edit-profile"),
          }
        );
      }
      return;
    }

    // Other status checks (pending, flagged, etc.)
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
      let hasErrors = false;
      const errors = {};

      Object.keys(itemDataState).forEach((key) => {
        if (key !== "isFormValid") {
          if (
            itemType === FOR_SALE &&
            ["lateCharges", "repairReplacement", "securityDeposit"].includes(
              key
            )
          ) {
            return;
          }
          const field = itemDataState[key];
          const { hasError, error } = validateInput(key, field.value);

          if (hasError) {
            hasErrors = true;
            errors[key] = error;
            dispatch(
              blurField({ name: key, value: field.value, itemType: FOR_SALE })
            );

            if (key === "availableDates") {
              dispatch(updateAvailableDates(field.value));
            }
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

      if (!localImages.length) {
        ShowAlert(
          dispatch,
          "error",
          "Image Required",
          "Please upload at least one image"
        );
        return;
      }
      const formData = new FormData();
      localImages
        .filter((image) => image.file instanceof File) // Filter only File objects
        .forEach((image) => formData.append("upload_images", image.file));

      removedImages.forEach((image) => {
        formData.append("remove_images", image);
      });

      const itemData = {
        [itemType === FOR_RENT ? "ownerId" : "sellerId"]: userId,
        category: itemDataState.category.value,
        itemName: itemDataState.itemName.value,
        itemCondition: itemDataState.itemCondition.value,
        deliveryMethod: itemDataState.deliveryMethod.value,
        paymentMethod: itemDataState.paymentMethod.value,
        price: itemDataState.price.value,
        desc: itemDataState.desc.value,
        tags: itemDataState.tags.value,
        dates: itemDataState.availableDates.value,
        toRemoveDates: removedDates,
        toRemoveDurations: removedDurations,
        specs: itemDataState.specs.value,
        location: itemDataState.location.value,
        ...(itemType === FOR_RENT && {
          lateCharges: itemDataState.lateCharges.value,
          securityDeposit: itemDataState.securityDeposit.value,
          repairReplacement: itemDataState.repairReplacement.value,
        }),
        ...(itemType === FOR_SALE && {
          stock: itemDataState.stock.value,
        }),
      };

      formData.append(
        itemType === FOR_RENT ? "listing" : "item",
        JSON.stringify(itemData)
      );

      const endpoint =
        itemType === FOR_RENT
          ? `/listings/users/${userId}/update/${id}`
          : `/item-for-sale/users/${userId}/update/${id}`;

      ShowAlert(dispatch, "loading", "Submitting changes", "Please wait...");
      const response = await axios.patch(`${baseApi}${endpoint}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      await ShowAlert(
        dispatch,
        "success",
        "Success",
        `Item for ${itemType === FOR_RENT ? "listing" : "sale"} changed!`,
        { text: "Ok" }
      );

      ShowAlert(dispatch, "loading", "Redirecting");

      navigate(`/${itemType === FOR_RENT ? MY_LISTINGS : MY_ITEMS}`, {
        state: { redirecting: true },
      });
    } catch (error) {
      ShowAlert(dispatch, "error", "Error", "Request failed or timed out.");
      console.error("Submission error:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to update. Please try again.";
      ShowAlert(dispatch, "error", "Error", errorMessage);
    }
  };

  return (
    <div className="container-content add-item-detail">
      <BreadCrumb breadcrumbs={editItemBreadcrumbs({ itemType })} />

      {itemData.statusMessage && (
        <div className={`alert py-2 ${getStatusClass(itemData.status)}`}>
          {itemData.status}
          {": "}
          {itemData.statusMessage}
        </div>
      )}

      {config["Generate Sample Data"] && (
        <button onClick={handleGenerateData}>Generate Sample Data</button>
      )}

      <div className="add-item-container">
        <div className="imgs-container">
          <Tooltip title={`This item is ${itemType}`}>
            <img
              src={itemType === FOR_RENT ? forRentIcon : forSaleIcon}
              alt={itemType}
              className="item-type"
            />
          </Tooltip>
          {itemDataState.images.triggered && itemDataState.images.hasError && (
            <ValidationError message={itemDataState.images.error} />
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
            isEditPage={true}
            onItemTypeChange={handleItemTypeChange}
            onCategoryChange={handleCategoryChange}
          />
          {itemDataState.category.triggered &&
            itemDataState.category.hasError && (
              <div className="validation error">
                <img
                  src={warningIcon}
                  className="warning-icon"
                  alt="Error indicator"
                />
                <span className="text">{itemDataState.category.error}</span>
              </div>
            )}

          <FormField
            label={
              itemDataState.itemType.value === FOR_RENT
                ? "For Rent"
                : "For Sale"
            }
            id="itemName"
            value={itemDataState.itemName.value}
            onChange={handleFieldChange}
            onBlur={handleFieldBlur}
            error={itemDataState.itemName.error}
            triggered={itemDataState.itemName.triggered}
            placeholder="Add item name"
          />

          <FormField
            label={<span className="price">₱</span>}
            id="price"
            value={itemDataState.price.value}
            onChange={handleFieldChange}
            onBlur={handleFieldBlur}
            error={itemDataState.price.error}
            triggered={itemDataState.price.triggered}
            placeholder="Add price"
            className="field-container item-price"
            item_type={itemType}
          />

          {itemDataState?.itemType?.value === FOR_SALE && (
            <FormField
              label="Stock"
              id="stock"
              value={itemDataState.stock.value}
              onChange={handleFieldChange}
              onBlur={handleFieldBlur}
              error={itemDataState.stock.error}
              triggered={itemDataState.stock.triggered}
              placeholder="Enter stock quantity"
              className="field-container item-stock"
              type="number"
            />
          )}

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
                {itemDataState.itemType.value === FOR_RENT ? "Rent" : "Buy"}
              </button>
            </div>
          </Tooltip>

          <hr />

          {itemDataState.availableDates.triggered &&
            itemDataState.availableDates.hasError && (
              <div className="validation error d-block">
                <img
                  src={warningIcon}
                  className="warning-icon"
                  alt="Error indicator"
                />
                <span className="text">
                  {" "}
                  {itemDataState.availableDates.error}
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

          {/* Delivery and Payment Methods */}
          <div className="group-container delivery-method">
            <label className="label">Delivery Method</label>
            <div className="delivery-method">
              <Tooltip
                title=""
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
          {itemDataState.deliveryMethod.triggered &&
            itemDataState.deliveryMethod.hasError && (
              <div className="validation error">
                <img
                  src={warningIcon}
                  className="warning-icon"
                  alt="Error indicator"
                />
                <span className="text">
                  {itemDataState.deliveryMethod.error}
                </span>
              </div>
            )}

          <div className="group-container payment-method ">
            <label className="label">Payment Method</label>
            <div className="delivery-method">
              {config?.Stripe && (
                <Tooltip
                  title={`${
                    user?.user?.hasStripe === false
                      ? "This is disabled. You must have stripe account first. Create one by going to /profile/dashboard."
                      : ""
                  }`}
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
                      disabled={user?.user?.hasStripe === true ? false : true}
                    >
                      Online Payment
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
                      Pay upon meetup
                    </button>
                  </div>
                </Tooltip>
              )}
            </div>
          </div>

          {itemDataState.paymentMethod.triggered &&
            itemDataState.paymentMethod.hasError && (
              <div className="validation error">
                <img
                  src={warningIcon}
                  className="warning-icon"
                  alt="Error indicator"
                />
                <span className="text">
                  {itemDataState.paymentMethod.error}
                </span>
              </div>
            )}

          <FormField
            label="Item Condition"
            id="itemCondition"
            value={itemDataState.itemCondition.value}
            onChange={handleFieldChange}
            onBlur={handleFieldBlur}
            error={itemDataState.itemCondition.error}
            triggered={itemDataState.itemCondition.triggered}
            placeholder="Select item condition"
            type="select"
            options={[
              "New",
              "Used (like new)",
              "Used (fair)",
              "Used (good)",
              "Poor",
            ]}
          />

          <FormField
            label="Location (for meetup / pick up)"
            id="location"
            value={itemDataState.location.value}
            onChange={handleFieldChange}
            onBlur={handleFieldBlur}
            error={itemDataState.location.error}
            triggered={itemDataState.location.triggered}
            placeholder="Add location"
            type="text"
          />

          {itemType === FOR_RENT ? (
            <div className="group-container terms">
              <AddTerms
                values={{
                  lateCharges: itemDataState?.lateCharges?.value,
                  securityDeposit: itemDataState?.securityDeposit?.value,
                  repairReplacement: itemDataState?.repairReplacement?.value,
                }}
              />
            </div>
          ) : (
            ""
          )}
        </div>
      </div>
      <UserToolbar user={user?.user} isYou={true} />
      <AddItemDescAndSpecs
        specs={itemDataState.specs.value}
        desc={itemDataState.desc.value}
        tags={itemDataState.tags.value}
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
          specs: itemDataState.specs.error,
          desc: itemDataState.desc.error,
          tags: itemDataState.tags.error,
        }}
        triggered={{
          specs: itemDataState.specs.triggered,
          desc: itemDataState.desc.triggered,
          tags: itemDataState.tags.triggered,
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
        onClose={() => setShowComparison(false)}
        contentLabel="Changes Comparison"
      >
        <div className="flex justify-end mb-4">
          <button
            className="btn btn-secondary"
            onClick={() => setShowComparison(false)}
          >
            Close
          </button>
        </div>
        <ComparisonView
          originalData={originalData}
          currentData={itemDataState}
        />
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

export default EditItem;
