// components
import NavBar from "../../../components/navbar/navbar/NavBar";
import Footer from "../../../components/footer/Footer";
// modules
import React, { useState } from "react";
import { parseISO, eachWeekOfInterval, format, addDays } from "date-fns";
// style
import "./postFormStyles.css";

const PostForm = () => {
  const [images, setImages] = useState([]);
  const [rentalDurations, setRentalDurations] = useState([
    { from: "", fromTime: "", to: "", toTime: "" },
  ]);
  const [rentalRate, setRentalRate] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [specifications, setSpecifications] = useState([
    { title: "", description: "" },
  ]);

  const [rentalDatesOption, setRentalDatesOption] = useState("custom");
  const [customDates, setCustomDates] = useState([]);
  const [weeklyDays, setWeeklyDays] = useState([]);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

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
    setCustomDates((prev) => [...prev, value]);
  };

  const handleRemoveDate = (date) => {
    setCustomDates((prev) => prev.filter((d) => d !== date));
  };

  const handleDayChange = (day) => {
    setWeeklyDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  return (
    <>
      <div className="form-container custom-container">
        <h2>Create new post</h2>
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
            <input type="text" placeholder="Item Name" className="borderless" />
            <hr />
            <div className="buttons">
              <button className="btn btn-two" data="Message"></button>
              <button className="btn btn-one">Borrow</button>
            </div>
            <div className="groupby">
              <div className="rental-duration">
                <label>Rental Duration</label>
                {rentalDurations.map((duration, index) => (
                  <div className="time-inputs" key={index}>
                    <label>From</label>
                    <input
                      type="time"
                      value={duration.fromTime}
                      className="time-input"
                      onChange={(e) => {
                        const newDurations = [...rentalDurations];
                        newDurations[index].fromTime = e.target.value;
                        setRentalDurations(newDurations);
                      }}
                    />
                    <label>to</label>
                    <input
                      type="time"
                      value={duration.toTime}
                      className="time-input"
                      onChange={(e) => {
                        const newDurations = [...rentalDurations];
                        newDurations[index].toTime = e.target.value;
                        setRentalDurations(newDurations);
                      }}
                    />
                    <button
                      className="btn btn-danger"
                      onClick={() => {
                        const newDurations = rentalDurations.filter(
                          (_, i) => i !== index
                        );
                        setRentalDurations(newDurations);
                      }}
                    >
                      -
                    </button>
                  </div>
                ))}

                <button
                  className="btn btn-primary"
                  onClick={() =>
                    setRentalDurations([
                      ...rentalDurations,
                      { from: "", fromTime: "", to: "", toTime: "" },
                    ])
                  }
                >
                  +
                </button>
              </div>

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
                    <div>
                      <label>Selected Dates:</label>
                      {customDates.map((date, index) => (
                        <div key={index}>
                          {date}
                          <button
                            className="btn btn-danger"
                            onClick={() => handleRemoveDate(date)}
                          >
                            -
                          </button>
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

                          return dates.map((date) => (
                            <li key={date}>{date}</li>
                          ));
                        })}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="terms-checkbox">
              <input
                type="checkbox"
                id="terms"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
              />
              <label htmlFor="terms">
                I agree on rental terms set by the owner.
              </label>
            </div>
          </div>
        </div>
        <div className="profile">
          <div className="profile-name">Ebe Dencel</div>
          <div className="rating">Rating: ⭐⭐⭐⭐⭐</div>
          <button className="btn btn-two" data="View Listings"></button>
          <button className="btn btn-two" data="View Profile"></button>
        </div>
        <div className="item-specifications">
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
                  type="button" // Prevents form submission
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
          <textarea
            placeholder="Item Description"
            className="item-description"
          />
        </div>
      </div>
    </>
  );
};

export default PostForm;
