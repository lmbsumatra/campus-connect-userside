import React, { useState } from "react";
import "./style.css";
import { useNavigate } from "react-router-dom";

const FAB = ({ icon, onClick }) => {
  const [showButtons, setShowButtons] = useState(false);
  const navigate = useNavigate();

  const handleShow = () => {
    setShowButtons(!showButtons);
  };

  function createPost() {
    navigate("/new-post");
  }

  return (
    <div className="fab-container">
      <div className={`fab-buttons ${showButtons ? "show" : ""}`}>
        <button className="fab add-item" onClick={() => onClick("add-item")}>
          add
        </button>
        <button className="fab create-post" onClick={createPost}>
          create
        </button>
      </div>
      <button className="fab" onClick={handleShow}>
        {icon}
      </button>
    </div>
  );
};

export default FAB;
