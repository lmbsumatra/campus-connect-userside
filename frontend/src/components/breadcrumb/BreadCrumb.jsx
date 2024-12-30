import React from "react";
import "./breadCrumbStyles.css"; // Import the CSS file

const BreadCrumb = ({ breadcrumbs }) => {
  return (
    <div aria-label="breadcrumb" className="breadcrumb">
      <ol className="breadcrumb-list">
        {breadcrumbs.map((breadcrumb, index) => (
          <li key={index} className="breadcrumb-item">
            {/* Render a link if it's not the last item */}
            {index < breadcrumbs.length - 1 ? (
              <>
                <a href={breadcrumb.href} className="breadcrumb-link">
                  {breadcrumb.label}
                </a>
              </>
            ) : (
              <span className="breadcrumb-current">{breadcrumb.label}</span> // Current page, non-clickable
            )}
          </li>
        ))}
      </ol>
    </div>
  );
};

export default BreadCrumb;
