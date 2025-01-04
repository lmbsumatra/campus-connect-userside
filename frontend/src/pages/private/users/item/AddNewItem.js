import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import DatePicker from "react-datepicker";
import Tooltip from "@mui/material/Tooltip";
import { formatDateFromSelectDate } from "../../../../utils/dateFormat.js";

// Components
import UserToolbar from "../common/UserToolbar.jsx";
import AddItemDescAndSpecs from "../common/AddItemDescAndSpecs.jsx";
import AddItemBadges from "../common/AddItemBadges.jsx";
import AddTerms from "../common/AddTerms.jsx";
import AddImage from "../common/AddImage.jsx";
import DateDurationPicker from "../post/DateDurationPicker.jsx";
import LoadingItemDetailSkeleton from "../../../../components/loading-skeleton/LoadingItemDetailSkeleton.js";
import ShowAlert from "../../../../utils/ShowAlert.js";

// Constants and Utils
import { formatTimeTo12Hour } from "../../../../utils/timeFormat.js";
import {
  FOR_RENT,
  PAY_UPON_MEETUP,
  GCASH,
  PICK_UP,
  MEET_UP,
  FOR_SALE,
} from "../../../../utils/consonants.js";

// Redux
import { selectStudentUser } from "../../../../redux/auth/studentAuthSlice.js";
import { showNotification } from "../../../../redux/alert-popup/alertPopupSlice.js";
import { fetchUser } from "../../../../redux/user/userSlice.js";
import {
  blurField,
  generateSampleData,
  updateAvailableDates,
  updateField,
  validateInput,
} from "../../../../redux/item-form/itemFormSlice.js";

// Assets
import cartIcon from "../../../../assets/images/pdp/cart.svg";
import forRentIcon from "../../../../assets/images/card/rent.svg";
import forSaleIcon from "../../../../assets/images/card/buy.svg";
import warningIcon from "../../../../assets/images/input-icons/warning.svg";

// Styles
import "bootstrap/dist/css/bootstrap.min.css";
import "react-datepicker/dist/react-datepicker.css";
import "./addNewItemStyles.css";
import { toast, ToastContainer } from "react-toastify";
import axios from "axios";
import { baseApi } from "../../../../App.js";
import { io } from "socket.io-client";
import BreadCrumb from "../../../../components/breadcrumb/BreadCrumb.jsx";
import { addItemBreadcrumbs } from "../../../../utils/Breadcrumbs.js";

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

const AddNewItem = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const itemDataState = useSelector((state) => state.itemForm);
  const [removedImages, setRemovedImages] = useState([]);
  const { user, loadingFetchUser, errorFetchUser } = useSelector(
    (state) => state.user
  );

  console.log(itemDataState);

  const { userId } = useSelector(selectStudentUser);
  const socket = io("http://localhost:3001", {
    transports: ["polling", "websocket"],
  });

  const [category, setCategory] = useState("");
  const [itemType, setItemType] = useState(FOR_RENT);
  const [showDateDurationPicker, setShowDateDurationPicker] = useState(false);
  const [selectedDatesDurations, setSelectedDatesDurations] = useState([]);
  const [selectedDisplayDate, setSelectedDisplayDate] = useState(null);
  const [localImages, setLocalImages] = useState([]);

  const handleGenerateData = () => {
    dispatch(generateSampleData());
  };

  useEffect(() => {
    if (userId) {
      console.log("Fetching user with ID:", userId);
      dispatch(fetchUser(userId))
      .then((response) => console.log("User fetch response:", response))
      .catch((error) => console.error("User fetch error:", error));
    }
  }, [userId, dispatch]);
  console.log("Current user state:", { user, loadingFetchUser, errorFetchUser });

  if (loadingFetchUser) {
    return <LoadingItemDetailSkeleton />;
  }

