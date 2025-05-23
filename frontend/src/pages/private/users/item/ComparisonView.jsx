import React, { useMemo } from "react";
import { Diff } from "lucide-react";
import "./comparisonViewStyles.css";
import { FOR_RENT, FOR_SALE } from "../../../../utils/consonants";

const formatValue = (value) => {
  if (value === null || value === undefined) return "None";
  if (typeof value === "object" && value.value !== undefined) {
    return value.value.toString();
  }
  if (Array.isArray(value)) {
    return value.join(", ") || "Empty array";
  }
  if (typeof value === "object") {
    const values = Object.values(value);
    if (values.length === 0) return "Empty object";
    return values.map((v) => formatValue(v)).join(", ");
  }
  return value.toString();
};

// Utility to normalize field names
const normalizeFieldName = (fieldName) => {
  return fieldName
    .replace(/([A-Z])/g, " $1") // Add a space before each uppercase letter
    .replace(/^./, (str) => str.toUpperCase()) // Capitalize the first letter
    .trim();
};

const ComparisonView = ({ originalData, currentData, itemType }) => {
  const changes = useMemo(() => {
    const differences = {};

    Object.keys(currentData).forEach((key) => {
      if (key === "isFormValid" || key === "triggered" || key === "hasError")
        return;

      const currentValue =
        currentData[key]?.value !== undefined
          ? currentData[key].value
          : currentData[key];
      const originalValue = originalData[key];

      if (JSON.stringify(currentValue) !== JSON.stringify(originalValue)) {
        differences[key] = {
          old: originalValue,
          new: currentValue,
        };
      }
    });

    if (originalData?.images?.length !== currentData?.images?.value?.length) {
      differences.images = {
        old: originalData?.images || [],
        new: currentData?.images?.value || [],
      };
    }

    if (
      JSON.stringify(originalData?.availableDates) !==
      JSON.stringify(currentData?.availableDates?.value)
    ) {
      differences.availableDates = {
        old: originalData?.availableDates || [],
        new: currentData?.availableDates?.value || [],
      };
    }

    if (
      JSON.stringify(originalData?.requestDates) !==
      JSON.stringify(currentData?.requestDates?.value)
    ) {
      differences.requestDates = {
        old: originalData?.requestDates || [],
        new: currentData?.requestDates?.value || [],
      };
    }

    return differences;
  }, [originalData, currentData]);

  const filteredChanges = Object.entries(changes).filter(([field]) => {
    if (itemType === FOR_RENT && field === "stock") return false;
    if (
      itemType === FOR_SALE &&
      (field === "lateCharges" ||
        field === "securityDeposit" ||
        field === "repairReplacement")
    )
      return false;
    return true;
  });

  const hasChanges = filteredChanges.length > 0;

  const renderValue = (value, type) => {
    if (type === "images") {
      return Array.isArray(value) ? `${value.length} images` : "0 images";
    }

    if (type === "availableDates") {
      if (!Array.isArray(value)) return "0 dates";
      return `${value.length} dates (${value
        .map((date) => {
          if (typeof date === "object" && date.date) {
            return new Date(date.date).toLocaleDateString();
          }
          return new Date(date).toLocaleDateString();
        })
        .join(", ")})`;
    }

    if (type === "requestDates") {
      if (!Array.isArray(value)) return "0 dates";
      return `${value.length} dates (${value
        .map((date) => {
          if (typeof date === "object" && date.date) {
            return new Date(date.date).toLocaleDateString();
          }
          return new Date(date).toLocaleDateString();
        })
        .join(", ")})`;
    }

    return formatValue(value);
  };

  return (
    <div className="comparison-container">
      <div className="comparison-header">
        <Diff className="comparison-icon" />
        <h2 className="comparison-title">Changes Summary</h2>
      </div>

      {!hasChanges ? (
        <p className="no-changes">No changes detected</p>
      ) : (
        <div className="changes-list">
          {Object.entries(changes).map(([field, values]) => {
            if (itemType === FOR_RENT && field === "stock") return null;
            if (
              itemType === FOR_SALE &&
              (field === "lateCharges" ||
                field === "securityDeposit" ||
                field === "repairReplacement")
            )
              return null;
            return (
              <div key={field} className="change-item">
                <label className="field-label">
                  {normalizeFieldName(field)}
                </label>

                <div className="comparison-row">
                  <div className="comparison-column previous">
                    <p className="column-header">Previous</p>
                    <div className="value-container">
                      {renderValue(values.old, field)}
                    </div>
                  </div>

                  <div className="comparison-column new">
                    <p className="column-header">New</p>
                    <div className="value-container">
                      {renderValue(values.new, field)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ComparisonView;
