import React from "react";
import "./style.css"; // Use the same CSS file
import StarRating from "../../Rating/StarRating";

import item1 from "../../../assets/images/item/item_1.jpg";
import item2 from "../../../assets/images/item/item_2.jpg";
import item3 from "../../../assets/images/item/item_3.jpg";
import item4 from "../../../assets/images/item/item_4.jpg";
import item5 from "../../../assets/images/item/item_5.jpg";
import { useNavigate } from "react-router-dom";

const BorrowingPost = ({ borrowingPosts }) => {
  const navigate = useNavigate();

  const getItemImage = (itemImage) => {
    switch (itemImage) {
      case "item_1.jpg":
        return item1;
      case "item_2.jpg":
        return item2;
      case "item_3.jpg":
        return item3;
      case "item_4.jpg":
        return item4;
      case "item_5.jpg":
        return item5;
      default:
        return item1;
    }
  };

  const handleCardClick = (id) => {
    navigate(`/posts/${id}`);
  };

  return (
    <div className="custom-container post">
      <div className="borrowing-card-container">
        {borrowingPosts.map((post) => (
          <div
            className="borrowing-card"
            style={{ width: "800px", cursor: "pointer", height: "300px"
            }}
            key={post.id}
            onClick={() => handleCardClick(post.id)}
          >
            <div className="borrowing-card-body">
              <div className="borrowing-card-content">
                <h5 className="fs-5">{post.itemName}</h5>
                <div className="details">
                <div className="d-flex align-items-center mb-1">
                    <span className="me-2">Rental Duration</span>
                    <button className="btn btn-tertiary no-fill">
                      {post.rentalDuration}
                    </button>
                  </div>
                  <div className="d-flex align-items-center mb-1">
                    <span className="me-2">Rental Date</span>
                    <button className="btn btn-tertiary no-fill">
                      {post.rentalDate}
                    </button>
                  </div>
                  <div className="d-flex align-items-center mb-1">
                    <span className="me-2">Delivery</span>
                    <button className="btn btn-tertiary no-fill">
                      {post.deliveryMethod}
                    </button>
                  </div>
                </div>
              </div>
              <img
                src={getItemImage(post.itemImage)}
                className="borrowing-card-img"
                alt="..."
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BorrowingPost;
