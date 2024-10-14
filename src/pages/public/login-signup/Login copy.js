import React, { useState } from 'react';

const LoginSignUp = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [uploadedId, setUploadedId] = useState(null);

  const handleTabClick = (tab) => {
    setIsLogin(tab === 'login');
    // Reset image previews when switching tabs
    setUploadedImage(null);
    setUploadedId(null);
  };

  const handleImageUpload = (e, setImage) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="auth-container">
      <div className="tab-buttons">
        <button onClick={() => handleTabClick('login')} className={isLogin ? 'active' : ''}>
          Log In
        </button>
        <button onClick={() => handleTabClick('signup')} className={!isLogin ? 'active' : ''}>
          Sign Up
        </button>
      </div>

      {isLogin ? (
        <div className="form-container">
          <h2>Log In</h2>
          <div>
            <label>Email Address</label>
            <input type="email" />
          </div>

          <div>
            <label>Password</label>
            <input type="password" />
          </div>
          <div>
            <button className="btn btn-primary">Log In</button>
            <button className="btn btn-secondary">Forgot Password</button>
            <span>or</span>
            <p>
              You don't have an account? <a href="/signup">Sign up here!</a>
            </p>
          </div>
        </div>
      ) : (
        <div className="form-container">
          <h2>Sign Up</h2>
          <div>
            <label>Name</label>
            <input type="text" />
          </div>
          <div>
            <label>Email</label>
            <input type="email" />
          </div>
          <div>
            <label>College</label>
            <select className="search-dropdown">
              <option value="option1">Explore</option>
              <option value="option2">Option 2</option>
              <option value="option3">Option 3</option>
            </select>
          </div>
          <div>
            <p>For verification [i]</p>
            <div>
              <label>Scanned ID</label>
              <input type="file" onChange={(e) => handleImageUpload(e, setUploadedId)} />
              {uploadedId && <img src={uploadedId} alt="Uploaded ID" className="preview" />}
            </div>
            <div>
              <label>Picture with your ID</label>
              <input type="file" onChange={(e) => handleImageUpload(e, setUploadedImage)} />
              {uploadedImage && <img src={uploadedImage} alt="Uploaded Image" className="preview" />}
            </div>
          </div>
          <div>
            <button className="btn btn-primary">Sign Up</button>
            <span>or</span>
            <p>
              Already have an account? <a href="/login">Log in here.</a>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

// export default LoginSignUp;
