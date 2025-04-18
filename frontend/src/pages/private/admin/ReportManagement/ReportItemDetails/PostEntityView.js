import React from "react";
import "./EntityView.css";

const PostEntityView = ({ entityDetails }) => {
  if (!entityDetails) return <div>No details available for this post.</div>;

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
      return Object.entries(specs)
        .map(([key, value]) => `${key}: ${value}`)
        .join(", ");
    } catch {
      return specifications;
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
        <span className="entity-label">Post Name:</span>
        <span className="entity-value">
          {entityDetails.post_item_name || "N/A"}
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
        <span className="entity-label">Description:</span>
        <span className="entity-value">
          {entityDetails.description || "N/A"}
        </span>
      </div>

      <div className="entity-row">
        <span className="entity-label">Specifications:</span>
        <div className="entity-value entity-specs">
          {formatSpecifications(entityDetails.specifications)}
        </div>
      </div>

      <div className="entity-row">
        <span className="entity-label">Tags:</span>
        <div className="entity-value entity-tags">
          {entityDetails.tags &&
            formatTags(entityDetails.tags)
              .split(", ")
              .map((tag, index) => (
                <span key={index} className="entity-tag">
                  {tag}
                </span>
              ))}
        </div>
      </div>

      <div className="entity-row">
        <span className="entity-label">Date Added:</span>
        <span className="entity-value">
          {formatDate(entityDetails.created_at)}
        </span>
      </div>

      <div className="entity-row">
        <span className="entity-label">Renter Name:</span>
        <span className="entity-value">
          {entityDetails.renter
            ? `${entityDetails.renter.first_name} ${entityDetails.renter.last_name}`
            : "N/A"}
        </span>
      </div>

      {/* Image Display Section */}
      {images.length > 0 && (
        <div className="entity-row">
          <span className="entity-label">Images:</span>
          <div className="entity-value image-gallery">
            {images.map((imgSrc, index) => (
              <img
                key={index}
                src={imgSrc}
                alt={`${entityDetails.post_item_name || "Post"} - view ${
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

export default PostEntityView;
