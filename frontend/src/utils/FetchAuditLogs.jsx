import { baseApi } from "./consonants";
const fetchAuditLogs = async (adminUser) => {
  if (!adminUser || !adminUser.token) {
    throw new Error("No authentication token found.");
  }

  const response = await fetch(`${baseApi}/admin/logs`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${adminUser.token}`,
    },
  });

  if (!response.ok) throw new Error("Failed to fetch logs");

  return response.json();
};

export default fetchAuditLogs;
