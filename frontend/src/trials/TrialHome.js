import React, { useState, useEffect } from "react";
import Subheader from "../components/common/subheader/Subheader";
import TrialOnHeroSection from "./TrialOnHeroSection";

const TrialHome = () => {
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      // Track the scroll position, capping at 300px for the gradient effect
      const newScrollPosition = Math.min(window.scrollY, 300); // Max gradient at 300px
      setScrollPosition(newScrollPosition);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Calculate gradient opacity based on scroll position
  const gradientOpacity = scrollPosition / 300; // Normalize between 0 and 1

  return (
    <div>
      {/* Hero section with dynamic gradient */}
      <div
        style={{
          position: "relative",
          overflow: "hidden",
        }}
      >
        <TrialOnHeroSection />

        {/* Gradient overlay, applied only when scrolled */}
        {scrollPosition > 0 && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              background: `linear-gradient(rgba(to bottom, (0, 0, 0, ${
                1 - gradientOpacity
              }), rgba(255, 255, 255, ${gradientOpacity})))`,
              pointerEvents: "none", // Allow interactions with underlying elements
              transition: "background 0.3s ease-in-out", // Smooth transition
            }}
          />
        )}
      </div>

      {/* Subheaders */}
      <Subheader />
      <Subheader />
      <Subheader />
      <Subheader />
      <Subheader />
      <Subheader />
    </div>
  );
};

export default TrialHome;
