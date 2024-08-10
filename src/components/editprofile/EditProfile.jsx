import React, { useState } from "react";
import './style.css';

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
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission logic here
  };

  return (
    <form onSubmit={handleSubmit} className="edit-profile-form">
      <div className="form-section personal-details">
        <h3 className="section-label">Personal Details</h3>
        <div className="details-grid">
          <div className="form-group">
            <label>Surname</label>
            <input type="text" name="surname" value={formData.surname} onChange={handleChange} placeholder="Example Input" />
          </div>
          <div className="form-group">
            <label>Firstname</label>
            <input type="text" name="firstname" value={formData.firstname} onChange={handleChange} placeholder="Example Input" />
          </div>
          <div className="form-group">
            <label>Middlename (optional)</label>
            <input type="text" name="middlename" value={formData.middlename} onChange={handleChange} placeholder="Example Input" />
          </div>
          <div className="form-group">
            <label>Year</label>
            <input type="text" name="year" value={formData.year} onChange={handleChange} placeholder="Example Input" />
          </div>
          <div className="form-group">
            <label>College</label>
            <input type="text" name="college" value={formData.college} onChange={handleChange} placeholder="Example Input" />
          </div>
          <div className="form-group">
            <label>Course</label>
            <input type="text" name="course" value={formData.course} onChange={handleChange} placeholder="Example Input" />
          </div>
          <div className="form-group">
            <label>Gender</label>
            <input type="text" name="gender" value={formData.gender} onChange={handleChange} placeholder="Example Input" />
          </div>
          <div className="form-group">
            <label>Birthday</label>
            <input type="date" name="birthday" value={formData.birthday} onChange={handleChange} placeholder="Example Input" />
          </div>
        </div>
      </div>

      <div className="form-section account-details">
        <h3 className="section-label">Account Details</h3>
        <div className="details-grid">
          <div className="form-group">
            <label>Username</label>
            <input type="text" name="username" value={formData.username} onChange={handleChange} placeholder="Example Input" />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Example Input" />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Example Input" />
          </div>
          <div className="form-group">
            <label>Confirm Password</label>
            <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Example Input" />
          </div>
        </div>
      </div>

      <div className="form-section verification">
        <h3 className="section-label">Verification</h3>
        <div className="verification-grid">
          <div className="form-group">
            <label>Upload Image</label>
            <input type="file" name="verificationImage" onChange={handleChange} />
          </div>
          {/* Add any other verification inputs here */}
        </div>
      </div>
    </form>
  );
}

export default EditProfile;
