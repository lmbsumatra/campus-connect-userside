import React, { useEffect, useRef, useState } from "react";
import "./style.css";

const Subheader = () => {
  const [visibleFeatures, setVisibleFeatures] = useState([]);
  const [lastScrollY, setLastScrollY] = useState(0); // Track last scroll position

  const featureRefs = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = featureRefs.current.indexOf(entry.target);
          if (entry.isIntersecting) {
            setVisibleFeatures((prev) => [...new Set([...prev, index])]);
          } else {
            // Set a delay for disappearing feature when scrolled up
            setVisibleFeatures((prev) => prev.filter((i) => i !== index));
          }
        });
      },
      { threshold: 0.2 } // Trigger when 20% of the element is visible
    );

    featureRefs.current.forEach((ref) => observer.observe(ref));

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > lastScrollY) {
        // Scrolling down
        // Logic to show new features or adjust visibility if needed
      } else {
        // Scrolling up
        // Revert features visibility when scrolling up
        setVisibleFeatures((prev) => {
          // Example: If you want to hide features that are offscreen when scrolling up
          return prev.slice(0, prev.length - 1);
        });
      }

      setLastScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

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
