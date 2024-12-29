import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./CardComponent.css";

const CardComponent = ({ data, headers }) => {
  return (
    <div className="adminv1-card-container">
      {data.map((row, index) => (
        <div className="adminv1-card" key={index}>
          <div className="adminv1-card-body">
            {headers.map((header, headerIndex) => {
              const isStatus = header === "Status";
              const isAction = header === "Action";

              return (
                <p
                  key={headerIndex}
                  className={`adminv1-card-text ${
                    isStatus || isAction ? "adminv1-status-action" : ""
                  }`}
                >
                  {isStatus && <strong>Status:</strong>}
                  {isAction && <strong>Action:</strong>}
                  {!isStatus && !isAction && row[headerIndex]}
                  {isStatus || isAction ? row[headerIndex] : null}
                </p>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default CardComponent;
