import React, { useState, useEffect } from "react";
import { baseApi } from "../../../../utils/consonants";
import { Modal, Button } from "react-bootstrap";
import { useAuth } from "../../../../context/AuthContext";
import ShowAlert from "../../../../utils/ShowAlert";
import { useDispatch } from "react-redux";

const AdminViewAccounts = () => {
  const { adminUser } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [error, setError] = useState("");
  const [showAccountsModal, setShowAccountsModal] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [newPermission, setNewPermission] = useState("ReadOnly");
  const dispatch = useDispatch();

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

  const openPermissionModal = (account) => {
    setSelectedAccount(account);
    setNewPermission(account.admin?.permissionLevel || "ReadOnly");
    setShowPermissionModal(true);
  };

  const handlePermissionChange = async () => {
    try {
      const response = await fetch(`${baseApi}/admin/update-permission`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminUser.token}`,
        },
        body: JSON.stringify({
          userId: selectedAccount.user_id,
          permissionLevel: newPermission,
        }),
      });

      if (!response.ok) throw new Error("Failed to update permission");

      await ShowAlert(
        dispatch,
        "success",
        "Success",
        "Permission updated successfully!"
      );
      setShowPermissionModal(false);
      window.location.reload();
    } catch (err) {
      await ShowAlert(dispatch, "error", "Error", err.message);
    }
  };

  return (
    <div>
      <Button variant="primary" onClick={() => setShowAccountsModal(true)}>
        View Admin Accounts
      </Button>

      {/* Main accounts modal */}
      <Modal
        show={showAccountsModal}
        onHide={() => setShowAccountsModal(false)}
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
                  <th>Permission Level</th>{" "}
                  {adminUser?.role === "superadmin" && <th>Actions</th>}
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
                    <td>
                      {account.role === "superadmin"
                        ? "Full Access"
                        : account.admin?.permissionLevel || "None"}
                    </td>
                    {adminUser?.role === "superadmin" && (
                      <td>
                        {account.role !== "superadmin" && (
                          <Button
                            variant="warning"
                            size="sm"
                            onClick={() => openPermissionModal(account)}
                          >
                            Edit
                          </Button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowAccountsModal(false)}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Permission editing modal */}
      <Modal
        show={showPermissionModal}
        onHide={() => setShowPermissionModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Edit Permission Level for {selectedAccount?.first_name}{" "}
            {selectedAccount?.last_name}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div>
            <label htmlFor="permissionLevel">Permission Level</label>
            <select
              id="permissionLevel"
              value={newPermission}
              onChange={(e) => setNewPermission(e.target.value)}
              className="form-control"
            >
              <option value="ReadOnly">ReadOnly</option>
              <option value="ReadWrite">ReadWrite</option>
              <option value="DeniedAccess">DeniedAccess</option>
            </select>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowPermissionModal(false)}
          >
            Cancel
          </Button>
          <Button variant="primary" onClick={handlePermissionChange}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AdminViewAccounts;
