import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./dateTimePickerStyles.css";
import Tooltip from "@mui/material/Tooltip";
import { updateAvailableDates } from "../../../../redux/item-form/itemFormSlice";
import { useDispatch } from "react-redux";

const ModeSelector = ({ mode, setMode, resetDates }) => (
  <div className="field-container select">
    <label>Select Mode</label>
    <div className="input-wrapper">
      {["custom", "range", "weekly"].map((value) => (
        <div key={value} className="input-wrapper">
          <input
            type="radio"
            id={value}
            name="mode"
            checked={mode === value}
            onChange={() => {
              setMode(value);
              resetDates();
            }}
          />
          <label htmlFor={value}>
            {value.charAt(0).toUpperCase() + value.slice(1)} Dates
          </label>
        </div>
      ))}
    </div>
  </div>
);

const WeekdaySelector = ({ weekdays, toggleWeekday }) => (
  <div>
    <label>Select Weekdays</label>
    <div className="d-flex flex-wrap">
      {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, index) => (
        <Form.Check
          key={index}
          label={day}
          type="checkbox"
          checked={weekdays.includes(index)}
          onChange={() => toggleWeekday(index)}
        />
      ))}
    </div>
  </div>
);

const TimeDurationModal = ({
  selectedDate,
  startTime,
  endTime,
  applyToAll,
  onClose,
  onSave,
  onTimeChange,
  onApplyAllChange,
}) => (
  <Modal show={true} onHide={onClose}>
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
            onChange={(e) => onTimeChange("startTime", e.target.value)}
          />
        </Form.Group>
        <Form.Group controlId="end-time">
          <Form.Label>End Time</Form.Label>
          <Form.Control
            type="time"
            value={endTime}
            onChange={(e) => onTimeChange("endTime", e.target.value)}
          />
        </Form.Group>
        <Form.Group>
          <Form.Check
            type="checkbox"
            label="Apply this time to all selected dates"
            checked={applyToAll}
            onChange={onApplyAllChange}
          />
        </Form.Group>
      </Form>
    </Modal.Body>
    <Modal.Footer>
      <Button variant="secondary" onClick={onClose}>
        Close
      </Button>
      <Button variant="primary" onClick={onSave}>
        Add Duration
      </Button>
    </Modal.Footer>
  </Modal>
);

