import { useState } from "react";
import RangeSlider from "react-range-slider-input";
import "react-range-slider-input/dist/style.css";
import { categories, CONDITIONS } from "../../utils/consonants";

const FilterToolbar = ({ onFilterchange }) => {
  const [categoryFilter, setCategoryFilter] = useState("COE");
  const [rateFilter, setRateFilter] = useState("1");
  const [selectedConditions, setSelectedCondition] = useState([]);
  const [filters, setFilters] = useState({
    category: "",
    rating: "",
    condition: "",
    priceRange: "",
  });

  // Event Handlers for Filters
  const handleCategoryChange = (e) => setCategoryFilter(e.target.value);
  const handleRateChange = (e) => setRateFilter(e.target.value);

  const handleOnSelectCondition = (condition) => {
    let updatedConditions = [...selectedConditions];

    if (selectedConditions.includes(condition)) {
      updatedConditions = selectedConditions.filter((c) => c !== condition); // Remove condition
    } else {
      updatedConditions.push(condition); // Add condition
    }

    // Directly update state and log after state is set
    setSelectedCondition(updatedConditions);
    console.log("Updated selected conditions immediately:", updatedConditions);
  };

  const handleFilterChange = () => {};

  return (
    <div className="col-md-2">
      <h5>Filters</h5>
      <div className="mb-3">
        <label className="form-label">By Category</label>
        <select
          className="form-select"
          value={categoryFilter}
          onChange={handleCategoryChange}
        >
          {categories.map((cat) => (
            <option value={cat}>{cat}</option>
          ))}
        </select>
      </div>
      <div className="mb-3">
        <label className="form-label">By Rate</label>
        <select
          className="form-select"
          value={rateFilter}
          onChange={handleRateChange}
        >
          <option value="1">1 star</option>
          <option value="2">2 star</option>
          <option value="3">3 star</option>
          <option value="4">4 star</option>
          <option value="5">5 star</option>
        </select>
      </div>

      <div>
        <RangeSlider />
      </div>

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