// Show error state if user fetch failed
if (errorFetchUser) {
  return (
    <div className="error-container">
      <p>Error loading user data. Please try again later.</p>
    </div>
  );
}
// Ensure user data exists before rendering main content
if (!user?.user) {
  return <LoadingItemDetailSkeleton />;
}

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

  const handleSaveDatesDurations = (datesDurations) => {
    // Assuming datesDurations is an array
    const serializedDates = datesDurations.map((dateObj) => ({
      ...dateObj,
      date: formatDateFromSelectDate(dateObj.date),
    }));

    setSelectedDatesDurations(serializedDates);
    dispatch(updateAvailableDates(serializedDates));
  };

  const handleCategoryChange = (selectedCategory) => {
    setCategory(selectedCategory);
    dispatch(updateField({ name: "category", value: selectedCategory }));
    dispatch(blurField({ name: "category", value: selectedCategory }));
  };

  const handleImagesChange = ({ currentImages, removedImagesList }) => {
    setLocalImages(currentImages);
    setRemovedImages(removedImagesList);
    console.log({ localImages });

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

    console.log("Filenames:", filenames); // Debugging: log the filenames

    // Dispatch updates to Redux
    dispatch(updateField({ name: "images", value: filenames })); // Use filenames instead of full objects
    dispatch(blurField({ name: "images", value: filenames }));
  };

  const handleSubmit = async () => {
    console.log(itemDataState);
    if (!user?.user) {
      ShowAlert(
        dispatch,
        "error",
        "Error",
        "User data not available. Please try again."
      );
      return;
    }
    try {
      let hasErrors = false;
      const errors = {};

      // Validate fields
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
            console.log(error);
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
        images: itemDataState.images.value,
        specs: itemDataState.specs.value,
        ...(itemType === FOR_RENT && {
          lateCharges: itemDataState.lateCharges.value,
          securityDeposit: itemDataState.securityDeposit.value,
          repairReplacement: itemDataState.repairReplacement.value,
        }),
      };

      console.log("Submitting item data:", itemData);

      formData.append(
        itemType === FOR_RENT ? "listing" : "item",
        JSON.stringify(itemData)
      );

      const endpoint =
        itemType === FOR_RENT ? "/listings/add" : "/item-for-sale/add";

      // Trigger loading alert
      ShowAlert(dispatch, "loading", "Creating listing", "Please wait...");

      // Make Axios request with timeout
      const response = await axios.post(`${baseApi}${endpoint}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

    /* if (socket) {
        const notification = {
          title: `New ${itemType === FOR_RENT ? "Listing!" : "Item for Sale!"}`,
          owner: {
            name: user.user.fname + " " + user.user.lname,
          },
          message:
            itemType === FOR_RENT
             // ? "has added a new rental listing."
              : "has listed an item for sale.",
          type:
            itemType === FOR_RENT
              //? "new-listing"
              : "new-item-for-sale",
        timestamp: new Date().toISOString(), 
        };
        socket.emit
        ( notification.type === "new-listing"
            //? "new-listing-notification" 
            : "new-item-for-sale-notification",
          notification);
      }
*/
      ShowAlert(
        dispatch,
        "success",
        "Success",
        `Item for ${itemType === FOR_RENT ? "listing" : "sale"} added!`
      );
      // navigate(`/items/${response.data.listing.id}`);
    } catch (error) {
      ShowAlert(dispatch, "error", "Error", "Request failed or timed out.");

      console.error("Submission error:", error);

      const errorMessage =
        error.response?.data?.message ||
        "Failed to create listing. Please try again.";

      ShowAlert(dispatch, "error", "Error", errorMessage);
    }
  };
  const renderUserToolbar = () => {
    if (!user?.user) return null;
    return <UserToolbar user={user.user} isYou={true} />;
  };

  return (
    <div className="container-content add-item-detail">
      <BreadCrumb breadcrumbs={addItemBreadcrumbs({ itemType })} />
      <button onClick={handleGenerateData}>Generate Sample Data</button>
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
            <div className="validation error d-block">
              <img src={warningIcon} className="icon" alt="Error indicator" />
              <span className="text">{itemDataState.images.error}</span>
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
          />
          {itemDataState.category.triggered &&
            itemDataState.category.hasError && (
              <div className="validation error">
                <img src={warningIcon} className="icon" alt="Error indicator" />
                <span className="text">{itemDataState.category.error}</span>
              </div>
            )}

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
                <img src={warningIcon} className="icon" alt="Error indicator" />
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
                highlightDates={selectedDatesDurations.map(
                  (item) => new Date(item.date)
                )}
                excludeDates={UNAVAILABLE_DATES.map((date) => new Date(date))}
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
          {itemDataState.deliveryMethod.triggered &&
            itemDataState.deliveryMethod.hasError && (
              <div className="validation error">
                <img src={warningIcon} className="icon" alt="Error indicator" />
                <span className="text">
                  {itemDataState.deliveryMethod.error}
                </span>
              </div>
            )}

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
                    Gcash
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
            </div>
          </div>

          {itemDataState.paymentMethod.triggered &&
            itemDataState.paymentMethod.hasError && (
              <div className="validation error">
                <img src={warningIcon} className="icon" alt="Error indicator" />
                <span className="text">
                  {itemDataState.paymentMethod.error}
                </span>
              </div>
            )}

          <div className="group-container item-condition">
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

      {renderUserToolbar()}

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

      <button className="btn btn-primary" onClick={() => handleSubmit()}>
        Submit
      </button>
    </div>
  );
};

export default AddNewItem;
