import React, { useState, useEffect, useMemo } from "react";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";

// Register required Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

// Reports by Category
export const ReportsByCategory = ({ reports }) => {
  const [timeRange, setTimeRange] = useState("all");

  const filteredReports = useMemo(() => {
    const now = new Date();
    switch (timeRange) {
      case "day":
        return reports.filter(
          (r) =>
            new Date(r.createdAt) > new Date(now.setDate(now.getDate() - 1))
        );
      case "week":
        return reports.filter(
          (r) =>
            new Date(r.createdAt) > new Date(now.setDate(now.getDate() - 7))
        );
      case "month":
        return reports.filter(
          (r) =>
            new Date(r.createdAt) > new Date(now.setMonth(now.getMonth() - 1))
        );
      default:
        return reports;
    }
  }, [reports, timeRange]);

  const categoryData = filteredReports.reduce((acc, report) => {
    const category = report.entity_type || "Unknown";
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});

  const chartData = {
    labels: Object.keys(categoryData),
    datasets: [
      {
        data: Object.values(categoryData),
        backgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4BC0C0",
          "#9966FF",
          "#FF9F40",
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="p-3 bg-white rounded shadow-sm mb-2">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-3">
        <h5 className="mb-2 mb-md-0">Reports by Category</h5>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="form-select form-select-sm w-auto"
        >
          <option value="all">All Time</option>
          <option value="month">Last Month</option>
          <option value="week">Last Week</option>
          <option value="day">Last 24h</option>
        </select>
      </div>

      <div className="d-flex justify-content-center">
        <div style={{ position: "relative", width: "100%", maxWidth: "400px" }}>
          <Pie
            data={chartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                tooltip: {
                  callbacks: {
                    label: (context) => {
                      const total = context.dataset.data.reduce(
                        (a, b) => a + b,
                        0
                      );
                      const value = context.raw;
                      const percentage = Math.round((value / total) * 100);
                      return `${context.label}: ${value} (${percentage}%)`;
                    },
                  },
                },
              },
            }}
          />
        </div>
      </div>
    </div>
  );
};

