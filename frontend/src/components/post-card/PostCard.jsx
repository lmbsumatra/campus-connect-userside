import React, { useState, useMemo, useEffect, useReducer, useRef } from "react";
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
import editIcon from "../../assets/images/table/edit.svg";
import deleteIcon from "../../assets/images/table/delete.svg";
import "./postCardStyles.css";
import { defaultImages } from "../../utils/consonants";
import { ItemStatus } from "../../utils/Status";

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

const PostCard = ({
  borrowingPosts,
  title,
  isProfileVisit,
  isYou = false,
  selectedItems = [],
  onSelectItem,
  viewType = "card",
  onDelete,
}) => {
  const [selectedIndex, setSelectedIndex] = useState(null);
  const dropdownRefs = useRef({});
  const [showOptions, setShowOptions] = useState(null);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const navigate = useNavigate();

  const handleCardClick = (id) => navigate(`/profile/my-posts/edit/${id}`);
  const handleMouseEnter = (index) => setSelectedIndex(index);
  const handleMouseLeave = () => setSelectedIndex(null);
  const handleMoreClick = (index, e) => {
    e.stopPropagation();
    setShowOptions(showOptions === index ? null : index);
  };

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

  useEffect(() => {
    borrowingPosts.forEach((_, index) => {
      dropdownRefs.current[index] =
        dropdownRefs.current[index] || React.createRef();
    });
  }, [borrowingPosts]);

  const handleDropdownToggle = (e, index) => {
    e.stopPropagation();
    setActiveDropdown(activeDropdown === index ? null : index);
  };

  const handleOptionClick = (e, option, item) => {
    e.stopPropagation();
    setActiveDropdown(null);
    if (option === "view") {
      navigate(`/view/${item.id}`);
    } else if (option === "edit") {
      navigate(`/profile/my-posts/edit/${item.id}`);
    } else if (option === "delete") {
      if (onDelete) {
        onDelete(item.id); // Call handleDelete with item ID
      }
    }
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedItems = useMemo(() => {
    let sortableItems = [...borrowingPosts];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [borrowingPosts, sortConfig]);

  const renderCardView = () => (
    <div className="card-container">
      {borrowingPosts.length > 0 ? (
        borrowingPosts.map((item, index) => (
          <div
            key={index}
            className={`card variant-2 ${isYou && "expand"}`}
            onClick={() => handleCardClick(item.id)}
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
            <div className="item-type">Looking for...</div>
            <div className="details">
              <div className="description">
                <p className="item-name">{item.name}</p>
                <div className="rental-desc-holder">
                  <label className="label">Rental Details</label>
                  <span className="rental-date">
                    {item.rentalDates.length > 0
                      ? formatDate(item.rentalDates[0].date)
                      : "N/A"}
                  </span>
                  <span className="rental-duration">
                    {item.rentalDates.length > 0 &&
                    item.rentalDates[0].durations.length > 0
                      ? (() => {
                          const firstDuration =
                            item.rentalDates[0].durations[0];
                          const from = formatTimeTo12Hour(
                            firstDuration.timeFrom
                          );
                          const to = formatTimeTo12Hour(firstDuration.timeTo);
                          const computedDuration = computeDuration(
                            firstDuration.timeFrom,
                            firstDuration.timeTo
                          );
                          return `${from} - ${to} (${computedDuration})`;
                        })()
                      : "N/A"}
                  </span>

                  <a className="link more" href="./">
                    More details
                  </a>
                </div>

                <div className="tags-holder">
                  <span className="tag">{item.tags.slice(0, 1)}</span>
                  <Tooltip
                    title={item.tags.slice(1).map((tag, index) => (
                      <div key={index}>
                        {tag}
                        <br />
                      </div>
                    ))}
                    {...tooltipProps}
                  >
                    {item.tags.length > 1 && (
                      <span className="tag">More +</span>
                    )}
                  </Tooltip>
                </div>
                <div className="action-btns">
                  <button className="btn btn-rectangle primary">Offer</button>
                  <button className="btn btn-icon primary">
                    <img src={cartIcon} alt="Message poster" />
                  </button>

                  {isYou && (
                    <div
                      className="option"
                      ref={(el) => {
                        if (el) dropdownRefs.current[index] = el;
                      }}
                    >
                      <button
                        className="btn btn-icon secondary option"
                        onClick={(e) => handleDropdownToggle(e, index)}
                      >
                        <img src={moreIcon} alt="More options" />
                      </button>
                      {activeDropdown === index && (
                        <div className="menu">
                          {["edit", "delete"].map((option) => (
                            <button
                              key={option}
                              className="item"
                              onClick={(e) =>
                                handleOptionClick(e, option, item)
                              }
                            >
                              {option.charAt(0).toUpperCase() + option.slice(1)}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="img-holder">
                <img
                  src={item.images[0] || defaultImages}
                  alt={item.name}
                  className="img"
                  onError={(e) => {
                    e.target.onerror = null; // Prevent infinite loop
                    e.target.src = defaultImages; // Provide a backup fallback image
                  }}
                />
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
        ))
      ) : (
        <p>No items to display</p>
      )}
    </div>
  );

  const renderTableView = () => (
    <div className="table-container">
      <table className="table">
        <thead>
          <tr>
            {isYou && (
              <th>
                <input
                  type="checkbox"
                  onChange={(e) => {
                    const allIds = borrowingPosts.map((item) => item.id);
                    if (e.target.checked) {
                      // Select all items that aren't already selected
                      const newSelected = [
                        ...new Set([...selectedItems, ...allIds]),
                      ];
                      if (onSelectItem) onSelectItem(newSelected);
                    } else {
                      // Deselect all items
                      if (onSelectItem) onSelectItem([]);
                    }
                  }}
                  checked={
                    selectedItems.length === borrowingPosts.length &&
                    borrowingPosts.length > 0
                  }
                />
              </th>
            )}
            <th>Image</th>
            <th onClick={() => handleSort("name")}>
              Name{" "}
              {sortConfig.key === "name" &&
                (sortConfig.direction === "asc" ? "↑" : "↓")}
            </th>
            <th>Rental Date</th>
            <th>Duration</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sortedItems.length > 0 ? (
            sortedItems.map((item, index) => (
              <tr
                key={item.id || index}
                className={selectedItems.includes(item.id) ? "selected" : ""}
                onClick={() => handleCardClick(item.id)}
              >
                {isYou && (
                  <td onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item.id)}
                      onChange={(e) => onSelectItem(item.id)}
                    />
                  </td>
                )}
                <td>
                  <div className="table-img-holder">
                    <img
                      src={item.images[0] || defaultImages}
                      alt={item.name}
                      className="img-thumbnail"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = defaultImages;
                      }}
                    />
                  </div>
                </td>
                <td>{item.name}</td>
                <td>
                  {item.rentalDates.length > 0
                    ? formatDate(item.rentalDates[0].date)
                    : "N/A"}
                </td>
                <td>
                  {item.rentalDates.length > 0 &&
                  item.rentalDates[0].durations.length > 0
                    ? (() => {
                        const firstDuration = item.rentalDates[0].durations[0];
                        const from = formatTimeTo12Hour(firstDuration.timeFrom);
                        const to = formatTimeTo12Hour(firstDuration.timeTo);
                        return `${from} - ${to}`;
                      })()
                    : "N/A"}
                </td>
                <td>
                  {isYou && (
                    <span
                      className={`status-badge ${
                        ItemStatus(item.status).className
                      }`}
                    >
                      {ItemStatus(item.status).label}
                    </span>
                  )}
                </td>
                <td onClick={(e) => e.stopPropagation()}>
                  <div className="table-actions">
                    <button
                      className="btn btn-icon primary"
                      onClick={(e) => handleOptionClick(e, "edit", item)}
                    >
                      <img src={editIcon} alt="Edit" />
                    </button>
                    <button
                      className="btn btn-icon primary"
                      onClick={(e) => handleOptionClick(e, "delete", item)}
                    >
                      <img src={deleteIcon} alt="Delete" />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={isYou ? 7 : 6} className="text-center">
                No items to display
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="post-card-container">
      <div className="header-section">
        <h2 className="fs-2 fw-bold">{title}</h2>
      </div>
      {viewType === "card" ? renderCardView() : renderTableView()}
    </div>
  );
};

export default PostCard;
