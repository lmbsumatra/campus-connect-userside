import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './TableComponent.css';

const TableComponent = ({ headers, data, statusColumnIndex }) => {
  return (
    <div className="table-responsive">
      <table className="table table-bordered">
        <thead>
          <tr>
            {headers.map((header, index) => (
              <th key={index}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <td key={cellIndex}>
                  {cellIndex === statusColumnIndex ? (
                    <span className={`badge ${getStatusBadgeClass(cell)}`}>{cell}</span>
                  ) : (
                    cell
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Helper function to determine badge color based on status
const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'Approved':
      return 'bg-success';
    case 'Declined':
      return 'bg-danger';
    case 'Suspended':
      return 'bg-secondary';
    default:
      return 'bg-light';
  }
};

export default TableComponent;
