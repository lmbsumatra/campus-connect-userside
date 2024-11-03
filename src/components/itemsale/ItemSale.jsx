import React, { useState } from "react";
import moreImg from "../../assets/images/icons/moreImg.png";
import "./itemSaleStyles.css";
import { useNavigate } from "react-router-dom";
import itemForSaleIcon from "../../assets/images/card/sale.png";

const ItemSale = ({ items, title }) => {
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [showOptions, setShowOptions] = useState(null);
  const [showSalePopup, setShowSalePopup] = useState(false);
  const [currentSaleIndex, setCurrentSaleIndex] = useState(null);
  const navigate = useNavigate();

  const handleMouseEnter = (index) => {
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
    setShowOptions(showOptions === index ? null : index);
  };

  const handleCardClick = ({id}) => {
    navigate(`/item-for-sale/${id}`);
  };

  return (
    <div>
      <h2 className="fs-2 fw-bold">{title}</h2>
      <div className="card-container m-0">
        {items.length > 0 ? (
          items.map((item, index) => {
            let tags = [];
            try {
              tags = JSON.parse(item.tags);
            } catch (e) {
              console.error("Error parsing tags:", e);
              tags = [];
            }

            return (
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
                      <p className="card-text fw-bold ellipsis">{item.item_for_sale_name}</p>
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

                  {showSalePopup && currentSaleIndex === index && (
                    <div className="sale-popup">This item is for sale</div>
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

export default ItemSale;
