import logo from "../../assets/images/navbar/cc-logo.png";
import "./verifyEmailStyles.css";

const VerifyEmail = ({ token }) => {
  const verificationUrl = `http://localhost:3001/verify-email/${token}`;

  return (
    <div className="container-content email">
      <div className="header">
        <img src={logo} alt="Campus Connect Logo" />
        <span>Campus Connect</span>
      </div>
      <div className="content">
        <h1>Verify Your Email Address</h1>
        <h6>Welcome to Campus Connect!</h6>
        <p>
          Click the button below to verify your email address and activate your
          account.
        </p>
        <button
          className="btn btn-primary"
          onClick={() => window.location.href = verificationUrl}
        >
          Verify
        </button>
        <span className="expiration">This link will expire in 5 minutes.</span>
        <p>
          If the button above doesn't work, copy and paste the following link
          into your browser:
        </p>
        <a href={verificationUrl} target="_blank" rel="noopener noreferrer">
          {verificationUrl}
        </a>
      </div>
      <div className="footer">
        <p>
          If you didn’t request this email or think something is wrong, contact
          us at{" "}
          <a href="mailto:campusconnect@gmail.com">campusconnect@gmail.com</a>.
          We’d love to help.
        </p>
      </div>
    </div>
  );
};

export default VerifyEmail;
