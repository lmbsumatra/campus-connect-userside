import React, { useEffect, useRef, useState } from "react";
import "./style.css";

const Subheader = () => {
  const [visibleFeatures, setVisibleFeatures] = useState([]);
  const featureRefs = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = featureRefs.current.indexOf(entry.target);
          if (entry.isIntersecting) {
            // Add to visibleFeatures if intersecting
            setVisibleFeatures((prev) => [...new Set([...prev, index])]);
          } 
          // Removing from visibleFeatures is now handled differently (see below)
        });
      },
      { threshold: 0.2 }
    );

    featureRefs.current.forEach((ref) => observer.observe(ref));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="sub-header">
      <div className="container max-xy feature-features">
        {features.map((feature, index) => (
          <div
            key={index}
            className={`feature feature-${index} ${
              visibleFeatures.includes(index) ? "active" : ""
            }`}
            ref={(el) => (featureRefs.current[index] = el)}
          >
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
    icon: "📦",
  },
  {
    title: "Secure Transactions",
    description:
      "We prioritize your safety with secure payment methods and verified user profiles, ensuring peace of mind for every transaction.",
    icon: "🔒",
  },
  {
    title: "Wide Variety",
    description:
      "Explore a wide range of items categorized by college departments.",
    icon: "🛠️",
  },
  {
    title: "Community Driven",
    description:
      "Join a community of TUP Manila students helping each other succeed.",
    icon: "🤝",
  },
];

export default Subheader;
