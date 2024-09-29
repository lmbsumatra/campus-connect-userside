// modules
import React from "react";
// styles
import "./style.css";
// images
import item1 from "../../assets/images/item/item_1.jpg";
import item2 from "../../assets/images/item/item_2.jpg";
import item3 from "../../assets/images/item/item_3.jpg";
import item4 from "../../assets/images/item/item_4.jpg";
import item5 from "../../assets/images/item/item_5.jpg";
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
      <h2 className="fs-2 fw-bold">New Borrowing Posts</h2>
      <div className="card-container d-flex justify-content-center">
        {borrowingPosts.map((post) => (
          <div
            className="card"
            style={{ width: "500px", cursor: "pointer" }}
            key={post.id}
            onClick={() => handleCardClick(post.id)}
          >
            <div className="d-flex user-container align-items-center">
              <div className="align-items-center">
                <img
                  src={getItemImage(post.itemImage)}
                  alt=""
                  className="icon-user me-2"
                />
                <h5 className="fs-6">
                  {post.username} (
                  <span>
                    {post.userRating}
                    <i
                      className="fa-solid fa-star"
                      style={{ color: "#ffd43b" }}
                    ></i>
                  </span>
                  ) <span>is looking for</span>
                </h5>
              </div>
              <div className="d-flex justify-content-between">
                <button
                  className="btn btn-two"
                  data={post.actions.message}
                ></button>
                <button className="btn btn-one">{post.actions.view}</button>
              </div>
            </div>
            <div className="card-body d-flex flex-row">
              <div className="card-content">
                <div className="pe-3">
                  <div>
                    <h5 className="fs-5">{post.itemName}</h5>
                  </div>
                  <div className="d-flex align-items-center mb-1">
                    <span className="me-2">Duration</span>
                    <button className="btn btn-six" data={post.rentalDuration}>
                      
                    </button>
                  </div>
                  <div className="d-flex align-items-center mb-1">
                    <span className="me-2">Rental Date</span>
                    <button className="btn btn-six" data={post.rentalDate}>
                      
                    </button>
                  </div>
                  <div className="d-flex align-items-center mb-1">
                    <span className="me-2">Delivery</span>
                    <button className="btn btn-six" data={post.deliveryMethod}>
                      
                    </button>
                  </div>
                </div>
              </div>
              <div>
                <img
                  src={getItemImage(post.itemImage)}
                  className="card-img-left"
                  alt="..."
                  style={{ width: "200px", objectFit: "cover" }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BorrowingPost;
