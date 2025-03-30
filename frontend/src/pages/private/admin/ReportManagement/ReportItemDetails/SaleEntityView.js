import React from "react";
import "./EntityView.css";

const SaleEntityView = ({ entityDetails }) => {
  if (!entityDetails) return <div>No details available for this listing.</div>;

  const formatDate = (isoDate) => {
    if (!isoDate) return "N/A";
    const date = new Date(isoDate);
    return date.toLocaleDateString();
  };

  const formatSpecifications = (specifications) => {
    if (!specifications) return "N/A";

    try {
      const specs =
        typeof specifications === "string"
          ? JSON.parse(specifications)
          : specifications;
      return (
        <div className="entity-specs">
          {Object.entries(specs).map(([key, value], index) => (
            <div key={index} className="entity-spec-item">
              <strong>{key}:</strong> {value}
            </div>
          ))}
        </div>
      );
    } catch {
      return specifications;
    }
  };

  const formatTags = (tags) => {
    if (!tags) return "N/A";
    try {
      const parsedTags = typeof tags === "string" ? JSON.parse(tags) : tags;
      return (
        <div className="entity-tags">
          {parsedTags.map((tag, index) => (
            <span key={index} className="entity-tag">
              {tag}
            </span>
          ))}
        </div>
      );
    } catch {
      return tags;
    }
  };

  const getImages = (images) => {
    if (!images) return [];
    try {
      return typeof images === "string" ? JSON.parse(images) : images;
    } catch {
      return [];
    }
  };

  const images = getImages(entityDetails.images);

  return (
    <div className="entity-details">
      <div className="entity-row">
        <span className="entity-label">Sale Name:</span>
        <span className="entity-value">
          {entityDetails.item_for_sale_name || "N/A"}
        </span>
      </div>
      <div className="entity-row">
        <span className="entity-label">Price:</span>
        <span className="entity-value entity-price">
          {entityDetails.price || "N/A"}
        </span>
      </div>
      <div className="entity-row">
        <span className="entity-label">Category:</span>
        <span className="entity-value">
          <span className="entity-badge entity-category">
            {entityDetails.category || "N/A"}
          </span>
        </span>
      </div>
      <div className="entity-row">
        <span className="entity-label">Delivery Mode:</span>
        <span className="entity-value">
          {entityDetails.delivery_mode || "N/A"}
        </span>
      </div>
      <div className="entity-row">
        <span className="entity-label">Item Condition:</span>
        <span className="entity-value">
          <span className="entity-badge entity-condition">
            {entityDetails.item_condition || "N/A"}
          </span>
        </span>
      </div>
      <div className="entity-row">
        <span className="entity-label">Description:</span>
        <span className="entity-value">
          {entityDetails.description || "N/A"}
        </span>
      </div>
      <div className="entity-row">
        <span className="entity-label">Specifications:</span>
        <span className="entity-value">
          {formatSpecifications(entityDetails.specifications)}
        </span>
      </div>
      <div className="entity-row">
        <span className="entity-label">Tags:</span>
        <span className="entity-value">{formatTags(entityDetails.tags)}</span>
      </div>
      <div className="entity-row">
        <span className="entity-label">Date Added:</span>
        <span className="entity-value">
          {formatDate(entityDetails.created_at)}
        </span>
      </div>
      <div className="entity-row">
        <span className="entity-label">Seller Name:</span>
        <span className="entity-value">
          {entityDetails.seller
            ? `${entityDetails.seller.first_name} ${entityDetails.seller.last_name}`
            : "N/A"}
        </span>
      </div>

      {/* Image Display Section */}
      {images.length > 0 && (
        <div className="entity-row">
          <span className="entity-label">Images:</span>
          <div className="image-gallery">
            {images.map((imgSrc, index) => (
              <img
                key={index}
                src={imgSrc}
                alt={`${entityDetails.item_for_sale_name || "Sale"} - view ${
                  index + 1
                }`}
                className="entity-image"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SaleEntityView;
