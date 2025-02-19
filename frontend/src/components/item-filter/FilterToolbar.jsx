import { useState } from "react";
import RangeSlider from "react-range-slider-input";
import "react-range-slider-input/dist/style.css";
import { categories, CONDITIONS } from "../../utils/consonants";

const FilterToolbar = ({ onFilterChange, showPriceRange }) => {
  const [selectedConditions, setSelectedCondition] = useState([]);
  const [filters, setFilters] = useState({
    category: "",
    rating: "",
    condition: [],
    priceRange: [0, 1000], // Default range (adjust as needed)
  });

  // Event Handlers
  const handleOnSelectCondition = (condition) => {
    setSelectedCondition((prevConditions) => {
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

  const handleFilterChange = (key, value) => {
    const updatedFilters = { ...filters, [key]: value };
    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  const handlePriceRangeChange = (value) => {
    handleFilterChange("priceRange", value);
  };

  return (
    <div className="col-md-2">
      <h5>Filters</h5>

      {/* Category Filter */}
      <div className="mb-3">
        <label className="form-label">By Category</label>
        <select
          className="form-select"
          value={filters.category}
          onChange={(e) => handleFilterChange("category", e.target.value)}
        >
          <option value="">Reset</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Price Range Slider */}
      {showPriceRange && (
        <div className="mb-3">
          <label className="form-label">Price Range</label>
          <RangeSlider
            min={0}
            max={1000}
            step={10}
            value={filters.priceRange}
            onInput={handlePriceRangeChange}
          />
          <div>
            <span>${filters.priceRange[0]}</span> -{" "}
            <span>${filters.priceRange[1]}</span>
          </div>
        </div>
      )}

      {/* Condition Filter */}
      <div>
        <label>Condition</label>
        {CONDITIONS.map((condition) => (
          <label key={condition}>
            <input
              type="checkbox"
              value={condition}
              checked={selectedConditions.includes(condition)}
              onChange={() => handleOnSelectCondition(condition)}
            />
            {condition}
          </label>
        ))}
      </div>
    </div>
  );
};

export default FilterToolbar;
