import React, { useState, useEffect } from "react";
import FetchUserInfo from "../../../../utils/FetchUserInfo";
import "./editProfileStyles.css";
import { useAuth } from "../../../../context/AuthContext";
import showPassword from "../../../../assets/images/icons/eye-open.svg";
import hidePassword from "../../../../assets/images/icons/eye-closed.svg";
import PasswordMeter from "../../../../components/common/PasswordMeter";

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
    scanned_id: "",
    photo_with_id: "",
  });

  const [isModalOpen, setModalOpen] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [isShowPassword, setShowPassword] = useState(false);
  const { studentUser } = useAuth();
  const userId = studentUser.userId;
  const token = studentUser.token;

  const { user, student, errorMessage: fetchErrorMessage } = FetchUserInfo({userId});
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (user && student) {
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
    }
    if (fetchErrorMessage) {
      setErrorMessage(fetchErrorMessage);
    }
  }, [user, student, fetchErrorMessage]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      setErrorMessage("New passwords do not match.");
      return;
    }

    try {
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
        setErrorMessage(errorData.message || "Password update failed. Please try again.");
      }
    } catch (error) {
      setErrorMessage("An error occurred while changing the password.");
    }
  };

  const handleShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <div className="rounded bg-white mt-2">
      <form className="edit-profile-form">
        <div className="form-section personal-details">
          <h3 className="section-label">Edit Personal Details</h3>
          <div className="details-grid">
            {["surname", "firstname", "middlename", "college", "course", "tup_id"].map((field) => (
              <div className="form-group" key={field}>
                <label>{field.charAt(0).toUpperCase() + field.slice(1)}</label>
                <input
                  type="text"
                  name={field}
                  value={formData[field]}
                  onChange={handleChange}
                  placeholder="Example Input"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="form-section account-details">
          <h3 className="section-label">Edit Account Details</h3>
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
                onClick={() => setModalOpen(true)}
              >
                Change Password
              </button>
            </div>
          </div>
        </div>

        <div className="form-section verification">
          <h3 className="section-label">Update Verification</h3>
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
                  {formData.photo_with_id && (
                    <img
                      src={formData.photo_with_id}
                      alt="Photo with ID"
                      style={{ height: "100px", width: "auto" }}
                    />
                  )}
                </div>
              </div>
              <div>
                <label>Scanned ID</label>
                <div>
                  {formData.scanned_id && (
                    <img
                      src={formData.scanned_id}
                      alt="Scanned ID"
                      style={{ height: "100px", width: "auto" }}
                    />
                  )}
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
              {["currentPassword", "newPassword", "confirmNewPassword"].map((field) => (
                <div className="form-group" key={field}>
                  <label>{field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</label>
                  <input
                    type={isShowPassword ? "text" : "password"}
                    name={field}
                    value={passwordData[field]}
                    onChange={handlePasswordChange}
                    placeholder={`Enter ${field.replace(/([A-Z])/g, ' $1')}`}
                    required
                  />
                  <div className="pass-icon" onClick={handleShowPassword}>
                    <img src={isShowPassword ? showPassword : hidePassword} alt="Toggle password visibility" />
                  </div>
                  {field === "newPassword" && <PasswordMeter password={passwordData.newPassword} />}
                </div>
              ))}
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
