import React, { useEffect, useState } from "react";
import "./new.css";
import TrialOnNavbar from "./TrialOnNavbar";
import img3 from "./img_3.svg";
import item1 from "./item_1.png";
import item2 from "./item_2.png";
import item3 from "./item_3.png";
import item4 from "./item_4.png";
import item5 from "./item_5.png";
import item6 from "./item_6.png";
import item7 from "./item_7.png";
import item8 from "./item_8.png";

const TrialOnHeroSection = () => {
  const [currentStep, setCurrentStep] = useState(0); // Tracks the current slide
  const [animationClass, setAnimationClass] = useState("entering"); // Handles animation state

  // Automatically transitions between steps with animation
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationClass("exiting");
      setTimeout(() => {
        setCurrentStep((prevStep) => (prevStep + 1) % 8); // Loop through steps
        setAnimationClass("entering");
      }, 500); // Animation duration
    }, 4000); // Slide interval

    return () => clearInterval(interval);
  }, []);

  // Slide content
  const stepDescriptions = [
    {
      subText: "Need to read for an exam?",
      headerText: (
        <h1 className="headline white">
          Rent a <span className="text-highlight wavy-underline">book</span>{" "}
          here and ace that test!
        </h1>
      ),
      paragraph:
        "Accessing books has never been easier. Get the textbooks you need, save money, and focus on what matters most—your grades.",
    },
    {
      subText: "Worried about acing that lab?",
      headerText: (
        <h1 className="headline white">
          Rent <span className="text-highlight wavy-underline">lab equipment</span>,
          relax, and ace that lab!
        </h1>
      ),
      paragraph:
        "Say goodbye to lab stress with affordable rentals. Get the gear you need to experiment confidently and perform your best in class.",
    },
    {
      subText: "Stressed about tough equations?",
      headerText: (
        <h1 className="headline white">
          Rent a <span className="text-highlight wavy-underline">scientific calculator</span> and solve them with ease!
        </h1>
      ),
      paragraph:
        "Tackle complex calculations with ease by renting a reliable scientific calculator. Keep your budget intact while excelling in math or science.",
    },
    {
      subText: "Want to play some tunes?",
      headerText: (
        <h1 className="headline white">
          Rent a <span className="text-highlight wavy-underline">guitar</span>{" "}
          and unleash your inner musician!
        </h1>
      ),
      paragraph:
        "Explore your musical talents without breaking the bank. Renting a guitar is the perfect way to start your musical journey today.",
    },
    {
      subText: "Have spare tech lying around?",
      headerText: (
        <h1 className="headline white">
          Share your <span className="text-highlight wavy-underline">laptop</span> and earn extra cash (and good karma).
        </h1>
      ),
      paragraph:
        "Turn unused gadgets into a source of income. Lend your laptop to someone in need and make a difference.",
    },
    {
      subText: "Got unused sports gear?",
      headerText: (
        <h1 className="headline white">
          Lend your <span className="text-highlight wavy-underline">badminton racket</span> and let others enjoy it!
        </h1>
      ),
      paragraph:
        "Help others stay active while earning some extra money. Share your badminton racket and give it a new purpose.",
    },
    {
      subText: "Thinking of decluttering?",
      headerText: (
        <h1 className="headline white">
          Sell your old <span className="text-highlight wavy-underline">clothes</span> and fund your next fashion find!
        </h1>
      ),
      paragraph:
        "Make room for new trends by selling your gently used clothes. Help the environment and your wallet at the same time.",
    },
    {
      subText: "Dreaming of new tech?",
      headerText: (
        <h1 className="headline white">
          Buy a pre-loved <span className="text-highlight wavy-underline">tablet</span> and save your budget!
        </h1>
      ),
      paragraph:
        "Upgrade to a better device without overspending. Pre-loved tablets offer great value and functionality for students like you.",
    },
  ];

  // Slide images
  const images = [item1, item2, item3, item4, item5, item6, item7, item8];

  return (
    <div className="hero header-image">
      <TrialOnNavbar />
      <div className="content2 d-flex align-items-content">
        {/* Slide Text Content */}
        <div className="header-container2">
          <h4 className="sub-title white">{stepDescriptions[currentStep].subText}</h4>
          {stepDescriptions[currentStep].headerText}
          <p className="p white">{stepDescriptions[currentStep].paragraph}</p>
          <div className="btn-container">
            <button className="btn btn-rounded primary opac">Add now!</button>
            <button className="btn btn-rounded secondary opac">Learn more</button>
          </div>
        </div>

        {/* Rotating Gear Image */}
        <div className="gear">
          <img
            src={img3}
            style={{ animation: "spin 30s linear infinite" }}
            alt="Decorative"
          />
        </div>

        {/* Animated Item Images */}
        <div className={`items ${animationClass}`}>
          <div className="image-box floating">
            <img src={images[currentStep]} alt="Item" className="slide-item" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrialOnHeroSection;
