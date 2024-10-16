// images, icons
import Logo from "../../assets/images/navbar/cc-logo-white.svg";
// style, css
import "./footerStyles.css";

const Footer = () => {
  return (
    <div className="container-content d-block">
      <div className="footer">
        <div className="flag d-flex align-items-center">
          <img src={Logo} alt="Campus Connect Logo" />
          <h5 className="fs-5 fw-bold text-white">Campus Connect</h5>
        </div>

        <div className="footer-links">
          <div className="link-header">
            <h5 className="fs-5 text-accent fw-bold">ABOUT</h5>
            <ul>
              <li>
                <a href="#" className="">Our Story</a>
              </li>
              <li>
                <a href="#" className="">Mission</a>
              </li>
              <li>
                <a href="#" className="">Benefits</a>
              </li>
              <li>
                <a href="#" className="">Team</a>
              </li>
            </ul>
          </div>
          <div className="link-header">
            <h5 className="fs-5 text-accent fw-bold">LEGAL</h5>
            <ul>
              <li>
                <a href="#" className="">Terms and Conditions</a>
              </li>
              <li>
                <a href="#" className="">Privacy Policy</a>
              </li>
              <li>
                <a href="#" className="">Terms of Use</a>
              </li>
              <li>
                <a href="#" className="">Do not Sell or Share My Personal Information</a>
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
