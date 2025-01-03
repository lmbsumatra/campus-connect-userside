import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const AdminResetStatus = ({ onClose }) => {
  const [dates, setDates] = useState([]);
  const [newDate, setNewDate] = useState("");
  const [description, setDescription] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    // Fetch end semester dates from the server
    fetch("http://localhost:3001/admin/end-semester-dates")
      .then((response) => response.json())
      .then((data) => setDates(data))
      .catch((error) => console.error("Error fetching dates:", error));
  }, []);

  const handleAction = (action) => {
    action(); // Proceed with the intended action
  };

  const handleAddDate = () => {
    if (!newDate || !description) {
        setErrorMessage("Please fill in both date and description.");
        return;
    }

    // Check if the date already exists
    if (dates.some((dateObj) => dateObj.date === newDate)) {
        setErrorMessage("This date already exists.");
        return;
    }

    const newEntry = {
        date: new Date(newDate).toISOString(),
        description,
    };

    fetch("http://localhost:3001/admin/end-semester-dates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEntry),
    })
        .then((response) => {
        if (response.ok) {
            return response.json();
        }
        if (response.status === 409) {
            throw new Error("This date already exists.");
        }
        throw new Error("Failed to add date.");
        })
        .then((newDate) => {
        setDates([...dates, newDate]); // Add the new date to the list
        setNewDate("");
        setDescription("");
        setErrorMessage("");
        })
        .catch((error) => {
        console.error("Error adding date:", error);
        setErrorMessage(error.message);
        });  
    };

  const handleRemoveDate = async (date) => {
    try {
      const response = await fetch(`http://localhost:3001/admin/end-semester-dates/${date}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to remove date');
      }

      const data = await response.json();
      console.log(data.message); // Display success message from backend

      // Remove the date from the state
      setDates(dates.filter((dateObj) => dateObj.date !== date));
    } catch (error) {
      console.error('Error removing date:', error); // Log error to the console
      alert('Error removing date');
    }
  };

  return (
    <div className="modal show bg-shadow" style={{ display: "block" }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Manage End Semester Dates</h5>
            <button className="close" onClick={onClose}>
              <span>&times;</span>
            </button>
          </div>
          <div className="modal-body">
            <div>
              <label>Date:</label>
              <input
                type="date"
                className="form-control"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
              />
            </div>
            <div>
              <label>Description:</label>
              <input
                type="text"
                className="form-control"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description for the End Semester Date"
              />
            </div>
            {errorMessage && <p className="text-danger">{errorMessage}</p>}
            <button
              className="btn btn-primary mt-2"
              onClick={() => handleAction(handleAddDate)}
            >
              Add Date
            </button>
            <ul className="list-group mt-3">
              {dates.map((dateObj, index) => (
                <li className="list-group-item" key={index}>
                  <strong>{dateObj.date}</strong>: {dateObj.description}
                  <button
                    className="btn btn-danger btn-sm float-end"
                    onClick={() => handleAction(() => handleRemoveDate(dateObj.date), true)}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminResetStatus;
