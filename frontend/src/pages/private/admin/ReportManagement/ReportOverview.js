import React, { useState, useEffect } from "react";
import TableComponent from "../../../../components/Table/TableComponent";
import "./ReportDashboard.css";
import useFetchAllReportsData from "../../../../utils/FetchAllReportsData";
import { formatDate } from "../../../../utils/dateFormat";
import { useNavigate } from "react-router-dom";
import SearchBarComponent from "../../../../components/Search/SearchBarComponent";
import PaginationComponent from "../../../../components/Pagination/PaginationComponent";
import CardComponent from "../../../../components/Table/CardComponent"; 
import { ReportStatus } from "../../../../utils/Status";

const ReportOverview = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOptions, setSortOptions] = useState({});
  const [filterOptions, setFilterOptions] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [reportsPerPage] = useState(10);
  const [originalData, setOriginalData] = useState([]);
  const navigate = useNavigate();
   const [viewMode, setViewMode] = useState("table");

  const headers = [
    "Report ID",
    "Reason",
    "Reporter",
    "Reported Item",
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

  const handleView = (reportId) => {
    navigate(`/admin/reports/view/${reportId}`);
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
        const reportedItem = report.item_name.toLowerCase();
        const normalizedReason = report.reason.toLowerCase();
        const normalizedDateAdded = formatDate(report.createdAt).toLowerCase();

        return (
          reporterName.includes(normalizedSearchQuery) ||
          reportedItem.includes(normalizedSearchQuery) ||
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
      report.item_name,
      formatDate(report.createdAt),
      <span className={`badge ${className}`}>{label}</span>,
      <div className="d-flex flex-column align-items-center gap-1">
        <button
          className="btn btn-action view"
          onClick={() => handleView(report.id)}
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

  const handleSwitchView = (view) => {
    setViewMode(view);
  };

  return (
    <div className="admin-content-container">
      <div className="row">
        <div className="col-lg-12">
          <SearchBarComponent
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
          {/* View switcher */}
       <div className="admin-view-toggle">
            <button onClick={() => handleSwitchView("table")} className={`btn btn-secondary mb-4 ${viewMode === "table" ? "active" : ""}`}>Table View</button>
            <button onClick={() => handleSwitchView("card")} className={`btn btn-secondary mb-4 ${viewMode === "card" ? "active" : ""}`}>Card View</button>
          </div>

          {/* Conditionally render Table or Card View */}
          {viewMode === "table" ? (
            <TableComponent
              headers={headers}
              data={data}
              onSortChange={handleSortChange}
              onFilterChange={handleFilterChange}
              statusOptions={filterableStatusOptions} 
            />
          ) : (
            <CardComponent data={data} headers={headers}/>

          )}
            {loading && <p>Loading ...</p>}
            {error && <p>Error: {error}</p>}
          <PaginationComponent
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </div>
  );
};

export default ReportOverview;
