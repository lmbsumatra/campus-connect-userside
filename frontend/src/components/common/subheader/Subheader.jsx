// Import the CSS file for styling
import "./style.css";

const Subheader = () => {
  return (
    <div className="sub-header">
      <div className="container max-xy feature-features">
        {features.map((feature, index) => (
          <div key={index} className={`feature feature-${index}`}>
            <div className="icon-container">
              <span className="feature-icon">{feature.icon}</span>
            </div>
            <div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Feature data for rendering
const features = [
  {
    title: "Easy Rentals",
    description:
      "Find and borrow the materials you need with just a few clicks.",
    icon: "📦", // Example icon
  },
  {
    title: "Secure Transactions",
    description:
      "We prioritize your safety with secure payment methods and verified user profiles, ensuring peace of mind for every transaction.",
    icon: "🔒", // Example icon
  },
  {
    title: "Wide Variety",
    description:
      "Explore a wide range of items categorized by college departments.",
    icon: "🛠️", // Example icon
  },
  {
    title: "Community Driven",
    description:
      "Join a community of TUP Manila students helping each other succeed.",
    icon: "🤝", // Example icon
  },
];

export default Subheader;
