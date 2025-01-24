import React, { useEffect, useState } from "react";
import "./new.css";
import TrialOnNavbar from "./TrialOnNavbar";
import img3 from "./img_3.svg";

const TrialOnHeroSection = () => {
  const [isShrinking, setIsShrinking] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // This function handles scroll event
    const handleScroll = () => {
      const scrollY = window.scrollY;
      if (scrollY > 200) {
        setIsShrinking(true);
      } else {
        setIsShrinking(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    // Function to update the current step based on time
    const updateStep = () => {
      setInterval(() => {
        setCurrentStep((prevStep) => (prevStep + 1) % 8); // 8 steps in total
      }, 3750); // 30 seconds / 8 steps = 3.75 seconds per step
    };

    updateStep();
  }, []);

  const stepDescriptions = [
    "Need a <span class='centered-text'>📚</span> textbook? Rent it here and avoid the textbook trauma!",
    "Stressed about <span class='centered-text'>🔬</span> lab equipment? Rent it, relax, and ace that lab!",
    "Forget the <span class='centered-text'>📊</span> graphing calculator drain on your wallet. Rent it and conquer those equations!",
    "<span class='centered-text'>🎸</span> Musical instrument calling? Rent it and unleash your inner musician!",
    "Got a spare <span class='centered-text'>💻</span> laptop? Lend it out and earn some extra cash (and good karma).",
    "Tired of that <span class='centered-text'>🎮</span> gaming console collecting dust? Lend it out and let someone else enjoy it!",
    "Time to declutter? Sell your old <span class='centered-text'>📚</span> study guides and fund your next adventure!",
    "Craving a <span class='centered-text'>📱</span> new tablet? Buy it pre-loved and save your student budget!",
  ];

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

      <div className="text-info">
        <h2 dangerouslySetInnerHTML={{ __html: stepDescriptions[currentStep] }} />
      </div>
    </div>
  );
};

export default TrialOnHeroSection;
