import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./CardComponent.css";

const CardComponent = ({ data, headers }) => {
  return (
    <div className="card-container">
      {data.map((row, index) => (
        <div className="card" key={index}>
          <div className="card-body">
            {headers.map((header, headerIndex) => {
              // Check if the header is "Status" or "Action"
              const isStatus = header === "Status";
              const isAction = header === "Action";

              return (
                <p
                  key={headerIndex}
                  className={`card-text ${
                    isStatus || isAction ? "status-action" : ""
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