export const ReportTrends = ({ reports }) => {
  const [timeRange, setTimeRange] = useState("monthly");

  const generateTrendData = () => {
    const now = new Date();
    let labels = [];
    let dataPoints = [];
    let daysBack = 30;

    if (timeRange === "weekly") {
      daysBack = 7;
    } else if (timeRange === "daily") {
      daysBack = 24;
      // For hourly data
      for (let i = daysBack - 1; i >= 0; i--) {
        const hour = new Date(now);
        hour.setHours(hour.getHours() - i);
        labels.push(hour.getHours() + ":00");
        dataPoints.push(0);
      }

      reports.forEach((report) => {
        const reportHour = new Date(report.createdAt).getHours();
        const hourLabel = reportHour + ":00";
        const index = labels.indexOf(hourLabel);
        if (index !== -1) {
          dataPoints[index]++;
        }
      });

      return { labels, dataPoints };
    }

    // For daily data
    for (let i = daysBack - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      labels.push(
        date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
      );
      dataPoints.push(0);
    }

    reports.forEach((report) => {
      const reportDate = new Date(report.createdAt).toLocaleDateString(
        "en-US",
        {
          month: "short",
          day: "numeric",
        }
      );
      const index = labels.indexOf(reportDate);
      if (index !== -1) {
        dataPoints[index]++;
      }
    });

    return { labels, dataPoints };
  };

  const { labels, dataPoints } = generateTrendData();
  const chartData = {
    labels,
    datasets: [
      {
        label: "Reports",
        data: dataPoints,
        backgroundColor: dataPoints.map((value) =>
          value > 10 ? "rgba(255, 99, 132, 0.8)" : "rgba(54, 162, 235, 0.8)"
        ), // Different colors based on value
        borderColor: "rgb(54, 162, 235)",
        borderWidth: 1,
        tension: 0.4,
      },
    ],
  };

  return (
    <div className="p-3 bg-white rounded shadow-sm mb-2">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5>Report Trends</h5>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="form-select form-select-sm w-auto"
        >
          <option value="daily">Last 24 Hours</option>
          <option value="weekly">Last 7 Days</option>
          <option value="monthly">Last 30 Days</option>
        </select>
      </div>
      <div style={{ height: "300px" }}>
        <Bar
          data={chartData}
          options={{
            responsive: true,
            scales: {
              y: {
                beginAtZero: true,
                title: {
                  display: true,
                  text: "Number of Reports",
                },
              },
              x: {
                title: {
                  display: true,
                  text: timeRange === "daily" ? "Hour of Day" : "Date",
                },
              },
            },
          }}
        />
      </div>
    </div>
  );
};
export const ReportStatusTrend = ({ reports }) => {
  const [timeRange, setTimeRange] = useState("monthly");

  const filteredReports = useMemo(() => {
    const now = new Date();
    switch (timeRange) {
      case "weekly":
        return reports.filter(
          (r) =>
            new Date(r.createdAt) > new Date(now.setDate(now.getDate() - 7))
        );
      case "monthly":
        return reports.filter(
          (r) =>
            new Date(r.createdAt) > new Date(now.setMonth(now.getMonth() - 1))
        );
      case "quarterly":
        return reports.filter(
          (r) =>
            new Date(r.createdAt) > new Date(now.setMonth(now.getMonth() - 3))
        );
      default:
        return reports;
    }
  }, [reports, timeRange]);

  // Group by date and status
  const statusTrendData = filteredReports.reduce((acc, report) => {
    const date = new Date(report.createdAt).toLocaleDateString();
    if (!acc[date])
      acc[date] = { pending: 0, reviewed: 0, dismissed: 0, resolved: 0 };
    acc[date][report.status]++;
    return acc;
  }, {});

  const sortedDates = Object.keys(statusTrendData).sort(
    (a, b) => new Date(a) - new Date(b)
  );

  const chartData = {
    labels: sortedDates,
    datasets: [
      {
        label: "Pending",
        data: sortedDates.map((date) => statusTrendData[date].pending),
        backgroundColor: "rgba(255, 206, 86, 0.6)",
        borderColor: "rgba(255, 206, 86, 1)",
      },
      {
        label: "Reviewed",
        data: sortedDates.map((date) => statusTrendData[date].reviewed),
        backgroundColor: "rgba(54, 162, 235, 0.6)",
        borderColor: "rgba(54, 162, 235, 1)",
      },
      {
        label: "Dismissed",
        data: sortedDates.map((date) => statusTrendData[date].dismissed),
        backgroundColor: "rgba(255, 99, 132, 0.6)",
        borderColor: "rgba(255, 99, 132, 1)",
      },
      // {
      //   label: "Resolved",
      //   data: sortedDates.map((date) => statusTrendData[date].resolved),
      //   backgroundColor: "rgba(75, 192, 192, 0.6)",
      //   borderColor: "rgba(75, 192, 192, 1)",
      // },
    ],
  };

  return (
    <div className="p-3 bg-white rounded shadow-sm mb-2">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5>Report Status Trend</h5>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="form-select form-select-sm w-auto"
        >
          <option value="weekly">Last 7 Days</option>
          <option value="monthly">Last 30 Days</option>
          <option value="quarterly">Last 90 Days</option>
        </select>
      </div>
      <div style={{ height: "300px" }}>
        <Bar
          data={chartData}
          options={{
            responsive: true,
            scales: {
              x: { stacked: true },
              y: { stacked: true },
            },
          }}
        />
      </div>
    </div>
  );
};

