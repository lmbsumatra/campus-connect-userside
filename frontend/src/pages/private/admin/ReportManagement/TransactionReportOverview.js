import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import TableComponent from "../../../../components/Table/TableComponent";
import PaginationComponent from "../../../../components/Pagination/PaginationComponent";
import SearchBarComponent from "../../../../components/Search/SearchBarComponent";
import useFetchAllTransactionReportsData from "../../../../utils/FetchAllTransactionReportsData";
import { TransactionReportStatus } from "../../../../utils/Status";
import { formatDate } from "../../../../utils/dateFormat";
import { useAuth } from "../../../../context/AuthContext";

const TransactionReportOverview = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [reportsPerPage] = useState(10);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { adminUser } = useAuth();

  // State for managing the action modal
  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedReportForAction, setSelectedReportForAction] = useState(null);

  // Filters State - Default statusFilter to 'action_queue'
  const [activeFilters, setActiveFilters] = useState({
    status: "action_queue",
  });
  // Sorting State
  const [sortOptions, setSortOptions] = useState({
    column: "Date Created",
    order: "descending",
  });

  const {
    transactionReports: allReports,
    error,
    loading,
    removeReportFromList: removeReportGlobally,
  } = useFetchAllTransactionReportsData();

  const headers = [
    "Report ID",
    "Type",
    "Reason Snippet",
    "Reporter",
    "Reported",
    "Date Created",
    "Status",
    "Action",
  ];

  // Available statuses for the filter dropdown
  const statusFilterOptions = [
    { value: "action_queue", label: "Escalated" },
    { value: "all", label: "All Statuses" },
    { value: "admin_review", label: "Admin Review" },
    { value: "open", label: "Open" },
    { value: "under_review", label: "Under Review" },
    { value: "resolved", label: "Resolved (by Reporter)" },
    { value: "admin_resolved", label: "Admin Resolved" },
    { value: "admin_dismissed", label: "Admin Dismissed" },
  ];

  // Handle generic filter changes from TableComponent
  const handleFilterChange = (column, value) => {
    setActiveFilters((prev) => {
      const newFilters = { ...prev };
      if (value === "all" || !value) {
        // Treat 'all' or empty as clearing the filter for that column
        delete newFilters[column.toLowerCase()]; // Use lower case key for consistency
      } else {
        newFilters[column.toLowerCase()] = value;
      }
      return newFilters;
    });
    setCurrentPage(1); // Reset page on filter change
  };

  // Handle sorting changes from TableComponent
  const handleSortChange = (column, order) => {
    // Reset page only if sort actually changes
    if (sortOptions.column !== column || sortOptions.order !== order) {
      setSortOptions({ column, order });
      setCurrentPage(1);
    }
  };

  // Memoize filtered and sorted data
  const processedData = useMemo(() => {
    // Ensure allReports is an array before trying to iterate
    console.log("Processing reports, value of allReports:", allReports);
    const reportsToProcess = Array.isArray(allReports) ? allReports : [];

    // Now use the safeguarded array
    let filteredData = [...reportsToProcess];

    //Apply Search Filter
    const normalizedSearchQuery = searchQuery.trim().toLowerCase();
    if (normalizedSearchQuery) {
      filteredData = filteredData.filter((report) => {
        const reporterName = `${report.reporter?.first_name || ""} ${
          report.reporter?.last_name || ""
        }`.toLowerCase();
        const reportedName = `${report.reported?.first_name || ""} ${
          report.reported?.last_name || ""
        }`.toLowerCase();
        return (
          report.id.toString().includes(normalizedSearchQuery) ||
          reporterName.includes(normalizedSearchQuery) ||
          reportedName.includes(normalizedSearchQuery) ||
          (report.report_description || "")
            .toLowerCase()
            .includes(normalizedSearchQuery) ||
          report.transaction_type
            ?.toLowerCase()
            .includes(normalizedSearchQuery) ||
          report.status?.toLowerCase().includes(normalizedSearchQuery)
        );
      });
    }

    // Apply Column Filters
    Object.entries(activeFilters).forEach(([key, value]) => {
      // ... filtering logic ...
      if (!value || value === "all") return;
      switch (key) {
        case "status":
          if (value === "action_queue") {
            filteredData = filteredData.filter(
              (report) =>
                report.status === "escalated" ||
                report.status === "admin_review"
            );
          } else {
            filteredData = filteredData.filter(
              (report) => report.status === value
            );
          }
          break;
        case "type":
          filteredData = filteredData.filter(
            (report) => report.transaction_type === value
          );
          break;
        default:
          break;
      }
    });

    // Apply Sorting (using filteredData)
    if (sortOptions.column && sortOptions.order !== "default") {
      filteredData.sort((a, b) => {
        let valA, valB;
        switch (sortOptions.column) {
          case "Report ID":
            valA = a.id;
            valB = b.id;
            break;
          case "Date Created":
            valA = new Date(a.createdAt);
            valB = new Date(b.createdAt);
            break;
          default:
            return 0;
        }
        const comparison = valA < valB ? -1 : valA > valB ? 1 : 0;
        return sortOptions.order === "ascending" ? comparison : comparison * -1;
      });
    }

    return filteredData;
  }, [allReports, searchQuery, activeFilters, sortOptions]);

  const totalItems = processedData.length;
  const totalPages = Math.ceil(totalItems / reportsPerPage);
  const displayedData = processedData.slice(
    (currentPage - 1) * reportsPerPage,
    currentPage * reportsPerPage
  );

  const handleViewAction = (report) => {
    // Navigate to the dedicated Admin Action Page
    navigate(`/admin/reports/action/${report.id}`);
  };

  // Map data for the table
  const data = displayedData.map((report) => {
    const { label, className } = TransactionReportStatus(report.status);
    const canAdminAction =
      report.status === "escalated" || report.status === "admin_review";

    return [
      report.id,
      report.transaction_type,
      (report.report_description || "").substring(0, 50) + "...",
      <>{`${report.reporter?.first_name || ""} ${
        report.reporter?.last_name || "N/A"
      }`}</>,
      <>{`${report.reported?.first_name || ""} ${
        report.reported?.last_name || "N/A"
      }`}</>,
      formatDate(report.createdAt),
      <span className={`badge ${className}`}>{label}</span>,
      <div className="d-flex flex-column align-items-center gap-1">
        {canAdminAction ? ( // Show Review button only if actionable
          <button
            className="btn btn-action view"
            onClick={() => handleViewAction(report)}
          >
            View
          </button>
        ) : (
          <button
            className="btn btn-action view"
            onClick={() =>
              navigate(`/admin/reports/transaction-details/${report.id}`)
            }
          >
            View
          </button>
        )}
      </div>,
    ];
  });

  const columnsConfig = useMemo(
    () => [
      { header: "Report ID", sortable: true, filterable: false },
      {
        header: "Type",
        sortable: false,
        filterable: true,
        filterOptions: ["rental", "sell"],
      },
      { header: "Reason Snippet", sortable: false, filterable: false },
      { header: "Reporter", sortable: false, filterable: false },
      { header: "Reported", sortable: false, filterable: false },
      { header: "Date Created", sortable: true, filterable: false },
      {
        header: "Status",
        sortable: false,
        filterable: true,
        filterOptions: statusFilterOptions.map((opt) => opt.value),
        filterLabels: statusFilterOptions.reduce((acc, opt) => {
          // Pass labels for display
          acc[opt.value] = opt.label;
          return acc;
        }, {}),
      },
      { header: "Action", sortable: false, filterable: false },
    ],
    []
  );

  return (
    <div className="admin-content-container">
      <h3 className="admin-content-title">Transaction Report Management</h3>
      <SearchBarComponent
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        placeholder="Search reports..."
      />
      {/* Display loading or error before processing data */}
      {loading && <p>Loading reports...</p>}
      {error && <p className="text-danger">Error: {error}</p>}
      {!loading &&
        !error && ( // Only render table etc. when not loading and no error
          <>
            <TableComponent
              headers={headers}
              data={data} // Use the correctly mapped 'data' variable
              columnsConfig={columnsConfig}
              onFilterChange={handleFilterChange}
              onSortChange={handleSortChange}
              currentFilters={activeFilters}
              currentSort={sortOptions}
            />
            {totalItems > 0 && (
              <PaginationComponent
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                itemsPerPage={reportsPerPage}
                totalItems={totalItems}
              />
            )}
            {totalItems === 0 && (
              <p>No reports found matching your criteria.</p>
            )}
          </>
        )}
    </div>
  );
};

export default TransactionReportOverview;
