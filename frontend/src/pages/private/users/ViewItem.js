import React, { useState } from "react";
import { useParams } from "react-router-dom";
import "../../../components/itemlisting/itemStyles.css";
import userProfilePicture from "../../../assets/images/icons/user-icon.svg";
import itemImage from "../../../assets/images/item/item_1.jpg";
import { formatDate } from "../../../utils/dateFormat";
import { formatTimeTo12Hour } from "../../../utils/timeFormat";
import useFetchItemByParam from "../../../hooks/useFetchItemByParam";
import UserToolbar from "../../../components/users/user-toolbar/UserToolbar";
import { useAuth } from "../../../context/AuthContext";
import { useDispatch, useSelector } from "react-redux";
import { addCartItem, selectCartItems } from "../../../redux/cart/cartSlice";
import { baseApi } from "../../../App";

function ViewItem() {
  const { studentUser } = useAuth();
  const { userId } = studentUser;
  // Retrieve the post ID from the URL params
  const { id } = useParams();
  const dispatch = useDispatch();

  // State to manage the selected rental date
  const [selectedDate, setSelectedDate] = useState(null);

  // Base API URL
  const baseUrl = "http://localhost:3001";

  // Fetch the selected post using the custom hook
  const { selectedItem, loading, error, tags } = useFetchItemByParam(
    `${baseApi}/item-for-sale/available/${id}`
  );

  const cartItems = useSelector(selectCartItems);

  const handleAddToCart = () => {
    // Check if item is already in the cart
    const isItemInCart = cartItems.some((item) => item.id === selectedItem.id);

    // console.log(selectedItem)

    if (!isItemInCart) {
      dispatch(
        addCartItem({
          user_id: userId,
          owner_id: selectedItem.seller_id,
          item_id: selectedItem.id,
          transaction_type: "buy",
          date: 65,
          duration: 100,
          price: parseFloat(selectedItem.price),
          status: "pending",
        })
      );
      alert("Item added to cart");
    } else {
      alert("Item is already in your cart");
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  if (!selectedItem) {
    return <p>Item not found</p>;
  }

  const {
    itemImage: itemImageUrl = itemImage,
    rating = 0,
    price = "0",
    available_dates = [],
    userProfilePicture: userProfilePic = userProfilePicture,
    seller = {},
    description = "No description available.",
  } = selectedItem;

  const userName = `${seller.first_name || "Unknown"} ${
    seller.last_name || "User"
  }`;
  const userRating = seller.rating || 0;

  // Parse specifications
  let specifications = {};
  if (typeof selectedItem.specifications === "string") {
    try {
      specifications = JSON.parse(selectedItem.specifications);
    } catch (error) {
      console.error("Error parsing specifications:", error);
      specifications = {};
    }
  } else if (typeof selectedItem.specifications === "object") {
    specifications = selectedItem.specifications;
  }

  const itemSpecifications = Object.entries(specifications).map(
    ([key, value]) => ({
      label: key || "N/A",
      value: value || "N/A",
    })
  );

  const isProfileVisit = userId === seller.user_id ? true : false;

  return (
    <div>
      {/* Item Details Section */}
      <div className="py-4 px-2 m-0 rounded row bg-white">
        <div className="col-md-6 item-image">
          <img
            src={itemImageUrl}
            alt="Item"
            className="img-container img-fluid"
          />
        </div>
        <div className="col-md-6 item-desc">
          {/* Category Button */}
          <button className="btn btn-rounded thin">
            {selectedItem.category}
          </button>

          {/* Item Name and Rating */}
          <div className="d-flex justify-content-between align-items-center">
            <p className="mb-0">
              <i>Item for sale </i>
              <strong>{selectedItem.item_for_sale_name}</strong>
            </p>
            <p className="mb-0">
              <strong>{rating}</strong>
            </p>
          </div>

          {/* Price and Action Buttons */}
          <span className="price">₱{price}/hr</span>
          <div className="d-flex justify-content-end">
            <button className="btn btn-rectangle secondary no-fill me-2">
              Message
            </button>
            <button className="btn btn-rectangle primary no-fill me-2">
              Borrow
            </button>
            <button
              className="btn btn-rectangle success no-fill"
              onClick={handleAddToCart}
            >
              Add to Cart
            </button>
          </div>

          <hr />

          {/* Available Dates Section */}
          <p>
            <strong>Available Dates</strong>
            {available_dates.length > 0 ? (
              available_dates.map((date) => (
                <button
                  key={date.id}
                  className="btn btn-rounded thin me-2 ms-2"
                  onClick={() => setSelectedDate(date.date)}
                >
                  {formatDate(date.date)}
                </button>
              ))
            ) : (
              <i>No available dates</i>
            )}
          </p>

          {/* Available Times Section */}
          <div>
            <p>
              <strong>Available Times</strong>{" "}
              {selectedDate ? (
                formatDate(selectedDate)
              ) : (
                <i>Please select a preferred date</i>
              )}
              :
            </p>
            {selectedDate && available_dates.length > 0 ? (
              available_dates
                .find((rental) => rental.date === selectedDate)
                ?.durations?.map((duration) => (
                  <button
                    key={duration.id}
                    className="btn btn-rounded thin me-2 ms-2"
                  >
                    {`${formatTimeTo12Hour(
                      duration.rental_time_from
                    )} - ${formatTimeTo12Hour(duration.rental_time_to)}`}
                  </button>
                ))
            ) : (
              <p>No times available</p>
            )}
          </div>

          {/* Payment and Delivery Mode */}
          <div>
            <p>
              <strong>Payment Mode:</strong>
              <button className="btn btn-rounded primary thin ms-2">
                {selectedItem.payment_mode === "payment upon meetup"
                  ? "Upon meetup"
                  : "Gcash"}
              </button>
            </p>
          </div>
          <div>
            <p>
              <strong>Delivery:</strong>
              <button className="btn btn-rounded primary thin ms-2">
                {selectedItem.delivery_mode === "pickup" ? "Pickup" : "Meetup"}
              </button>
            </p>
          </div>

          {/* Rental Agreement */}
          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              id="flexCheckDefault"
            />
            <label className="form-check-label" htmlFor="flexCheckDefault">
              I agree to the rental terms set by the owner
            </label>
          </div>
        </div>
      </div>

      {/* User Info Section */}
      <UserToolbar
        userProfilePic={userProfilePic}
        user={seller}
        isProfileVisit={isProfileVisit}
        userRating={userRating}
        buttonText1="View For Sale"
        buttonText2="View Profile"
        activeTab="For Sale"
      />

      {/* Item Specifications Section */}
      <div className="item-specs mt-5 p-4 bg-white">
        <h4>Item Specifications</h4>
        <table className="specifications-table">
          <thead>
            <tr>
              <th>Specification</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            {itemSpecifications.length > 0 ? (
              itemSpecifications.map((spec, index) => (
                <tr key={index}>
                  <td>
                    <strong>{spec.label}</strong>
                  </td>
                  <td>{spec.value}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="2">No specifications available</td>
              </tr>
            )}
          </tbody>
        </table>

        <hr />

        <h4>Item Description</h4>
        <p>{description}</p>

        {/* Tags Section */}
        <div>
          <strong>Tags:</strong>
          {Array.isArray(tags) && tags.length > 0 ? (
            <div className="tags-container d-flex gap-2">
              {tags.map((tag, index) => (
                <button key={index} className="btn btn-rounded thin" disabled>
                  {tag}
                </button>
              ))}
            </div>
          ) : (
            <p>No tags available</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default ViewItem;
