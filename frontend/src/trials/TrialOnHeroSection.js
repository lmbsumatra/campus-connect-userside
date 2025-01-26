import React, { useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import "./new.css";
import TrialOnNavbar from "./TrialOnNavbar";
import img3 from "./img_3.svg";

import bookStack from '../';
import { stepDescriptions } from "./HeroDisplayLabels";

const TrialOnHeroSection = () => {
  const [currentStep, setCurrentStep] = useState(0); // Tracks the current slide
  const [animationClass, setAnimationClass] = useState("entering"); // Handles animation state

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationClass("exiting");
      setTimeout(() => {
        setCurrentStep((prevStep) => (prevStep + 1) % stepDescriptions.length); // Loop through steps
        setAnimationClass("entering");
      }, 500); // Animation duration
    }, 4000); // Slide interval

    return () => clearInterval(interval);
  }, []);


  const currentStepData = stepDescriptions[currentStep];

  // 3D Model Loader
  function Model({ path }) {
    const gltf = useGLTF(path);
    return <primitive object={gltf.scene} scale={1} />;
  }

  return (
    <div className="hero header-image">
      <TrialOnNavbar />

      <div className="content2 d-flex align-items-content">
        {/* Slide Text Content */}
        <div className="header-container2">
          <h4 className="sub-title white">{currentStepData.subText}</h4>
          {currentStepData.headerText}
          <p className="p white">{currentStepData.paragraph}</p>
          <div className="btn-container">
            <button className="btn btn-rectangle primary opac">Add now!</button>
            <button className="btn btn-rectangle secondary opac">
              Learn more
            </button>
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

        {/* 3D Viewer or Fallback Static Image */}
        <div className={`items ${animationClass}`}>
          <div className="image-box floating">
            {currentStepData.modelPath ? (
              <Canvas>
                <ambientLight intensity={5} />
                <directionalLight position={[10, 10, 5]} intensity={1} />
                <OrbitControls />
                <Model path={currentStepData.modelPath} />
              </Canvas>
            ) : (
              <img
                src={currentStepData.image}
                alt="Item"
                className="slide-item"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrialOnHeroSection;
