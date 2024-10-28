import React, { useState, useEffect } from "react";
import "../BorrowerPOV/postStyles.css";
import StarRating from "../../Rating/StarRating.jsx"
import { items, users } from "../data.jsx";
import BorrowingPost from "./Posts.jsx";

const UserProfileVisit = () => {
  const [activeTab, setActiveTab] = useState("about");
  const [borrowingPosts, setBorrowingPosts] = useState([]);

  const user = users[0]; // Assuming you want to display the first user

  // Simulating fetching borrowing posts, replace this with actual data fetching
  useEffect(() => {
    // Replace with actual API endpoint or data source
    fetch("/Posts.json")
      .then((response) => response.json())
      .then((data) => setBorrowingPosts(data.borrowingPosts));
  }, []);

  return (
    <div>
      <div className="profile-container">
        <div className="profile-header">
          <div className="profile-banner"></div>
          <div className="profile-picture">
            <img
              src={user.profilePhoto}
              alt="Profile"
              className="profile-photo"
            />
          </div>
          <div className="profile-info">
            <h2>{user.name}</h2>
            <div className="profile-details">
              <div>
                <span className="profile-label">College</span>
                <span className="profile-value">{user.college}</span>
              </div>
              <div>
                <span className="profile-label">Rating</span>
                <span className="profile-value">
                  <StarRating rating={user.rating} />
                </span>
              </div>
              <div className="profile-bio">
                <span className="profile-label">Bio</span>
                <span className="profile-value">{user.bio}</span>
              </div>
              <div>
                <span className="profile-label">Joined</span>
                <span className="profile-value">{user.joined}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="prof-content-wrapper">
          <div className="profile-content">
            <div className="filter-bttns">
              <button
                className={`filter-bttn ${
                  activeTab === "about" ? "active" : ""
                }`}
                onClick={() => setActiveTab("about")}
              >
                About
              </button>
              <button
                className={`filter-bttn ${
                  activeTab === "items" ? "active" : ""
                }`}
                onClick={() => setActiveTab("items")}
              >
                ({items.length}) Items
              </button>
              <button
                className={`filter-bttn ${
                  activeTab === "posts" ? "active" : ""
                }`}
                onClick={() => setActiveTab("posts")}
              >
                ({borrowingPosts.length}) Posts
              </button>
            </div>
            {activeTab === "about" && (
              <div>
                <h3>About</h3>
                <p>Details about the user...</p>
              </div>
            )}
            {activeTab === "items" && (
              <div className="item-list">
                {items.map((item, index) => (
                  <div className="card" key={index}>
                    <div className="card-img-top">
                      <img src={item.image} alt={item.title} />
                    </div>
                    <div className="card-body d-flex flex-column">
                      <div className="d-flex justify-content-between">
                        <h5 className="fs-5">{item.title}</h5>
                        <h3 className="fs-5">{item.price}</h3>
                      </div>
                      <div className="d-flex align-items-center mt-auto">
                        <img
                          src={item.ownerImage}
                          alt={item.owner}
                          className="icon-user me-2 mb-2"
                        />
                        <div>
                          <h5 className="fs-6">{item.owner}</h5>
                          <StarRating rating={item.rating || 0} />
                        </div>
                      </div>
                      <div className="button-container d-flex justify-content-end">
                        <button className="btn btn-primary no-fill me-2">
                          <span className="text-gradient">View</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {activeTab === "posts" && (
              <div>
                <BorrowingPost borrowingPosts={borrowingPosts} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfileVisit;
