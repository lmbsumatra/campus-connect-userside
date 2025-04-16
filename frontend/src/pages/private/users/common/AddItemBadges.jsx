import React, { useState } from "react";
import Tooltip from "@mui/material/Tooltip";
import "./addItemBadgesStyles.css";
import { categories, FOR_RENT, FOR_SALE } from "../../../../utils/consonants";
import { useDispatch } from "react-redux";
import ShowAlert from "../../../../utils/ShowAlert";

const FOR_TYPES = ["For Rent", "For Sale"];
const TO_TYPES = ["To Rent", "To Buy"];

const AddItemBadges = ({
  values,
  onCategoryChange,
  onItemTypeChange,
  isPost,
  isEditPage,
  isRepresentative = false,
}) => {
  const itemTypes = isPost ? TO_TYPES : FOR_TYPES;
  const itemType = values?.itemType || itemTypes[0];
  const dispatch = useDispatch();

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
    if (isRepresentative === false) {
      return ShowAlert(
        dispatch,
        "warning",
        "Sorry",
        "Sorry you have to be representative of an org to sell."
      );
    }
    if (isEditPage) return;
    const currentIndex = itemTypes.indexOf(itemType);
    const newItemType = itemTypes[(currentIndex + 1) % itemTypes.length]; // Toggle between two values
    if (onItemTypeChange) {
      onItemTypeChange(newItemType);
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
          title={
            isEditPage
              ? "Disabled "
              : `Toggle between ${itemTypes[0]} and ${itemTypes[1]}`
          }
          placement="bottom"
        >
          <label className="toggle">
            <input
              type="checkbox"
              id="toggle-switch"
              checked={itemType === itemTypes[1]} // Toggle between two states
              onChange={handleToggleChange}
              disabled={isEditPage}
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
