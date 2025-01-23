import React, { useEffect, useState } from "react";
import "./new.css";
import TrialOnNavbar from "./TrialOnNavbar";
import img3 from "./img_3.svg";
import img4 from "./img_4.svg";
import Subheader from "../components/common/subheader/Subheader";

const TrialOnHeroSection = () => {
  const [isShrinking, setIsShrinking] = useState(false); // Track scroll state
  const [currentGear, setCurrentGear] = useState(0); // Track current focused gear

  const gears = [img3, img4, img3, img4]; // Array of gear images

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;

      // Trigger shrinking and appearance of small gears after 200px scroll
      if (scrollY > 200) {
        setIsShrinking(true);
      } else {
        setIsShrinking(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNext = () => {
    setCurrentGear((prev) => (prev + 1) % gears.length);
  };

  const handlePrevious = () => {
    setCurrentGear((prev) => (prev - 1 + gears.length) % gears.length);
  };

  return (
    <div className="">
      {/* Navbar Section */}
      <TrialOnNavbar />
      <div className="endpoint">
        {/* Header Image Section */}
        <div className="header-image w-100">
          <div className="sample-box text-white">{/* Example boxes */}</div>
        </div>
      </div>

      {/* Main Gear */}
      <div className={`divider ${isShrinking ? "shrinking" : ""}`}>
        <img
          src={gears[currentGear]} // Display the current gear
          alt={`Gear ${currentGear + 1}`}
          style={{
            animation: isShrinking ? "none" : "spin 30s linear infinite",
          }}
        />
      </div>

      {/* Small Gears with Rolling Effect */}
      <div className="small-gears">
        {gears.map((gear, index) => {
          // Calculate relative position to animate all gears
          const relativePosition =
            (index - currentGear + gears.length) % gears.length;

          const positionClass =
            relativePosition === 0
              ? "center"
              : relativePosition < gears.length / 2
              ? "right"
              : "left";

          return (
            <div>
              <img
                key={index}
                src={gear}
                alt={`Gear ${index + 1}`}
                className={`gear ${positionClass}`}
              />
            </div>
          );
        })}
      </div>

      {/* Navigation Buttons */}
      <div className="gear-controls">
        <button onClick={handlePrevious}>Previous</button>
        <button onClick={handleNext}>Next</button>
      </div>

      <Subheader />
    </div>
  );
};

export default TrialOnHeroSection;
