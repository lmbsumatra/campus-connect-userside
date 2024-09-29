import React from "react";
import "./style.css";

const StarRating = ({ rating }) => {
  return (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star} className={`star-icon ${star > rating ? 'empty' : ''}`}>
          <i className="fa-solid fa-star"></i>
        </span>
      ))}
    </div>
  );
};

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
                    <StarRating rating={item.rating || 0} />
                  </div>
                </div>
                <div className="d-flex justify-content-between">
                  <button className="btn btn-two" data="Message">
                  </button>
                  <button className="btn btn-one">
                    View
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
