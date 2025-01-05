// frontend/src/components/Analytics/TransactionAnalyticsComponent.js
import React, { useState, useEffect } from "react";
import { Bar, Pie, Doughnut } from "react-chartjs-2";
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

export const TransactionStatusDistribution = ({ transactions }) => {
  const statusData = transactions.reduce((acc, transaction) => {
    const status = transaction.status || "Unknown";
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  const chartData = {
    labels: Object.keys(statusData),
    datasets: [
      {
        data: Object.values(statusData),
        backgroundColor: [
          "#28a745", // Completed
          "#ffc107", // Pending
          "#dc3545", // Failed
          "#17a2b8", // Other statuses
          "#ff69b4",  
          "#ff4500",  
          "#1e90ff", 
          "#8a2be2", 
        ],
      },
    ],
  };

  return (
    <div className="p-3 bg-white rounded shadow-sm mb-2">
      <h5>Transaction Status Distribution</h5>
      <div style={{ height: "300px" }}>
        <Doughnut data={chartData} />
      </div>
    </div>
  );
};

export const TransactionsGrowth = ({ transactions }) => {
  const growthData = transactions.reduce((acc, transaction) => {
    const month = new Date(transaction.createdAt).toLocaleString("default", {
      month: "short",
    });
    acc[month] = (acc[month] || 0) + 1;
    return acc;
  }, {});

  const chartData = {
    labels: Object.keys(growthData),
    datasets: [
      {
        label: "Transactions Created",
        data: Object.values(growthData),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
      },
    ],
  };

  return (
    <div className="p-3 bg-white rounded shadow-sm mb-2">
      <h5>Transactions Growth</h5>
      <div style={{ height: "200px" }}>
        <Bar data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
      </div>
    </div>
  );
};

export const TransactionsByType = ({ transactions }) => {
  const typeData = transactions.reduce((acc, transaction) => {
    const type = transaction.type || "Unknown";
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  const chartData = {
    labels: Object.keys(typeData),
    datasets: [
      {
        data: Object.values(typeData),
        backgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4BC0C0",
          "#9966FF",
        ],
      },
    ],
  };

  return (
    <div className="p-3 bg-white rounded shadow-sm mb-2">
      <h5>Transactions by Type</h5>
      <div style={{ height: "300px" }}>
        <Pie data={chartData} />
      </div>
    </div>
  );
};

// export const TopTransactionUsers = ({ transactions }) => {
//   const [topUsers, setTopUsers] = useState([]);

//   useEffect(() => {
//     const userActivity = calculateTopUsers(transactions);
//     setTopUsers(userActivity);
//   }, [transactions]);

//   const calculateTopUsers = (transactions) => {
//     const userCounts = {};

//     transactions.forEach((transaction) => {
//       const buyerName = `${transaction.buyer?.first_name} ${transaction.buyer?.last_name}`;
//       const sellerName = `${transaction.seller?.first_name} ${transaction.seller?.last_name}`;
//       if (buyerName) {
//         if (!userCounts[buyerName]) userCounts[buyerName] = 0;
//         userCounts[buyerName]++;
//       }
//       if (sellerName) {
//         if (!userCounts[sellerName]) userCounts[sellerName] = 0;
//         userCounts[sellerName]++;
//       }
//     });

//     return Object.entries(userCounts)
//       .sort(([, countA], [, countB]) => countB - countA)
//       .slice(0, 5)
//       .map(([user, count]) => ({ user, count }));
//   };

//   return (
//     <div className="p-3 bg-white rounded shadow-sm mb-2">
//       <h5>Top Transaction Users</h5>
//       {topUsers.length > 0 ? (
//         <ol className="list-group list-group-numbered">
//           {topUsers.map((user, index) => (
//             <li key={index} className="list-group-item d-flex justify-content-between">
//               <span>{user.user}</span>
//               <span>{user.count} Transactions</span>
//             </li>
//           ))}
//         </ol>
//       ) : (
//         <p>No data available.</p>
//       )}
//     </div>
//   );
// };



