import React, { useState, useEffect, useRef } from "react";
import "./itemCardStyles.css";
import { useNavigate } from "react-router-dom";
import item1 from "../../assets/images/item/item_1.jpg";
import Tooltip from "@mui/material/Tooltip";
import cartIcon from "../../assets/images/card/cart.svg";
import moreIcon from "../../assets/images/card/more.svg";
import forRentIcon from "../../assets/images/card/rent.svg";
import forSaleIcon from "../../assets/images/card/buy.svg";
import editIcon from "../../assets/images/table/edit.svg";
import deleteIcon from "../../assets/images/table/delete.svg";
import { ItemStatus } from "../../utils/Status";
import { FOR_RENT } from "../../utils/consonants";

// Import custom hook
import useSortItems from "../../pages/private/users/student-profile/useSortItems";

const tooltipProps = {
  componentsProps: {
    popper: {
      modifiers: [
        {
          name: "offset",
          options: { offset: [0, -10] },
        },
      ],
    },
  },
};

const ItemCard = ({
  items,
  title,
  isYou,
  onOptionClick,
  selectedItems = [],
  onSelectItem,
  viewType = "card",
  itemType,
}) => {
  console.log({ items });
  const [activeDropdown, setActiveDropdown] = useState(null);
  const dropdownRefs = useRef({});
  const navigate = useNavigate();

  // Use the custom sorting hook
  const { sortedItems, sortConfig, handleSort } = useSortItems(items);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const activeRef = dropdownRefs.current[activeDropdown];
      if (
        activeDropdown !== null &&
        activeRef &&
        !activeRef.contains(event.target)
      ) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [activeDropdown]);

  const handleCardClick = (e, item) => {
    e.stopPropagation();
    if (item.itemType === "For Rent")
      navigate(`/profile/my-listings/edit/${item.id}`, { state: { item } });
    else if (item.itemType === "For Sale") navigate(`/shop/${item.id}`);
  };

  const handleAddToCart = (e, item) => {
    e.stopPropagation();
    console.log(`Added ${item.name} to cart`);
  };

  const handleDropdownToggle = (e, index) => {
    e.stopPropagation();
    setActiveDropdown((prevState) => (prevState === index ? null : index));
  };

  const handleAddItemClick = () => {
    navigate(
      `/profile/${itemType === FOR_RENT ? "my-listings" : "my-for-sale"}/add`
    );
  };

  // Render items as cards
  const renderCardView = () => (
    <div className="card-container vertical">
      {/* Add Item Card */}
      {isYou && (
        <div
          className="card variant-1 add-item bg-light"
          onClick={handleAddItemClick}
        >
          <div className="add-item-content">
            <p className="add-item-text">+ Add New Item</p>
          </div>
        </div>
      )}
      {sortedItems.map((item, index) => (
        <div
          key={item.id || index}
          className={`card variant-1 ${
            selectedItems.includes(item.id) ? "selected" : ""
          }`}
          onClick={(e) => handleCardClick(e, item)}
        >
          {isYou && (
            <div className="select-container">
              <div className="select">
                <input
                  type="checkbox"
                  checked={selectedItems.includes(item.id)}
                  onClick={(e) => e.stopPropagation()} // Prevent card click
                  onChange={(e) => onSelectItem(item.id)} // Handle selection
                />
                {selectedItems.includes(item.id) ? "Selected" : "Select"}
              </div>
            </div>
          )}

          <div className="img-holder">
            <img src={item1} alt={item.name} className="img" />
            <Tooltip
              title={`${item.name} is for ${
                item.itemType === "Rent" ? "rent" : "sale"
              }.`}
              {...tooltipProps}
            >
              <img
                src={item.itemType === FOR_RENT ? forRentIcon : forSaleIcon}
                alt={`${item.name} type`}
                className="item-type"
              />
            </Tooltip>
          </div>

          <div className="description">
            <div className="tags-holder">
              {Array.isArray(item.tags) && item.tags.length > 0 && (
                <>
                  <span className="tag">{item.tags[0]}</span>
                  {item.tags.length > 1 && (
                    <Tooltip
                      title={item.tags.slice(1).map((tag, i) => (
                        <div key={i}>
                          {tag}
                          <br />
                        </div>
                      ))}
                      {...tooltipProps}
                    >
                      <span className="tag">More +</span>
                    </Tooltip>
                  )}
                </>
              )}
            </div>

            <p className="item-name">{item.name}</p>
            <p className="item-price">
              P{item.price} {item.itemType === "Rent" ? "per hour" : ""}
            </p>

            <div className="action-btns">
              <button className="btn btn-rectangle primary" disabled={isYou}>
                {item.itemType === FOR_RENT ? "Rent" : "Buy"}
              </button>
              <button
                className="btn btn-icon primary"
                onClick={(e) => handleAddToCart(e, item)}
                disabled={isYou}
              >
                <img src={cartIcon} alt="Add to cart" />
              </button>

              <div
                className="option"
                ref={(el) => (dropdownRefs.current[index] = el)}
              >
                <button
                  className="btn btn-icon secondary option"
                  onClick={(e) => handleDropdownToggle(e, index)}
                >
                  <img src={moreIcon} alt="More options" />
                </button>
                {activeDropdown === index && (
                  <div className="menu">
                    {["view", "edit", "delete"].map((option) => (
                      <button
                        key={option}
                        className="item"
                        onClick={(e) => onOptionClick(e, option, item)}
                      >
                        {option.charAt(0).toUpperCase() + option.slice(1)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {isYou && (
              <div
                className={`item-status ${ItemStatus(item.status).className}`}
              >
                {ItemStatus(item.status).label}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  // Render items as a table
  const renderTableView = () => (
    <table className="table">
      <thead>
        <tr>
          <th onClick={() => handleSort("select")}>Select</th>
          <th onClick={() => handleSort("image")}>Image</th>
          <th onClick={() => handleSort("name")}>
            Name{" "}
            {sortConfig.key === "name" &&
              (sortConfig.direction === "asc" ? "↑" : "↓")}
          </th>
          <th onClick={() => handleSort("price")}>
            Price{" "}
            {sortConfig.key === "price" &&
              (sortConfig.direction === "asc" ? "↑" : "↓")}
          </th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {sortedItems.map((item, index) => (
          <tr
            key={item.id || index}
            className={selectedItems.includes(item.id) ? "selected" : ""}
          >
            <td>
              {isYou && (
                <input
                  type="checkbox"
                  checked={selectedItems.includes(item.id)}
                  onChange={(e) => onSelectItem(item.id)} // Handle selection
                />
              )}
            </td>
            <td>
              <img src={item1} alt={item.name} className="img-thumbnail" />
            </td>
            <td>{item.name}</td>
            <td>
              P{item.price} {item.itemType === "Rent" ? "per hour" : ""}
            </td>
            <td>
              <button
                className="btn btn-icon primary"
                onClick={(e) => onOptionClick(e, "edit", item)}
              >
                <img src={editIcon} alt="Edit" />
              </button>
              <button
                className="btn btn-icon primary"
                onClick={(e) => onOptionClick(e, "delete", item)}
              >
                <img src={deleteIcon} alt="Delete" />
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div>
      <h2 className="fs-2 fw-bold">{title}</h2>
      {viewType === "card" ? renderCardView() : renderTableView()}
    </div>
  );
};

export default ItemCard;
