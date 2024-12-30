import React, { useState, useEffect, useRef } from "react";
import "./itemCardStyles.css";
import { useNavigate } from "react-router-dom";
import item1 from "../../assets/images/item/item_1.jpg";
import Tooltip from "@mui/material/Tooltip";
import cartIcon from "../../assets/images/card/cart.svg";
import moreIcon from "../../assets/images/card/more.svg";
import forRentIcon from "../../assets/images/card/rent.svg";
import forSaleIcon from "../../assets/images/card/buy.svg";
import { ItemStatus } from "../../utils/Status";
import { useDispatch, useSelector } from "react-redux";
import { deleteListingById } from "../../redux/listing/allListingsByUserSlice";
import { selectStudentUser } from "../../redux/auth/studentAuthSlice";
import ShowAlert from "../../utils/ShowAlert";
import { FOR_RENT } from "../../utils/consonants";

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

const ItemCard = ({ items, title, isYou, onOptionClick }) => {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const dropdownRefs = useRef({});
  const navigate = useNavigate();
  const { userId } = useSelector(selectStudentUser);
  const { deletingListing, deleteStatus, deleteError } = useSelector(
    (state) => state.allListingsByUser
  );

  const dispatch = useDispatch();

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

  const handleAddToCart = (e, item) => {
    e.stopPropagation();
  };

  const handleDropdownToggle = (e, index) => {
    e.stopPropagation();
    setActiveDropdown((prevState) => (prevState === index ? null : index));
  };

  const handleCardClick = (item) => {
    if (item.itemType === "For Rent") navigate(`/rent/${item.id}`);
    else if (item.itemType === "For Sale") navigate(`/shop/${item.id}`);
  };
  return (
    <div>
      <h2 className="fs-2 fw-bold">{title}</h2>
      For rent
      <div className="card-container vertical">
        {items.length > 0 ? (
          items.map((item, index) => (
            <div
              key={item.id || index}
              className="card variant-1"
              onClick={() => handleCardClick(item)}
            >
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
                  <button className="btn btn-rectangle primary">
                    {item.itemType === FOR_RENT ? "Rent" : "Buy"}
                  </button>
                  <button
                    className="btn btn-icon primary"
                    onClick={(e) => handleAddToCart(e, item)}
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
                    className={`item-status ${
                      ItemStatus(item.status).className
                    }`}
                  >
                    {ItemStatus(item.status).label}
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

export default ItemCard;
