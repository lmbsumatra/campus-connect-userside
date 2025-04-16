import { useState, useEffect } from "react";
import { Modal, Button, Tab } from "react-bootstrap";

const MissionVisionModal = ({ show, handleClose, defaultTab }) => {
  const [activeKey, setActiveKey] = useState("mission");

  useEffect(() => {
    if (show) {
      setActiveKey(defaultTab);
    }
  }, [show, defaultTab]);

  return (
    <Modal show={show} onHide={handleClose} centered size="md">
      <Modal.Header closeButton>
        <Modal.Title>Mission & Vision</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Tab.Container activeKey={activeKey}>
          {/* Custom Tabs */}
          <div
            style={{
              display: "flex",
              gap: "1rem",
              padding: "10px",
            }}
          >
            <button
              onClick={() => setActiveKey("mission")}
              style={{
                padding: "10px 20px",
                borderRadius: "8px",
                background: activeKey === "mission" ? "#ff5400" : "#e0e0e0",
                color: activeKey === "mission" ? "#fff" : "#333",
                border: "none",
                fontWeight: "bold",
                transition: "0.3s",
                width: "100%",
              }}
            >
              Mission
            </button>
            <button
              onClick={() => setActiveKey("vision")}
              style={{
                padding: "10px 20px",
                borderRadius: "8px",
                background: activeKey === "vision" ? "#ff5400" : "#e0e0e0",
                color: activeKey === "vision" ? "#fff" : "#333",
                border: "none",
                fontWeight: "bold",
                transition: "0.3s",
                width: "100%",
              }}
            >
              Vision
            </button>
          </div>

          <Tab.Content>
            <Tab.Pane eventKey="mission" active={activeKey === "mission"}>
              <div
                style={{
                  background: "#fafafa",
                  padding: "20px",
                  borderRadius: "12px",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
                }}
              >
                <h5 style={{ color: "#ff5400", marginBottom: "10px" }}>
                  Our Mission
                </h5>
                <p style={{ lineHeight: "1.7", color: "#333" }}>
                  We provide a peer-to-peer rental, buy and sell platform as a
                  convenient alternative solution for the students of TUP Manila
                  to find needed materials in order to complete their academic
                  requirements. We collaborate with students to implement and
                  maintain the vitality of the platform. We, along with TUP SSG,
                  uphold trust by ensuring the security of students' information
                  within the platform.
                </p>
              </div>
            </Tab.Pane>

            <Tab.Pane eventKey="vision" active={activeKey === "vision"}>
              <div
                style={{
                  background: "#fafafa",
                  padding: "20px",
                  borderRadius: "12px",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
                }}
              >
                <h5 style={{ color: "#ff5400", marginBottom: "10px" }}>
                  Our Vision
                </h5>
                <p style={{ lineHeight: "1.7", color: "#333" }}>
                  RenTUPeers is designed mainly to foster a community within
                  students that empower and support each other towards academic
                  excellence through resource sharing. It is aimed to enter and
                  become apparent in the collegiate scene, not just for TUP
                  Manila but for the rest of universities regionwide as well.
                </p>
                <h6 style={{ marginTop: "15px", fontWeight: "bold" }}>
                  Core Values
                </h6>
                <ul
                  style={{
                    paddingLeft: "20px",
                    color: "#333",
                    lineHeight: "1.6",
                    listStyleType: "disc",
                  }}
                >
                  <li>Collaboration</li>
                  <li>Empowerment</li>
                  <li>Growth</li>
                  <li>Integrity</li>
                  <li>Reliability</li>
                  <li>Equity</li>
                  <li>Trust</li>
                </ul>
              </div>
            </Tab.Pane>
          </Tab.Content>
        </Tab.Container>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default MissionVisionModal;
