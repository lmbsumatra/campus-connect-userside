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
      case "successful_login":
        return "action-login";
      case "logout":
        return "action-logout";
      case "failed_login":
        return "action-failed-login";
      case "post":
        return "action-created";
      case "patch":
        return "action-updated";
      case "delete":
        return "action-deleted";
      default:
        return "action-default";
    }
  };

  // Generalized truncation function
  const truncate = (text, maxLength = 30) => {
    if (!text) return "N/A";
    return text.length > maxLength
      ? `${text.substring(0, maxLength)}...`
      : text;
  };

  // Pagination Logic
  const indexOfLastLog = currentPage * logsPerPage;
  const indexOfFirstLog = indexOfLastLog - logsPerPage;
  const currentLogs = logs.slice(indexOfFirstLog, indexOfLastLog);

  return (
    <div className="logs-dashboard-container">
      <div className="logs-dashboard">
        <div className="logs-header">
          <h2 className="logs-title">Admin Activity Logs</h2>
        </div>

        {error ? (
          <div className="logs-error-container">
            <p className="logs-error">{error}</p>
          </div>
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
                      <tr key={log.id} className="logs-table-row">
                        <td className="admin-name">
                          {log.admin
                            ? `${log.admin.last_name}, ${log.admin.first_name}`
                            : "Unknown"}
                        </td>
                        <td className="admin-role">{log.role}</td>
                        <td
                          className={`action-cell ${getActionClass(
                            log.action
                          )}`}
                        >
                          {log.action}
                        </td>
                        <td className="endpoint-cell">
                          <div className="details-tooltip-wrapper">
                            <span className="details-truncated">
                              {truncate(log.endpoint, 25)}
                            </span>
                            {log.endpoint && log.endpoint.length > 25 && (
                              <span className="details-tooltip">
                                {log.endpoint}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="details-cell">
                          <div className="details-tooltip-wrapper">
                            <span className="details-truncated">
                              {truncate(log.details)}
                            </span>
                            {log.details && log.details.length > 30 && (
                              <span className="details-tooltip">
                                {log.details}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="timestamp-cell">
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

            <div className="pagination-container">
              <PaginationComponent
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LogsDashboard;
