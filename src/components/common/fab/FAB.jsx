import React, { useState } from "react";
import "./style.css";
import { useNavigate } from "react-router-dom";
import createPostIcon from "../../../assets/images/fab/POSTS.svg"
import addItemIcon from "../../../assets/images/fab/RENTALS.svg"

const FAB = ({ icon, onClick }) => {
  const [showButtons, setShowButtons] = useState(false);
  const navigate = useNavigate();

  const handleShow = () => {
    setShowButtons(!showButtons);
  };

  function createPost() {
    navigate("/new-post");
  }
  function addItem() {
    navigate("/add-listing");
  }

  return (
    <div className="fab-container">
      <div className={`fab-buttons ${showButtons ? "show" : ""}`}>
        <button className="fab add-item" onClick={addItem}>
          <img src={createPostIcon} alt ="Create post icon"/>
        </button>
        <button className="fab create-post" onClick={createPost}>
        <img src={addItemIcon} alt ="Create post icon"/>
        </button>
      </div>
      <button className="fab" onClick={handleShow}>
        {icon}
      </button>
    </div>
  );
};

export default FAB;
