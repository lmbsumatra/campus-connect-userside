import React, { useState, useEffect, useRef } from "react";
import FetchUserInfo from "../../../../utils/FetchUserInfo";
import "./editProfileStyles.css";
import { useAuth } from "../../../../context/AuthContext";
import showPassword from "../../../../assets/images/icons/eye-open.svg";
import hidePassword from "../../../../assets/images/icons/eye-closed.svg";
import PasswordMeter from "../../../../components/common/PasswordMeter";
import { baseApi } from "../../../../App";
import { Modal, Button, InputGroup, Form } from "react-bootstrap";
import { Tooltip } from "@mui/material";
import { toast } from "react-toastify";

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
    scannedId: "",
    photoWithId: "",
    status: "",
  });

  const [isModalOpen, setModalOpen] = useState(false);
  const { studentUser } = useAuth();
  const userId = studentUser.userId;
  const token = studentUser.token;

  const {
    user,
    student,
    errorMessage: fetchErrorMessage,
  } = FetchUserInfo({ userId });

  console.log({ user, student });
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (user && student) {
      setFormData({
        surname: user.lname || "",
        firstname: user.fname || "",
        middlename: user.mname || "",
        year: student.year || "",
        college: student.college || "",
        course: student.course || "",
        gender: user.gender || "",
        birthday: user.birthday || "",
        username: user.username || "",
        email: user.email || "",
        tup_id: `${student.id}` || "",
        scannedId: student.scannedId || "",
        photoWithId: student.photoWithId || "",
        status: student.status || "",
        statusMsg: student.statusMsg || "",
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

  const handleProfileSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${baseApi}/user/update-profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fname: formData.firstname,
          lname: formData.surname,
          mname: formData.middlename,
          gender: formData.gender,
          birthday: formData.birthday,
          username: formData.username,
        }),
      });

      const studentResponse = await fetch(`${baseApi}/student/update-profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          year: formData.year,
          college: formData.college,
          course: formData.course,
        }),
      });

      if (response.ok && studentResponse.ok) {
        setSuccessMessage("Profile updated successfully!");
        setTimeout(() => {
          setSuccessMessage("");
        }, 3000);
      } else {
        const errorData = await response.json();
        setErrorMessage(
          errorData.message || "Failed to update profile. Please try again."
        );
        setTimeout(() => {
          setErrorMessage("");
        }, 3000);
      }
    } catch (error) {
      setErrorMessage("An error occurred while updating your profile.");
      setTimeout(() => {
        setErrorMessage("");
      }, 3000);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      setErrorMessage("New passwords do not match.");
      return;
    }

    try {
      const response = await fetch(`${baseApi}/user/change-password`, {
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
        setSuccessMessage("Password successfully changed.");
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmNewPassword: "",
        });

        setTimeout(() => {
          setSuccessMessage("");
        }, 3000);
        // setModalOpen(false);
      } else {
        const errorData = await response.json();
        setErrorMessage(
          errorData.message || "Password update failed. Please try again."
        );
        setTimeout(() => {
          setErrorMessage("");
        }, 3000);
      }
    } catch (error) {
      setErrorMessage("An error occurred while changing the password.");
      setTimeout(() => {
        setErrorMessage("");
      }, 3000);
    }
  };

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  const [passwordVisibility, setPasswordVisibility] = useState({
    currentPassword: false,
    newPassword: false,
    confirmNewPassword: false,
  });

  const togglePasswordVisibility = (field) => {
    setPasswordVisibility((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const [photoHover, setPhotoHover] = useState(false);
  const [idHover, setIdHover] = useState(false);

  const photoFileRef = useRef(null);
  const idFileRef = useRef(null);

  const [uploadedFiles, setUploadedFiles] = useState({
    scannedId: null,
    photoWithId: null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileUpload = (e, type) => {
    if (formData.status !== "pending" && formData.status !== "rejected") return;

    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage(
        `File size exceeds 5MB limit. Please select a smaller image.`
      );
      setTimeout(() => {
        setErrorMessage("");
      }, 3000);
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      setErrorMessage(`Only JPG and PNG files are accepted.`);
      setTimeout(() => {
        setErrorMessage("");
      }, 3000);
      return;
    }

    const imageUrl = URL.createObjectURL(file);

    setErrorMessage("");

    setFormData((prev) => ({
      ...prev,
      [type === "scannedId" ? "scannedId" : "photoWithId"]: imageUrl,
    }));

    setUploadedFiles((prev) => ({
      ...prev,
      [type]: file,
    }));
  };

  const handleDocumentSubmission = async (e) => {
    e.preventDefault();

    // Check if at least one file has been selected
    if (!uploadedFiles.scannedId && !uploadedFiles.photoWithId) {
      setErrorMessage("Please select at least one document to update.");
      setTimeout(() => {
        setErrorMessage("");
      }, 3000);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const formDataToSubmit = new FormData();

      if (uploadedFiles.scannedId) {
        formDataToSubmit.append("scanned_id", uploadedFiles.scannedId);
      }

      if (uploadedFiles.photoWithId) {
        formDataToSubmit.append("photo_with_id", uploadedFiles.photoWithId);
      }

      const response = await fetch(
        `${baseApi}/user/update-verification-documents`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formDataToSubmit,
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSuccessMessage(
          "Documents submitted successfully. They will be reviewed shortly."
        );

        setFormData((prev) => ({
          ...prev,
          status: data.status,
        }));

        setUploadedFiles({
          scannedId: null,
          photoWithId: null,
        });

        setTimeout(() => {
          setSuccessMessage("");
        }, 5000);
      } else {
        const errorData = await response.json();
        setErrorMessage(
          errorData.message || "Failed to update documents. Please try again."
        );
        setTimeout(() => {
          setErrorMessage("");
        }, 3000);
      }
    } catch (error) {
      console.error("Error updating documents:", error);
      setErrorMessage("A network error occurred. Please try again later.");
      setTimeout(() => {
        setErrorMessage("");
      }, 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded bg-white mt-2">
      {errorMessage && (
        <div className="alert alert-danger mb-3">{errorMessage}</div>
      )}
      {successMessage && (
        <div className="alert alert-success mb-3">{successMessage}</div>
      )}

      <form className="edit-profile-form" onSubmit={handleProfileSubmit}>
        <div className="form-section personal-details">
          <h3 className="section-label">Edit Personal Details</h3>
          <div className="details-grid">
            {[
              "surname",
              "firstname",
              "middlename",
              "college",
              "course",
              "tup_id",
            ].map((field) => (
              <div className="form-group" key={field}>
                <label>{field.charAt(0).toUpperCase() + field.slice(1)}</label>
                <input
                  type="text"
                  name={field}
                  value={formData[field]}
                  onChange={handleChange}
                  placeholder="Example Input"
                  disabled={field === "tup_id"}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="form-section account-details">
          <h3 className="section-label">Account Details</h3>
          <div className="details-grid">
            <div className="form-group">
              <label>Email</label>
              <Tooltip title="Changing email is not available for now.">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Example Input"
                  disabled
                />
              </Tooltip>
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

        <button className="btn btn-rectangle primary" type="submit">
          Save Changes
        </button>
      </form>

      <form onSubmit={handleDocumentSubmission} className="mt-4">
        <div className="form-section verification mb-5">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h3 className="section-label">Verification Documents</h3>
            <div className="verification-status">
              {formData.status === "pending" && (
                <span className="badge bg-warning text-dark py-2 px-3">
                  Pending Verification
                </span>
              )}
              {formData.status === "verified" && (
                <span className="badge bg-success py-2 px-3">Verified</span>
              )}
              {formData.status === "flagged" && (
                <span className="badge bg-danger py-2 px-3">Flagged</span>
              )}
            </div>
          </div>

          {formData.status && formData.statusMsg && (
            <div
              className={`alert ${
                formData.status === "verified"
                  ? "alert-success"
                  : formData.status === "flagged"
                  ? "alert-danger"
                  : "alert-warning"
              } mb-3`}
            >
              {formData.statusMsg}
            </div>
          )}

          {/* {formData.status === "flagged" && (
            <div className="alert alert-danger mb-3">
              <small>
                Your verification was rejected. Please upload new documents.
              </small>
            </div>
          )} */}

          <div className="row verification-grid g-4">
            <div className="col-md-6">
              <div className="document-container">
                <div className="document-label d-flex justify-content-between">
                  <span>Photo with ID</span>
                  {(formData.status === "pending" ||
                    formData.status === "rejected") && (
                    <small className="text-primary">
                      Click image to change
                    </small>
                  )}
                </div>
                <div
                  className={`document-preview ${
                    formData.status === "pending" ||
                    formData.status === "rejected"
                      ? "document-preview-editable"
                      : ""
                  }`}
                  onMouseEnter={() =>
                    (formData.status === "pending" ||
                      formData.status === "rejected") &&
                    setPhotoHover(true)
                  }
                  onMouseLeave={() => setPhotoHover(false)}
                  onClick={() =>
                    (formData.status === "pending" ||
                      formData.status === "rejected") &&
                    photoFileRef.current.click()
                  }
                >
                  {formData.photoWithId ? (
                    <div className="position-relative">
                      <img
                        src={formData.photoWithId}
                        alt="Photo with ID"
                        className="img-fluid rounded"
                      />
                      {photoHover &&
                        (formData.status === "pending" ||
                          formData.status === "rejected") && (
                          <div className="document-overlay d-flex align-items-center justify-content-center">
                            <i className="bi bi-camera-fill me-2"></i>
                            Update Photo
                          </div>
                        )}
                    </div>
                  ) : (
                    <div className="empty-document d-flex flex-column align-items-center justify-content-center">
                      <i className="bi bi-person-badge fs-1 mb-2"></i>
                      <span>Upload a photo of yourself holding your ID</span>
                      {(formData.status === "pending" ||
                        formData.status === "rejected") && (
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary mt-2"
                          onClick={() => photoFileRef.current.click()}
                        >
                          Select Photo
                        </button>
                      )}
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  ref={photoFileRef}
                  style={{ display: "none" }}
                  onChange={(e) => handleFileUpload(e, "photoWithId")}
                  disabled={
                    formData.status !== "pending" &&
                    formData.status !== "rejected"
                  }
                />
              </div>
            </div>

            <div className="col-md-6">
              <div className="document-container">
                <div className="document-label d-flex justify-content-between">
                  <span>Scanned ID</span>
                  {(formData.status === "pending" ||
                    formData.status === "rejected") && (
                    <small className="text-primary">
                      Click image to change
                    </small>
                  )}
                </div>
                <div
                  className={`document-preview ${
                    formData.status === "pending" ||
                    formData.status === "rejected"
                      ? "document-preview-editable"
                      : ""
                  }`}
                  onMouseEnter={() =>
                    (formData.status === "pending" ||
                      formData.status === "rejected") &&
                    setIdHover(true)
                  }
                  onMouseLeave={() => setIdHover(false)}
                  onClick={() =>
                    (formData.status === "pending" ||
                      formData.status === "rejected") &&
                    idFileRef.current.click()
                  }
                >
                  {formData.scannedId ? (
                    <div className="position-relative">
                      <img
                        src={formData.scannedId}
                        alt="Scanned ID"
                        className="img-fluid rounded"
                      />
                      {idHover &&
                        (formData.status === "pending" ||
                          formData.status === "rejected") && (
                          <div className="document-overlay d-flex align-items-center justify-content-center">
                            <i className="bi bi-camera-fill me-2"></i>
                            Update ID
                          </div>
                        )}
                    </div>
                  ) : (
                    <div className="empty-document d-flex flex-column align-items-center justify-content-center">
                      <i className="bi bi-card-image fs-1 mb-2"></i>
                      <span>Upload a clear scan of your student ID</span>
                      {(formData.status === "pending" ||
                        formData.status === "rejected") && (
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary mt-2"
                          onClick={() => idFileRef.current.click()}
                        >
                          Select ID
                        </button>
                      )}
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  ref={idFileRef}
                  style={{ display: "none" }}
                  onChange={(e) => handleFileUpload(e, "scannedId")}
                  disabled={
                    formData.status !== "pending" &&
                    formData.status !== "rejected"
                  }
                />
              </div>
            </div>
          </div>

          {(formData.status === "pending" ||
            formData.status === "rejected") && (
            <div className="text-center mt-4">
              <button
                className="btn btn-primary px-4"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit for Verification"}
              </button>
            </div>
          )}
        </div>
      </form>

      <Modal
        show={isModalOpen}
        onHide={() => setModalOpen(false)}
        centered
        className="password-change-modal"
      >
        <Modal.Header closeButton className="border-bottom-0">
          <Modal.Title className="fw-bold">Change Password</Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-0">
          {errorMessage && (
            <div className="alert alert-danger py-2">{errorMessage}</div>
          )}
          {successMessage && (
            <div className="alert alert-success py-2">{successMessage}</div>
          )}
          <Form onSubmit={handlePasswordSubmit}>
            {[
              {
                name: "currentPassword",
                label: "Current Password",
                placeholder: "Enter your current password",
              },
              {
                name: "newPassword",
                label: "New Password",
                placeholder: "Enter your new password",
              },
              {
                name: "confirmNewPassword",
                label: "Confirm New Password",
                placeholder: "Confirm your new password",
              },
            ].map((field) => (
              <Form.Group className="mb-4" key={field.name}>
                <Form.Label className="fw-semibold mb-1">
                  {field.label}
                </Form.Label>
                <InputGroup>
                  <Form.Control
                    type={passwordVisibility[field.name] ? "text" : "password"}
                    name={field.name}
                    value={passwordData[field.name]}
                    onChange={handlePasswordChange}
                    placeholder={field.placeholder}
                    required
                    className=""
                  />
                  <Button
                    variant="outline-secondary"
                    onClick={() => togglePasswordVisibility(field.name)}
                    className=""
                  >
                    {passwordVisibility[field.name] ? (
                      <img
                        src={showPassword}
                        alt="Hide"
                        className="password-icon"
                      />
                    ) : (
                      <img
                        src={hidePassword}
                        alt="Show"
                        className="password-icon"
                      />
                    )}
                  </Button>
                </InputGroup>
                {field.name === "newPassword" && (
                  <div className="mt-2">
                    <PasswordMeter password={passwordData.newPassword} />
                  </div>
                )}
              </Form.Group>
            ))}
            <div className="d-flex justify-content-end gap-3 mt-4">
              <Button
                variant="light"
                onClick={() => setModalOpen(false)}
                className="px-4"
              >
                Cancel
              </Button>
              <Button variant="primary" type="submit" className="px-4">
                Update Password
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default EditProfile;
