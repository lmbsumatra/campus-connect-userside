import React, { useState, useEffect } from "react";
import TableComponent from "../../../../components/Table/TableComponent";
import "./ReportDashboard.css";
import { Outlet } from "react-router-dom";
import useFetchAllReportsData from "../../../../utils/FetchAllReportsData";
import { formatDate } from "../../../../utils/dateFormat";
import { useNavigate } from "react-router-dom";
import SearchBarComponent from "../../../../components/Search/SearchBarComponent";
import PaginationComponent from "../../../../components/Pagination/PaginationComponent";
// import { useDispatch } from "react-redux";
// import ShowAlert from "../../../../utils/ShowAlert";
// import { showNotification } from "../../../../redux/alert-popup/alertPopupSlice";

import {
  ReportsByCategory,
  ReportStatusTrend,
  ResolutionTimeAnalysis,
  ReviewerEfficiency,
  ReportTrends,
  ReportsByReason,
} from "../../../../components/Analytics/ReportAnalyticsComponent";
import { ReportStatus } from "../../../../utils/Status";
//import { useAuth } from "../../../../context/AuthContext";
//import { baseApi } from "../../../../utils/consonants";

const ReportDashboard = () => {
  //const { adminUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOptions, setSortOptions] = useState({});
  const [filterOptions, setFilterOptions] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [reportsPerPage] = useState(10);
  const [originalData, setOriginalData] = useState([]);
  // const dispatch = useDispatch();
  const navigate = useNavigate();

  const headers = [
    "Reporter",
    "Reported Name",
    "Reason",
    "Entity Type",
    "Date Added",
    "Status",
    "Action",
  ];

  const { reports, error, loading } = useFetchAllReportsData();

  useEffect(() => {
    if (reports.length) {
      setOriginalData(reports);
    }
  }, [reports]);

  const handleView = (report) => {
    navigate(
      `/admin/reports/${report.entity_type}/${report.reported_entity_id}`,
      {
        state: {
          reportDetails: {
            id: report.id,
            reporter: `${report.reporter.first_name} ${report.reporter.last_name}`,
            reason: report.reason,
            status: report.status,
            createdAt: formatDate(report.createdAt),
            lastUpdated: report.lastUpdated
              ? formatDate(report.lastUpdated)
              : null,
            reviewedBy: report.reviewedBy || null,
          },
        },
      }
    );
  };

  // const handleDelete = async (reportId) => {
  //   dispatch(
  //     showNotification({
  //       type: "warning",
  //       title: "Delete Report?",
  //       text: "Are you sure you want to delete this report? This action cannot be undone.",
  //       customButton: {
  //         text: "Yes, Delete",
  //         action: async () => {
  //           try {
  //             const response = await fetch(
  //               `${baseApi}/api/reports/${reportId}`,
  //               {
  //                 method: "DELETE",
  //                 headers: {
  //                   "Content-Type": "application/json",
  //                   Authorization: `Bearer ${adminUser.token}`,
  //                 },
  //               }
  //             );

  //             if (response.ok) {
  //               await ShowAlert(
  //                 dispatch,
  //                 "success",
  //                 "Report Deleted",
  //                 "Report deleted successfully."
  //               );
  //               setOriginalData((prevData) =>
  //                 prevData.filter((report) => report.id !== reportId)
  //               );
  //             } else {
  //               await ShowAlert(
  //                 dispatch,
  //                 "error",
  //                 "Report Deletion Failed",
  //                 "Failed to delete the report. Please try again."
  //               );
  //             }
  //           } catch (error) {
  //             console.error("Error deleting the report:", error);
  //             await ShowAlert(
  //               dispatch,
  //               "error",
  //               "Error",
  //               "An error occurred while deleting the report."
  //             );
  //           }
  //         },
  //         showCancel: true, // Enables the cancel button
  //       },
  //     })
  //   );
  // };

  const getStatusInfo = (status) => {
    const { label, className } = ReportStatus(status);
    return { label, className };
  };

  const filterableStatusOptions = [
    "pending",
    "reviewed",
    "dismissed",
    "resolved",
  ];

  const handleSortChange = (column, order) => {
    if (order === "default") {
      setSortOptions({});
    } else {
      setSortOptions({ [column]: order });
    }
  };

  const handleFilterChange = (column, value) => {
    setFilterOptions({ ...filterOptions, [column]: value });
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const getFilteredData = () => {
    let filteredData = originalData;

    const normalizedSearchQuery = searchQuery
      .trim()
      .replace(/\s+/g, " ")
      .toLowerCase();

    if (normalizedSearchQuery) {
      filteredData = filteredData.filter((report) => {
        const reporterName =
          `${report.reporter.first_name} ${report.reporter.last_name}`.toLowerCase();
        const normalizedReason = report.reason.toLowerCase();
        const normalizedDateAdded = formatDate(report.createdAt).toLowerCase();

        return (
          reporterName.includes(normalizedSearchQuery) ||
          report.reported_entity_id
            .toString()
            .includes(normalizedSearchQuery) ||
          report.entity_type.toLowerCase().includes(normalizedSearchQuery) ||
          normalizedReason.includes(normalizedSearchQuery) ||
          normalizedDateAdded.includes(normalizedSearchQuery) ||
          (report.entity_name &&
            report.entity_name.toLowerCase().includes(normalizedSearchQuery))
        );
      });
    }

    if (filterOptions["Status"]) {
      filteredData = filteredData.filter(
        (report) => report.status === filterOptions["Status"]
      );
    }
    if (
      filterOptions["Entity Type"] &&
      filterOptions["Entity Type"] !== "all"
    ) {
      filteredData = filteredData.filter(
        (report) => report.entity_type === filterOptions["Entity Type"]
      );
    }

    return filteredData;
  };

  const sortedData = () => {
    let sorted = [...getFilteredData()];

    // Default sorting by Date Added (newest first) if no sorting option is selected
    if (!sortOptions["Date Added"]) {
      sorted = sorted.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
    }

    if (Object.keys(sortOptions).length > 0) {
      if (sortOptions["Date Added"]) {
        sorted = sorted.sort((a, b) =>
          sortOptions["Date Added"] === "newest"
            ? new Date(b.createdAt) - new Date(a.createdAt)
            : new Date(a.createdAt) - new Date(b.createdAt)
        );
      }
    }

    return sorted;
  };

  const sortedFilteredData = sortedData();

  const totalItems = sortedFilteredData.length;
  const totalPages = Math.ceil(totalItems / reportsPerPage);

  const displayedData = sortedFilteredData.slice(
    (currentPage - 1) * reportsPerPage,
    currentPage * reportsPerPage
  );

  const data = displayedData.map((report) => {
    const { label, className } = getStatusInfo(report.status);
    return [
      <>
        {report.reporter.first_name} {report.reporter.last_name}
      </>,
      report.entity_name,
      report.reason,
      report.entity_type.charAt(0).toUpperCase() + report.entity_type.slice(1),
      formatDate(report.createdAt),
      <span className={`badge ${className}`}>{label}</span>,
      <div className="d-flex flex-column align-items-center gap-1">
        <button
          className="btn btn-action view"
          onClick={() => handleView(report)}
        >
          View
        </button>
        {/* <button
          className="btn btn-action delete"
          onClick={() => handleDelete(report.id)}
        >
          Delete
        </button> */}
      </div>,
    ];
  });

  return (
    <div className="admin-content-container">
      <div className="row">
        <div className="col-lg-8">
          <div className="recent-reports-header  p-3 mb-3">
            <h4>Recent Reports</h4>
            <Outlet />
            <SearchBarComponent
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
            {loading && <p>Loading ...</p>}
            {error && <p>Error: {error}</p>}
            <TableComponent
              headers={headers}
              data={data}
              onSortChange={handleSortChange}
              onFilterChange={handleFilterChange}
              statusOptions={filterableStatusOptions}
            />
            <PaginationComponent
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
        <div className="col-lg-4  analytics-section">
          <ReportTrends reports={reports} />
          <ReportsByCategory reports={reports} />
          <ReportStatusTrend reports={reports} />
          <ResolutionTimeAnalysis reports={reports} />
          <ReviewerEfficiency reports={reports} />
          <ReportsByReason reports={reports} />
        </div>
      </div>
    </div>
  );
};

export default ReportDashboard;
