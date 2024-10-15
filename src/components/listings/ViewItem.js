import React, { useState } from "react";
import "./style.css";
import { useParams } from "react-router-dom";
import NavBar from "../navbar/navbar/NavBar";
import Footer from "../footer/Footer";
import userProfilePicture from "../../assets/images/icons/user-icon.svg";
import itemImage from "../../assets/images/item/item_1.jpg";

function ViewItem() {
  const { id } = useParams();

  const item = [
    {
      id: 8,
      itemImage: itemImage,
      itemCategory: "CIT",
      itemName: "Clarinet",
      price: "12",
      rating: 4.8,
      availableDates: [
        {
          date: "October 1, 2024",
          availableTimes: ["11am - 2pm", "3pm - 4pm"],
        },
        {
          date: "October 2, 2024",
          availableTimes: ["11am - 1pm", "1pm - 2pm", "3pm - 4pm"],
        },
      ],
      availableDuration: ["11a - 1pm", "1pm - 2pm", "3pm - 4pm"],
      lateCharges: "20",
      securityDeposit: "20",
      repairAndReplacement: "None",
      userName: "Hank",
      userProfilePicture: userProfilePicture,
      userRating: 4.0,
      itemDescription:
        "A professional-grade clarinet with a warm and rich tone, suitable for orchestral and solo performances.",
      title: "Clarinet",
      itemSpecifications: [
        // Add this line
        { label: "Brand", value: "Stanley" },
        { label: "Model", value: "87 - 474" },
        { label: "Type", value: "Adjustable Wrench" },
        { label: "Materials", value: "Chrome Vanadium Steel" },
        { label: "Size", value: "12 Inches" },
        { label: "Jaw Capacity", value: "1-1/2 inches" },
        { label: "Finish", value: "Polished Chrome" },
        { label: "Handle", value: "Anti-slip grip" },
      ],
      tags: [
        "#Flute",
        "#Music",
        "#InstrumentRental",
        "#Yamaha",
        "#ConcertFlute",
        "#BeginnerFriendly",
      ],
    },
  ];

  const selectedItem = item[0];
  const [selectedDate, setSelectedDate] = useState(null);

  if (!selectedItem) {
    return <p>Item not found</p>;
  }

  return (
    <div>
      <div className="custom-container">
        <div className="item-container row">
          {/* image preview */}
          <div className="col-md-6 item-image">
            <img
              src={selectedItem.itemImage}
              alt="Item image"
              className="img-container img-fluid"
            />
          </div>

          {/* rental info */}
          <div className="col-md-6 item-desc">
            <button className="btn btn-rounded thin">
              {selectedItem.itemCategory}
            </button>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <p className="mb-0">
                <strong>{selectedItem.title}</strong>
              </p>
              <p className="mb-0">
                <strong>{selectedItem.rating}</strong>
              </p>
            </div>
            <span className="price">₱{selectedItem.price}/hr</span>
            <div className="mt-5 d-flex justify-content-end">
              <button className="btn btn-rectangle secondary no-fill me-2">Message</button>
              <button className="btn btn-rectangle primary no-fill me-2">Borrow</button>
            </div>

            <hr />

            <p>
              <strong>Available Dates</strong>
              {selectedItem.availableDates.map((dateObj) => (
                <button
                  key={dateObj.date}
                  className="btn btn-rounded thin me-2 ms-2"
                  onClick={() => setSelectedDate(dateObj.date)}
                >
                  {dateObj.date}
                </button>
              ))}
            </p>

            <div>
              <p>
                <strong>Available Times</strong> {selectedDate}:
              </p>
              {selectedDate && (
                <div>
                  {selectedItem.availableDates
                    .find((date) => date.date === selectedDate)
                    ?.availableTimes.map((time, index) => (
                      <button
                        key={index}
                        className="btn btn-rounded thin me-2 ms-2"
                      >
                        {time}
                      </button>
                    ))}
                </div>
              )}
            </div>

            <div>
              <p>
                <strong>Available Duration</strong> {selectedDate}:
              </p>
              <div>
                {selectedItem.availableDuration.map((time, index) => (
                  <button
                    key={index}
                    className="btn btn-rounded thin me-2 ms-2"
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>

            <p>
              <strong>Rental Rate:</strong> ₱{selectedItem.price}/hr
            </p>
            <p>
              <strong>Late Charges:</strong> ₱100/hr
            </p>
            <p>
              <strong>Security Deposit:</strong> ₱500
            </p>
            <p>
              <strong>Repair and Replacement:</strong> Available
            </p>
            <p>
              <strong>Delivery:</strong>
              <button className="btn btn-rounded thin ms-2">Meetup</button>
              <button className="btn btn-rounded thin ms-2">Pickup</button>
            </p>
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                value=""
                id="flexCheckDefault"
              />
              <label className="form-check-label" htmlFor="flexCheckDefault">
                I agree on rental terms set by the owner
              </label>
            </div>
          </div>
        </div>

        <div className="user-info mt-5">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <img
                src={selectedItem.userProfilePicture}
                alt="Profile"
                className="profile-pic me-2"
              />
              <div>
                <a
                  href={`/userprofile/${selectedItem.userName}`}
                  className="text-dark small text-decoration-none"
                >
                  {selectedItem.userName}
                </a>
              </div>
            </div>
            <div className="rating">
              <span>Rating:</span>
              {"★".repeat(Math.floor(selectedItem.userRating))}
              {"☆".repeat(5 - Math.floor(selectedItem.userRating))}
            </div>
            <button className="btn btn-rectangle secondary me-2">
              View Listings
            </button>
            <button className="btn btn-rectangle secondary me-2">
              View Profile
            </button>
          </div>
        </div>

        {/* item specs */}
        <div className="item-specs mt-5">
          <h4>Item Specifications</h4>
          <table className="specifications-table">
            <thead>
              <tr>
                <th>Specification</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              {selectedItem.itemSpecifications.map((spec, index) => (
                <tr key={index}>
                  <td>
                    <strong>{spec.label}</strong>
                  </td>
                  <td>{spec.value}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <hr />

          {/* item description */}
          <h4>Item Description</h4>
          <p>
            {selectedItem.itemDescription}
          </p>

          {/* tags */}
          <div>
            {selectedItem.tags.map((tag, index) => (
              <button key={index} className="btn btn-rounded thin">
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ViewItem;
