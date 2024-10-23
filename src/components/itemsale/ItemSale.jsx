import React, { useState } from "react";
import moreImg from "../../assets/images/icons/moreImg.png";
import "./itemSaleStyles.css";
import { useNavigate } from "react-router-dom";
import itemForSaleIcon from "../../assets/images/card/sale.png";

const ItemSale = ({ items = [], title }) => {
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [showOptions, setShowOptions] = useState(null);
  const [showSalePopup, setShowSalePopup] = useState(false); // State for sale icon popup
  const [currentSaleIndex, setCurrentSaleIndex] = useState(null); // Track which sale icon is hovered
  const navigate = useNavigate();

  const handleMouseEnter = (tags, index) => {
    setSelectedIndex(index);
  };

  const handleMouseLeave = () => {
    setSelectedIndex(null);
  };

  const handleSaleMouseEnter = (index) => {
    setShowSalePopup(true);
    setCurrentSaleIndex(index);
  };

  const handleSaleMouseLeave = () => {
    setShowSalePopup(false);
    setCurrentSaleIndex(null);
  };

  const handleMoreClick = (index, e) => {
    e.stopPropagation();
    if (showOptions === index) {
      setShowOptions(null); // Close if already open
    } else {
      setShowOptions(index);
    }
  };

  const handleCardClick = (item) => {
    navigate(`/rent/1`); // Navigate to the link when the card is clicked
  };

  return (
    <div>
      <h2 className="fs-2 fw-bold">{title}</h2>
      <div className="card-container m-0">
        {items.length > 0 ? (
          items.map((item, index) => (
            <div
              key={index}
              className="card-link"
              onClick={() => handleCardClick(item)}
            >
              <div className="card card-variant-3">
                <img
                  src={itemForSaleIcon}
                  className="sale-icon"
                  alt="Item for sale icon/indication"
                  onMouseEnter={() => handleSaleMouseEnter(index)}
                  onMouseLeave={handleSaleMouseLeave}
                />
                <div className="card-img-top">
                  <img src={item.image} alt="Card" />
                </div>
                <div className="tags">
                  <ul className="tag-list">
                    {item.tags &&
                      item.tags.slice(0, 1).map((tag, tagIndex) => (
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
                <div className="card-body d-flex">
                  <div>
                    <p className="card-text fw-bold">{item.title}</p>
                    <p className="card-text text-accent fw-bold">
                      {item.price}
                    </p>
                  </div>
                  <img
                    src={moreImg}
                    className="icon more"
                    alt="More options"
                    onClick={(e) => handleMoreClick(index, e)}
                    style={{ cursor: "pointer", width: "28px", height: "28px" }}
                  />
                </div>

                {selectedIndex === index && (
                  <div className="popup">
                    <div className="popup-content">
                      <ul>
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

                {/* Sale pop-up */}
                {showSalePopup && currentSaleIndex === index && (
                  <div className="sale-popup">
                    This item is for sale
                  </div>
                )}
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

export default ItemSale;