export const ResolutionTimeAnalysis = ({ reports }) => {
  // Filter only resolved reports
  const resolvedReports = reports.filter(
    (r) => r.status === "reviewed" || r.status === "dismissed"
  );

  const resolutionTimes = resolvedReports.map((report) => {
    const createdAt = new Date(report.createdAt);
    const resolvedAt = new Date(report.updatedAt);
    return Math.ceil((resolvedAt - createdAt) / (1000 * 60 * 60 * 24)); // Days
  });

  // Categorize resolution times
  const timeCategories = {
    "Same Day": 0,
    "1-3 Days": 0,
    "4-7 Days": 0,
    "1-2 Weeks": 0,
    "Over 2 Weeks": 0,
  };

  resolutionTimes.forEach((days) => {
    if (days === 0) timeCategories["Same Day"]++;
    else if (days <= 3) timeCategories["1-3 Days"]++;
    else if (days <= 7) timeCategories["4-7 Days"]++;
    else if (days <= 14) timeCategories["1-2 Weeks"]++;
    else timeCategories["Over 2 Weeks"]++;
  });

  const chartData = {
    labels: Object.keys(timeCategories),
    datasets: [
      {
        label: "Resolution Time",
        data: Object.values(timeCategories),
        backgroundColor: [
          "#4BC0C0",
          "#36A2EB",
          "#FFCE56",
          "#FF9F40",
          "#FF6384",
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="p-3 bg-white rounded shadow-sm mb-2">
      <h5>Report Resolution Time</h5>
      <div style={{ height: "300px" }}>
        <Bar
          data={chartData}
          options={{
            responsive: true,
            scales: {
              y: {
                beginAtZero: true,
                title: {
                  display: true,
                  text: "Number of Reports",
                },
              },
              x: {
                title: {
                  display: true,
                  text: "Time to Resolution",
                },
              },
            },
          }}
        />
      </div>
    </div>
  );
};

export const ReviewerEfficiency = ({ reports }) => {
  const [viewMode, setViewMode] = useState("reviewers"); // 'reviewers' or 'reporters'
  const [timeRange, setTimeRange] = useState("all"); // 'all', 'month', 'week'

  // Filter reports by time range
  const filteredReports = useMemo(() => {
    const now = new Date();
    switch (timeRange) {
      case "month":
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        return reports.filter((r) => new Date(r.createdAt) >= startOfMonth);
      case "week":
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
        startOfWeek.setHours(0, 0, 0, 0);
        return reports.filter((r) => new Date(r.createdAt) >= startOfWeek);
      default:
        return reports;
    }
  }, [reports, timeRange]);

  // Calculate reviewer efficiency data
  const reviewerData = useMemo(() => {
    const reviewedReports = filteredReports.filter(
      (r) =>
        (r.status === "reviewed" || r.status === "dismissed") && r.reviewedBy
    );

    return Object.entries(
      reviewedReports.reduce((acc, report) => {
        const reviewer = report.reviewedBy;
        if (!acc[reviewer]) {
          acc[reviewer] = { count: 0, totalTime: 0 };
        }
        acc[reviewer].count++;
        acc[reviewer].totalTime +=
          new Date(report.updatedAt) - new Date(report.createdAt);
        return acc;
      }, {})
    )
      .map(([name, data]) => ({
        name,
        reportsHandled: data.count,
        avgResolutionTime:
          Math.round(
            (data.totalTime / data.count / (1000 * 60 * 60 * 24)) * 10
          ) / 10, // Days
      }))
      .sort((a, b) => b.reportsHandled - a.reportsHandled);
  }, [filteredReports]);

  // Calculate top reporters data
  const topReporters = useMemo(() => {
    return Object.entries(
      filteredReports.reduce((acc, report) => {
        const reporter = report.reporter
          ? `${report.reporter.first_name} ${report.reporter.last_name}`
          : "Anonymous";
        acc[reporter] = (acc[reporter] || 0) + 1;
        return acc;
      }, {})
    )
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [filteredReports]);

  return (
    <div className="p-3 bg-white rounded shadow-sm mb-2">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5>
          {viewMode === "reviewers" ? "Reviewer Efficiency" : "Top Reporters"}
        </h5>
        <div className="d-flex gap-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="form-select form-select-sm"
          >
            <option value="all">All Time</option>
            <option value="month">This Month</option>
            <option value="week">This Week</option>
          </select>
          <select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value)}
            className="form-select form-select-sm"
          >
            <option value="reviewers">Reviewers</option>
            <option value="reporters">Top Reporters</option>
          </select>
        </div>
      </div>

      {viewMode === "reviewers" ? (
        <div className="table-responsive">
          <table className="table table-hover">
            <thead>
              <tr>
                <th>Reviewer</th>
                <th>Reports Handled</th>
                <th>Avg. Resolution Time</th>
              </tr>
            </thead>
            <tbody>
              {reviewerData.length > 0 ? (
                reviewerData.map((reviewer, i) => (
                  <tr key={i}>
                    <td>{reviewer.name}</td>
                    <td>{reviewer.reportsHandled}</td>
                    <td>
                      {reviewer.avgResolutionTime} days
                      <div className="progress mt-1" style={{ height: "5px" }}>
                        <div
                          className="progress-bar bg-success"
                          style={{
                            width: `${Math.min(
                              100,
                              reviewer.avgResolutionTime * 10
                            )}%`,
                          }}
                        ></div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="text-center py-4">
                    No reviewer data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div>
          {topReporters.length > 0 ? (
            <ol className="list-group list-group-numbered">
              {topReporters.map((reporter, i) => (
                <li
                  key={i}
                  className="list-group-item d-flex justify-content-between align-items-start"
                >
                  <div className="ms-2 me-auto">
                    <div className="fw-bold">{reporter.name}</div>
                  </div>
                  <span className="badge bg-primary rounded-pill">
                    {reporter.count} reports
                  </span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-center py-4">No reporter data available</p>
          )}
        </div>
      )}
    </div>
  );
};

const stopWords = new Set([
  "this",
  "that",
  "with",
  "have",
  "from",
  "and",
  "the",
  "for",
  "you",
  "your",
  "are",
  "was",
  "were",
  "can",
  "not",
  "but",
  "what",
  "why",
  "how",
  "which",
  "when",
  "where",
  "who",
  "about",
  "there",
  "some",
  "more",
]);

export const ReportsByReason = ({ reports }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [reasonData, setReasonData] = useState([]);
  const [otherReasonData, setOtherReasonData] = useState([]);
  const [viewMode, setViewMode] = useState("predefined"); // 'predefined' or 'keywords'
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    setIsLoading(true);

    // Filter reports by selected category if not 'all'
    const filteredReports =
      selectedCategory === "all"
        ? reports
        : reports.filter((r) => r.entity_type === selectedCategory);

    if (viewMode === "predefined") {
      // Analyze predefined reasons
      const reasonCounts = filteredReports.reduce((acc, report) => {
        const reason = report.reason || "Unknown";
        acc[reason] = (acc[reason] || 0) + 1;
        return acc;
      }, {});

      const sortedReasons = Object.entries(reasonCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([reason, count]) => ({
          reason,
          count,
          percentage: Math.round((count / filteredReports.length) * 100),
        }));

      setReasonData(sortedReasons);
      setOtherReasonData([]);
    } else {
      // Separate "Other" reasons for better analysis
      const otherReasons = {};
      const wordCounts = {};

      filteredReports.forEach((report) => {
        if (report.reason && report.reason.toLowerCase().startsWith("other:")) {
          const customReason = report.reason.replace(/^other:\s*/i, "").trim();
          if (customReason) {
            otherReasons[customReason] = (otherReasons[customReason] || 0) + 1;
          }
        } else if (report.reason) {
          // Process words for keyword analysis
          report.reason
            .toLowerCase()
            .replace(/[^a-z\s]/g, "") // Remove punctuation
            .split(/\s+/)
            .forEach((word) => {
              if (word.length >= 4 && !stopWords.has(word)) {
                wordCounts[word] = (wordCounts[word] || 0) + 1;
              }
            });
        }
      });

      // Sort top keywords
      const sortedKeywords = Object.entries(wordCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 30)
        .map(([text, count]) => ({ reason: text, count }));

      // Sort top "Other" reasons separately
      const sortedOtherReasons = Object.entries(otherReasons)
        .sort((a, b) => b[1] - a[1])
        .map(([reason, count]) => ({ reason, count }));

      setReasonData(sortedKeywords);
      setOtherReasonData(sortedOtherReasons);
    }

    setIsLoading(false);
  }, [reports, viewMode, selectedCategory]);

  // Get unique entity types for filter
  const entityTypes = [...new Set(reports.map((r) => r.entity_type))].filter(
    Boolean
  );

  return (
    <div className="p-3 bg-white rounded shadow-sm mb-2">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5>Report Reasons Analysis</h5>
        <div className="d-flex gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="form-select form-select-sm"
          >
            <option value="all">All Categories</option>
            {entityTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          <select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value)}
            className="form-select form-select-sm"
          >
            <option value="predefined">Predefined Reasons</option>
            <option value="keywords">Keyword Analysis</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : viewMode === "predefined" ? (
        <div className="reason-chart">
          <div className="d-flex justify-content-between mb-2">
            <small className="text-muted">
              Showing {reasonData.length} unique reasons
            </small>
            {reasonData.length > 20 && (
              <small className="text-muted">Scroll to view all</small>
            )}
          </div>

          <div
            className="table-responsive position-relative"
            style={{
              maxHeight: "400px",
              border: "1px solid #dee2e6",
              borderRadius: "4px",
            }}
          >
            <table className="table table-sm mb-0">
              <thead
                style={{
                  position: "sticky",
                  top: 0,
                  background: "white",
                  zIndex: 1,
                  boxShadow: "0 2px 2px -1px rgba(0,0,0,0.1)",
                }}
              >
                <tr>
                  <th>Reason</th>
                  <th>Count</th>
                  <th style={{ width: "200px" }}>Percentage</th>
                </tr>
              </thead>
              <tbody>
                {reasonData.length > 0 ? (
                  reasonData.map((item, i) => (
                    <tr key={i}>
                      <td>{item.reason}</td>
                      <td>{item.count}</td>
                      <td>
                        <div className="d-flex align-items-center">
                          <div
                            className="progress flex-grow-1"
                            style={{ height: "8px" }}
                          >
                            <div
                              className="progress-bar"
                              role="progressbar"
                              style={{ width: `${item.percentage}%` }}
                            />
                          </div>
                          <span className="ms-2" style={{ minWidth: "40px" }}>
                            {item.percentage}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="text-center py-4">
                      No predefined reason data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="word-cloud" style={{ height: "400px" }}>
          {reasonData.length > 0 ? (
            reasonData.map((word, i) => (
              <span
                key={i}
                className="d-inline-block m-1"
                style={{
                  fontSize: `${12 + word.count * 0.8}px`,
                  color: `hsl(${i * 10}, 70%, 50%)`,
                  fontWeight: word.count > 5 ? "bold" : "normal",
                }}
                title={`${word.count} occurrences`}
              >
                {word.reason}
              </span>
            ))
          ) : (
            <p className="text-center py-4">No keyword data available</p>
          )}

          {otherReasonData.length > 0 && (
            <>
              <h6 className="mt-3">Top "Other" Reasons</h6>
              <ul className="list-group">
                {otherReasonData.map((item, i) => (
                  <li key={i} className="list-group-item">
                    {item.reason} ({item.count})
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
};
