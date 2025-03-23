import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { showNotification } from "../../../../redux/alert-popup/alertPopupSlice";
import "bootstrap/dist/css/bootstrap.min.css";
import { formatDate } from "../../../../utils/dateFormat";
import { useAuth } from "../../../../context/AuthContext";
import { baseApi } from "../../../../utils/consonants";

const AdminUnavailableDates = ({ onClose }) => {
  const { adminUser } = useAuth();
  const dispatch = useDispatch();
  const [dates, setDates] = useState([]);
  const [newDate, setNewDate] = useState("");
  const [description, setDescription] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showInfo, setShowInfo] = useState(false); // Toggle for info section

  useEffect(() => {
    fetch(`${baseApi}/admin/unavailable-dates`)
      .then((response) => response.json())
      .then((data) => setDates(data))
      .catch((error) => console.error("Error fetching dates:", error));
  }, []);

  const handleAddDate = () => {
    if (!newDate || !description) {
      setErrorMessage("Please fill in both date and description.");
      return;
    }

    if (dates.some((dateObj) => dateObj.date === newDate)) {
      setErrorMessage("This date already exists.");
      return;
    }

    dispatch(
      showNotification({
        type: "warning",
        title: "Confirm Addition",
        text: `Are you sure you want to add ${newDate} as an unavailable date?`,
        customButton: {
          text: "Yes, Add Date",
          action: async () => {
            const newEntry = {
              date: new Date(newDate).toISOString(),
              description,
            };

            try {
              const response = await fetch(
                `${baseApi}/admin/unavailable-dates`,
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${adminUser.token}`,
                  },
                  body: JSON.stringify(newEntry),
                }
              );

              if (response.ok) {
                const addedDate = await response.json();
                setDates([...dates, addedDate]);
                setNewDate("");
                setDescription("");
                setErrorMessage("");

                dispatch(
                  showNotification({
                    type: "success",
                    title: "Date Added",
                    text: "The unavailable date has been successfully added.",
                  })
                );
              } else {
                throw new Error("Failed to add date.");
              }
            } catch (error) {
              console.error("Error adding date:", error);
              setErrorMessage(error.message);
              dispatch(
                showNotification({
                  type: "error",
                  title: "Error",
                  text: "An error occurred while adding the date.",
                })
              );
            }
          },
          showCancel: true,
        },
      })
    );
  };

  const handleRemoveDate = (date) => {
    dispatch(
      showNotification({
        type: "warning",
        title: "Confirm Deletion",
        text: `Are you sure you want to remove ${formatDate(date)}?`,
        customButton: {
          text: "Yes, Remove Date",
          action: async () => {
            try {
              const response = await fetch(
                `${baseApi}/admin/unavailable-dates/${date}`,
                {
                  method: "DELETE",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${adminUser.token}`,
                  },
                }
              );

              if (!response.ok) {
                throw new Error("Failed to remove date");
              }

              setDates(dates.filter((dateObj) => dateObj.date !== date));

              dispatch(
                showNotification({
                  type: "success",
                  title: "Date Removed",
                  text: "The unavailable date has been successfully removed.",
                })
              );
            } catch (error) {
              console.error("Error removing date:", error);
              dispatch(
                showNotification({
                  type: "error",
                  title: "Error",
                  text: "An error occurred while removing the date.",
                })
              );
            }
          },
          showCancel: true,
        },
      })
    );
  };

  return (
    <div className="modal show bg-shadow" style={{ display: "block" }}>
      <div className="modal-dialog">
        <div className="modal-content">
          {/* Modal Header */}
          <div className="modal-header d-flex justify-content-between align-items-center">
            <h5 className="modal-title">Manage Unavailable Dates</h5>
            <button
              className="btn btn-info btn-sm"
              onClick={() => setShowInfo(!showInfo)}
            >
              ℹ
            </button>
            <button
              className="btn btn-light border shadow-sm px-3 py-2"
              onClick={onClose}
            >
              <span className="fw-bold" style={{ fontSize: "1.2rem" }}>
                &times;
              </span>
            </button>
          </div>

          {/* Info Section */}
          {showInfo && (
            <div className="alert alert-info m-3">
              <strong>Purpose:</strong> This page allows you to set unavailable
              dates. On these dates, certain routes will be blocked to prevent
              user access.
              <hr />
              <strong>Affected routes:</strong>
              <ul className="mb-0">
                <li>Reporting entity (user, listing, post, and sale)</li>
                <li>Creating a Post</li>
                <li>Adding listing</li>
              </ul>
            </div>
          )}

          {/* Modal Body */}
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
                placeholder="Reason for unavailability"
              />
            </div>
            {errorMessage && <p className="text-danger">{errorMessage}</p>}
            <button className="btn btn-primary mt-2" onClick={handleAddDate}>
              Add Date
            </button>
            <ul className="list-group mt-3">
              {dates.map((dateObj, index) => (
                <li className="list-group-item" key={index}>
                  <strong>{formatDate(dateObj.date)}</strong>:{" "}
                  {dateObj.description}
                  <button
                    className="btn btn-danger btn-sm float-end"
                    onClick={() => handleRemoveDate(dateObj.date)}
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

export default AdminUnavailableDates;
