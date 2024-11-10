import React, { useState, useEffect } from "react";

export const HandleWeeklyDateAndTime = ({ data, setData }) => {
  const [weeklyDays, setWeeklyDays] = useState([]);
  const [activeWeeklyDay, setActiveWeeklyDay] = useState(null);
  const [weeklyRentalTimes, setWeeklyRentalTimes] = useState({});
  const [newFrom, setNewFrom] = useState("");
  const [newTo, setNewTo] = useState("");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  useEffect(() => {
    const dateAndTime = [];

    weeklyDays.forEach((day) => {
      const startDate = new Date(dateRange.start);
      const dayIndex = ["Mon", "Tues", "Wed", "Thurs", "Fri", "Sat", "Sun"].indexOf(day);
      const dates = [];

      for (let d = startDate; d <= new Date(dateRange.end); d.setDate(d.getDate() + 1)) {
        if (d.getDay() === (dayIndex + 1) % 7) {
          const dateStr = d.toISOString().split("T")[0];
          const times = weeklyRentalTimes[day]?.times || [];
          dateAndTime.push({ date: dateStr, times });
        }
      }
    });

    setData((prev) => ({ ...prev, dateAndTime }));
  }, [weeklyRentalTimes, weeklyDays, dateRange, setData]);

  const handleDayChange = (day) => {
    setWeeklyDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
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
    <div className="sub-groupby">
      <label>Select Days:</label>
      <div className="day-selector">
        {["Mon", "Tues", "Wed", "Thurs", "Fri", "Sat", "Sun"].map((day) => (
          <span
            key={day}
            className={`day ${weeklyDays.includes(day) ? "selected" : ""}`}
            onClick={() => handleDayChange(day)}
          >
            {day}
          </span>
        ))}
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
            const dayIndex = ["Mon", "Tues", "Wed", "Thurs", "Fri", "Sat", "Sun"].indexOf(day);
            const dates = [];

            for (let d = startDate; d <= new Date(dateRange.end); d.setDate(d.getDate() + 1)) {
              if (d.getDay() === (dayIndex + 1) % 7) {
                const dateStr = d.toISOString().split("T")[0];
                dates.push(dateStr);
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
                      {weeklyRentalTimes[day]?.times?.map((timeObj, timeIndex) => (
                        <div key={timeIndex} className="time-input d-flex align-items-center">
                          <span>{`${timeObj.from} - ${timeObj.to}`}</span>
                          <button
                            className="btn btn-danger ms-2"
                            onClick={() => handleRemoveWeeklyTime(day, timeIndex)}
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
  );
};
