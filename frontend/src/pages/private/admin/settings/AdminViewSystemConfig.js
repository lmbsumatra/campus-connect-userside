import React from "react";
import { Modal, Button, Table } from "react-bootstrap";
import { useSystemConfig } from "../../../../context/SystemConfigProvider";
import "./adminViewConfigStyles.css";
import { updateSystemConfig } from "../../../../redux/system-config/systemConfigSlice";
import { useDispatch } from "react-redux";

const AdminViewSystemConfig = ({ show, onClose }) => {
  const { config, loading } = useSystemConfig();
  const dispatch = useDispatch();

  if (loading) {
    return (
      <Modal show={show} onHide={onClose} centered>
        <Modal.Body>Loading system configurations...</Modal.Body>
      </Modal>
    );
  }

  const handleSystemConfigAction = ({ key, value }) => {
    dispatch(updateSystemConfig({ config: key, config_value: !value }));
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
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(config).map(([key, value]) => (
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
                    onClick={(e) => handleSystemConfigAction({ key, value })}
                  >
                    {value ? "Disable" : "Enable"}
                  </button>
                </td>
              </tr>
            ))}
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
