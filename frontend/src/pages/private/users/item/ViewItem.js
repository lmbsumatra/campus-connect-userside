import React from "react";
import { useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import DatePicker from "react-datepicker";
import Tooltip from "@mui/material/Tooltip";
import UserToolbar from "../common/UserToolbar.jsx";
import { formatDateFromSelectDate } from "../../../../utils/dateFormat.js";
import { formatTimeTo12Hour } from "../../../../utils/timeFormat.js";
import { FOR_RENT, FOR_SALE } from "../../../../utils/consonants.js";
import cartIcon from "../../../../assets/images/pdp/cart.svg";
import forRentIcon from "../../../../assets/images/card/rent.svg";
import forSaleIcon from "../../../../assets/images/card/buy.svg";
import BreadCrumb from "../../../../components/breadcrumb/BreadCrumb.jsx";
import { viewItemBreadcrumbs } from "../../../../utils/Breadcrumbs.js";
import "bootstrap/dist/css/bootstrap.min.css";
import "react-datepicker/dist/react-datepicker.css";
import "./addNewItemStyles.css";

const ViewItem = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const itemData = location?.state?.item || {};
  const { user } = useSelector((state) => state.user);

  console.log(user, itemData);

  const renderDurations = (date) => {
    const dateItem = itemData.availableDates?.find(
      (item) =>
        formatDateFromSelectDate(new Date(item.date)) ===
        formatDateFromSelectDate(date)
    );

    if (!date) {
      return (
        <p className="select-date-message">
          Please select a date to view available times.
        </p>
      );
    }

    if (!dateItem?.durations?.length) {
      return (
        <p className="no-duration-message">No available times for this date.</p>
      );
    }

    return (
      <div className="duration-list">
        {dateItem.durations.map((duration, index) => (
          <div key={index} className="duration-item">
            <input type="checkbox" checked disabled />
            {formatTimeTo12Hour(duration.timeFrom)} -{" "}
            {formatTimeTo12Hour(duration.timeTo)}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="container-content view-item-detail">
      <BreadCrumb
        breadcrumbs={viewItemBreadcrumbs({ itemType: itemData.itemType })}
      />

      <div className="view-item-container">
        
        <div className="imgs-container">
          <Tooltip title={`This item is for ${itemData.itemType}hiiiiiiiiiii`}>
            <img
              src={itemData.itemType === FOR_RENT ? forRentIcon : forSaleIcon}
              alt={itemData.itemType}
              className="item-type"
            />
          </Tooltip>

          <div className="image-gallery">
            {itemData.images?.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`Item image ${index + 1}`}
                className="item-image"
              />
            ))}
          </div>
        </div>

        <div className="item-details">
          <div className="badges">
            <span className="badge category">{itemData.category}</span>
            <span className="badge type">{itemData.itemType}</span>
          </div>

          <h2 className="item-name">{itemData.itemName}</h2>
          <div className="price">${itemData.price}</div>

          <div className="action-btns">
            <button className="btn btn-icon primary">
              <img src={cartIcon} alt="Add to cart" />
            </button>
            <button className="btn btn-rectangle secondary">Message</button>
            <button className="btn btn-rectangle primary">
              {itemData.itemType === FOR_RENT ? "Rent" : "Buy"}
            </button>
          </div>

          <hr />

          {itemData.itemType === FOR_RENT && (
            <div className="rental-dates">
              <h3>Available Dates</h3>
              <DatePicker
                inline
                readOnly
                highlightDates={itemData.availableDates?.map(
                  (item) => new Date(item.date)
                )}
              />
              <div className="duration-picker">
                <h4>Available Times</h4>
                {renderDurations(new Date())}
              </div>
            </div>
          )}

          <div className="delivery-payment">
            <div className="method-group">
              <h3>Delivery Method</h3>
              <span className="value">{itemData.deliveryMethod}</span>
            </div>

            <div className="method-group">
              <h3>Payment Method</h3>
              <span className="value">{itemData.paymentMethod}</span>
            </div>
          </div>

          <div className="condition">
            <h3>Item Condition</h3>
            <p>{itemData.itemCondition}</p>
          </div>

          {itemData.itemType === FOR_RENT && (
            <div className="terms">
              <h3>Rental Terms</h3>
              <div className="term-group">
                <h4>Late Charges</h4>
                <p>{itemData.lateCharges}</p>
              </div>
              <div className="term-group">
                <h4>Security Deposit</h4>
                <p>{itemData.securityDeposit}</p>
              </div>
              <div className="term-group">
                <h4>Repair/Replacement</h4>
                <p>{itemData.repairReplacement}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <UserToolbar user={user.user} isYou={false} />

      <div className="item-description">
        <h3>Description</h3>
        <p>{itemData.desc}</p>
      </div>

      <div className="specifications">
        <h3>Specifications</h3>
        <ul>
          {itemData.specs?.map((spec, index) => (
            <li key={index}>{spec}</li>
          ))}
        </ul>
      </div>

      <div className="tags">
        {itemData.tags?.map((tag, index) => (
          <span key={index} className="tag">
            #{tag}
          </span>
        ))}
      </div>
    </div>
  );
};

export default ViewItem;
