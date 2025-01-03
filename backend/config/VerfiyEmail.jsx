// const logo = require("./cc-logo.png");
// const require() "./verifyEmailStyles.css";

const VerifyEmail = () => {
  return `
    <div className="container-content email">
      <div>
        {/* <img src={logo} /> */}
        <span>Campus Connect</span>
      </div>
      <div>
        <h1>Verify you email address.</h1>
      </div>
      <div>
        <h6>Welcome to Campus Connect!</h6>
        <p>
          Click the button below to verify your email address and make your
          account active.
        </p>
      </div>
      <div>
        <button className="btn btn-primary">Verify</button>
        <span>This link will expire in 5 mins.</span>
      </div>
      <div>
        <span>
          If the button above doesn't work, click or copy + paste this link in
          you browser:
        </span>
        <a href="http://localhost:3001/verfiy-email/{{token}}">
          http://localhost:3001/verfiy-email/{{ token }}
        </a>
      </div>
      <div>
        <span>
          If you didn't request this email or if you think something is wrong,
          contact use at <a href="">campusconnect@gmail.com</a> We'd love to
          help.
        </span>
      </div>
    </div>`;
};

module.exports = VerifyEmail;
