// images, icons
import Logo from "../../../assets/images/navbar/cc-logo-white.svg";
// style, css
import "./footerStyles.css";

const Footer = () => {
  return (
    <div className="container-content footer-container">
      <div className="footer">
        <div className="footer-flag">
          <img src={Logo} alt="Campus Connect Logo" className="footer-logo" />
          <h5 className="footer-title">RenTUPeers</h5>
        </div>

        <div className="footer-links">
          <div className="link-section">
            <h5 className="link-title">ABOUT</h5>
            <ul>
              <li><a href="#">Our Story</a></li>
              <li><a href="#">Mission</a></li>
              <li><a href="#">Benefits</a></li>
              <li><a href="#">Team</a></li>
            </ul>
          </div>
          <div className="link-section">
            <h5 className="link-title">LEGAL</h5>
            <ul>
              <li><a href="/terms-and-condition">Terms and Conditions</a></li>
              <li><a href="/privacy-policy">Privacy Policy</a></li>
            </ul>
          </div>
          <div className="link-section">
            <h5 className="link-title">CONTACT US</h5>
            <ul>
              <li><a href="#">rentupeers.team@tup.edu.ph</a></li>
              <li><a href="#">+639 123 456 789</a></li>
            </ul>
          </div>
        </div>
      </div>

      <hr className="footer-divider" />
      <div className="footer-bottom">
        <span>©2024 Campus Connect. All Rights Reserved</span>
      </div>
    </div>
  );
};

export default Footer;
