import React, { useState, useEffect, useRef } from "react";
import "./itemCardStyles.css";
import { useNavigate } from "react-router-dom";
import item1 from "../../assets/images/item/item_1.jpg";
import Tooltip from "@mui/material/Tooltip";
import gearIcon from "../../assets/images/card/gear.svg";
import forRentIcon from "../../assets/images/card/rent.svg";
import forSaleIcon from "../../assets/images/card/buy.svg";
import editIcon from "../../assets/images/table/edit.svg";
import deleteIcon from "../../assets/images/table/delete.svg";
import { ItemStatus } from "../../utils/Status";
import { defaultImages, FOR_RENT, FOR_SALE } from "../../utils/consonants";
import targetIcon from "../../assets/images/card/target.svg";

// Import custom hook
import useSortItems from "../../pages/private/users/student-profile/useSortItems";
import { useDispatch, useSelector } from "react-redux";
import ShowAlert from "../../utils/ShowAlert";
import { checkSlotLimit } from "./checkSlotLimit";
import { useAuth } from "../../context/AuthContext";
import { useSystemConfig } from "../../context/SystemConfigProvider";

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
  const { user, loadingFetchUser } = useSelector((state) => state.user);
  const isVerified = user?.student?.status ?? false;
  const isRepresentative = user?.user?.isRepresentative || false;
  const isEmailVerified = user?.user?.emailVerified ?? false;

  const dispatch = useDispatch();
  const [activeDropdown, setActiveDropdown] = useState(null);
  const dropdownRefs = useRef({});
  const navigate = useNavigate();
  const { studentUser } = useAuth();
  const userId = studentUser?.userId;
  const token = studentUser?.token;
  const { config } = useSystemConfig();

  // Use the custom sorting hook
  const { sortedItems, sortConfig, handleSort } = useSortItems(
    isYou ? items : [] // If sorted in MyListings, pass an empty array
  );

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
      if (item.owner && isYou) {
        navigate(`/profile/my-listings/edit/${item.id}`, { state: { item } });
      } else {
        navigate(`/rent/${item.id}`);
      }
    else if (item.itemType === "For Sale") {
      if (item.seller && isYou) {
        navigate(`/profile/my-for-sale/edit/${item.id}`, { state: { item } });
      } else {
        navigate(`/shop/${item.id}`);
      }
    }
  };

  const handleAddItemClick = async () => {
    if (isRepresentative === false && itemType === "For Sale") {
      return ShowAlert(
        dispatch,
        "warning",
        "Sorry",
        "Sorry you have to be representative of an org to sell."
      );
    }
    // Ban check
    if (isVerified === "banned") {
      ShowAlert(
        dispatch,
        "warning",
        "Account Banned",
        "Your account is permanently banned. You cannot add item.",
        { text: "Ok" }
      );
      return;
    }

    // Restricted status check (regardless of date)
    if (isVerified === "restricted") {
      // Try to get the restriction end date
      let restrictionDate = null;
      if (user?.student?.restricted_until) {
        restrictionDate = new Date(user.student.restricted_until);
      } else if (user?.student?.statusMsg) {
        // Try to extract from statusMsg
        const dateMatch = user.student.statusMsg.match(
          /restricted until ([^\.]+)/i
        );
        if (dateMatch && dateMatch[1]) {
          try {
            restrictionDate = new Date(dateMatch[1].trim());
          } catch (e) {
            console.error("Failed to parse date from statusMsg:", e);
          }
        }
      }

      // Check if the restriction is still active
      const isCurrentlyRestricted =
        restrictionDate &&
        !isNaN(restrictionDate.getTime()) &&
        restrictionDate > new Date();

      if (isCurrentlyRestricted) {
        ShowAlert(
          dispatch,
          "warning",
          "Account Restricted",
          `Your account is temporarily restricted until ${restrictionDate.toLocaleString()}. You cannot add items at this time.`,
          { text: "Ok" }
        );
      } else {
        // Restriction expired but status still "restricted"
        ShowAlert(
          dispatch,
          "warning",
          "Account Status Issue",
          "Your account has a restriction status that needs attention. Please contact support or check your profile.",
          {
            text: "View Profile",
            action: () => navigate("/profile/edit-profile"),
          }
        );
      }
      return;
    }

    // Other status checks (pending, flagged, etc.)
    if (isVerified !== "verified" || isEmailVerified !== true) {
      ShowAlert(
        dispatch,
        "warning",
        "Access Denied",
        "You must be verified to proceed.",
        {
          text: "View Profile",
          action: () => {
            navigate("/profile/edit-profile");
          },
        }
      );
      return;
    }

    const canPost = await checkSlotLimit({
      dispatch,
      navigate,
      user,
      token,
      config,
      listingType:
        itemType === FOR_RENT
          ? "listingForRent"
          : itemType === FOR_SALE
          ? "itemForSale"
          : "postLookingForItem",
    });

    if (!canPost) return;

    navigate(`/profile/my-listings/add`);
  };
  const displayItems = isYou ? (items.length > 0 ? items : sortedItems) : items;
  // Use sorted items only if isYou

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
      {displayItems.map((item, index) => (
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
            <img
              src={item.images[0] || [defaultImages]}
              alt={item.name}
              className="img"
              onError={(e) => {
                e.target.onerror = null; // Prevent infinite loop
                e.target.src = [defaultImages]; // Provide a backup fallback image
              }}
            />

            <Tooltip
              title={`${item.name} is for ${
                item.itemType === FOR_RENT ? "rent" : "sale"
              }.`}
              {...tooltipProps}
            >
              <img
                src={item.itemType === FOR_RENT ? forRentIcon : forSaleIcon}
                alt={`${item.name} type`}
                className="item-type"
              />
            </Tooltip>

            {item.isFollowingRenter ||
              (item.isFollowingBuyer && (
                <Tooltip
                  title={
                    item.itemType === FOR_RENT
                      ? "This item is rented by one of your followings"
                      : "This item is bought by one of your followings"
                  }
                  componentsProps={{
                    popper: {
                      modifiers: [
                        {
                          name: "offset",
                          options: {
                            offset: [0, 0],
                          },
                        },
                      ],
                    },
                  }}
                >
                  <img
                    src={targetIcon}
                    alt={
                      item.itemType === FOR_RENT
                        ? "This item is rented by one of your followings"
                        : "This item is bought by one of your followings"
                    }
                    className="rented-indx"
                  />
                </Tooltip>
              ))}

            {item.hasRepresentative && (
              <Tooltip
                title={`This item is sold by ${item?.organization?.name} organization.`}
                componentsProps={{
                  popper: {
                    modifiers: [
                      {
                        name: "offset",
                        options: {
                          offset: [0, 0],
                        },
                      },
                    ],
                  },
                }}
              >
                <img
                  src={item?.organization?.logo || gearIcon}
                  alt={`This item is sold by ${item?.organization?.name} organization`}
                  className="rented-indx"
                />
              </Tooltip>
            )}
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

            {/* <div className="action-btns">
              <button
                className="btn btn-rectangle primary"
                onClick={(e) => handleActionBtnClick(e, item)}
                disabled={isYou}
              >
                {item.itemType === FOR_RENT ? "Rent" : "Buy"}
              </button>
              <button
                className="btn btn-icon primary"
                onClick={(e) => handleActionBtnClick(e, item)}
                disabled={isYou}
              >
                <img src={cartIcon} alt="Add to cart" />
              </button>

              {isYou && (
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
                      {["edit", "delete"].map((option) => (
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
              )}
            </div> */}

            <div className="d-flex">
              {item.averageRating ? (
                <div className="d-flex flex-row align-items-center">
                  <span className="fs-5 fw-bold text-success">
                    {item.averageRating.toFixed(2)}
                  </span>
                  <span className="ms-1 text-warning">
                    <i
                      className="bi-star-fill text-warning"
                      style={{ fontSize: "1rem", verticalAlign: "middle" }} // Ensure star is inline with text
                    />
                  </span>
                </div>
              ) : (
                <span className="error-msg text-gray align-items-center">
                  <i
                    className="bi-star"
                    style={{ fontSize: "1rem", verticalAlign: "middle" }}
                  />{" "}
                  No ratings yet
                </span>
              )}
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

  const renderTableView = () => (
    <div className="table-responsive">
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
                    onChange={(e) => onSelectItem(item.id)}
                  />
                )}
              </td>
              <td>
                <img
                  src={item.images[0] || [defaultImages]}
                  alt={item.name}
                  className="img-thumbnail"
                />
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
    </div>
  );

  return (
    <div>
      <h2 className="fs-2 fw-bold">{title}</h2>
      {viewType === "card" ? renderCardView() : renderTableView()}
    </div>
  );
};

export default ItemCard;
