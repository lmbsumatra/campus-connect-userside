import React, { useState, useEffect } from "react";
import { baseApi } from "../../../../utils/consonants";
import { Modal, Button } from "react-bootstrap";

const AdminViewAccounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const response = await fetch(`${baseApi}/admin/accounts`);
        if (!response.ok) {
          throw new Error("Failed to fetch accounts");
        }
        const data = await response.json();
        setAccounts(data);
      } catch (err) {
        setError(err.message);
      }
    };
    fetchAccounts();
  }, []);

  return (
    <div>
      <Button variant="primary" onClick={() => setShowModal(true)}>
        View Admin Accounts
      </Button>

      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        size="lg"
        centered
        dialogClassName="admin1-accounts-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>Admin Accounts</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <div className="alert alert-danger">{error}</div>}
          <div className="table-responsive">
            <table className="table table-striped table-hover">
              <thead className="thead-light">
                <tr>
                  <th>First Name</th>
                  <th>Last Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Created At</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((account) => (
                  <tr key={account.user_id}>
                    <td>{account.first_name}</td>
                    <td>{account.last_name}</td>
                    <td>{account.email}</td>
                    <td>{account.role}</td>
                    <td>{new Date(account.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AdminViewAccounts;
