import React from "react";
import "./style.css";

const ItemList = ({ items = [] }) => {
  return (
    <div className="custom-container item">
      <h2 className="fs-2 fw-bold margin-top-adjustment">Top Listings</h2>
      <div className="card-container">
        {items.length > 0 ? (
          items.map((item, index) => (
            <div className="card" key={index}>
              <div className="card-img-top">
                <img src={item.image} alt="Item" />
              </div>
              <div className="card-body d-flex flex-column">
                <div className="d-flex justify-content-between">
                  <h5 className="fs-5">{item.title}</h5>
                  <h3 className="fs-5">{item.price}</h3>
                </div>
                <div className="d-flex align-items-center">
                  <img
                    src={item.ownerImage}
                    alt=""
                    className="icon-user me-2 mb-2"
                  />
                  <div>
                    <h5 className="fs-6">{item.owner}</h5>
                    <span>
                      <i
                        className="fa-solid fa-star"
                        style={{ color: "#ffd43b" }}
                      ></i>
                    </span>
                  </div>
                </div>
                <div className="d-flex justify-content-between">
                  <button className="btn btn-primary no-fill me-2">
                    <span className="text-gradient">Message</span>
                  </button>
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
    </div>
  );
};

export default ItemList;
