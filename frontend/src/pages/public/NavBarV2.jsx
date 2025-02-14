import "./navBarV2Styles.css";
import React, { useState, useEffect, useRef } from "react";
import logoDark from "../../assets/images/navbar/cc-logo.png";
import { useNavigate } from "react-router-dom";

const NavBarV2 = () => {
  const navigate = useNavigate();
  return (
    <div className={` "dark" `}>
      <div className="navbar-main">
        {/* Logo */}
        <div className="nav-logo" onClick={() => navigate("/")}>
          <img src={logoDark} alt="RentTUPeers logo" />
          <span className={"dark"}>RenTUPeers</span>
        </div>
      </div>
    </div>
  );
};

export default NavBarV2;
