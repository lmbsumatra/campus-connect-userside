// components
import NavBar from "../../../src/components/navbar/navbar/NavBar";
import Footer from "../../../src/components/footer/Footer";
// modules
import React, { useState } from "react";
// style
import "./style.css";

const AddItem = () => {
  const [images, setImages] = useState([]);
  const [rentalDurations, setRentalDurations] = useState([
    { from: "", fromTime: "", to: "", toTime: "" },
  ]);
  const [rentalRate, setRentalRate] = useState("");
  const [lateCharges, setLateCharges] = useState("");
  const [securityDeposit, setSecurityDeposit] = useState("");
  const [repairReplacement, setRepairReplacement] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState("pickup");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [specifications, setSpecifications] = useState([
    { title: "", description: "" },
  ]);

  const [rentalDatesOption, setRentalDatesOption] = useState("custom");
  const [customDates, setCustomDates] = useState([]);
  const [weeklyDays, setWeeklyDays] = useState([]);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleGroup = () => setIsExpanded(!isExpanded);

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
      <NavBar />
      <div className="form-container custom-container">
        <h2>Add item</h2>
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
            <label>Price</label>
            <hr />
            {/* Rental Duration and Dates, etc. */}
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
                    <label>Selected Dates:</label>
                    <div>
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

            {/* Rental Rate Section */}
            <div className="groupby  ">
              <label>Rental Rate (per hour)</label>
              <input
                type="text"
                value={rentalRate}
                onChange={(e) => setRentalRate(e.target.value)}
                placeholder="Add your price here per hour"
              />
            </div>

            {/* Late Charges Section
            <div className="groupby  ">
              <label>Late Charges</label>
              <input
                type="text"
                value={lateCharges}
                onChange={(e) => setLateCharges(e.target.value)}
                placeholder="Add if applicable"
              />
            </div>

            Security Deposit Section
            <div className="groupby  ">
              <label>Security Deposit</label>
              <input
                type="text"
                value={securityDeposit}
                onChange={(e) => setSecurityDeposit(e.target.value)}
                placeholder="Add if applicable"
              />
            </div>

            Repair and Replacement Section
            <div className="groupby  ">
              <label>Repair and Replacement</label>
              <input
                type="text"
                value={repairReplacement}
                onChange={(e) => setRepairReplacement(e.target.value)}
                placeholder="Add if applicable"
              />
            </div> */}

            {/* Delivery Options */}
            <div className="groupby  ">
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

            <div className="groupby">
  <div onClick={toggleGroup} style={{ cursor: "pointer" }}>
    {isExpanded ? "v Hide Optional Fees" : "> Show Optional Fees"}
  </div>
  <div className={`optional-fees ${isExpanded ? 'expanded' : ''}`}>
    <div>
      <label>Late Charges</label>
      <input
        type="text"
        value={lateCharges}
        onChange={(e) => setLateCharges(e.target.value)}
        placeholder="Add if applicable"
      />
    </div>
    <div>
      <label>Security Deposit</label>
      <input
        type="text"
        value={securityDeposit}
        onChange={(e) => setSecurityDeposit(e.target.value)}
        placeholder="Add if applicable"
      />
    </div>
    <div>
      <label>Repair and Replacement</label>
      <input
        type="text"
        value={repairReplacement}
        onChange={(e) => setRepairReplacement(e.target.value)}
        placeholder="Add if applicable"
      />
    </div>
  </div>
</div>


            {/* Agreement to Terms */}
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

      <Footer />
    </>
  );
};

export default AddItem;
