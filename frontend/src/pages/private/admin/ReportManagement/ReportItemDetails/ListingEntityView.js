import React from "react";

const ListingEntityView = ({ entityDetails }) => {
  if (!entityDetails) return <div>No details available for this sale.</div>;

  const formatDate = (isoDate) => {
    if (!isoDate) return "N/A";
    const date = new Date(isoDate);
    return date.toLocaleDateString(); // Default format based on locale
  };

  const formatSpecifications = (specifications) => {
    if (!specifications) return "N/A";
  
    // Parse and render specifications if it's a JSON string
    try {
      const specs = typeof specifications === "string" ? JSON.parse(specifications) : specifications;
      return Object.entries(specs)
        .map(([key, value]) => `${key}: ${value}`)
        .join(", "); // Join key-value pairs with a comma
    } catch {
      return specifications; // Fallback if parsing fails
    }
  };
  

  const formatTags = (tags) => {
    if (!tags) return "N/A";
    try {
      const parsedTags = typeof tags === "string" ? JSON.parse(tags) : tags;
      return parsedTags.join(", ");
    } catch {
      return tags;
    }
  };

  return (
    <div className="entity-details">
      <div className="entity-row">
        <span className="entity-label">Listing Name:</span>
        <span className="entity-value">{entityDetails.listing_name || "N/A"}</span>
      </div>
      <div className="entity-row">
        <span className="entity-label">Rate:</span>
        <span className="entity-value">{entityDetails.rate || "N/A"}</span>
      </div>
      <div className="entity-row">
        <span className="entity-label">Category:</span>
        <span className="entity-value">{entityDetails.category || "N/A"}</span>
      </div>

      <div className="entity-row">
        <span className="entity-label">Deliver Mode:</span>
        <span className="entity-value">{entityDetails.delivery_mode|| "N/A"}</span>
      </div>
      <div className="entity-row">
        <span className="entity-label">Late Charges:</span>
        <span className="entity-value">{entityDetails.late_charges || "N/A"}</span>
      </div>
      <div className="entity-row">
        <span className="entity-label">Description:</span>
        <span className="entity-value">{entityDetails.description || "N/A"}</span>
      </div>

      <div className="entity-row">
        <span className="entity-label">Specifications:</span>
        <span className="entity-value">{formatSpecifications(entityDetails.specifications)}</span>
      </div>
      <div className="entity-row">
        <span className="entity-label">Tags:</span>
        <span className="entity-value">{formatTags(entityDetails.tags)}</span>
      </div>
      <div className="entity-row">
        <span className="entity-label">Date Added:</span>
        <span className="entity-value">{formatDate(entityDetails.created_at)}</span>
      </div>
      <div className="entity-row">
        <span className="entity-label">Owner Name:</span>
        <span className="entity-value">
          {entityDetails.owner
            ? `${entityDetails.owner.first_name} ${entityDetails.owner.last_name}`
            : "N/A"}
        </span>
      </div>
    </div>
  );
};

export default ListingEntityView;
