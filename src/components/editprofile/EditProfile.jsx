import React, { useState, useEffect } from "react";
import FetchUserInfo from "../User/header/FetchUserInfo";
import "./editProfileStyles.css";

function EditProfile() {
  const [formData, setFormData] = useState({
    surname: "",
    firstname: "",
    middlename: "",
    year: "",
    college: "",
    course: "",
    gender: "",
    birthday: "",
    username: "",
    email: "",
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [isModalOpen, setModalOpen] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  // useEffect(() => {}, [isModalOpen]);

  useEffect(() => {
    const setUserInfo = (data) => {
      const { user, student } = data;
      setFormData({
        surname: user.last_name || "",
        firstname: user.first_name || "",
        middlename: user.middle_name || "",
        year: student.year || "",
        college: student.college || "",
        course: student.course || "",
        gender: user.gender || "",
        birthday: user.birthday || "",
        username: user.username || "",
        email: user.email || "",
      });
    };

    FetchUserInfo(setUserInfo, setErrorMessage);
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate password inputs
    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      setErrorMessage("New passwords do not match.");
      return;
    }

    // Call the API to update the user's password
    const response = await fetch("http://localhost:3001/user/updatePassword", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      }),
    });

    if (response.ok) {
      setErrorMessage("");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      });
      setModalOpen(false); // Close modal on success
    } else {
      const errorData = await response.json();
      setErrorMessage(
        errorData.message || "Password update failed. Please try again."
      );
    }
  };

  return (
    <div className="container rounded bg-white mt-2">
      {errorMessage && <p className="error-message">{errorMessage}</p>}
      <form className="edit-profile-form">
        <div className="form-section personal-details">
          <h3 className="section-label">Personal Details</h3>
          <div className="details-grid">
            <div className="form-group">
              <label>Surname</label>
              <input
                type="text"
                name="surname"
                value={formData.surname}
                onChange={handleChange}
                placeholder="Example Input"
              />
            </div>
            <div className="form-group">
              <label>Firstname</label>
              <input
                type="text"
                name="firstname"
                value={formData.firstname}
                onChange={handleChange}
                placeholder="Example Input"
              />
            </div>
            <div className="form-group">
              <label>Middlename (optional)</label>
              <input
                type="text"
                name="middlename"
                value={formData.middlename}
                onChange={handleChange}
                placeholder="Example Input"
              />
            </div>
            <div className="form-group">
              <label>Year</label>
              <input
                type="text"
                name="year"
                value={formData.year}
                onChange={handleChange}
                placeholder="Example Input"
              />
            </div>
            <div className="form-group">
              <label>College</label>
              <input
                type="text"
                name="college"
                value={formData.college}
                onChange={handleChange}
                placeholder="Example Input"
              />
            </div>
            <div className="form-group">
              <label>Course</label>
              <input
                type="text"
                name="course"
                value={formData.course}
                onChange={handleChange}
                placeholder="Example Input"
              />
            </div>
            <div className="form-group">
              <label>Gender</label>
              <input
                type="text"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                placeholder="Example Input"
              />
            </div>
            <div className="form-group">
              <label>Birthday</label>
              <input
                type="date"
                name="birthday"
                value={formData.birthday}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <div className="form-section account-details">
          <h3 className="section-label">Account Details</h3>
          <div className="details-grid">
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Example Input"
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Example Input"
              />
            </div>
            <div className="form-group">
              <label>Change Password</label>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setModalOpen(true);
                }}
              >
                Change Password
              </button>
            </div>
          </div>
        </div>

        <div className="form-section verification">
          <h3 className="section-label">Verification</h3>
          <div className="verification-grid">
            <div className="form-group">
              <label>Upload Image</label>
              <input
                type="file"
                name="verificationImage"
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <button type="submit">Save Changes</button>
      </form>

      {isModalOpen && (
        <div className="change-pass-window">
          <div className="change-pass-window-content">
            <h3>Change Password</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Current Password</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  placeholder="Enter Current Password"
                  required
                />
              </div>
              <div className="form-group">
                <label>New Password</label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  placeholder="Enter New Password"
                  required
                />
              </div>
              <div className="form-group">
                <label>Confirm New Password</label>
                <input
                  type="password"
                  name="confirmNewPassword"
                  value={passwordData.confirmNewPassword}
                  onChange={handlePasswordChange}
                  placeholder="Confirm New Password"
                  required
                />
              </div>
              <button type="submit">Submit</button>
              <button type="button" onClick={() => setModalOpen(false)}>
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h3>Change Password</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Current Password</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  placeholder="Enter Current Password"
                  required
                />
              </div>
              <div className="form-group">
                <label>New Password</label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  placeholder="Enter New Password"
                  required
                />
              </div>
              <div className="form-group">
                <label>Confirm New Password</label>
                <input
                  type="password"
                  name="confirmNewPassword"
                  value={passwordData.confirmNewPassword}
                  onChange={handlePasswordChange}
                  placeholder="Confirm New Password"
                  required
                />
              </div>
              <button type="submit">Submit</button>
              <button type="button" onClick={() => setModalOpen(false)}>
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default EditProfile;
