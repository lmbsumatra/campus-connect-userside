import { useState, useRef, useEffect } from "react";
import RangeSlider from "react-range-slider-input";
import "react-range-slider-input/dist/style.css";
import { categories, CONDITIONS, defaultFilters } from "../../utils/consonants";

const FilterToolbar = ({
  filters,
  setFilters,
  onFilterChange,
  showPriceRange = true,
  setShowAdvanceFilter = null,
  showAdvancefilter = false,
  allApprovedPosts = [],
  setFilteredItems = null,
  isPost,
}) => {
  const [activeTab, setActiveTab] = useState("relevance");
  const [showPopup, setShowPopup] = useState(null);
  const popupRef = useRef(null);
  const tabsRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setShowPopup(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (filters.condition) {
      setSelectedConditions(filters.condition);
    }
  }, [filters.condition]);

  const [selectedConditions, setSelectedConditions] = useState(
    filters.condition || []
  );

  const handleFilterChange = (key, value) => {
    const updatedFilters = { ...filters, [key]: value };
    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  const handleTabScroll = (direction) => {
    if (tabsRef.current) {
      const scrollAmount = direction === "left" ? -100 : 100;
      tabsRef.current.scrollLeft += scrollAmount;
    }
  };

  const handleOnSelectCondition = (condition) => {
    setSelectedConditions((prevConditions) => {
      let updatedConditions;

      if (prevConditions.includes(condition)) {
        updatedConditions = prevConditions.filter((c) => c !== condition);
      } else {
        updatedConditions = [...prevConditions, condition];
      }

      handleFilterChange("condition", updatedConditions);
      return updatedConditions;
    });
  };

  const handlePriceRangeChange = (value) => {
    handleFilterChange("priceRange", value);
  };

  const handleCategoryChange = (category) => {
    handleFilterChange("category", category);
    setShowPopup(null);
  };

  const handleResetFilters = () => {
    setFilters(defaultFilters);
    if (setFilteredItems && allApprovedPosts) {
      setFilteredItems(allApprovedPosts);
    }
    setActiveTab("relevance");
    onFilterChange(defaultFilters);
  };

  const toggleAdvancedFilter = () => {
    if (setShowAdvanceFilter) {
      setShowAdvanceFilter(!showAdvancefilter);
    }
  };

  const handleSortChange = (sortKey) => {
    const currentSort = filters.sort;
    let newSort;

    if (currentSort === `${sortKey}Asc`) {
      newSort = `${sortKey}Desc`;
    } else {
      newSort = `${sortKey}Asc`;
    }

    handleFilterChange("sort", newSort);
    setActiveTab(newSort);
  };

  return (
    <div className="filter-toolbar">
      {/* Scrollable Tabs */}
      <div className="tabs-container">
        <button
          className="scroll-button"
          onClick={() => handleTabScroll("left")}
        >
          &lt;
        </button>

        <div className="tabs-wrapper">
          <div ref={tabsRef} className="tabs">
            {!isPost && (
              <div
                className={`tab-item ${
                  activeTab.includes("price") ? "active" : ""
                }`}
                onClick={() => handleSortChange("price")}
              >
                Price {filters.sort === "priceDesc" ? "↓" : "↑"}
              </div>
            )}
            <div
              className={`tab-item ${
                activeTab.includes("name") ? "active" : ""
              }`}
              onClick={() => handleSortChange("name")}
            >
              Name {filters.sort === "nameDesc" ? "Z→A" : "A→Z"}
            </div>
            <div
              className={`tab-item ${
                activeTab.includes("date") ? "active" : ""
              }`}
              onClick={() => handleSortChange("date")}
            >
              {filters.sort === "dateDesc" ? "Newest" : "Oldest"}
            </div>
            {!isPost && (
              <div
                className={`tab-item ${
                  activeTab.includes("rating") ? "active" : ""
                }`}
                onClick={() => handleSortChange("rating")}
              >
                Rating {filters.sort === "ratingDesc" ? "↓" : "↑"}
              </div>
            )}
            <div
              className={`tab-item ${activeTab === "advanced" ? "active" : ""}`}
              onClick={toggleAdvancedFilter}
            >
              Advanced Filter
            </div>
            <div className={`tab-item reset`} onClick={handleResetFilters}>
              Reset
            </div>
          </div>
        </div>

        <button
          className="scroll-button"
          onClick={() => handleTabScroll("right")}
        >
          &gt;
        </button>
      </div>

      {/* Popups */}
      {showPopup && (
        <div ref={popupRef} className="popup-container">
          {showPopup === "price" && (
            <div className="price-popup">
              <h6>Price Range</h6>
              <RangeSlider
                min={0}
                max={1000}
                step={10}
                value={filters.priceRange || [0, 1000]}
                onInput={handlePriceRangeChange}
              />
            </div>
          )}

          {showPopup === "category" && (
            <div className="category-popup">
              <h6>Select Category</h6>
              <div className="category-options">
                <div
                  className={`category-option ${
                    filters.category === "" ? "selected" : ""
                  }`}
                  onClick={() => handleCategoryChange("")}
                >
                  All Categories
                </div>
                {categories.map((cat) => (
                  <div
                    key={cat}
                    className={`category-option ${
                      filters.category === cat ? "selected" : ""
                    }`}
                    onClick={() => handleCategoryChange(cat)}
                  >
                    {cat}
                  </div>
                ))}
              </div>
            </div>
          )}

          {showPopup === "condition" && (
            <div className="condition-popup">
              <h6>Select Condition</h6>
              {CONDITIONS.map((condition) => (
                <div key={condition} className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id={`condition-${condition}`}
                    value={condition}
                    checked={selectedConditions.includes(condition)}
                    onChange={() => handleOnSelectCondition(condition)}
                  />
                  <label
                    className="form-check-label"
                    htmlFor={`condition-${condition}`}
                  >
                    {condition}
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        .filter-toolbar {
          width: auto;
        }
        button {
          all: unset;
          background: none;
          border: none;
          padding: 0;
          font: inherit;
          cursor: pointer;
          outline: none;
        }

        .tabs-container {
          display: flex;
          background-color: rgba(28, 28, 28, 0.03);
          padding: 8px 16px;
          margin: 4px;
          border-radius: 8px;
        }
        .tab-item {
          cursor: pointer;
          padding: 0.5rem 1rem;
          position: relative;
          white-space: nowrap;
        }
        .tab-item:hover {
          background-color: rgba(0, 0, 0, 0.03);
        }
        .tabs-wrapper {
          overflow: hidden;
        }
        .tabs {
          display: flex;
          flex-wrap: nowrap;
          overflow-x: auto;
          scroll-behavior: smooth;
        }
        .tabs::-webkit-scrollbar {
          display: none;
        }
        .category-option {
          cursor: pointer;
          padding: 0.5rem;
        }
        .category-option:hover {
          background-color: rgba(0, 0, 0, 0.03);
        }
        .popup-container {
          position: absolute;
          background-color: white;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          padding: 1rem;
          border-radius: 8px;
          min-width: 250px;
          z-index: 1000;
        }
        .popup-buttons {
          display: flex;
          justify-content: space-between;
          margin-top: 1rem;
        }
        .btn-cancel,
        .btn-apply {
          padding: 0.5rem 1rem;
          font-size: 0.875rem;
        }
        .reset {
          color: red;
        }
        @media (max-width: 768px) {
          .popup-container {
            width: 90vw;
            min-width: 90vw;
          }
        }
      `}</style>
    </div>
  );
};

export default FilterToolbar;
