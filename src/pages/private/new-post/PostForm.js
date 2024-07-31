// components
import NavBar from "../../../components/navbar/navbar/NavBar";
import Footer from "../../../components/footer/Footer";
// modules
import React, { useState } from "react";
import { parseISO, eachWeekOfInterval, format, addDays } from "date-fns";
// style
import "./style.css";

const PostForm = () => {
  const [activeTab, setActiveTab] = useState("item-details");
  const [specifications, setSpecifications] = useState([
    { title: "", description: "" },
  ]);
  const [images, setImages] = useState([]);
  const [rentalDurations, setRentalDurations] = useState([
    { from: "", fromTime: "", to: "", toTime: "" },
  ]);
  const [rentalDatesOption, setRentalDatesOption] = useState("");
  const [dates, setDates] = useState([]);
  const [customDateInput, setCustomDateInput] = useState("");
  const [customDates, setCustomDates] = useState([]);
  const [weeklyDay, setWeeklyDay] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleAddSpecification = () => {
    setSpecifications([...specifications, { title: "", description: "" }]);
  };

  const handleRemoveSpecification = (index) => {
    const newSpecifications = specifications.filter((_, i) => i !== index);
    setSpecifications(newSpecifications);
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages((prevImages) => [...prevImages, ...files]);
  };

  const handleAddDuration = () => {
    setRentalDurations([
      ...rentalDurations,
      { from: "", fromTime: "", to: "", toTime: "" },
    ]);
  };

  const handleRemoveDuration = (index) => {
    const newDurations = rentalDurations.filter((_, i) => i !== index);
    setRentalDurations(newDurations);
  };
  const handleAddDate = () => {
    if (rentalDatesOption === "custom" && customDateInput) {
      setDates([...dates, customDateInput]);
      setCustomDateInput("");
    } else if (
      rentalDatesOption === "weekly" &&
      weeklyDay &&
      startDate &&
      endDate
    ) {
      const start = parseISO(startDate);
      const end = parseISO(endDate);
      const dayOfWeek = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ].indexOf(weeklyDay);
      const weeks = eachWeekOfInterval({ start, end });

      const weeklyDates = [];
      weeks.forEach((weekStart) => {
        const date = addDays(weekStart, dayOfWeek);
        if (date >= start && date <= end) {
          weeklyDates.push(format(date, "yyyy-MM-dd"));
        }
      });

      setDates([...dates, ...weeklyDates]);
      setWeeklyDay("");
      setStartDate("");
      setEndDate("");
    }
  };

  const handleRemoveDate = (index) => {
    const updatedDates = dates.filter((_, i) => i !== index);
    setDates(updatedDates);
  };

  return (
    <>
      <NavBar />
      <div className="form-container custom-container">
        <div className="sidebar">
          <div
            className={`sidebar-item ${
              activeTab === "item-details" ? "active" : ""
            }`}
            onClick={() => setActiveTab("item-details")}
          >
            Item Details
          </div>
          <div
            className={`sidebar-item ${
              activeTab === "rental-details" ? "active" : ""
            }`}
            onClick={() => setActiveTab("rental-details")}
          >
            Rental Details
          </div>
          <div
            className={`sidebar-item ${
              activeTab === "post-status" ? "active" : ""
            }`}
            onClick={() => setActiveTab("post-status")}
          >
            Post Status
          </div>
        </div>
        <div className="form-content">
          {activeTab === "item-details" && (
            <div className="item-details d-flex justify-content-between">
              <div className="me-5">
                <div className="form-group">
                  <label htmlFor="item-name">Item Name</label>
                  <input
                    type="text"
                    id="item-name"
                    placeholder="Example Input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="description">Description</label>
                  <input
                    type="text"
                    id="description"
                    placeholder="Example Input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="specification">Specification</label>
                  {specifications.map((spec, index) => (
                    <div key={index} className="specification-group">
                      <input
                        type="text"
                        value={spec.title}
                        onChange={(e) => {
                          const newSpecifications = [...specifications];
                          newSpecifications[index].title = e.target.value;
                          setSpecifications(newSpecifications);
                        }}
                        placeholder="Title"
                        required
                      />
                      <input
                        type="text"
                        value={spec.description}
                        onChange={(e) => {
                          const newSpecifications = [...specifications];
                          newSpecifications[index].description = e.target.value;
                          setSpecifications(newSpecifications);
                        }}
                        placeholder="Description"
                        required
                      />
                      <button
                        type="button"
                        className="remove-spec"
                        onClick={() => handleRemoveSpecification(index)}
                      >
                        -
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="add-spec"
                    onClick={handleAddSpecification}
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="form-group w-50">
                <label htmlFor="item-image">Item Image</label>
                <div className="d-flex">
                  <input
                    placeholder="Upload Image"
                    className="upload-image"
                    type="file"
                    id="item-image"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    required
                  />
                  <div className="image-preview">
                    {images.length > 0 &&
                      images.map((image, index) => (
                        <div key={index} className="image-placeholder">
                          <img
                            src={URL.createObjectURL(image)}
                            alt={`preview ${index}`}
                          />
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          )}
          {activeTab === "rental-details" && (
            <div className="rental-details">
              <div className="form-group">
                <label htmlFor="rental-duration">Rental Duration</label>
                {rentalDurations.map((duration, index) => (
                  <div className="duration-group mb-1">
                    <div className="input-border left">From</div>
                    <input
                      type="time"
                      placeholder="Time"
                      className="input-border center"
                      value={duration.fromTime}
                      onChange={(e) => {
                        const newDurations = [...rentalDurations];
                        newDurations[index].fromTime = e.target.value;
                        setRentalDurations(newDurations);
                      }}
                      required
                    />
                    <div className="input-border center">To</div>
                    <input
                      type="time"
                      placeholder="Time"
                      className="input-border right"
                      value={duration.toTime}
                      onChange={(e) => {
                        const newDurations = [...rentalDurations];
                        newDurations[index].toTime = e.target.value;
                        setRentalDurations(newDurations);
                      }}
                      required
                    />
                    <button
                      className="add-duration"
                      onClick={() => handleRemoveDuration(index)}
                    >
                      -
                    </button>
                  </div>
                ))}
                <button className="add-duration" onClick={handleAddDuration}>
                  +
                </button>
              </div>
              <div className="form-group">
                <label htmlFor="rental-dates">Rental Dates</label>
                <div className="dates-group">
                  <label>
                    <input
                      type="radio"
                      name="rental-dates"
                      value="custom"
                      checked={rentalDatesOption === "custom"}
                      onChange={() => setRentalDatesOption("custom")}
                    />
                    Custom Dates
                  </label>
                  {rentalDatesOption === "custom" && (
                    <>
                      <input
                        type="date"
                        className="input-border"
                        value={customDateInput}
                        onChange={(e) => setCustomDateInput(e.target.value)}
                      />
                      <button
                        type="button"
                        className="add-date"
                        onClick={handleAddDate}
                      >
                        +
                      </button>
                    </>
                  )}
                  <label>
                    <input
                      type="radio"
                      name="rental-dates"
                      value="weekly"
                      checked={rentalDatesOption === "weekly"}
                      onChange={() => setRentalDatesOption("weekly")}
                    />
                    Weekly
                  </label>
                  {rentalDatesOption === "weekly" && (
                    <>
                      <select
                        value={weeklyDay}
                        className="input-border"
                        onChange={(e) => setWeeklyDay(e.target.value)}
                      >
                        <option value="">Select Day</option>
                        <option value="Monday">Monday</option>
                        <option value="Tuesday">Tuesday</option>
                        <option value="Wednesday">Wednesday</option>
                        <option value="Thursday">Thursday</option>
                        <option value="Friday">Friday</option>
                        <option value="Saturday">Saturday</option>
                        <option value="Sunday">Sunday</option>
                      </select>
                      <input
                        type="date"
                        className="input-border"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                      />
                      <input
                        type="date"
                        className="input-border"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                      />
                      <button
                        type="button"
                        className="add-date"
                        onClick={handleAddDate}
                      >
                        +
                      </button>
                    </>
                  )}
                </div>
                <div className="dates-list">
                  <h6>Selected Dates:</h6>
                  <ul>
                    {dates.map((date, index) => (
                      <li key={index}>
                        {date}
                        <button
                          type="button"
                          className="add-date"
                          onClick={() => handleRemoveDate(index)}
                        >
                          -
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default PostForm;
