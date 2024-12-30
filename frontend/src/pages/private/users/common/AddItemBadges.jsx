import React, { useState } from "react";
import Tooltip from "@mui/material/Tooltip";
import "./addItemBadgesStyles.css";
import { FOR_RENT, FOR_SALE } from "../../../../utils/consonants";

const AddItemBadges = ({ values, onCategoryChange, onItemTypeChange }) => {
  const itemType = values?.itemType || FOR_RENT;

  const categories = [
    "Electronics",
    "Home",
    "Fashion",
    "Sports",
    "Books",
    "Toys",
    "Automotive",
    "Health",
    "Hobbies",
    "Technology",
    "Business",
    "Musical",
    "Pet",
    "Event",
    "Travel",
  ];

  const getCollegeBadgeUrl = (college) => {
    if (college !== undefined && college !== null) {
      try {
        return require(`../../../../assets/images/colleges/${college}.png`);
      } catch (error) {
        return require(`../../../../assets/images/colleges/CAFA.png`);
      }
    } else {
      return require(`../../../../assets/images/colleges/CAFA.png`);
    }
  };

  const handleToggleChange = () => {
    const newItemType = itemType === "For Rent" ? "For Sale" : "For Rent";
    if (onItemTypeChange) {
      onItemTypeChange(newItemType); // Pass the change to the parent component
    }
  };

  

  return (
    <div className="badge-container">
      {/* College Badge Section */}
      <div className="college-badge">
        {values?.college && (
          <Tooltip
            title={`This item is from ${values?.college}.`}
            placement="bottom"
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
            {values?.college && (
              <img
                src={getCollegeBadgeUrl(values?.college ?? "CAFA")}
                alt="College"
                style={{ height: "24px", width: "24px" }}
              />
            )}
            {values?.college && <span>{values?.college}</span>}
          </Tooltip>
        )}
      </div>

      {/* Category Dropdown Section */}
      <div className="category-badge">
        <Tooltip
          title="Select a category for this item."
          placement="bottom"
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
          <select
            className="category-dropdown"
            value={values?.category || ""}
            onChange={(e) => onCategoryChange(e.target.value)}
          >
            <option className="header" value="" disabled>
              Select Category
            </option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </Tooltip>
      </div>

      {/* Toggle Section */}

      <div className="toggle-container">
        <Tooltip
          title="Toggle to whether you want item to be renter or sold."
          placement="bottom"
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
          <label className="toggle">
            <input
              type="checkbox"
              id="toggle-switch"
              checked={itemType === FOR_SALE}
              onChange={handleToggleChange}
            />
            <span className="slider">
              <p className="text">{itemType}</p>
            </span>
          </label>
        </Tooltip>
      </div>
    </div>
  );
};

export default AddItemBadges;
