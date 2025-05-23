import React, { useState, useEffect, useRef } from "react";
import FetchUserInfo from "../../../../utils/FetchUserInfo";
import "./editProfileStyles.css";
import { useAuth } from "../../../../context/AuthContext";
import showPassword from "../../../../assets/images/icons/eye-open.svg";
import hidePassword from "../../../../assets/images/icons/eye-closed.svg";
import PasswordMeter from "../../../../components/common/PasswordMeter";
import { Modal, InputGroup } from "react-bootstrap";
import { Tooltip } from "@mui/material";
import { baseApi, collegesAndCourses } from "../../../../utils/consonants";
import { Form, Button, Container, Row, Col } from "react-bootstrap";
import { useDispatch } from "react-redux";
import ShowAlert from "../../../../utils/ShowAlert";

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
    corImage: "",
    status: "",
  });

  // Store original data to compare for changes
  const [originalData, setOriginalData] = useState({});
  const [isPersonalDataChanged, setIsPersonalDataChanged] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isModalOpen, setModalOpen] = useState(false);
  const { studentUser } = useAuth();
  const userId = studentUser.userId;
  const token = studentUser.token;

  const {
    user,
    student,
    errorMessage: fetchErrorMessage,
  } = FetchUserInfo({ userId });

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorVerificationMessage, setVerificationErrorMessage] = useState("");
  const [successVerificationMessage, setVerificationSuccessMessage] =
    useState("");
  const dispatch = useDispatch();

  useEffect(() => {
    if (user && student) {
      const userData = {
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
        corImage: student.corImage || "",
        status: student.status || "",
        statusMsg: student.statusMsg || "",
      };

      setFormData(userData);
      setOriginalData(userData); // Save original data for comparison
    }
    if (fetchErrorMessage) {
      setErrorMessage(fetchErrorMessage);
    }
  }, [user, student, fetchErrorMessage]);

  // Check if personal data has changed
  useEffect(() => {
    const personalFields = [
      "surname",
      "firstname",
      "middlename",
      "year",
      "college",
      "course",
      "tup_id",
    ];

    const hasChanges = personalFields.some(
      (field) => formData[field] !== originalData[field]
    );
    setIsPersonalDataChanged(hasChanges);
  }, [formData, originalData]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // College dropdown change handler
  const handleCollegeChange = (e) => {
    const selectedCollege = e.target.value;
    setFormData((prevData) => ({
      ...prevData,
      college: selectedCollege,
      course: "", // Reset course when college changes
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
    setIsSubmitting(true);

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
          college: formData.college,
          course: formData.course,
          tup_id: formData.tup_id,
        }),
      });
      if (response.ok) {
        setSuccessMessage("Profile updated successfully!");
        ShowAlert(dispatch, "success", "Profile updated successfully!");
        // Update original data to match current data
        setOriginalData({ ...formData });
        setIsPersonalDataChanged(false);

        setTimeout(() => {
          setSuccessMessage("");
        }, 3000);
      } else {
        const errorData = await response.json();
        setErrorMessage(
          errorData.message || "Failed to update profile. Please try again."
        );
        ShowAlert(
          dispatch,
          "error",
          "Failed to update profile. Please try again."
        );
        setTimeout(() => {
          setErrorMessage("");
        }, 3000);
      }
    } catch (error) {
      setErrorMessage("An error occurred while updating your profile.");
      ShowAlert(
        dispatch,
        "error",
        "An error occurred while updating your profile."
      );
      setTimeout(() => {
        setErrorMessage("");
      }, 3000);
    } finally {
      setIsSubmitting(false);
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
  const [corHover, setCorHover] = useState(false);

  const photoFileRef = useRef(null);
  const idFileRef = useRef(null);
  const corFileRef = useRef(null);

  const [uploadedFiles, setUploadedFiles] = useState({
    scannedId: null,
    photoWithId: null,
    corImage: null,
  });

  const handleFileUpload = (e, type) => {
    if (formData.status !== "pending" && formData.status !== "flagged") return;

    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setVerificationErrorMessage(
        "File size exceeds 5MB limit. Please select a smaller image."
      );
      setTimeout(() => setVerificationErrorMessage(""), 3000);
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      setVerificationErrorMessage("Only JPG and PNG files are accepted.");
      setTimeout(() => setVerificationErrorMessage(""), 3000);
      return;
    }

    const imageUrl = URL.createObjectURL(file);

    // This ensures React recognizes the state change
    setFormData((prev) => ({
      ...prev,
      [type]: imageUrl,
    }));

    setUploadedFiles((prev) => ({
      ...prev,
      [type]: file,
    }));
  };

  const handleDocumentSubmission = async (e) => {
    e.preventDefault();

    if (!uploadedFiles.scannedId && !uploadedFiles.photoWithId && !uploadedFiles.corImage) {
      setVerificationErrorMessage(
        "Please select at least one document to update."
      );
      ShowAlert(
        dispatch,
        "error",
        "Please select at least one document to update."
      );
      setTimeout(() => {
        setErrorMessage("");
      }, 3000);
      return;
    }

    setIsSubmitting(true);
    setVerificationErrorMessage("");

    try {
      const formDataToSubmit = new FormData();

      if (uploadedFiles.scannedId) {
        formDataToSubmit.append("scanned_id", uploadedFiles.scannedId);
      }

      if (uploadedFiles.photoWithId) {
        formDataToSubmit.append("photo_with_id", uploadedFiles.photoWithId);
      }

      if (uploadedFiles.corImage) {
        formDataToSubmit.append("cor_image", uploadedFiles.corImage);
      }

      const response = await fetch(
        `${baseApi}/user/update-verification-documents`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`, // Remove "Content-Type" header
          },
          body: formDataToSubmit,
        }
      );

      if (response.ok) {
        const data = await response.json();
        setVerificationSuccessMessage(
          "Documents submitted successfully. They will be reviewed shortly."
        );
        ShowAlert(
          dispatch,
          "success",
          "Documents submitted successfully. They will be reviewed shortly."
        );

        setFormData((prev) => ({
          ...prev,
          status: data.status,
          statusMsg: data.statusMsg,
        }));
        setUploadedFiles({ scannedId: null, photoWithId: null, corImage: null });
        ShowAlert(dispatch, "success", "Verification documents uploaded!");

        setTimeout(() => {
          setVerificationSuccessMessage("");
        }, 5000);
      } else {
        const errorData = await response.json();
        setVerificationErrorMessage(
          errorData.message || "Failed to update documents. Please try again."
        );
        ShowAlert(
          dispatch,
          "error",
          "Failed to update documents. Please try again."
        );
        setTimeout(() => {
          setVerificationErrorMessage("");
        }, 3000);
      }
    } catch (error) {
      console.error("Error updating documents:", error);
      setVerificationErrorMessage(
        "A network error occurred. Please try again later."
      );
      ShowAlert(
        dispatch,
        "error",
        "A network error occurred. Please try again later."
      );
      setTimeout(() => {
        setVerificationErrorMessage("");
      }, 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get college abbreviations for dropdown
  const collegeOptions = Object.keys(collegesAndCourses);

  return (
    <Container className="rounded bg-white mt-2 p-4">
      {errorMessage && (
        <div className="alert alert-danger mb-3">{errorMessage}</div>
      )}
      {successMessage && (
        <div className="alert alert-success mb-3">{successMessage}</div>
      )}

      {/* Personal Details Form */}
      <Form onSubmit={handleProfileSubmit} className="form-section mb-4">
        <h3 className="mb-4 fw-bold">Edit Personal Details</h3>

        {/* Name Fields - Three Columns */}
        <Row className=" mb-3">
          <Col md={4}>
            <Form.Group controlId="formSurname">
              <Form.Label className="fw-semibold">Surname</Form.Label>
              <Form.Control
                type="text"
                name="surname"
                value={formData.surname}
                onChange={handleChange}
                placeholder="Enter surname"
                className="form-control p-2"
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group controlId="formFirstname">
              <Form.Label className="fw-semibold">Firstname</Form.Label>
              <Form.Control
                type="text"
                name="firstname"
                value={formData.firstname}
                onChange={handleChange}
                placeholder="Enter firstname"
                className="form-control p-2"
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group controlId="formMiddlename">
              <Form.Label className="fw-semibold">Middlename</Form.Label>
              <Form.Control
                type="text"
                name="middlename"
                value={formData.middlename}
                onChange={handleChange}
                placeholder="Enter middlename"
                className="form-control p-2"
              />
            </Form.Group>
          </Col>
        </Row>

        {/* Other Fields */}
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group controlId="formTupId">
              <Tooltip
                title={
                  formData.status === "verified" && "This has been verified."
                }
              >
                <Form.Label className="fw-semibold">TUP ID</Form.Label>
                <Form.Control
                  type="text"
                  name="tup_id"
                  value={formData.tup_id}
                  onChange={handleChange}
                  readOnly={formData.status === "verified"}
                  disabled={formData.status === "verified"}
                  className="form-control p-2"
                />
              </Tooltip>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group controlId="formCollege">
              <Form.Label className="fw-semibold">College</Form.Label>
              <Form.Select
                name="college"
                value={formData.college}
                onChange={handleCollegeChange}
                className="form-select p-2"
              >
                <option value="">Select College</option>
                {collegeOptions.map((college) => (
                  <option key={college} value={college}>
                    {college}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={6}>
            <Form.Group controlId="formCourse">
              <Form.Label className="fw-semibold">Course</Form.Label>
              <Form.Select
                name="course"
                value={formData.course}
                onChange={handleChange}
                className="form-select p-2"
              >
                <option value="">Select Course</option>
                {formData.college &&
                  Object.entries(
                    collegesAndCourses[formData.college] || {}
                  ).map(([code, courseName]) => (
                    <option key={code} value={courseName}>
                      {courseName}
                    </option>
                  ))}
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>

        <div className="text-end mt-4">
          <Button
            type="submit"
            variant="primary"
            disabled={!isPersonalDataChanged || isSubmitting}
            className="px-4"
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </Form>

      {/* Account Details Section */}
      <div className="form-section mb-4 mt-5">
        <h3 className="mb-4 fw-bold">Account Details</h3>
        <Row className="">
          <Col md={6} className="mb-3">
            <Form.Group>
              <Form.Label className="fw-semibold">Email</Form.Label>
              <Tooltip title="Changing email is not available for now.">
                <Form.Control
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email"
                  disabled
                  className="form-control"
                />
              </Tooltip>
            </Form.Group>
          </Col>
          <Col md={6} className="mb-3">
            <Form.Group>
              <Form.Label className="fw-semibold">Password</Form.Label>
              <div>
                <Button
                  type="button"
                  variant="outline-primary"
                  onClick={() => setModalOpen(true)}
                  className="px-4"
                >
                  Change Password
                </Button>
              </div>
            </Form.Group>
          </Col>
        </Row>
      </div>

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

          {errorVerificationMessage && (
            <div className="alert alert-danger mb-3">
              {errorVerificationMessage}
            </div>
          )}
          {successVerificationMessage && (
            <div className="alert alert-success mb-3">
              {successVerificationMessage}
            </div>
          )}

          {/* {formData.status === "flagged" && (
            <div className="alert alert-danger mb-3">
              <small>
                Your verification was flagged. Please upload new documents.
              </small>
            </div>
          )} */}

          <div className="row verification-grid g-4">
            <div className="col-lg-4 col-md-6 col-12">
              <div className="document-container">
                <div className="document-label d-flex justify-content-between">
                  <span>Photo with ID</span>
                  {(formData.status === "pending" ||
                    formData.status === "flagged") && (
                    <small className="text-primary">
                      Click image to change
                    </small>
                  )}
                </div>
                <div
                  className={`document-preview ${
                    formData.status === "pending" ||
                    formData.status === "flagged"
                      ? "document-preview-editable"
                      : ""
                  }`}
                  onMouseEnter={() =>
                    (formData.status === "pending" ||
                      formData.status === "flagged") &&
                    setPhotoHover(true)
                  }
                  onMouseLeave={() => setPhotoHover(false)}
                  onClick={() =>
                    (formData.status === "pending" ||
                      formData.status === "flagged") &&
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
                          formData.status === "flagged") && (
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
                        formData.status === "flagged") && (
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
                    formData.status !== "flagged"
                  }
                />
              </div>
            </div>

            <div className="col-lg-4 col-md-6 col-12">
              <div className="document-container">
                <div className="document-label d-flex justify-content-between">
                  <span>Scanned ID</span>
                  {(formData.status === "pending" ||
                    formData.status === "flagged") && (
                    <small className="text-primary">
                      Click image to change
                    </small>
                  )}
                </div>
                <div
                  className={`document-preview ${
                    formData.status === "pending" ||
                    formData.status === "flagged"
                      ? "document-preview-editable"
                      : ""
                  }`}
                  onMouseEnter={() =>
                    (formData.status === "pending" ||
                      formData.status === "flagged") &&
                    setIdHover(true)
                  }
                  onMouseLeave={() => setIdHover(false)}
                  onClick={() =>
                    (formData.status === "pending" ||
                      formData.status === "flagged") &&
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
                          formData.status === "flagged") && (
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
                        formData.status === "flagged") && (
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
                    formData.status !== "flagged"
                  }
                />
              </div>
            </div>

            <div className="col-lg-4 col-md-6 col-12">
              <div className="document-container">
                <div className="document-label d-flex justify-content-between">
                  <span>Certificate of Registration (COR)</span>
                  {(formData.status === "pending" ||
                    formData.status === "flagged") && (
                    <small className="text-primary">
                      Click image to change
                    </small>
                  )}
                </div>
                <div
                  className={`document-preview ${
                    formData.status === "pending" ||
                    formData.status === "flagged"
                      ? "document-preview-editable"
                      : ""
                  }`}
                  onMouseEnter={() =>
                    (formData.status === "pending" ||
                      formData.status === "flagged") &&
                    setCorHover(true)
                  }
                  onMouseLeave={() => setCorHover(false)}
                  onClick={() =>
                    (formData.status === "pending" ||
                      formData.status === "flagged") &&
                    corFileRef.current.click()
                  }
                >
                  {formData.corImage ? (
                    <div className="position-relative">
                      <img
                        src={formData.corImage}
                        alt="Certificate of Registration"
                        className="img-fluid rounded"
                      />
                      {corHover &&
                        (formData.status === "pending" ||
                          formData.status === "flagged") && (
                          <div className="document-overlay d-flex align-items-center justify-content-center">
                            <i className="bi bi-camera-fill me-2"></i>
                            Update COR
                          </div>
                        )}
                    </div>
                  ) : (
                    <div className="empty-document d-flex flex-column align-items-center justify-content-center">
                      <i className="bi bi-file-earmark-text fs-1 mb-2"></i>
                      <span>Upload your Certificate of Registration</span>
                      {(formData.status === "pending" ||
                        formData.status === "flagged") && (
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary mt-2"
                          onClick={() => corFileRef.current.click()}
                        >
                          Select COR
                        </button>
                      )}
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  ref={corFileRef}
                  style={{ display: "none" }}
                  onChange={(e) => handleFileUpload(e, "corImage")}
                  disabled={
                    formData.status !== "pending" &&
                    formData.status !== "flagged"
                  }
                />
              </div>
            </div>
          </div>

          {(formData.status === "pending" || formData.status === "flagged") && (
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

      {/* Password Change Modal */}
      <Modal
        show={isModalOpen}
        onHide={() => setModalOpen(false)}
        centered
        className="password-change-modal"
      >
        <Modal.Header closeButton className="border-bottom-0">
          <Modal.Title className="fw-bold">Change Password</Modal.Title>
        </Modal.Header>
        <Modal.Body className="py-2">
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
            ].map((field, index) => (
              <div key={field.name}>
                <Form.Group className="mb-4">
                  <Form.Label className="fw-semibold mb-1">
                    {field.label}
                  </Form.Label>
                  <InputGroup className="d-flex gap-0 m-0">
                    <Form.Control
                      type={
                        passwordVisibility[field.name] ? "text" : "password"
                      }
                      name={field.name}
                      value={passwordData[field.name]}
                      onChange={handlePasswordChange}
                      placeholder={field.placeholder}
                      required
                      className="form-control"
                    />
                    <Button
                      onClick={() => togglePasswordVisibility(field.name)}
                      className="m-0 p-0 d-flex align-items-center justify-content-center no-hover no-shadow"
                      style={{
                        backgroundColor: "transparent",
                        border: "1px solid rgb(218, 218, 218)",
                        borderTopRightRadius: "0.36rem",
                        borderBottomRightRadius: "0.36rem",
                        borderLeft: "none", // Remove left border to blend with input
                        boxShadow: "none", // Removes shadow
                        transition: "none", // Disables animation on hover
                      }}
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
              </div>
            ))}

            {/* Add a horizontal line before action buttons */}
            <div className="d-flex justify-content-end gap-3 mt-4">
              <Button
                variant="light"
                onClick={() => setModalOpen(false)}
                className="px-4 btn-light"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                type="submit"
                className="px-4 btn btn-primary"
              >
                Update Password
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
}

export default EditProfile;
