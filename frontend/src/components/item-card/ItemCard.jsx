import React, { useState } from "react";
import moreImg from "../../assets/images/icons/moreImg.png";
import "./itemCardStyles.css";
import { useNavigate } from "react-router-dom";
import item1 from "../../assets/images/item/item_1.jpg";
import flagIcon from "../../assets/images/card/flag.svg";
import Tooltip from "@mui/material/Tooltip";
import { Button } from "@mui/material";
import cartIcon from "../../assets/images/card/cart.svg";
import moreIcon from "../../assets/images/card/more.svg";
import forRentIcon from "../../assets/images/card/rent.svg";
import forSaleIcon from "../../assets/images/card/buy.svg";
import { addCartItem } from "../../redux/cart/cartSlice";
import { useDispatch, useSelector } from "react-redux";
import { selectStudentUser } from "../../redux/auth/studentAuthSlice";

const ItemCard = ({ items, title, isProfileVisit }) => {
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [showOptions, setShowOptions] = useState(null);
  const navigate = useNavigate();
 

  console.log(items);

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

  const handleCardClick = (item) => {
    if (item.itemType === "Rent") navigate(`/rent/${item.id}`);
    // Navigate to the link when the card is clicked
    else if (item.itemType === "Sale") {
      navigate(`/shop/${item.id}`);
    }
  };

  const handleAddToCart = (e, item) => {
    e.stopPropagation();


  };

  return (
    <div>
      <h2 className="fs-2 fw-bold">{title}</h2>
      For rent
      <div className="card-container vertical">
        <div className="card variant-1">
          <div className="img-holder">
            <img src={item1} alt={`${item1}`} className="img" />
            <Tooltip
              title={"This is a tooltip"}
              componentsProps={{
                popper: {
                  modifiers: [
                    {
                      name: "offset",
                      options: {
                        offset: [0, -10], // Adjusts the tooltip distance [horizontal, vertical]
                      },
                    },
                  ],
                },
              }}
            >
              {" "}
              <img
                src={forRentIcon}
                alt={`${item1} is for rent`}
                className="item-type"
              />
            </Tooltip>
          </div>
          <div className="description">
            <div className="tags-holder">
              <span className="tag">tagtagtagtagtag</span>
              <Tooltip
                title={"This is a tooltip"}
                componentsProps={{
                  popper: {
                    modifiers: [
                      {
                        name: "offset",
                        options: {
                          offset: [0, -10], // Adjusts the tooltip distance [horizontal, vertical]
                        },
                      },
                    ],
                  },
                }}
              >
                <span className="tag">More +</span>
              </Tooltip>
            </div>
            <p className="item-name">Nikon 123 Camera Dslr Dslr</p>
            <p className="item-price">P100 per hr</p>
            <div className="action-btns">
              <button className="btn btn-rectangle primary">Rent</button>
              <button className="btn-icon">
                <img src={cartIcon} alt="Add to cart" />
              </button>
              <button className="btn-icon option">
                <img src={moreIcon} alt="More option" />
              </button>
            </div>
          </div>
        </div>
        <div className="card variant-1">
          <div className="img-holder">
            <img src={item1} alt={`${item1}`} className="img" />
            <Tooltip
              title={"This is a tooltip"}
              componentsProps={{
                popper: {
                  modifiers: [
                    {
                      name: "offset",
                      options: {
                        offset: [0, -10], // Adjusts the tooltip distance [horizontal, vertical]
                      },
                    },
                  ],
                },
              }}
            >
              {" "}
              <img
                src={forRentIcon}
                alt={`${item1} is for rent`}
                className="item-type"
              />
            </Tooltip>
          </div>
          <div className="description">
            <div className="tags-holder">
              <span className="tag">tagtagtagtagtag</span>
              <Tooltip
                title={"This is a tooltip"}
                componentsProps={{
                  popper: {
                    modifiers: [
                      {
                        name: "offset",
                        options: {
                          offset: [0, -10], // Adjusts the tooltip distance [horizontal, vertical]
                        },
                      },
                    ],
                  },
                }}
              >
                <span className="tag">More +</span>
              </Tooltip>
            </div>
            <p className="item-name">Nikon 123 Camera Dslr</p>
            <p className="item-price">P100 per hr</p>
            <div className="action-btns">
              <button className="btn btn-rectangle primary">Rent</button>
              <button className="btn-icon">
                <img src={cartIcon} alt="Add to cart" />
              </button>
              <button className="btn-icon option">
                <img src={moreIcon} alt="More option" />
              </button>
            </div>
          </div>
        </div>
        {items.length > 0 ? (
          items.map((item, index) => {
            return (
              <div
                className="card variant-1"
                onClick={(e) => handleCardClick(item)}
              >
                <div className="img-holder">
                  <img src={item1} alt={`${item1}`} className="img" />
                  <Tooltip
                    title={`${item.name} is for ${
                      item.itemType === "Rent" ? "rent" : "sale"
                    }.`}
                    componentsProps={{
                      popper: {
                        modifiers: [
                          {
                            name: "offset",
                            options: {
                              offset: [0, -50], // Adjusts the tooltip distance [horizontal, vertical]
                            },
                          },
                        ],
                      },
                    }}
                  >
                    <img
                      src={item.itemType === "Rent" ? forRentIcon : forSaleIcon}
                      alt={`${item1} is for rent`}
                      className="item-type"
                    />
                  </Tooltip>
                </div>
                <div className="description">
                  <div className="tags-holder">
                    <span className="tag">
                      {JSON.parse(item.tags).slice(0, 1)}
                    </span>
                    <Tooltip
                      title={JSON.parse(item.tags)
                        .slice(1)
                        .map((tag, index) => (
                          <div key={index}>
                            {tag}
                            <br />
                          </div>
                        ))}
                      componentsProps={{
                        popper: {
                          modifiers: [
                            {
                              name: "offset",
                              options: {
                                offset: [0, -10], // Adjusts the tooltip distance [horizontal, vertical]
                              },
                            },
                          ],
                        },
                      }}
                    >
                      <span className="tag">More +</span>
                    </Tooltip>
                  </div>
                  <p className="item-name">{item.name}</p>
                  <p className="item-price">
                    P{item.price} {item.itemType === "Rent" ? "per hour" : ""}
                  </p>
                  <div className="action-btns">
                    <button className="btn btn-rectangle primary">
                      {item.itemType === "Rent" ? "Rent" : "Buy"}
                    </button>
                    <button
                      className="btn-icon"
                      onClick={(e) => handleAddToCart(e, item)}
                    >
                      <img src={cartIcon} alt="Add to cart" />
                    </button>
                    <button className="btn-icon option">
                      <img src={moreIcon} alt="More option" />
                    </button>
                  </div>
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

export default ItemCard;
