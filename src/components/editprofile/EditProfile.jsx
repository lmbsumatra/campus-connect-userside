import React, { useState, useEffect } from "react";
import FetchUserInfo from "../../utils/FetchUserInfo";
import "./editProfileStyles.css";
import { useAuth } from "../../context/AuthContext";
import showPassword from "../../assets/images/icons/eye-open.svg";
import hidePassword from "../../assets/images/icons/eye-closed.svg";
import PasswordMeter from "../common/PasswordMeter";

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
    tup_id: "",
  });

  const [errorMessage, setErrorMessage] = useState("");
  const { studentUser } = useAuth();
  const token = studentUser.token;
  const [isModalOpen, setModalOpen] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  // useEffect(() => {}, [isModalOpen]);
  const [isShowPassword, setShowPassword] = useState(false);

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
        tup_id: student.tup_id || "",
        scanned_id: student.scanned_id || "",
        photo_with_id: student.photo_with_id || "",
      });
    };
    const fetchData = async () => {
      if (token) {
        const { user, student, errorMessage } = await FetchUserInfo(token);
        setUserInfo({ user, student });
        setErrorMessage(errorMessage);
      }
    };
    fetchData();
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

    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      setErrorMessage("New passwords do not match.");
      return;
    }
    const response = await fetch("http://localhost:3001/user/change-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
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
      setModalOpen(false);
    } else {
      const errorData = await response.json();
      setErrorMessage(
        errorData.message || "Password update failed. Please try again."
      );
    }
  };

  const handleShowPassword = () => {
    setShowPassword(!isShowPassword);
  };

  return (
    <div className="rounded bg-white mt-2">
      
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
              <label>TUP ID</label>
              <input
                type="text"
                name="tup_id"
                value={formData.tup_id}
                onChange={handleChange}
                placeholder="Example Input"
              />
            </div>
          </div>
        </div>

        <div className="form-section account-details">
          <h3 className="section-label">Account Details</h3>
          <div className="details-grid">
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
              <div>
                <label>Photo with ID</label>
                <div>
                  <img
                    src={formData.photo_with_id}
                    style={{ height: "100px", width: "auto" }}
                  />
                </div>
              </div>
              <div>
                <label>Scanned ID</label>
                <div>
                  <img
                    src={formData.scanned_id}
                    style={{ height: "100px", width: "auto" }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <button className="btn btn-rectangle primary" type="submit">
          Save Changes
        </button>
      </form>

      {isModalOpen && (
        <div className="change-pass-window">
          <div className="change-pass-window-content">
            <h3>Change Password</h3>
            {errorMessage && <p className="error-message">{errorMessage}</p>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Current Password</label>
                <input
                  type={isShowPassword ? "text" : "password"}
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  placeholder="Enter Current Password"
                  required
                />
                <div className="pass-icon" onClick={handleShowPassword}>
                  <img
                    src={`${isShowPassword ? showPassword : hidePassword}`}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>New Password</label>
                <input
                  type={isShowPassword ? "text" : "password"}
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  placeholder="Enter New Password"
                  required
                />
                <div className="pass-icon" onClick={handleShowPassword}>
                  <img
                    src={`${isShowPassword ? showPassword : hidePassword}`}
                  />
                </div>
                <PasswordMeter password={passwordData.newPassword} />
              </div>
              <div className="form-group">
                <label>Confirm New Password</label>
                <input
                  type={isShowPassword ? "text" : "password"}
                  name="confirmNewPassword"
                  value={passwordData.confirmNewPassword}
                  onChange={handlePasswordChange}
                  placeholder="Confirm New Password"
                  required
                />
                <div className="pass-icon" onClick={handleShowPassword}>
                  <img
                    src={`${isShowPassword ? showPassword : hidePassword}`}
                  />
                </div>
              </div>
              <button className="btn btn-rectangle primary" type="submit">
                Submit
              </button>
              <button
                className="btn btn-rectangle muted"
                type="button"
                onClick={() => setModalOpen(false)}
              >
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
