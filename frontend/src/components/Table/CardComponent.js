import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./CardComponent.css";

const CardComponent = ({ data, headers }) => {
  return (
    <div className="adminv1-card-container">
      {data.map((row, index) => (
        <div key={index} className="adminv1-card">
          <div className="adminv1-card-body">
            {headers.map((header, headerIndex) => {
              const isStatus = header === "Status";
              const isAction = header === "Action";
              const isImage =
                headerIndex === 0 && React.isValidElement(row[headerIndex]);

              return (
                <div
                  key={headerIndex}
                  className={
                    isImage
                      ? "adminv1-card-image"
                      : isStatus
                      ? "adminv1-status-action"
                      : isAction
                      ? "adminv1-card-footer"
                      : "adminv1-card-text"
                  }
                >
                  {!isImage && !isStatus && !isAction && (
                    <div className="adminv1-card-label">{header}:</div>
                  )}

                  {isStatus && <strong>Status: </strong>}
                  {isAction && <strong>Action: </strong>}

                  <div
                    className={
                      isStatus ? "adminv1-status-value" : "adminv1-card-value"
                    }
                  >
                    {row[headerIndex]}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default CardComponent;
