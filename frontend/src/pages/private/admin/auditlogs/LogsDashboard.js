import React, { useEffect, useState } from "react";
import fetchAuditLogs from "../../../../utils/FetchAuditLogs";
import { useAuth } from "../../../../context/AuthContext";
import PaginationComponent from "../../../../components/Pagination/PaginationComponent";
import "./LogsDashboard.css";

const LogsDashboard = () => {
  const { adminUser } = useAuth();
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const logsPerPage = 10;
  const totalPages = Math.ceil(logs.length / logsPerPage);

  useEffect(() => {
    if (!adminUser) {
      setError("No admin user found.");
      return;
    }

    fetchAuditLogs(adminUser)
      .then(setLogs)
      .catch((err) => setError(err.message));
  }, [adminUser]);

  const getActionClass = (action) => {
    switch (action.toLowerCase()) {
      case "created":
        return "action-created";
      case "updated":
        return "action-updated";
      case "deleted":
        return "action-deleted";
      default:
        return "action-default";
    }
  };

  // **Pagination Logic**
  const indexOfLastLog = currentPage * logsPerPage;
  const indexOfFirstLog = indexOfLastLog - logsPerPage;
  const currentLogs = logs.slice(indexOfFirstLog, indexOfLastLog);

  return (
    <div className="logs-dashboard">
      <h2 className="logs-title">Admin Activity Logs</h2>

      {error ? (
        <p className="logs-error">{error}</p>
      ) : (
        <>
          <div className="logs-table-container">
            <table className="logs-table">
              <thead>
                <tr>
                  <th>Admin Name</th>
                  <th>Role</th>
                  <th>Action</th>
                  <th>Endpoint</th>
                  <th>Details</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {currentLogs.length > 0 ? (
                  currentLogs.map((log) => (
                    <tr key={log.id}>
                      <td>
                        {log.admin
                          ? `${log.admin.last_name}, ${log.admin.first_name}`
                          : "Unknown"}
                      </td>
                      <td>{log.role}</td>
                      <td className={getActionClass(log.action)}>
                        {log.action}
                      </td>
                      <td>{log.endpoint}</td>
                      <td>{log.details}</td>
                      <td className="timestamp">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="logs-no-data">
                      No logs available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* ✅ Add Pagination Component */}
          <PaginationComponent
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      )}
    </div>
  );
};

export default LogsDashboard;