const DateDurationPicker = ({
  show,
  onClose,
  onSaveDatesDurations,
  unavailableDates,
}) => {
  // State management
  const [dates, setDates] = useState([]);
  const [mode, setMode] = useState("custom");
  const [selectedDate, setSelectedDate] = useState(null);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [applyToAll, setApplyToAll] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [weekdays, setWeekdays] = useState([]);
  const dispatch = useDispatch();
  // Helper functions
  const isSelected = (date) =>
    dates.some((d) => d.date.getTime() === date.getTime());

  const handleTimeChange = (field, value) => {
    if (field === "startTime") setStartTime(value);
    if (field === "endTime") setEndTime(value);
  };

  // Date handling functions
  const handleAddCustomDate = (date) => {
    if (isSelected(date)) {
      alert("This date is already added.");
      return;
    }
    setDates([...dates, { date, timePeriods: [] }]);
  };

  const handleAddRange = () => {
    if (!startDate || !endDate) {
      alert("Please select both start and end dates.");
      return;
    }

    const newDates = [];
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      if (
        !unavailableDates.some((d) => d.getTime() === currentDate.getTime()) &&
        !isSelected(currentDate)
      ) {
        newDates.push({ date: new Date(currentDate), timePeriods: [] });
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    if (newDates.length === 0) {
      alert("No valid dates available in the range.");
      return;
    }

    setDates([...dates, ...newDates]);
  };

  const handleAddWeekly = () => {
    if (!startDate || !endDate || weekdays.length === 0) {
      alert("Please select dates and at least one weekday.");
      return;
    }

    const newDates = [];
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      if (
        weekdays.includes(currentDate.getDay()) &&
        !unavailableDates.some((d) => d.getTime() === currentDate.getTime()) &&
        !isSelected(currentDate)
      ) {
        newDates.push({ date: new Date(currentDate), timePeriods: [] });
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    if (newDates.length === 0) {
      alert("No valid weekly dates available.");
      return;
    }

    setDates([...dates, ...newDates]);
  };

  // Time period handling
  const handleAddTimePeriod = () => {
    if (!startTime || !endTime) {
      alert("Please select both start and end times");
      return;
    }

    const newTimePeriod = {
      startTime,
      endTime,
    };

    const updatedDates = dates.map((d) => {
      if (applyToAll || d.date.getTime() === selectedDate.getTime()) {
        return { ...d, timePeriods: [...d.timePeriods, newTimePeriod] };
      }
      return d;
    });

    setDates(updatedDates);
    setStartTime("");
    setEndTime("");
    setApplyToAll(false);
    setSelectedDate(null);
  };

  // Reset functions
  const resetDates = () => {
    setDates([]);
    setStartDate(null);
    setEndDate(null);
    setWeekdays([]);
  };

  const resetTime = (date) => {
    setDates(
      dates.map((d) =>
        d.date.getTime() === date.getTime() ? { ...d, timePeriods: [] } : d
      )
    );
  };

  const handleSaveAndClose = () => {
    onSaveDatesDurations(dates);
    dispatch(updateAvailableDates(dates));
    onClose();
  };

  return (
    <Modal show={show} onHide={handleSaveAndClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Select Dates and Time</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="d-flex">
          <div className="calendar-container" style={{ flex: 1 }}>
            <ModeSelector
              mode={mode}
              setMode={setMode}
              resetDates={resetDates}
            />

            {mode === "custom" && (
              <div className="field-container picker">
                <label>Select Custom Dates</label>
                <DatePicker
                  selected={null}
                  onChange={handleAddCustomDate}
                  inline
                  excludeDates={unavailableDates}
                  dayClassName={(date) =>
                    unavailableDates.some((d) => d.getTime() === date.getTime())
                      ? "unavailable-date"
                      : isSelected(date)
                      ? "selected-date"
                      : "available-date"
                  }
                  renderDayContents={(day, date) => {
                    const isUnavailable = unavailableDates.some(
                      (d) => d.getTime() === date.getTime()
                    );
                    return (
                      <Tooltip
                        title={isUnavailable ? "This date is unavailable" : ""}
                        arrow
                        disableHoverListener={!isUnavailable}
                      >
                        <span>{day}</span>
                      </Tooltip>
                    );
                  }}
                />
              </div>
            )}

            {mode === "range" && (
              <div className="field-container picker">
                <label>Select Date Range</label>
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
                />
                <Button variant="primary" onClick={handleAddRange}>
                  Add Range
                </Button>
              </div>
            )}

            {mode === "weekly" && (
              <div className="field-container picker">
                <label>Select Weekly Dates</label>
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
                />
                <WeekdaySelector
                  weekdays={weekdays}
                  toggleWeekday={(day) =>
                    setWeekdays((prev) =>
                      prev.includes(day)
                        ? prev.filter((d) => d !== day)
                        : [...prev, day]
                    )
                  }
                />
                <Button variant="primary" onClick={handleAddWeekly}>
                  Add Weekly Dates
                </Button>
              </div>
            )}
          </div>

          <div
            className="time-container"
            style={{ flex: 1, marginLeft: "20px" }}
          >
            <h3>Your Selected Dates and Durations</h3>
            {dates.length === 0 ? (
              <p>No dates added yet.</p>
            ) : (
              dates.map((dateItem) => (
                <div key={dateItem.date.getTime()} className="date-item">
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
                  <div className="button-group">
                    <Button
                      variant="primary"
                      onClick={() => setSelectedDate(dateItem.date)}
                    >
                      Add Duration
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() =>
                        setDates(dates.filter((d) => d.date !== dateItem.date))
                      }
                    >
                      Remove Date
                    </Button>
                    <Button
                      variant="warning"
                      onClick={() => resetTime(dateItem.date)}
                    >
                      Reset Time
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {selectedDate && (
          <TimeDurationModal
            selectedDate={selectedDate}
            startTime={startTime}
            endTime={endTime}
            applyToAll={applyToAll}
            onClose={() => setSelectedDate(null)}
            onSave={handleAddTimePeriod}
            onTimeChange={handleTimeChange}
            onApplyAllChange={() => setApplyToAll(!applyToAll)}
          />
        )}

        <Button variant="danger" onClick={resetDates} className="mt-3">
          Reset All Dates
        </Button>
      </Modal.Body>
    </Modal>
  );
};

export default DateDurationPicker;
