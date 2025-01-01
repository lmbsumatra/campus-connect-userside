// src/hooks/useSortItems.js

import { useState } from 'react';

const useSortItems = (items) => {
  const [sortConfig, setSortConfig] = useState({ key: "name", direction: "asc" });

  const sortedItems = [...items].sort((a, b) => {
    const { key, direction } = sortConfig;
    if (a[key] < b[key]) return direction === "asc" ? -1 : 1;
    if (a[key] > b[key]) return direction === "asc" ? 1 : -1;
    return 0;
  });

  const handleSort = (key) => {
    setSortConfig((prevConfig) => {
      const newDirection = prevConfig.key === key && prevConfig.direction === "asc" ? "desc" : "asc";
      return { key, direction: newDirection };
    });
  };

  return {
    sortedItems,
    sortConfig,
    handleSort,
  };
};

export default useSortItems;
