import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import item1 from "../../assets/images/item/item_1.jpg";
import moreImg from "../../assets/images/icons/moreImg.png";
import { formatDate } from "../../utils/dateFormat";
import { formatTimeTo12Hour } from "../../utils/timeFormat";
import { computeDuration } from "../../utils/timeFormat";
import flagIcon from "../../assets/images/card/flag.svg";
import Tooltip from "@mui/material/Tooltip";
import { Button } from "@mui/material";
import cartIcon from "../../assets/images/card/message.svg";
import moreIcon from "../../assets/images/card/more.svg";
import forRentIcon from "../../assets/images/card/looking-for.svg";
import "./postCardStyles.css";

const BorrowingPost = ({ borrowingPosts, title, isProfileVisit }) => {
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [showOptions, setShowOptions] = useState(null);
  const navigate = useNavigate();

  const handleCardClick = (id) => navigate(`/lend/${id}`);
  const handleMouseEnter = (index) => setSelectedIndex(index);
  const handleMouseLeave = () => setSelectedIndex(null);
  const handleMoreClick = (index, e) => {
    e.stopPropagation();
    setShowOptions(showOptions === index ? null : index);
  };

  return (
    <div>
      <h2 className="fs-2 fw-bold">{title}</h2>
      <div className="card-container">
        <div
          className="card variant-2"
        >
          <div className="item-type">Looking for...</div>
          <div className="details">
            <div className="description">
              <p className="item-name">nikon cameral dlsr dlsr</p>
              <div className="rental-desc-holder">
                <label className="label">Rental Details</label>
                <span className="rental-date">November 24, 2002</span>
                <span className="rental-duration">9:00am - 11:00am (2hrs)</span>
                <a className="link more" href="./">
                  More details
                </a>
              </div>

              <div className="tags-holder">
                <span className="tag">tags tags tag</span>
                <Tooltip
                  title="more tags"
                  componentsProps={{
                    popper: {
                      modifiers: [
                        { name: "offset", options: { offset: [0, -10] } },
                      ],
                    },
                  }}
                >
                  <span className="tag">More +</span>
                </Tooltip>
              </div>
              <div className="action-btns">
                <button className="btn btn-rectangle primary">Offer</button>
                <button className="btn-icon">
                  <img src={cartIcon} alt="Message poster" />
                </button>
                <button className="btn-icon option">
                  <img src={moreIcon} alt="More options" />
                </button>
              </div>
            </div>
            <div className="img-holder">
              <img src={item1} alt="nikon" className="img" />
            </div>
          </div>
        </div>
        {/* sample ui */}
        {borrowingPosts.length > 0 ? (
          borrowingPosts.map((item, index) => (
            <div
              key={index}
              className="card variant-2"
              onClick={() => handleCardClick(item.id)}
            >
              <div className="item-type">Looking for...</div>
              <div className="details">
                <div className="description">
                  <p className="item-name">{item.post_item_name}</p>
                  <div className="rental-desc-holder">
                    <label className="label">Rental Details</label>
                    <span className="rental-date">
                      {item.rental_dates.length > 0
                        ? formatDate(item.rental_dates[0].date)
                        : "N/A"}
                    </span>
                    <span className="rental-duration">
                      {item.rental_dates.length > 0 &&
                      item.rental_dates[0].durations.length > 0
                        ? item.rental_dates[0].durations
                            .map((duration) => {
                              const from = formatTimeTo12Hour(
                                duration.rental_time_from
                              );
                              const to = formatTimeTo12Hour(
                                duration.rental_time_to
                              );
                              const computedDuration = computeDuration(
                                duration.rental_time_from,
                                duration.rental_time_to
                              );
                              return `${from} - ${to} (${computedDuration})`;
                            })
                            .join(", ")
                        : "N/A"}
                    </span>
                    <a className="link more" href="./">
                      More details
                    </a>
                  </div>

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
                            { name: "offset", options: { offset: [0, -10] } },
                          ],
                        },
                      }}
                    >
                      <span className="tag">More +</span>
                    </Tooltip>
                  </div>
                  <div className="action-btns">
                    <button className="btn btn-rectangle primary">Offer</button>
                    <button className="btn-icon">
                      <img src={cartIcon} alt="Message poster" />
                    </button>
                    <button className="btn-icon option">
                      <img src={moreIcon} alt="More options" />
                    </button>
                  </div>
                </div>
                <div className="img-holder">
                  <img src={item1} alt={item.post_item_name} className="img" />
                </div>
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

export default BorrowingPost;
