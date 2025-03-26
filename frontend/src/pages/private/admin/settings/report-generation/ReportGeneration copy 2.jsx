import React from 'react';
import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';

// Helper function to generate mock data
const generateMockData = () => ({
  companyInfo: {
    name: "TUP Materials Exchange Platform",
    tagline: "Connecting Students, Empowering Learning",
    description: "A peer-to-peer platform dedicated to helping Technological University of the Philippines students exchange, rent, and sell academic materials and resources."
  },
  userMetrics: {
    totalUsers: 1245,
    newUsersThisMonth: 187,
    activeUsers: 823,
    userGrowthRate: 17.3,
    usersByCollege: {
      'CAFA': 156,
      'CIE': 210,
      'CIT': 298,
      'CLA': 187,
      'COE': 276,
      'COS': 118
    }
  },
  reportMetadata: {
    month: 'March',
    year: 2025,
    generatedDate: new Date().toLocaleDateString()
  }
});

// PDF Styles
const styles = StyleSheet.create({
  page: { padding: 30, fontFamily: 'Helvetica' },
  header: { flexDirection: 'row', marginBottom: 20, paddingBottom: 10, borderBottom: '1 solid #E0E0E0' },
  companyName: { fontSize: 18, fontWeight: 'bold', color: '#2C3E50' },
  reportTitle: { fontSize: 16, textAlign: 'center', marginBottom: 15, fontWeight: 'bold' },
  section: { marginBottom: 15, padding: 10, border: '1 solid #E0E0E0' },
  sectionTitle: { fontSize: 14, marginBottom: 10, fontWeight: 'bold', borderBottom: '1 solid #E0E0E0', paddingBottom: 5 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  label: { fontSize: 10, color: '#34495E' },
  value: { fontSize: 10, fontWeight: 'bold', color: '#2980B9' },
  footer: { position: 'absolute', bottom: 30, left: 30, right: 30, borderTop: '1 solid #E0E0E0', paddingTop: 10, flexDirection: 'row', justifyContent: 'space-between' }
});

// PDF Document Component
const MonthlyReportPDF = ({ data }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <View>
          <Text style={styles.companyName}>{data.companyInfo.name}</Text>
        </View>
      </View>

      <Text style={styles.reportTitle}>
        {`Monthly Platform Report - ${data.reportMetadata.month} ${data.reportMetadata.year}`}
      </Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About Our Platform</Text>
        <Text style={{ fontSize: 10, lineHeight: 1.5 }}>{data.companyInfo.description}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>User Metrics</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Total Users:</Text>
          <Text style={styles.value}>{data.userMetrics.totalUsers}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>New Users This Month:</Text>
          <Text style={styles.value}>{data.userMetrics.newUsersThisMonth}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Active Users:</Text>
          <Text style={styles.value}>{data.userMetrics.activeUsers}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={{ fontSize: 8, color: '#7F8C8D' }}>
          © {data.reportMetadata.year} {data.companyInfo.name}
        </Text>
        <Text style={{ fontSize: 8, color: '#7F8C8D' }}>
          Generated on: {data.reportMetadata.generatedDate}
        </Text>
      </View>
    </Page>
  </Document>
);

// Main Component
const MonthlyReportGenerator = () => {
  const mockData = generateMockData();

  const openPdfInNewTab = async () => {
    const blob = await pdf(<MonthlyReportPDF data={mockData} />).toBlob();
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Monthly Platform Report Generator</h1>
      <button 
        onClick={openPdfInNewTab} 
        className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
      >
        Open PDF in New Tab
      </button>
    </div>
  );
};

export default MonthlyReportGenerator;
