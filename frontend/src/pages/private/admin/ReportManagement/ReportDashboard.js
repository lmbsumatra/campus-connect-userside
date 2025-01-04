import React, { useState, useEffect } from "react";
import TableComponent from "../../../../components/Table/TableComponent";
import "./ReportDashboard.css";
import useFetchAllReportsData from "../../../../utils/FetchAllReportsData";
import { formatDate } from "../../../../utils/dateFormat";
import { useNavigate } from "react-router-dom";
import SearchBarComponent from "../../../../components/Search/SearchBarComponent";
import PaginationComponent from "../../../../components/Pagination/PaginationComponent";
import {
  ReportsByCategory,
  ReportStatusDistribution,
  ReportsGrowth,
  TopReportUsers,
} from "../../../../components/Analytics/ReportAnalyticsComponent";
import { ReportStatus } from "../../../../utils/Status";

const ReportDashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOptions, setSortOptions] = useState({});
  const [filterOptions, setFilterOptions] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [reportsPerPage] = useState(10);
  const [originalData, setOriginalData] = useState([]);
  const navigate = useNavigate();

  const headers = [
    "Report ID",
    "Reason",
    "Reporter",
    "Reported ID",
    "Entity",
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
    navigate(`/admin/reports/${report.entity_type}/${report.reported_entity_id}`);
  };
  

  const handleResolve = (reportId) => {
    console.log(`Resolving report with ID: ${reportId}`);
  };

  const handleDelete = (reportId) => {
    console.log(`Deleting report with ID: ${reportId}`);
  };

  const getStatusInfo = (status) => {
    const { label, className } = ReportStatus(status);
    return { label, className };
  };

  const filterableStatusOptions = [
    "pending",
    "reviewed",
    "flagged",
    "dismissed",
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
        const reporterName = `${report.reporter.first_name} ${report.reporter.last_name}`.toLowerCase();
        const normalizedReason = report.reason.toLowerCase();
        const normalizedDateAdded = formatDate(report.createdAt).toLowerCase();

        return (
          reporterName.includes(normalizedSearchQuery) ||
          report.reported_entity_id.toString().includes(normalizedSearchQuery) ||
          report.entity_type.toLowerCase().includes(normalizedSearchQuery) ||
          normalizedReason.includes(normalizedSearchQuery) ||
          normalizedDateAdded.includes(normalizedSearchQuery)
        );
      });
    }

    if (filterOptions["Status"]) {
      filteredData = filteredData.filter(
        (report) => report.status === filterOptions["Status"]
      );
    }

    return filteredData;
  };

  const sortedData = () => {
    let sorted = [...getFilteredData()];

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
      report.id,
      report.reason,
      <>{report.reporter.first_name} {report.reporter.last_name}</>,
      report.reported_entity_id,
      report.entity_type,
      formatDate(report.createdAt),
      <span className={`badge ${className}`}>{label}</span>,
      <div className="d-flex flex-column align-items-center gap-1">
        <button
          className="btn btn-action view"
          onClick={() => handleView(report)}
        >
          View
        </button>
        <button
          className="btn btn-action edit"
          onClick={() => handleResolve(report.id)}
        >
          Edit
        </button>
        <button
          className="btn btn-action delete"
          onClick={() => handleDelete(report.id)}
        >
          Delete
        </button>
      </div>,
    ];
  });

  return (
    <div className="admin-content-container">
      <div className="row">
        <div className="col-lg-8">
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
        <div className="col-lg-4">
          <ReportsByCategory reports={reports} />
          <ReportStatusDistribution reports={reports} />
          <ReportsGrowth reports={reports} />
          <TopReportUsers reports={reports} />
        </div>
      </div>
    </div>
  );
};

export default ReportDashboard;
