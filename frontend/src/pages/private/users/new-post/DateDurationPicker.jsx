import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./dateTimePickerStyles.css";

const DateDurationPicker = () => {
  const [dates, setDates] = useState([]); 
  const [unavailableDates, setUnavailableDates] = useState([
    new Date(2024, 11, 25), // Christmas (Dec 25, 2024)
    new Date(2024, 0, 1), // New Year's Day (Jan 1, 2024)
  ]); // Holidays
  const [showModal, setShowModal] = useState(true); 
  const [selectedDate, setSelectedDate] = useState(null);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [applyToAll, setApplyToAll] = useState(false); 

  // Range & Weekly options
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [weekdays, setWeekdays] = useState([]);
  const [mode, setMode] = useState("custom"); 

  const handleModalClose = () => setShowModal(false);
  const handleAddTimePeriod = () => {
    if (!startTime || !endTime) {
      alert("Please select both start and end times");
      return;
    }

    const newTimePeriod = { startTime, endTime };

    if (applyToAll) {
      const updatedDates = dates.map((d) => ({
        ...d,
        timePeriods: [...d.timePeriods, newTimePeriod],
      }));
      setDates(updatedDates);
    } else {
      const updatedDates = dates.map((d) =>
        d.date.getTime() === selectedDate.getTime()
          ? { ...d, timePeriods: [...d.timePeriods, newTimePeriod] }
          : d
      );
      setDates(updatedDates);
    }

    setStartTime("");
    setEndTime("");
    setApplyToAll(false); // Reset checkbox
  };

  const handleAddCustomDate = (date) => {
    if (dates.some((d) => d.date.getTime() === date.getTime())) {
      alert("This date is already added.");
      return;
    }
    setDates([...dates, { date, timePeriods: [] }]);
    setSelectedDate(null); 
  };

  const handleAddRange = (startDate, endDate) => {
    if (!startDate || !endDate) {
      alert("Please select both a start and an end date for the range.");
      return;
    }

    const rangeDates = [];
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      if (
        !unavailableDates.some((d) => d.getTime() === currentDate.getTime()) &&
        !isSelected(currentDate)
      ) {
        rangeDates.push(new Date(currentDate));
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    if (rangeDates.length === 0) {
      alert("No valid dates available in the range.");
      return;
    }

    const newDates = rangeDates.map((date) => ({ date, timePeriods: [] }));
    setDates([...dates, ...newDates]);
  };

  const handleAddWeekly = (startDate, endDate) => {
    if (!startDate || !endDate || weekdays.length === 0) {
      alert("Please select a start date, end date, and at least one weekday.");
      return;
    }

    const weeklyDates = [];
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      if (
        weekdays.includes(currentDate.getDay()) &&
        !unavailableDates.some((d) => d.getTime() === currentDate.getTime()) &&
        !isSelected(currentDate)
      ) {
        weeklyDates.push(new Date(currentDate));
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    if (weeklyDates.length === 0) {
      alert("No valid weekly dates available.");
      return;
    }

    const newDates = weeklyDates.map((date) => ({ date, timePeriods: [] }));
    setDates([...dates, ...newDates]);
  };

  const handleRemoveDate = (date) => {
    setDates(dates.filter((d) => d.date.getTime() !== date.getTime()));
  };

  const toggleWeekday = (day) => {
    setWeekdays(
      weekdays.includes(day)
        ? weekdays.filter((d) => d !== day)
        : [...weekdays, day]
    );
  };

  const isSelected = (date) => {
    return dates.some((d) => d.date.getTime() === date.getTime());
  };

  const resetDates = () => {
    setDates([]);
    setStartDate(null);
    setEndDate(null);
    setWeekdays([]);
  };

  const resetTime = (date) => {
    const updatedDates = dates.map((d) =>
      d.date.getTime() === date.getTime()
        ? { ...d, timePeriods: [] } 
        : d
    );
    setDates(updatedDates);
  };

  return (
    <Modal show={showModal} onHide={handleModalClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Select Dates and Time</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="d-flex">
          {/* Left - Calendar Section */}
          <div className="calendar-container" style={{ flex: 1 }}>
            {/* Radio Buttons for Mode Selection */}
            <Form.Group>
              <Form.Label>Select Mode</Form.Label>
              <div>
                <Form.Check
                  type="radio"
                  label="Custom Dates"
                  name="mode"
                  checked={mode === "custom"}
                  onChange={() => {
                    setMode("custom");
                    resetDates();
                  }}
                />
                <Form.Check
                  type="radio"
                  label="Range"
                  name="mode"
                  checked={mode === "range"}
                  onChange={() => {
                    setMode("range");
                    resetDates();
                  }}
                />
                <Form.Check
                  type="radio"
                  label="Weekly"
                  name="mode"
                  checked={mode === "weekly"}
                  onChange={() => {
                    setMode("weekly");
                    resetDates();
                  }}
                />
              </div>
            </Form.Group>
            {mode === "custom" && (
              <div>
                <h4>Select Custom Dates</h4>
                <DatePicker
                  selected={selectedDate}
                  onChange={(date) => handleAddCustomDate(date)}
                  inline
                  excludeDates={unavailableDates}
                  dayClassName={(date) => {
                    if (
                      unavailableDates.some(
                        (d) => d.getTime() === date.getTime()
                      )
                    )
                      return "unavailable-date";
                    if (isSelected(date)) return "selected-date";
                    return "available-date";
                  }}
                />
              </div>
            )}

            {mode === "range" && (
              <div>
                <h4>Select Date Range</h4>
                <DatePicker
                  selected={startDate}
                  onChange={(dates) => {
                    setStartDate(dates[0]);
                    setEndDate(dates[1]);
                  }}
                  selectsRange
                  startDate={startDate}
                  endDate={endDate}
                  inline
                  excludeDates={unavailableDates}
                  className="form-control"
                />
                <Button
                  variant="primary"
                  onClick={() => handleAddRange(startDate, endDate)}
                >
                  Add Range
                </Button>
              </div>
            )}

            {mode === "weekly" && (
              <div>
                <h4>Select Weekly Dates</h4>
                <DatePicker
                  selected={startDate}
                  onChange={(dates) => {
                    setStartDate(dates[0]);
                    setEndDate(dates[1]);
                  }}
                  selectsRange
                  startDate={startDate}
                  endDate={endDate}
                  inline
                  excludeDates={unavailableDates}
                  className="form-control"
                />
                <Form.Group>
                  <Form.Label>Select Weekdays</Form.Label>
                  <div className="d-flex flex-wrap">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                      (day, index) => (
                        <Form.Check
                          key={index}
                          label={day}
                          type="checkbox"
                          checked={weekdays.includes(index)}
                          onChange={() => toggleWeekday(index)}
                        />
                      )
                    )}
                  </div>
                </Form.Group>
                <Button
                  variant="primary"
                  onClick={() => handleAddWeekly(startDate, endDate)}
                >
                  Add Weekly Dates
                </Button>
              </div>
            )}
          </div>

          {/* Right - Time Selection */}
          <div
            className="time-container"
            style={{ flex: 1, marginLeft: "20px" }}
          >
            <h3>Your Selected Dates and Durations</h3>
            {dates.length === 0 ? (
              <p>No dates added yet.</p>
            ) : (
              dates.map((dateItem) => (
                <div key={dateItem.date} className="date-item">
                  <h5>{dateItem.date.toDateString()}</h5>
                  {dateItem.timePeriods.length === 0 ? (
                    <p>No durations added for this date.</p>
                  ) : (
                    dateItem.timePeriods.map((period, index) => (
                      <p key={index}>
                        Start: {period.startTime} | End: {period.endTime}
                      </p>
                    ))
                  )}
                  <button
                    onClick={() => {
                      setSelectedDate(dateItem.date);
                    }}
                    className="btn btn-primary"
                  >
                    Add Duration
                  </button>
                  <button
                    onClick={() => handleRemoveDate(dateItem.date)}
                    className="btn btn-danger"
                  >
                    Remove Date
                  </button>
                  <button
                    onClick={() => resetTime(dateItem.date)}
                    className="btn btn-warning"
                  >
                    Reset Time
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Time Duration Modal */}
        {selectedDate && (
          <Modal show={true} onHide={() => setSelectedDate(null)}>
            <Modal.Header closeButton>
              <Modal.Title>Add Time Duration</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form>
                <Form.Group controlId="start-time">
                  <Form.Label>Start Time</Form.Label>
                  <Form.Control
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  />
                </Form.Group>

                <Form.Group controlId="end-time">
                  <Form.Label>End Time</Form.Label>
                  <Form.Control
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                  />
                </Form.Group>

                {/* Checkbox to apply time to all dates */}
                <Form.Group>
                  <Form.Check
                    type="checkbox"
                    label="Apply this time to all selected dates"
                    checked={applyToAll}
                    onChange={() => setApplyToAll(!applyToAll)}
                  />
                </Form.Group>
              </Form>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setSelectedDate(null)}>
                Close
              </Button>
              <Button variant="primary" onClick={handleAddTimePeriod}>
                Add Duration
              </Button>
            </Modal.Footer>
          </Modal>
        )}

        {/* Reset All Dates Button */}
        <Button variant="danger" onClick={resetDates} className="mt-3">
          Reset All Dates
        </Button>
      </Modal.Body>
    </Modal>
  );
};

export default DateDurationPicker;
