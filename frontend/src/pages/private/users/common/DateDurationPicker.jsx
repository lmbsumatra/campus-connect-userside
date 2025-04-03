import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./dateTimePickerStyles.css";
import Tooltip from "@mui/material/Tooltip";

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
  timeFrom,
  timeTo,
  applyToAll,
  onClose,
  onSave,
  onTimeChange,
  onApplyAllChange,
}) => {
  const [error, setError] = useState("");
  return (
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
              value={timeFrom}
              onChange={(e) => onTimeChange("timeFrom", e.target.value)}
            />
          </Form.Group>
          <Form.Group controlId="end-time">
            <Form.Label>End Time</Form.Label>
            <Form.Control
              type="time"
              value={timeTo}
              onChange={(e) => onTimeChange("timeTo", e.target.value)}
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
          {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
        <Button
          variant="primary"
          onClick={() => {
            const start = new Date(`1970-01-01T${timeFrom}:00`);
            const end = new Date(`1970-01-01T${timeTo}:00`);
            const diff = (end - start) / (1000 * 60); // Convert milliseconds to minutes

            if (diff < 60) {
              setError("Duration must be at least 1 hour");
            } else {
              setError(""); // Clear error
              onSave();
            }
          }}
        >
          Add Duration
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

const DateDurationPicker = ({
  show,
  onClose,
  onSaveDatesDurations,
  unavailableDates,
  selectedDatesDurations = [], // Default to an empty array if not provided
  minDate = null,
  maxDate = null,
}) => {
  const [dates, setDates] = useState(selectedDatesDurations);
  const [mode, setMode] = useState("custom");
  const [selectedDate, setSelectedDate] = useState(null);
  const [timeFrom, settimeFrom] = useState("");
  const [timeTo, settimeTo] = useState("");
  const [applyToAll, setApplyToAll] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [weekdays, setWeekdays] = useState([]);
  const [removedDates, setRemovedDate] = useState([]);
  const [removedDurations, setRemovedDurations] = useState([]);

  // Helper functions
  const isSelected = (date) =>
    dates.some((d) => d.date.getTime() === date.getTime());

  const handleTimeChange = (field, value) => {
    if (field === "timeFrom") settimeFrom(value);
    if (field === "timeTo") settimeTo(value);
  };

  // Date handling functions
  const handleAddCustomDate = (date) => {
    // Create a normalized date (without time) for comparison
    const normalizedDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    ).getTime();

    // Check if this normalized date already exists in the dates array
    const isDateAlreadyAdded = dates.some((item) => {
      const existingDate = new Date(
        item.date.getFullYear(),
        item.date.getMonth(),
        item.date.getDate()
      ).getTime();

      return existingDate === normalizedDate;
    });

    if (isDateAlreadyAdded) {
      alert("This date is already added.");
      return;
    }

    // If not already selected, add it to the dates array
    setDates([...dates, { date, durations: [] }]);
  };

  const handleAddRange = () => {
    if (!startDate || !endDate) {
      alert("Please select both start and end dates.");
      return;
    }

    const newDates = [];
    let currentDate = new Date(startDate);
    const overlappingDates = [];

    // Ensure unavailableDates are properly formatted as Date objects
    const normalizedUnavailableDates = unavailableDates.map(
      (d) => (d instanceof Date ? d : new Date(d.date)) // Convert if it's an object with a date property
    );

    while (currentDate <= endDate) {
      // Normalize current date for comparison (remove time component)
      const normalizedDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        currentDate.getDate()
      );

      // Check if this date is unavailable
      const isUnavailable = normalizedUnavailableDates.some((d) => {
        const unavailableDate = new Date(
          d.getFullYear(),
          d.getMonth(),
          d.getDate()
        );
        return unavailableDate.getTime() === normalizedDate.getTime();
      });

      // Instead of using isSelected, directly check if the date already exists in the dates array
      const isAlreadySelected = dates.some((item) => {
        const existingDate = new Date(
          item.date.getFullYear(),
          item.date.getMonth(),
          item.date.getDate()
        );
        return existingDate.getTime() === normalizedDate.getTime();
      });

      if (isAlreadySelected) {
        // Track overlapping dates to alert the user later
        overlappingDates.push(normalizedDate.toDateString());
      } else if (!isUnavailable) {
        newDates.push({ date: new Date(normalizedDate), durations: [] });
      }

      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }

    if (overlappingDates.length > 0) {
      const message =
        overlappingDates.length > 3
          ? `${
              overlappingDates.length
            } dates are already added including: ${overlappingDates
              .slice(0, 3)
              .join(", ")}...`
          : `These dates are already added: ${overlappingDates.join(", ")}`;
      alert(message);
    }

    if (newDates.length === 0) {
      if (overlappingDates.length === 0) {
        alert("No valid dates available in the range.");
      }
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
    const overlappingDates = [];

    while (currentDate <= endDate) {
      // Only consider days of the week that match the selected weekdays
      if (weekdays.includes(currentDate.getDay())) {
        // Normalize current date for comparison (remove time component)
        const normalizedDate = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          currentDate.getDate()
        );

        // Check if this date is unavailable
        const isUnavailable = unavailableDates.some((d) => {
          const unavailableDate = d instanceof Date ? d : new Date(d.date);
          const normalizedUnavailable = new Date(
            unavailableDate.getFullYear(),
            unavailableDate.getMonth(),
            unavailableDate.getDate()
          );
          return normalizedUnavailable.getTime() === normalizedDate.getTime();
        });

        // Check if this date is already in the dates array
        const isAlreadySelected = dates.some((item) => {
          const existingDate = new Date(
            item.date.getFullYear(),
            item.date.getMonth(),
            item.date.getDate()
          );
          return existingDate.getTime() === normalizedDate.getTime();
        });

        if (isAlreadySelected) {
          // Track overlapping dates to alert the user later
          overlappingDates.push(normalizedDate.toDateString());
        } else if (!isUnavailable) {
          newDates.push({ date: new Date(normalizedDate), durations: [] });
        }
      }

      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }

    if (overlappingDates.length > 0) {
      const message =
        overlappingDates.length > 3
          ? `${
              overlappingDates.length
            } dates are already added including: ${overlappingDates
              .slice(0, 3)
              .join(", ")}...`
          : `These dates are already added: ${overlappingDates.join(", ")}`;
      alert(message);
    }

    if (newDates.length === 0) {
      if (overlappingDates.length === 0) {
        alert("No valid weekly dates available.");
      }
      return;
    }

    setDates([...dates, ...newDates]);
  };
  // Time period handling
  const handleAddTimePeriod = () => {
    if (!timeFrom || !timeTo) {
      alert("Please select both start and end times");
      return;
    }

    const newTimePeriod = {
      timeFrom,
      timeTo,
    };

    const updatedDates = dates.map((d) => {
      if (applyToAll || d.date.getTime() === selectedDate.getTime()) {
        return { ...d, durations: [...d.durations, newTimePeriod] };
      }
      return d;
    });

    setDates(updatedDates);
    settimeFrom("");
    settimeTo("");
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
        d.date.getTime() === date.getTime() ? { ...d, durations: [] } : d
      )
    );
  };

  const handleSaveAndClose = () => {
    onSaveDatesDurations(dates, removedDates, removedDurations);
    onClose();
  };

  useEffect(() => {
    if (show && selectedDatesDurations.length > 0) {
      setDates(
        selectedDatesDurations.map((dateItem) => ({
          date: new Date(dateItem.date),
          durations: dateItem.durations,
        }))
      );
    }
    setRemovedDate([]);
    setRemovedDurations([]);
  }, [show, selectedDatesDurations]);

  const removeDate = (dateToRemove) => {
    const dateFound = dates.find((d) => d.date === dateToRemove.date);
    if (dateFound) {
      setRemovedDate((prev) => [...prev, dateFound]); // Add to removed dates array
      setDates(dates.filter((d) => d.date !== dateToRemove.date)); // Remove from dates
      // console.log("Removed Date:", dateFound); // Debug log
    } else {
      // console.log("Date not found:", dateToRemove.date); // Debug log
    }
  };

  const removeDuration = (date, durationIndex) => {
    // Ensure that date and durationIndex are valid
    if (!date || durationIndex === undefined || durationIndex < 0) {
      console.error("Invalid arguments passed to removeDuration.");
      return;
    }

    // Find the date object in the dates array
    const dateObj = dates.find((d) => d.date.getTime() === date.getTime());

    if (
      dateObj &&
      dateObj.durations &&
      dateObj.durations.length > durationIndex
    ) {
      // Store the removed duration with its date
      const removedDuration = {
        date: new Date(date),
        duration: dateObj.durations[durationIndex],
      };

      // Add to removed durations array
      setRemovedDurations((prev) => [...prev, removedDuration]);

      // Map through the dates array and remove the specific duration
      const updatedDates = dates.map((d) => {
        if (d.date.getTime() === date.getTime()) {
          const updatedDurations = [...d.durations];
          updatedDurations.splice(durationIndex, 1); // Remove the duration at the specified index
          return { ...d, durations: updatedDurations };
        }
        return d;
      });

      setDates(updatedDates); // Update the dates state
    }
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
                  renderDayContents={(day, date) => {
                    // Find if the date is unavailable
                    const unavailableDate = unavailableDates.find((d) => {
                      const unavailableNormalizedDate = new Date(d.date);
                      unavailableNormalizedDate.setHours(0, 0, 0, 0); // Remove time

                      return (
                        unavailableNormalizedDate.getTime() === date.getTime()
                      );
                    });

                    return (
                      <Tooltip
                        title={unavailableDate ? unavailableDate.reason : ""}
                        arrow
                      >
                        <div className="date-cell">
                          {" "}
                          {/* Wrap the entire cell */}
                          {day}
                        </div>
                      </Tooltip>
                    );
                  }}
                  minDate={minDate} // Pass the minDate prop
                  maxDate={maxDate} // Pass the maxDate prop
                  selected={null}
                  onChange={handleAddCustomDate}
                  inline
                  excludeDates={unavailableDates}
                  highlightDates={selectedDatesDurations.map(
                    (item) => new Date(item.date)
                  )}
                  dayClassName={(date) => {
                    // Normalize `date` to remove time
                    const dateWithoutTime = new Date(
                      date.getFullYear(),
                      date.getMonth(),
                      date.getDate()
                    );

                    // Normalize unavailable dates
                    const unavailableDateWithoutTime = unavailableDates.map(
                      (d) => {
                        const unavailableDate =
                          d instanceof Date ? d : new Date(d.date);
                        return new Date(
                          unavailableDate.getFullYear(),
                          unavailableDate.getMonth(),
                          unavailableDate.getDate()
                        ).getTime();
                      }
                    );

                    if (date < minDate || date > maxDate) {
                      return "opacity-50 text-muted"; // Faded style for out-of-range dates
                    } else if (
                      unavailableDateWithoutTime.includes(
                        dateWithoutTime.getTime()
                      )
                    ) {
                      return "bg-danger text-white"; // Highlight unavailable dates
                    } else if (isSelected(date)) {
                      return "bg-warning text-dark"; // Highlight selected dates
                    } else if (
                      selectedDatesDurations.some(
                        (d) => new Date(d.date).getTime() === date.getTime()
                      )
                    ) {
                      return "bg-primary text-white"; // Highlight dates with durations
                    } else {
                      return ""; // Default available date
                    }
                  }}
                />
              </div>
            )}

            {mode === "range" && (
              <div className="field-container picker">
                <label>Select Date Range</label>
                <DatePicker
                  minDate={minDate} // Pass the minDate prop
                  maxDate={maxDate} // Pass the maxDate prop
                  selected={null}
                  onChange={(dates) => {
                    setStartDate(dates[0]);
                    setEndDate(dates[1]);
                  }}
                  selectsRange
                  startDate={startDate}
                  endDate={endDate}
                  inline
                  excludeDates={unavailableDates}
                  highlightDates={selectedDatesDurations.map(
                    (item) => new Date(item.date)
                  )}
                  renderDayContents={(day, date) => {
                    // Find if the date is unavailable
                    const unavailableDate = unavailableDates.find((d) => {
                      const unavailableNormalizedDate = new Date(d.date);
                      unavailableNormalizedDate.setHours(0, 0, 0, 0); // Remove time

                      return (
                        unavailableNormalizedDate.getTime() === date.getTime()
                      );
                    });

                    return (
                      <Tooltip
                        title={unavailableDate ? unavailableDate.reason : ""}
                        arrow
                      >
                        <div className="date-cell">
                          {" "}
                          {/* Wrap the entire cell */}
                          {day}
                        </div>
                      </Tooltip>
                    );
                  }}
                  dayClassName={(date) => {
                    // Normalize `date` to remove time
                    const dateWithoutTime = new Date(
                      date.getFullYear(),
                      date.getMonth(),
                      date.getDate()
                    );

                    // Normalize unavailable dates
                    const unavailableDateWithoutTime = unavailableDates.map(
                      (d) => {
                        const unavailableDate =
                          d instanceof Date ? d : new Date(d.date);
                        return new Date(
                          unavailableDate.getFullYear(),
                          unavailableDate.getMonth(),
                          unavailableDate.getDate()
                        ).getTime();
                      }
                    );

                    if (date < minDate || date > maxDate) {
                      return "opacity-50 text-muted"; // Faded style for out-of-range dates
                    } else if (
                      unavailableDateWithoutTime.includes(
                        dateWithoutTime.getTime()
                      )
                    ) {
                      return "bg-danger text-white"; // Highlight unavailable dates
                    } else if (isSelected(date)) {
                      return "bg-warning text-dark"; // Highlight selected dates
                    } else if (
                      selectedDatesDurations.some(
                        (d) => new Date(d.date).getTime() === date.getTime()
                      )
                    ) {
                      return "bg-primary text-white"; // Highlight dates with durations
                    } else {
                      return ""; // Default available date
                    }
                  }}
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
                  excludeDates={unavailableDates}
                  renderDayContents={(day, date) => {
                    // Find if the date is unavailable
                    const unavailableDate = unavailableDates.find((d) => {
                      const unavailableNormalizedDate = new Date(d.date);
                      unavailableNormalizedDate.setHours(0, 0, 0, 0); // Remove time

                      return (
                        unavailableNormalizedDate.getTime() === date.getTime()
                      );
                    });

                    return (
                      <Tooltip
                        title={unavailableDate ? unavailableDate.reason : ""}
                        arrow
                      >
                        <div
                          className={`${
                            unavailableDate ? "date-cell bg-danger" : "r"
                          }`}
                        >
                          {" "}
                          {/* Wrap the entire cell */}
                          {day}
                        </div>
                      </Tooltip>
                    );
                  }}
                  minDate={minDate} // Pass the minDate prop
                  maxDate={maxDate} // Pass the maxDate prop
                  selected={null}
                  onChange={(dates) => {
                    setStartDate(dates[0]);
                    setEndDate(dates[1]);
                  }}
                  selectsRange
                  startDate={startDate}
                  endDate={endDate}
                  inline
                  highlightDates={selectedDatesDurations.map(
                    (item) => new Date(item.date)
                  )}
                  dayClassName={(date) => {
                    const dateWithoutTime = new Date(
                      date.getFullYear(),
                      date.getMonth(),
                      date.getDate()
                    ); // Normalize to date without time

                    const unavailableDateWithoutTime = unavailableDates
                      .map((d) =>
                        new Date(d) instanceof Date && !isNaN(new Date(d))
                          ? new Date(d.getFullYear(), d.getMonth(), d.getDate())
                          : null
                      )
                      .filter(Boolean); // Remove any invalid values

                    if (date < minDate || date > maxDate) {
                      return "opacity-50 text-muted"; // Bootstrap classes for low opacity
                    } else if (
                      unavailableDateWithoutTime.some(
                        (d) => d.getTime() === dateWithoutTime.getTime()
                      )
                    ) {
                      return "bg-danger text-white"; // Mark unavailable dates with Bootstrap danger color
                    } else if (isSelected(date)) {
                      return "bg-warning text-dark"; // Mark selected dates with Bootstrap warning color
                    } else if (
                      selectedDatesDurations.some(
                        (d) => new Date(d.date).getTime() === date.getTime()
                      )
                    ) {
                      return "bg-primary text-white"; // Mark highlighted dates with Bootstrap primary color
                    } else {
                      return ""; // Mark other available dates with Bootstrap success color
                    }
                  }}
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
                  {dateItem.durations.length === 0 ? (
                    <p>No durations added for this date.</p>
                  ) : (
                    dateItem.durations.map((period, index) => (
                      <div
                        key={index}
                        className="duration-item d-flex justify-content-start align-items-center gap-1"
                      >
                        <p className="mb-0">
                          Start: {period.timeFrom} | End: {period.timeTo}
                        </p>
                        <button
                          className="ml-2"
                          style={{
                            width: "20px",
                            height: "20px",
                            borderRadius: "50%",
                            padding: "0",
                            margin: "0",
                            fontSize: "16px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: "#dc3545",
                            color: "white",
                            border: "none",
                            cursor: "pointer",
                          }}
                          onClick={() => removeDuration(dateItem.date, index)}
                          aria-label="Remove duration"
                        >
                          &times;
                        </button>
                      </div>
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
                      onClick={() => removeDate(dateItem)}
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
            timeFrom={timeFrom}
            timeTo={timeTo}
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
