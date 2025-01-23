import React, { useEffect, useState } from "react";
import "./new.css";
import TrialOnNavbar from "./TrialOnNavbar";
import img3 from "./img_3.svg";
import img4 from "./img_4.svg";
import Subheader from "../components/common/subheader/Subheader";
import ReactCurvedText from "react-curved-text";

const TrialOnHeroSection = () => {
  const [isShrinking, setIsShrinking] = useState(false); // Track scroll state
  const [currentGear, setCurrentGear] = useState(0);

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

  return (
    <div className="bg-dark">
      <TrialOnNavbar />
      <div className="header-image">
        <div className={`divider ${isShrinking ? "shrinking" : ""}`}>
          <img
            src={img3}
            style={{
              animation: isShrinking ? "none" : "spin 30s linear infinite",
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default TrialOnHeroSection;
