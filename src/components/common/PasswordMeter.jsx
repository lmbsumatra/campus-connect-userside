import "./passwordMeterStyles.css";

const PasswordMeter = ({ password }) => {
  const checkRequirements = () => {
    return [
      { test: password.length >= 8, label: "At least 8 characters" },
      { test: /[A-Z]/.test(password), label: "At least one uppercase letter" },
      { test: /[a-z]/.test(password), label: "At least one lowercase letter" },
      { test: /\d/.test(password), label: "At least one number" },
      {
        test: /[!@#$%^&*(),.?":{}|<>]/.test(password),
        label: "At least one symbol",
      },
    ];
  };

  const requirements = checkRequirements();
  const metCount = requirements.filter((req) => req.test).length;

  const progressBarColor = () => {
    if (metCount === 0) {
      return { color: "#FF4C4C", label: "No Strength", width: "0" };
    } else if (metCount === 1) {
      return { color: "#FF4C4C", label: "Very Weak", width: "20%" };
    } else if (metCount === 2) {
      return { color: "#FFD700", label: "Fair", width: "40%" };
    } else if (metCount === 3) {
      return { color: "#FFA500", label: "Good", width: "60%" };
    } else if (metCount === 4) {
      return { color: "#8BC34A", label: "Strong", width: "80%" };
    } else if (metCount === 5) {
      return { color: "#4CAF50", label: "Very Strong", width: "100%" };
    }
  };

  const changeStyle = () => ({
    width: progressBarColor().width,
    background: progressBarColor().color,
  });

  return (
    <div>
      <span>Password Strength: </span>
      <div className="progress" style={{ height: "7px" }}>
        <div className="progress-bar" style={changeStyle()}></div>
      </div>
      <span>{progressBarColor().label}</span>
      <ul>
        {requirements.map((req, index) => (
          <li key={index} style={{ color: req.test ? "green" : "red" }}>
            {req.label} {req.test ? "✔️" : "❌"}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PasswordMeter;
