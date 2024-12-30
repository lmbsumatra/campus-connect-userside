import React, { useState } from "react";
// style
import "./postFormStyles.css";

const PostForm = () => {
  const [images, setImages] = useState([]);
  const [deliveryMethod, setDeliveryMethod] = useState("pickup");
  const [specifications, setSpecifications] = useState([
    { title: "", description: "" },
  ]);

  const [rentalDatesOption, setRentalDatesOption] = useState("custom");
  const [customDates, setCustomDates] = useState([]);
  const [weeklyDays, setWeeklyDays] = useState([]);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [weeklyRentalTimes, setWeeklyRentalTimes] = useState({});
  const [activeDate, setActiveDate] = useState(null);
  const [activeWeeklyDay, setActiveWeeklyDay] = useState(null);
  const [newFrom, setNewFrom] = useState("");
  const [newTo, setNewTo] = useState("");

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages((prevImages) => [...prevImages, ...files]);
  };

  const handleAddSpecification = () => {
    setSpecifications([...specifications, { title: "", description: "" }]);
  };

  const handleRemoveSpecification = (index) => {
    const newSpecifications = specifications.filter((_, i) => i !== index);
    setSpecifications(newSpecifications);
  };

  const handleDateChange = (event) => {
    const { value } = event.target;
    setCustomDates((prev) => [...prev, { date: value, times: [] }]);
  };

  const handleRemoveDate = (date) => {
    setCustomDates((prev) => prev.filter((d) => d.date !== date.date));
  };

  const handleRemoveTimeInput = (date, index) => {
    setCustomDates((prev) =>
      prev.map((d) =>
        d.date === date.date
          ? { ...d, times: d.times.filter((_, i) => i !== index) }
          : d
      )
    );
  };

  const handleAddNewTimeSlot = (dateObj) => {
    if (newFrom && newTo) {
      setCustomDates((prev) =>
        prev.map((d) =>
          d.date === dateObj.date
            ? {
                ...d,
                times: [...d.times, { from: newFrom, to: newTo }],
              }
            : d
        )
      );
      setNewFrom("");
      setNewTo("");
    }
  };
  const handleDayChange = (day) => {
    setWeeklyDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleToggleActiveDate = (date) => {
    setActiveDate(activeDate === date ? null : date);
    setActiveWeeklyDay(null);
  };

  const handleToggleActiveWeeklyDay = (day) => {
    setActiveWeeklyDay(activeWeeklyDay === day ? null : day);
  };

  const handleRemoveWeeklyTime = (day, index) => {
    setWeeklyRentalTimes((prev) => ({
      ...prev,
      [day]: {
        times: prev[day].times.filter((_, i) => i !== index),
      },
    }));
  };

  const handleAddWeeklyTime = (day) => {
    if (newFrom && newTo) {
      setWeeklyRentalTimes((prev) => ({
        ...prev,
        [day]: {
          times: [...(prev[day]?.times || []), { from: newFrom, to: newTo }],
        },
      }));
      setNewFrom("");
      setNewTo("");
    }
  };

  return (
    <div className="container-content">
      <h2>Create Post</h2>
      <div className="form-preview">
        <div
          className="image-preview"
          onClick={() => document.getElementById("imageInput").click()}
        >
          {images.length === 0 ? (
            "Click here to add an image."
          ) : (
            <img src={URL.createObjectURL(images[0])} alt="Preview" />
          )}
        </div>
        <input
          type="file"
          id="imageInput"
          style={{ display: "none" }}
          accept="image/*"
          multiple
          onChange={handleImageChange}
        />
        <div className="form-fields">
          <button className="btn btn-rounded thin">CIT</button>
          <input type="text" placeholder="Item Name" className="borderless" />
          <label>Price</label>
          <hr />

          {/* Rental Duration and Dates, etc. */}
          <div className="groupby bg-white">
            <div className="rental-dates">
              <label>Rental Dates</label>
              <div className="date-options">
                <input
                  type="radio"
                  id="custom-dates"
                  name="rentalDates"
                  checked={rentalDatesOption === "custom"}
                  onChange={() => setRentalDatesOption("custom")}
                />
                <label htmlFor="custom-dates">Custom Dates</label>
                <input
                  type="radio"
                  id="weekly"
                  name="rentalDates"
                  checked={rentalDatesOption === "weekly"}
                  onChange={() => setRentalDatesOption("weekly")}
                />
                <label htmlFor="weekly">Weekly</label>
              </div>

              {rentalDatesOption === "custom" && (
                <div className="sub-groupby">
                  <input type="date" onChange={handleDateChange} />
                  <label>Selected Dates:</label>
                  <div className="d-flex">
                    {customDates.map((dateObj, index) => (
                      <div key={index} className="date-entry">
                        <button
                          className="btn btn-rounded thin"
                          onClick={() => handleToggleActiveDate(dateObj.date)}
                        >
                          {dateObj.date}
                        </button>
                        <button
                          className="btn btn-danger"
                          onClick={() => handleRemoveDate(dateObj)}
                        >
                          -
                        </button>
                        {activeDate === dateObj.date && (
                          <div className="d-block">
                            <label>Times:</label>
                            {dateObj.times.map((timeObj, timeIndex) => (
                              <div
                                key={timeIndex}
                                className="time-input d-flex align-items-center"
                              >
                                <span>{`${timeObj.from} - ${timeObj.to}`}</span>
                                <button
                                  className="btn btn-danger ms-2"
                                  onClick={() =>
                                    handleRemoveTimeInput(dateObj, timeIndex)
                                  }
                                >
                                  -
                                </button>
                              </div>
                            ))}
                            <div className="d-flex align-items-center mt-2">
                              <input
                                type="time"
                                placeholder="From"
                                value={newFrom}
                                onChange={(e) => setNewFrom(e.target.value)}
                              />
                              <input
                                type="time"
                                placeholder="To"
                                value={newTo}
                                onChange={(e) => setNewTo(e.target.value)}
                              />
                              <button
                                className="btn btn-primary ms-2"
                                onClick={() => handleAddNewTimeSlot(dateObj)}
                              >
                                +
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {rentalDatesOption === "weekly" && (
                <div className="sub-groupby">
                  <label>Select Days:</label>
                  <div className="day-selector">
                    {["Mon", "Tues", "Wed", "Thurs", "Fri", "Sat", "Sun"].map(
                      (day) => (
                        <span
                          key={day}
                          className={`day ${
                            weeklyDays.includes(day) ? "selected" : ""
                          }`}
                          onClick={() => handleDayChange(day)}
                        >
                          {day}
                        </span>
                      )
                    )}
                  </div>
                  <div className="date-inputs">
                    <label>Start Date</label>
                    <input
                      type="date"
                      value={dateRange.start}
                      onChange={(e) =>
                        setDateRange({ ...dateRange, start: e.target.value })
                      }
                      className="date-input"
                    />
                    <label>End Date</label>
                    <input
                      type="date"
                      value={dateRange.end}
                      onChange={(e) =>
                        setDateRange({ ...dateRange, end: e.target.value })
                      }
                      className="date-input"
                    />
                  </div>
                  <div>
                    <label>Selected Dates:</label>
                    <ul>
                      {weeklyDays.map((day) => {
                        const startDate = new Date(dateRange.start);
                        const dayIndex = [
                          "Mon",
                          "Tues",
                          "Wed",
                          "Thurs",
                          "Fri",
                          "Sat",
                          "Sun",
                        ].indexOf(day);
                        const dates = [];
                        for (
                          let d = startDate;
                          d <= new Date(dateRange.end);
                          d.setDate(d.getDate() + 1)
                        ) {
                          if (d.getDay() === (dayIndex + 1) % 7) {
                            dates.push(d.toISOString().split("T")[0]);
                          }
                        }
                        const combinedDates = dates.join(", ");
                        return (
                          combinedDates.length > 0 && (
                            <li key={day}>
                              <button
                                className="btn btn-rounded thin"
                                onClick={() => handleToggleActiveWeeklyDay(day)}
                              >
                                {combinedDates} ({day})
                              </button>
                              {activeWeeklyDay === day && (
                                <div className="d-block">
                                  <label>Times:</label>
                                  {weeklyRentalTimes[day]?.times?.map(
                                    (timeObj, timeIndex) => (
                                      <div
                                        key={timeIndex}
                                        className="time-input d-flex align-items-center"
                                      >
                                        <span>{`${timeObj.from} - ${timeObj.to}`}</span>
                                        <button
                                          className="btn btn-danger ms-2"
                                          onClick={() =>
                                            handleRemoveWeeklyTime(
                                              day,
                                              timeIndex
                                            )
                                          }
                                        >
                                          -
                                        </button>
                                      </div>
                                    )
                                  )}
                                  <div className="d-flex align-items-center mt-2">
                                    <input
                                      type="time"
                                      placeholder="From"
                                      value={newFrom}
                                      onChange={(e) =>
                                        setNewFrom(e.target.value)
                                      }
                                      className="no-border"
                                    />
                                    <input
                                      type="time"
                                      placeholder="To"
                                      value={newTo}
                                      onChange={(e) => setNewTo(e.target.value)}
                                      className="no-border"
                                    />
                                    <button
                                      className="btn btn-primary ms-2"
                                      onClick={() => handleAddWeeklyTime(day)}
                                    >
                                      +
                                    </button>
                                  </div>
                                </div>
                              )}
                            </li>
                          )
                        );
                      })}
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* Delivery Options */}
            <div className="groupby">
              <label>Delivery</label>
              <div className="delivery-options">
                <label>
                  <input
                    type="radio"
                    name="delivery"
                    value="pickup"
                    checked={deliveryMethod === "pickup"}
                    onChange={() => setDeliveryMethod("pickup")}
                  />
                  Pickup
                </label>
                <label>
                  <input
                    type="radio"
                    name="delivery"
                    value="meetup"
                    checked={deliveryMethod === "meetup"}
                    onChange={() => setDeliveryMethod("meetup")}
                  />
                  Meetup
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="user-info mt-5 bg-white">
        <div className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            <img src={""} alt="Profile" className="profile-pic me-2" />
            <div>
              <a href={``} className="text-dark small text-decoration-none">
                {}
              </a>
            </div>
          </div>
          <div className="rating">
            <span>Rating:</span>
            {"★"}
            {"☆"}
          </div>
          <button className="btn btn-rectangle secondary me-2">
            View Listings
          </button>
          <button className="btn btn-rectangle secondary me-2">
            View Profile
          </button>
        </div>
      </div>

      <div className="item-specifications bg-white">
        <label>Specifications</label>
        <hr />
        <div>
          {specifications.map((spec, index) => (
            <div key={index} className="specification">
              <input
                type="text"
                placeholder="Title"
                className="spec-title"
                value={spec.title}
                onChange={(e) =>
                  setSpecifications(
                    specifications.map((s, i) =>
                      i === index ? { ...s, title: e.target.value } : s
                    )
                  )
                }
              />
              <textarea
                placeholder="Item Description"
                className="item-specs-description"
                value={spec.description}
                onChange={(e) =>
                  setSpecifications(
                    specifications.map((s, i) =>
                      i === index ? { ...s, description: e.target.value } : s
                    )
                  )
                }
              />
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => handleRemoveSpecification(index)}
              >
                -
              </button>
            </div>
          ))}
        </div>
        <button className="btn btn-primary" onClick={handleAddSpecification}>
          +
        </button>
        <hr />
        <label>Item Description</label>
        <hr />
        <textarea placeholder="Item Description" className="item-description" />
      </div>
    </div>
  );
};

export default PostForm;
