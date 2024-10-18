import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./adminSettingStyles.css";

const AdminSettings = () => {
  const [showCreateAcctWindow, setShowCreateAcctWindow] = useState(false);
  const [profilePicture, setProfilePicture] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const handleCreateAccount = () => {
    setShowCreateAcctWindow(!showCreateAcctWindow);
    // Reset the image preview when the modal is closed
    setProfilePicture(null);
    setImagePreview(null);
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setProfilePicture(file);
      setImagePreview(URL.createObjectURL(file)); // Create a preview URL
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault(); // Prevent default behavior (Prevent file from being opened)
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      setProfilePicture(file);
      setImagePreview(URL.createObjectURL(file)); // Create a preview URL
    }
  };

  return (
    <div className="admin-content-container">
      <div className="admin content">
        <button className="btn btn-primary" onClick={handleCreateAccount}>
          Create Account
        </button>

        {showCreateAcctWindow && (
          <div className="modal show overlay" style={{ display: "block" }}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Create Admin Account</h5>
                  <button
                    type="button"
                    className="close"
                    onClick={handleCreateAccount}
                  >
                    <span>&times;</span>
                  </button>
                </div>
                <div className="modal-body">
                  <form>
                    {/* Profile Picture Upload Box */}
                    <div className="form-group">
                      <label>Profile Picture:</label>
                      <div
                        className="border border-dashed rounded p-3 text-center"
                        style={{
                          cursor: "pointer",
                          width: "200px",
                          maxHeight: "200px",
                        }}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        onClick={() =>
                          document.getElementById("file-input").click()
                        }
                      >
                        {imagePreview ? (
                          <img
                            src={imagePreview}
                            alt="Profile Preview"
                            style={{
                              width: "100%",
                              maxHeight: "200px",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <p>Drag and drop an image here, or click to upload</p>
                        )}
                        <input
                          type="file"
                          id="file-input"
                          accept="image/*"
                          style={{ display: "none" }}
                          onChange={handleFileChange}
                        />
                      </div>
                    </div>

                    {/* Full Name */}
                    <div className="form-group">
                      <label>Input your complete name</label>
                      <div className="input-group">
                        <input
                          type="text"
                          placeholder="First name"
                          className="form-control"
                        />
                        <input
                          type="text"
                          placeholder="Middle name (optional)"
                          className="form-control"
                        />
                        <input
                          type="text"
                          placeholder="Last name"
                          className="form-control"
                        />
                      </div>
                    </div>

                    {/* Basic Information */}
                    <div className="form-group">
                      <label>Username:</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Enter username"
                      />
                    </div>

                    <div className="form-group">
                      <label>Password:</label>
                      <input
                        type="password"
                        className="form-control"
                        placeholder="Enter password"
                      />
                    </div>

                    <div className="form-group">
                      <label>Email Address:</label>
                      <input
                        type="email"
                        className="form-control"
                        placeholder="Enter email"
                      />
                    </div>

                    {/* Select Role */}
                    <div className="form-group">
                      <label>Select Role:</label>
                      <select className="form-control">
                        <option value="">Choose role</option>
                        <option value="super_admin">Super Admin</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>

                    {/* Account Status */}
                    <div className="form-group">
                      <label>Account Status:</label>
                      <select className="form-control">
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="suspended">Suspended</option>
                      </select>
                    </div>

                    {/* Add Admin Button */}
                    <button type="submit" className="btn btn-success">
                      Add Admin
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSettings;
