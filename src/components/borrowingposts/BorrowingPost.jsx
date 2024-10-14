// modules
import React from "react";
import { useState } from "react";

// styles
import "./postStyles.css";
// images
import item1 from "../../assets/images/item/item_1.jpg";
import item2 from "../../assets/images/item/item_2.jpg";
import item3 from "../../assets/images/item/item_3.jpg";
import item4 from "../../assets/images/item/item_4.jpg";
import item5 from "../../assets/images/item/item_5.jpg";
import moreImg from "../../assets/images/icons/moreImg.png";
import { Link, useNavigate } from "react-router-dom";

const BorrowingPost = ({ borrowingPosts, title }) => {
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [showOptions, setShowOptions] = useState(null);
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

  const handleMouseEnter = (tags, index) => {
    setSelectedIndex(index);
  };

  const handleMouseLeave = () => {
    setSelectedIndex(null);
  };

  const handleMoreClick = (index) => {
    if (showOptions === index) {
      setShowOptions(null); // Close if already open
    } else {
      setShowOptions(index);
    }
  };

  return (
    <div className="custom-container item">
      <h2 className="fs-2 fw-bold">{title}</h2>
      <div className="card-container">
        {borrowingPosts.length > 0 ? (
          borrowingPosts.map((item, index) => (
            <Link to={`/lend/1`} key={index} className="card-link">
              <div className="card card-variant-2" key={index}>
                <div className="tags">
                  <ul className="tag-list">
                    {item.tags &&
                      item.tags.slice(0, 2).map((tag, tagIndex) => (
                        <li key={tagIndex} className="tag">
                          {tag}
                        </li>
                      ))}
                    {item.tags && item.tags.length > 1 && (
                      <li
                        className="tag more"
                        onMouseEnter={() => handleMouseEnter(item.tags, index)}
                        onMouseLeave={handleMouseLeave}
                      >
                        + More
                      </li>
                    )}
                  </ul>
                </div>
                <div className="row">
                  <div className="col-6">
                    <div className="card-body">
                      <p className="card-text fw-bold">{item.title}</p>
                      <p className="card-text text-accent fw-bold">
                        {item.price}
                      </p>
                      <div className="">
                        <p className="card-text label">Rental Duration</p>
                        <button className="btn btn-rounded thin">
                          {item.rentalDuration}
                        </button>
                      </div>
                      <div className="">
                        <p className="card-text label">Rental Date</p>
                        <button className="btn btn-rounded thin">
                          {item.rentalDate}
                        </button>
                      </div>
                      <img
                        src={moreImg}
                        className="icon more"
                        alt="More options"
                        onClick={() => handleMoreClick(index)}
                        style={{ cursor: "pointer" }}
                      />
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="card-img">
                      <img src={getItemImage(item.itemImage)} alt="Card" />
                    </div>
                  </div>
                </div>
                {selectedIndex === index && (
                  <div className="popup">
                    <div className="popup-content">
                      <ul className="d-block">
                        {item.tags.map((tag, tagIndex) => (
                          <li key={tagIndex}>{tag}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {showOptions === index && (
                  <div className="options">
                    <div className="options-content">
                      <ul>
                        <li>Option 1</li>
                        <li>Option 2</li>
                        <li>Option 3</li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </Link>
          ))
        ) : (
          <p>No items to display</p>
        )}
      </div>
    </div>
  );
};

export default BorrowingPost;
