import React, { useEffect, useState, useRef } from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import { PDFDownloadLink } from "@react-pdf/renderer";
import html2canvas from "html2canvas";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Legend,
} from "recharts";

const generateMockData = () => {
  return {
    companyInfo: {
      name: "TUP Materials Exchange Platform",
    },
    userMetrics: {
      usersByCollege: [
        { name: "CAFA", users: 156 },
        { name: "CIE", users: 210 },
        { name: "CIT", users: 298 },
      ],
      userStatus: [
        { name: "Verified", value: 1132 },
        { name: "Pending", value: 45 },
      ],
    },
    reportMetadata: {
      month: "March",
      year: 2025,
    },
  };
};

const styles = StyleSheet.create({
  page: { padding: 30 },
  header: { flexDirection: "row", marginBottom: 20 },
  companyName: { fontSize: 18, fontWeight: "bold" },
  section: { marginBottom: 15 },
  graphImage: { width: 400 },
});

const MonthlyReportPDF = ({ data, charts }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.companyName}>{data.companyInfo.name}</Text>
      </View>
      <Text>{`Monthly Report - ${data.reportMetadata.month} ${data.reportMetadata.year}`}</Text>
      <View style={styles.section}>
        <Text>Users by College</Text>
        {charts.college && (
          <Image style={styles.graphImage} src={charts.college} />
        )}
      </View>
      <View style={styles.section}>
        <Text>User Status Distribution</Text>
        {charts.status && (
          <Image style={styles.graphImage} src={charts.status} />
        )}
      </View>
    </Page>
  </Document>
);

const MonthlyReportGenerator = () => {
  const mockData = generateMockData();
  const [charts, setCharts] = useState({ college: null, status: null });
  const [isCaptured, setIsCaptured] = useState(false);
  const collegeRef = useRef(null);
  const statusRef = useRef(null);

  useEffect(() => {
    const captureChart = async (ref, key) => {
      if (ref.current) {
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Ensure chart renders fully
        const canvas = await html2canvas(ref.current);
        setCharts((prev) => ({
          ...prev,
          [key]: canvas.toDataURL("image/png"),
        }));
      }
    };

    const captureAllCharts = async () => {
      await captureChart(collegeRef, "college");
      await captureChart(statusRef, "status");
      setIsCaptured(true);
    };

    captureAllCharts();
  }, []);

  return (
    <div>
      <h1>Monthly Platform Report Generator</h1>
      <div ref={collegeRef}>
        <BarChart
          width={500}
          height={300}
          data={mockData.userMetrics.usersByCollege}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="users" fill="#8884d8" />
        </BarChart>
      </div>
      <div ref={statusRef}>
        <PieChart width={500} height={300}>
          <Pie
            data={mockData.userMetrics.userStatus}
            cx={250}
            cy={100}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          />
          <Tooltip />
          <Legend />
        </PieChart>
      </div>
      {isCaptured && (
        <PDFDownloadLink
          document={<MonthlyReportPDF data={mockData} charts={charts} />}
          fileName="monthly_report.pdf"
        >
          {({ loading }) =>
            loading ? "Loading Document..." : "Download PDF Report"
          }
        </PDFDownloadLink>
      )}
    </div>
  );
};

export default MonthlyReportGenerator;
