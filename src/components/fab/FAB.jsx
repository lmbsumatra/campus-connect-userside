import React, { useState } from "react";
import "./style.css"; // If you have custom styles for the FAB

const FAB = ({ icon, onClick }) => {
  const [showButtons, setShowButtons] = useState(false);

  const handleShow = () => {
    setShowButtons(!showButtons);
  };

  return (
    <div className="fab-container">
      <div className={`fab-buttons ${showButtons ? 'show' : ''}`}>
        <button className="fab add-item" onClick={() => onClick("add-item")}>
          add
        </button>
        <button
          className="fab create-post"
          onClick={() => onClick("create-post")}
        >
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
