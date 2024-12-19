import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import item1 from "../../assets/images/item/item_1.jpg";
import item2 from "../../assets/images/item/item_2.jpg";
import item3 from "../../assets/images/item/item_3.jpg";
import item4 from "../../assets/images/item/item_4.jpg";
import item5 from "../../assets/images/item/item_5.jpg";
import moreImg from "../../assets/images/icons/moreImg.png";
import "./postStyles.css";
import { formatDate } from "../../utils/dateFormat";
import flagIcon from "../../assets/images/card/flag.svg";
import Tooltip from "@mui/material/Tooltip";
import { Button } from "@mui/material";
import cartIcon from "../../assets/images/card/message.svg";
import moreIcon from "../../assets/images/card/more.svg";
import forRentIcon from "../../assets/images/card/looking-for.svg";

const BorrowingPost = ({ borrowingPosts, title, isProfileVisit }) => {
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
    navigate(`/lend/${id}`); // Use the actual ID here
  };

  const handleMouseEnter = (index) => {
    setSelectedIndex(index);
  };

  const handleMouseLeave = () => {
    setSelectedIndex(null);
  };

  const handleMoreClick = (index, e) => {
    e.stopPropagation();
    setShowOptions(showOptions === index ? null : index);
  };

  return (
    <div>
      <h2 className="fs-2 fw-bold">{title}</h2>

      <div className="card-container">
      <div className="card variant-2">
                <div className="item-type">
                  <i>Looking for...</i>
                </div>
                <div className="details">
                  <div className="description">
                    <p className="item-name">Nikon camera 123 dlsr dlsr</p>
                    <div className="rental-desc holder">
                      <div className="legend">Rental Details</div>
                      <label className="rental-date">November 04, 2002</label>
                      <span className="rental-duration">9am - 11am (2hrs)</span>
                      <a className="link more" href="./">
                        More details
                      </a>
                    </div>

                    <div className="tags-holder">
                      <span className="tag">tagtagtagtagtagtag</span>
                      <Tooltip
                        title="this is tag"
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
                    <div className="action-btns">
                      <button className="btn btn-rectangle primary">
                        Offer
                      </button>
                      <button className="btn-icon">
                        <img src={cartIcon} alt="Message poster" />
                      </button>
                      <button className="btn-icon option">
                        <img src={moreIcon} alt="More option" />
                      </button>
                    </div>
                  </div>
                  <div className="img-holder">
                    <img src={item1} alt={`${item1}`} className="img" />
                  </div>
                </div>
              </div>

        {borrowingPosts.length > 0 ? (
          borrowingPosts.map((item, index) => {
            return (
              <div className="card variant-2" key={index}>
                <div className="item-type">
                  <i>Looking for...</i>
                </div>
                <div className="details">
                  <div className="description">
                    <p className="item-name">{item.post_item_name}</p>
                    <div className="rental-desc holder">
                      <div className="legend">Rental Details</div>
                      <label className="rental-date">November 04, 2002</label>
                      <span className="rental-duration">9am - 11am (2hrs)</span>
                      <a className="link more" href="./">
                        More details
                      </a>
                    </div>

                    <div className="tags-holder">
                      <span className="tag">{JSON.parse(item.tags).slice(0, 1)}</span>
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
                    <div className="action-btns">
                      <button className="btn btn-rectangle primary">
                        Offer
                      </button>
                      <button className="btn-icon">
                        <img src={cartIcon} alt="Message poster" />
                      </button>
                      <button className="btn-icon option">
                        <img src={moreIcon} alt="More option" />
                      </button>
                    </div>
                  </div>
                  <div className="img-holder">
                    <img src={item1} alt={`${item2}`} className="img" />
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

export default BorrowingPost;
