import React, { useState } from "react";
import { Modal, Button, Table, Form, InputGroup } from "react-bootstrap";
import { useSystemConfig } from "../../../../context/SystemConfigProvider";
import "./adminViewConfigStyles.css";
import { updateSystemConfig } from "../../../../redux/system-config/systemConfigSlice";
import { useDispatch } from "react-redux";

const AdminViewSystemConfig = ({ show, onClose }) => {
  const { config, loading } = useSystemConfig();
  const dispatch = useDispatch();
  const [editingPrice, setEditingPrice] = useState(false);
  const [newSlotPrice, setNewSlotPrice] = useState("");

  if (loading) {
    return (
      <Modal show={show} onHide={onClose} centered>
        <Modal.Body>Loading system configurations...</Modal.Body>
      </Modal>
    );
  }

  const handleSystemConfigAction = ({ key, value }) => {
    if (typeof value === "boolean") {
      dispatch(updateSystemConfig({ config: key, config_value: !value }));
    }
  };

  const handleSlotPriceEdit = () => {
    if (!editingPrice) {
      setNewSlotPrice(config["Slot Price"] || 10);
      setEditingPrice(true);
    } else {
      // Save the price
      if (newSlotPrice !== "" && !isNaN(parseFloat(newSlotPrice)) && parseFloat(newSlotPrice) > 0) {
        dispatch(updateSystemConfig({ 
          config: "Slot Price", 
          config_value: parseFloat(newSlotPrice)
        }));
      }
      setEditingPrice(false);
    }
  };

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>System Configuration</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Configuration</th>
              <th>Status/Value</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(config).map(([key, value]) => {
              // Special handling for Slot Price
              if (key === "Slot Price") {
                return (
                  <tr key={key}>
                    <td>{key}</td>
                    <td>
                      {editingPrice ? (
                        <InputGroup>
                          <InputGroup.Text>₱</InputGroup.Text>
                          <Form.Control
                            type="number"
                            min="1"
                            step="0.01"
                            value={newSlotPrice}
                            onChange={(e) => setNewSlotPrice(e.target.value)}
                          />
                        </InputGroup>
                      ) : (
                        <span>₱{value}</span>
                      )}
                    </td>
                    <td>
                      <button
                        className={`btn btn-${editingPrice ? "success" : "primary"}`}
                        onClick={handleSlotPriceEdit}
                      >
                        {editingPrice ? "Save" : "Edit"}
                      </button>
                    </td>
                  </tr>
                );
              }

              // For boolean configs
              if (typeof value === "boolean") {
                return (
                  <tr key={key}>
                    <td>{key}</td>
                    <td>
                      <span className={`status-${value ? "enabled" : "disabled"}`}>
                        {value ? "Enabled" : "Disabled"}
                      </span>
                    </td>
                    <td>
                      <button
                        className={`btn btn-${value ? "success" : "warning"}`}
                        onClick={() => handleSystemConfigAction({ key, value })}
                      >
                        {value ? "Disable" : "Enable"}
                      </button>
                    </td>
                  </tr>
                );
              }

              // For other types
              return (
                <tr key={key}>
                  <td>{key}</td>
                  <td>{value}</td>
                  <td>
                    <button className="btn btn-secondary" disabled>
                      View Only
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AdminViewSystemConfig;
