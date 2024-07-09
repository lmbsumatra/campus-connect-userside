// images, icons
import Logo from "../../assets/images/icons/CC-LOGO-01.svg";
// style, css
import "./style.css";

const Footer = () => {
  return (
    <div className="custom-container">
      <div className="footer">
        <div className="flag bg-main d-flex align-items-center">
          <img src={Logo} alt="" />
          <h5 className="fs-5 fw-bold text-white">Campus Connect</h5>
        </div>

        <div className="footer-links">
          <div className="link-header">
            <h5 className="fs-5 text-secondary">ABOUT</h5>
            <ul>
              <li>
                <a href="#" className="text-gradient">Our Story</a>
              </li>
              <li>
                <a href="#" className="text-gradient">Mission</a>
              </li>
              <li>
                <a href="#" className="text-gradient">Benefits</a>
              </li>
              <li>
                <a href="#" className="text-gradient">Team</a>
              </li>
            </ul>
          </div>
          <div className="link-header">
            <h5 className="fs-5 text-secondary">LEGAL</h5>
            <ul>
              <li>
                <a href="#" className="text-gradient">Terms and Conditions</a>
              </li>
              <li>
                <a href="#" className="text-gradient">Privacy Policy</a>
              </li>
              <li>
                <a href="#" className="text-gradient">Terms of Use</a>
              </li>
              <li>
                <a href="#" className="text-gradient">Do not Sell or Share My Personal Information</a>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <hr />
      <div className="d-flex justify-content-center w-100">
        <span>©2024 Campus Connect. All Rights Reserved</span>
      </div>
    </div>
  );
};

export default Footer;
