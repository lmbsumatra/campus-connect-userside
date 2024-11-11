import React, { useState } from "react";
import moreImg from "../../assets/images/icons/moreImg.png";
import "./itemStyles.css";
import { useNavigate } from "react-router-dom";
import item1 from "../../assets/images/item/item_1.jpg";

const ItemList = ({ listings, title, isProfileVisit }) => {
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [showOptions, setShowOptions] = useState(null);
  const navigate = useNavigate();

  const handleMouseEnter = (index) => {
    setSelectedIndex(index);
  };

  const handleMouseLeave = () => {
    setSelectedIndex(null);
  };

  const handleMoreClick = (index, e) => {
    e.stopPropagation(); // Prevent the Link from triggering
    if (showOptions === index) {
      setShowOptions(null); // Close if already open
    } else {
      setShowOptions(index);
    }
  };

  const handleCardClick = ({ id }) => {
    navigate(`/rent/${id}`); // Navigate to the link when the card is clicked
  };

  return (
    <div>
      <h2 className="fs-2 fw-bold">{title}</h2>
      <div className="card-container m-0">
        {listings.length > 0 ? (
          listings.map((item, index) => {
            let tags = [];
            try {
              tags = JSON.parse(item.tags);
            } catch (e) {
              console.error("Error parsing tags:", e);
              tags = []; // Fallback to an empty array if parsing fails
            }

            return (
              <div
                key={index}
                className="card-link"
                onClick={() => handleCardClick(item)}
              >
                <div className={`card card-variant-1`}>
                  <div className="card-img-top">
                    <img src={item1} alt="Card" />
                  </div>
                  <div className="tags">
                    <ul className="tag-list">
                      {Array.isArray(tags) &&
                        tags.slice(0, 1).map((tag, tagIndex) => (
                          <li key={tagIndex} className="tag">
                            {tag}
                          </li>
                        ))}
                      {Array.isArray(tags) && tags.length > 1 && (
                        <li
                          className="tag more"
                          onMouseEnter={() => handleMouseEnter(index)}
                          onMouseLeave={handleMouseLeave}
                        >
                          + More
                        </li>
                      )}
                    </ul>
                  </div>
                  <div className="card-body d-flex">
                    <div>
                      <p className="card-text fw-bold ellipsis">
                        {item.listing_name}
                      </p>
                      <p className="card-text text-accent fw-bold">
                        {item.rate}
                      </p>
                    </div>
                    <img
                      src={moreImg}
                      className="icon more"
                      alt="More options"
                      onClick={(e) => handleMoreClick(index, e)}
                      style={{
                        cursor: "pointer",
                        width: "28px",
                        height: "28px",
                      }}
                    />
                  </div>

                  {selectedIndex === index && (
                    <div className="popup">
                      <div className="popup-content">
                        <ul>
                          {tags.map((tag, tagIndex) => (
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

                  {isProfileVisit === false && (
                    <div className="d-flex justify-content-end">
                      <span
                        className={`status-indication ${item.status}`}
                      >
                        {" "}
                        {item.status.charAt(0).toUpperCase() +
                          item.status.slice(1).toLowerCase()}{" "}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <p>No items to display</p>
        )}
      </div>
    </div>
  );
};

export default ItemList;
