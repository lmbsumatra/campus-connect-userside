// images, icons
import { useState } from "react";
import Logo from "../../../assets/images/navbar/cc-logo-white.svg";
// style, css
import "./footerStyles.css";
import MissionVisionModal from "./MissionVisionModal";

const Footer = () => {
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState("mission");

  const openModalWithTab = (tab) => {
    setActiveTab(tab);
    setShowModal(true);
  };

  return (
    <div className="container-content footer-container">
      <div className="footer">
        <div className="footer-flag">
          <img src={Logo} alt="RenTUPeers Logo" className="footer-logo" />
          <h5 className="footer-title">RenTUPeers</h5>
        </div>

        <div className="footer-links">
          <div className="link-section">
            <h5 className="link-title">ABOUT</h5>
            <ul>
              <li>
                <a
                  href=""
                  onClick={(e) => {
                    e.preventDefault();
                    openModalWithTab("mission");
                  }}
                >
                  Mission
                </a>
              </li>
              <li>
                <a
                  href=""
                  onClick={(e) => {
                    e.preventDefault();
                    openModalWithTab("vision");
                  }}
                >
                  Vision
                </a>
              </li>
            </ul>
          </div>
          <div className="link-section">
            <h5 className="link-title">LEGAL</h5>
            <ul>
              <li>
                <a href="/terms-and-condition">Terms and Conditions</a>
              </li>
              <li>
                <a href="/privacy-policy">Privacy Policy</a>
              </li>
            </ul>
          </div>
          <div className="link-section">
            <h5 className="link-title">CONTACT US</h5>
            <ul>
              <li>
                <a href="#">rentupeers.team@tup.edu.ph</a>
              </li>
              <li>
                <a href="#">+639 123 456 789</a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <MissionVisionModal
        show={showModal}
        handleClose={() => setShowModal(false)}
        defaultTab={activeTab}
      />

      <hr className="footer-divider" />
      <div className="footer-bottom">
        <span>©2024 RenTUPeers. All Rights Reserved</span>
      </div>
    </div>
  );
};

export default Footer;
