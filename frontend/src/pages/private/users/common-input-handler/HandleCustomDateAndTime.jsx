import React, { useState, useEffect } from "react";

export const HandleCustomDateAndTime = ({ data, setData }) => {
  const [customDates, setCustomDates] = useState({});
  const [newFrom, setNewFrom] = useState("");
  const [newTo, setNewTo] = useState("");
  const [activeDate, setActiveDate] = useState(null);

  useEffect(() => {
    const dateAndTime = Object.entries(customDates).map(
      ([date, { times }]) => ({
        date,
        times,
      })
    );
    setData((prev) => ({ ...prev, dateAndTime }));
  }, [customDates, setData]);

  const handleToggleActiveDate = (date) => {
    setActiveDate(activeDate === date ? null : date);
  };

  const handleDateChange = (event) => {
    const { value } = event.target;
    if (!customDates[value]) {
      setCustomDates((prev) => ({
        ...prev,
        [value]: { times: [] },
      }));
    }
  };

  const handleRemoveDate = (date) => {
    setCustomDates((prev) => {
      const newDates = { ...prev };
      delete newDates[date];
      return newDates;
    });
  };

  const handleAddNewTimeSlot = (date) => {
    if (newFrom && newTo) {
      setCustomDates((prev) => ({
        ...prev,
        [date]: {
          times: [...prev[date].times, { from: newFrom, to: newTo }],
        },
      }));
      setNewFrom("");
      setNewTo("");
    }
  };

  const handleRemoveTimeSlot = (date, index) => {
    setCustomDates((prev) => ({
      ...prev,
      [date]: {
        times: prev[date].times.filter((_, i) => i !== index),
      },
    }));
  };

  return (
    <div className="sub-groupby ">
      <div className="date-inputs">
        <label>Selected Dates:</label>
        <input type="date" onChange={handleDateChange}className="date-input" />
      </div>
      <div className="d-block">
        {Object.entries(customDates).map(([date, { times }]) => (
          <div key={date} className="date-entry">
            <button
              className="btn btn-rounded thin"
              onClick={() => handleToggleActiveDate(date)}
            >
              {date}
            </button>
            <button
              className="btn btn-danger"
              onClick={() => handleRemoveDate(date)}
            >
              -
            </button>
            {activeDate === date && (
              <div className="d-block ">
                <label>Times:</label>
                {times.map((timeObj, timeIndex) => (
                  <div
                    key={timeIndex}
                    className=" d-flex align-items-center"
                  >
                    <span>{`${timeObj.from} - ${timeObj.to}`}</span>
                    <button
                      className="btn btn-danger ms-2"
                      onClick={() => handleRemoveTimeSlot(date, timeIndex)}
                    >
                      -
                    </button>
                  </div>
                ))}
                <div className="d-flex align-items-center">
                  <label>From: </label>
                  <input
                    type="time"
                    placeholder="From"
                    value={newFrom}
                    onChange={(e) => setNewFrom(e.target.value)}
                    className="time-inputs"
                  />
                  <label className="d-flex">To: </label>
                  <input
                    type="time"
                    placeholder="To"
                    value={newTo}
                    onChange={(e) => setNewTo(e.target.value)}
                    className="time-inputs"
                  />
                  <button
                    className="btn btn-primary ms-2"
                    onClick={() => handleAddNewTimeSlot(date)}
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
  );
};
