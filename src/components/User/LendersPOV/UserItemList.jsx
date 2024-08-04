import React, { useState } from "react";
import "../LendersPOV/style.css"  ;
import ListView from "../../../assets/images/icons/list.png";
import GridView from "../../../assets/images/icons/grid.png";
import StarRating from "../../rating/StarRating";


const UserItemList = ({ items = [] }) => {
  const [isListView, setIsListView] = useState(false);

  const handleToggleView = () => {
    setIsListView(!isListView);
  };

  const renderCardView = () => (
    <div className="card-container">
      {items.length > 0 ? (
        items.map((item, index) => (
          <div className="card" key={index}>
            <div className="card-img-top">
              <img src={item.image} alt={item.title} />
            </div>
            <div className="card-body d-flex flex-column">
              <div className="d-flex justify-content-between">
                <h5 className="fs-5">{item.title}</h5>
                <h3 className="fs-5">{item.price}</h3>
              </div>
              <div className="d-flex align-items-center">
                <img
                  src={item.ownerImage}
                  alt={item.owner}
                  className="icon-user me-2 mb-2"
                />
                <div>
                  <h5 className="fs-6">{item.owner}</h5>
                  <StarRating rating={item.rating || 0} />
                </div>
              </div>
              <div className="button-container d-flex justify-content-end">
                <button className="btn btn-primary filled">
                  <span className="text-gradient">View</span>
                </button>
              </div>
            </div>
          </div>
        ))
      ) : (
        <p>No items to display</p>
      )}
    </div>
  );

  const renderTableView = () => (
    <div className="table-responsive">
      <table className="table table-striped">
        <thead className="table-header">
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th>Category</th>
            <th>Amount</th>
            <th>Ratings</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.length > 0 ? (
            items.map((item, index) => (
              <tr key={index}>
                <td>{item.title}</td>
                <td>{item.description}</td>
                <td>{item.category}</td>
                <td>{item.price}</td>
                <td><StarRating rating={item.rating || 0} /></td>
                <td>
                  <button className="btn btn-primary table-edit-btn me-2">Edit</button>
                  <button className="btn btn-danger">Delete</button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5">No items to display</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
  
  return (
    <div className="custom-container item">
      <div className="header-container">
        <h2 className="fs-2 fw-bold margin-top-adjustment">Items</h2>
        <div 
          className="photo-icon-container" 
          onClick={handleToggleView}
          title={isListView ? "Switch to Grid View" : "Switch to List View"}
        >
          <img 
            src={isListView ? GridView : ListView} 
            alt={isListView ? "Grid View Icon" : "List View Icon"} 
            className="photo-icon" 
          />
        </div>
      </div>
      {isListView ? renderTableView() : renderCardView()}
    </div>
  );
};

export default UserItemList;
