import React, { useState } from "react";
import moreImg from "../../assets/images/icons/moreImg.png";
import "./itemStyles.css";
import { useNavigate } from "react-router-dom";
import item1 from "../../assets/images/item/item_1.jpg";
import flagIcon from "../../assets/images/card/flag.svg";
import Tooltip from "@mui/material/Tooltip";
import { Button } from "@mui/material";
import cartIcon from "../../assets/images/card/cart.svg";
import moreIcon from "../../assets/images/card/more.svg";
import forRentIcon from "../../assets/images/card/rent.svg";

const ItemList = ({ listings, title, isProfileVisit }) => {
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [showOptions, setShowOptions] = useState(null);
  const navigate = useNavigate();

  console.log(listings);

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
      For rent
      <div className="card-container">
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
              <div className="card variant-1">
                <div className="img-holder">
                  <img src={item1} alt={`${item1}`} className="img" />
                  <Tooltip
                    title={`${item.listing_name} is for rent.`}
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
                    <span className="tag">
                      {JSON.parse(item.tags).slice(0, 1)}
                    </span>
                    <Tooltip
                      title={JSON.parse(item.tags)
                        .slice(1)
                        .map((tag, index) => (
                          <>
                            {tag}
                            <br />
                          </>
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
                  <p className="item-name">{item.listing_name}</p>
                  <p className="item-price">P{item.rate} per hour</p>
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
