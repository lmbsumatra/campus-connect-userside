import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { selectStudentUser } from "../../../../redux/auth/studentAuthSlice";
import {
  fetchTransactionReportsByUser,
  deleteTransactionReport,
} from "../../../../redux/reports/TransactionReportsByUserSlice.js";
import ShowAlert from "../../../../utils/ShowAlert";
import Toolbar from "../../../../components/toolbar/Toolbar";
import TimeoutComponent from "../../../../utils/TimeoutComponent.jsx";
import LoadingItemCardSkeleton from "../../../../components/loading-skeleton/loading-item-card-skeleton/LoadingItemCardSkeleton.js";
import "./reports.css";

function MyTransactionReports() {
  const [error, setError] = useState(null);
  const [selectedReports, setSelectedReports] = useState([]);
  const [viewType, setViewType] = useState("card");
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredReports, setFilteredReports] = useState([]);

  const { userId, token } = useSelector(selectStudentUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    transactionReportsByUser,
    loadingTransactionReportsByUser,
    errorTransactionReportsByUser,
  } = useSelector((state) => state.transactionReportsByUser);

  // Fetch transaction reports for the user
  useEffect(() => {
    if (userId && token) {
      dispatch(fetchTransactionReportsByUser({ userId, token }));
    }
  }, [userId, token, dispatch]);

  // Update filtered reports when all reports change
  useEffect(() => {
    if (transactionReportsByUser) {
      setFilteredReports(transactionReportsByUser);
    }
  }, [transactionReportsByUser]);

  // Handle errors from the Redux state
  useEffect(() => {
    if (errorTransactionReportsByUser) {
      setError(errorTransactionReportsByUser);
    }
  }, [errorTransactionReportsByUser]);

  // Handle report actions (view, delete)
  const handleReportAction = useCallback(
    async (e, option, report) => {
      e.stopPropagation();

      // if (option === "delete") {
      //   try {
      //     ShowAlert(dispatch, "loading", "Deleting report...");
      //     await dispatch(
      //       deleteTransactionReport({ userId, reportId: report.id })
      //     ).unwrap();
      //     ShowAlert(dispatch, "success", "Report deleted successfully!");
      //   } catch (error) {
      //     console.error("Error deleting report:", error);
      //     ShowAlert(
      //       dispatch,
      //       "error",
      //       "Error",
      //       error?.message || "Failed to delete report!"
      //     );
      //   }
      //   return;
      // }

      if (option === "view") {
        navigate(`/reports/${report.id}`);
      }
    },
    [dispatch, navigate, userId]
  );

  // Handle bulk delete operation
  const handleBulkDelete = useCallback(async () => {
    if (!selectedReports.length) {
      ShowAlert(dispatch, "warning", "No reports selected for deletion");
      return;
    }

    try {
      ShowAlert(dispatch, "loading", "Deleting selected reports...");
      await Promise.all(
        selectedReports.map((reportId) =>
          dispatch(deleteTransactionReport({ userId, reportId })).unwrap()
        )
      );

      ShowAlert(dispatch, "success", "Selected reports deleted successfully!");
      setSelectedReports([]);
    } catch (error) {
      console.error("Error deleting reports:", error);
      ShowAlert(
        dispatch,
        "error",
        "Error",
        error?.message || "Failed to delete reports!"
      );
    }
  }, [selectedReports, dispatch, userId]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Get reported user display - show "You" if current user is reported
  const getReportedUserDisplay = (report) => {
    if (report.reported_id === userId) {
      return "You";
    }
    return `${report.reported?.first_name} ${report.reported?.last_name}`;
  };

  // Get reporter display - show "You" if current user is reporter
  const getReporterDisplay = (report) => {
    if (report.reporter_id === userId) {
      return "You";
    }
    return `${report.reporter?.first_name} ${report.reporter?.last_name}`;
  };

  if (loadingTransactionReportsByUser) {
    return (
      <div className="card-container">
        {Array.from({ length: 4 }).map((_, index) => (
          <LoadingItemCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  const renderReportsTable = () => {
    return (
      <table className="reports-table">
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                checked={
                  selectedReports.length === filteredReports.length &&
                  filteredReports.length > 0
                }
                onChange={() => {
                  setSelectedReports(
                    selectedReports.length === filteredReports.length
                      ? []
                      : filteredReports.map((report) => report.id)
                  );
                }}
              />
            </th>
            <th>Type</th>
            <th>Status</th>
            <th>Reported User</th>
            <th>Reported By</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredReports
            .filter((report) => {
              // Filter by search term if provided
              if (!searchTerm) return true;
              const lowerSearchTerm = searchTerm.toLowerCase();

              // Search in various fields
              return (
                report.transaction_type
                  ?.toLowerCase()
                  .includes(lowerSearchTerm) ||
                report.status?.toLowerCase().includes(lowerSearchTerm) ||
                report.reported?.first_name
                  ?.toLowerCase()
                  .includes(lowerSearchTerm) ||
                report.reported?.last_name
                  ?.toLowerCase()
                  .includes(lowerSearchTerm) ||
                report.report_description
                  ?.toLowerCase()
                  .includes(lowerSearchTerm)
              );
            })
            .map((report) => (
              <tr
                key={report.id}
                onClick={() => navigate(`/reports/${report.id}`)}
              >
                <td>
                  <input
                    type="checkbox"
                    checked={selectedReports.includes(report.id)}
                    onChange={(e) => {
                      e.stopPropagation();
                      setSelectedReports((prev) =>
                        prev.includes(report.id)
                          ? prev.filter((id) => id !== report.id)
                          : [...prev, report.id]
                      );
                    }}
                  />
                </td>
                <td>{report.transaction_type}</td>
                <td>
                  <span className={`status-badge status-${report.status}`}>
                    {report.status.replace("_", " ")}
                  </span>
                </td>
                <td>{getReportedUserDisplay(report)}</td>
                <td>{getReporterDisplay(report)}</td>
                <td>{formatDate(report.createdAt)}</td>
                <td>
                  <div className="report-actions">
                    <button
                      onClick={(e) => handleReportAction(e, "view", report)}
                      className="action-button-report view-button-report"
                    >
                      View
                    </button>
                  </div>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    );
  };

  const renderReportsCards = () => {
    return (
      <div className="reports-cards">
        {filteredReports
          .filter((report) => {
            if (!searchTerm) return true;
            const lowerSearchTerm = searchTerm.toLowerCase();

            return (
              report.transaction_type
                ?.toLowerCase()
                .includes(lowerSearchTerm) ||
              report.status?.toLowerCase().includes(lowerSearchTerm) ||
              report.reported?.first_name
                ?.toLowerCase()
                .includes(lowerSearchTerm) ||
              report.reported?.last_name
                ?.toLowerCase()
                .includes(lowerSearchTerm) ||
              report.report_description?.toLowerCase().includes(lowerSearchTerm)
            );
          })
          .map((report) => (
            <div
              key={report.id}
              className="report-card"
              onClick={() => navigate(`/reports/${report.id}`)}
            >
              <div className="report-card-header">
                <input
                  type="checkbox"
                  checked={selectedReports.includes(report.id)}
                  onChange={(e) => {
                    e.stopPropagation();
                    setSelectedReports((prev) =>
                      prev.includes(report.id)
                        ? prev.filter((id) => id !== report.id)
                        : [...prev, report.id]
                    );
                  }}
                />
                <span className={`status-badge status-${report.status}`}>
                  {report.status.replace("_", " ")}
                </span>
              </div>
              <div className="report-card-body">
                <h3>
                  {report.transaction_type === "rental"
                    ? "Rental Report"
                    : "Sale Report"}
                </h3>
                <p>
                  <strong>Reported User:</strong>{" "}
                  {getReportedUserDisplay(report)}
                </p>
                <p>
                  <strong>Reported By:</strong> {getReporterDisplay(report)}
                </p>
                <p>
                  <strong>Date:</strong> {formatDate(report.createdAt)}
                </p>
                <p className="report-description">
                  {report.report_description?.length > 100
                    ? `${report.report_description.substring(0, 100)}...`
                    : report.report_description}
                </p>
              </div>
              <div className="report-card-footer">
                <button
                  className="action-button-report view-button-report"
                  onClick={(e) => handleReportAction(e, "view", report)}
                >
                  View
                </button>
                {/* <button
                  className="action-button-report delete-button-report"
                  onClick={(e) => handleReportAction(e, "delete", report)}
                >
                  Delete
                </button> */}
              </div>
            </div>
          ))}
      </div>
    );
  };

  return (
    <div className="transaction-reports-container">
      {error ? (
        <div className="error-message">Error: {error}</div>
      ) : (
        <>
          <Toolbar
            selectedItems={selectedReports}
            onSelectAll={() => {
              setSelectedReports(
                selectedReports.length === filteredReports.length
                  ? []
                  : filteredReports.map((report) => report.id)
              );
            }}
            onViewToggle={() =>
              setViewType((prev) => (prev === "card" ? "table" : "card"))
            }
            viewType={viewType}
            onAction={handleBulkDelete}
            items={filteredReports}
            onSearch={setSearchTerm}
            filterOptions={setFilteredReports}
            actionButtonText="Delete Selected"
          />

          {filteredReports.length === 0 ? (
            <div className="no-reports">
              <p>You don't have any transaction reports yet.</p>
            </div>
          ) : (
            <TimeoutComponent
              timeoutDuration={1000}
              fallback={
                <div className="card-container">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <LoadingItemCardSkeleton key={index} />
                  ))}
                </div>
              }
            >
              <div className="reports-container">
                {viewType === "table"
                  ? renderReportsTable()
                  : renderReportsCards()}
              </div>
            </TimeoutComponent>
          )}
        </>
      )}
    </div>
  );
}

export default MyTransactionReports;
