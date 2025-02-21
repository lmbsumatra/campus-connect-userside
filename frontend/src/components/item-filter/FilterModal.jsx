import { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import RangeSlider from "react-range-slider-input";
import "react-range-slider-input/dist/style.css";
import { categories, CONDITIONS } from "../../utils/consonants";

const FilterModal = ({ showFilterModal, close, applyFilters }) => {
  const [filters, setFilters] = useState({
    category: "",
    condition: [],
    priceRange: [0, 1000], // Default range
    sortBy: "",
  });

  const handleFilterChange = (key, value) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [key]: value,
    }));
  };

  const handleConditionChange = (condition) => {
    setFilters((prevFilters) => {
      const updatedConditions = prevFilters.condition.includes(condition)
        ? prevFilters.condition.filter((c) => c !== condition)
        : [...prevFilters.condition, condition];

      return { ...prevFilters, condition: updatedConditions };
    });
  };

  const handleApplyFilters = () => {
    applyFilters(filters);
    close(); // Close modal after applying filters
  };

  return (
    <Modal show={showFilterModal} onHide={close} centered>
      <Modal.Header closeButton>
        <Modal.Title>Advanced Filters</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {/* Category Dropdown */}
        <Form.Group className="mb-3">
          <Form.Label>Category</Form.Label>
          <Form.Select
            value={filters.category}
            onChange={(e) => handleFilterChange("category", e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </Form.Select>
        </Form.Group>

        {/* Price Range */}
        <Form.Group className="mb-3">
          <Form.Label>Price Range</Form.Label>
          <RangeSlider
            min={0}
            max={1000}
            step={10}
            value={filters.priceRange}
            onInput={(value) => handleFilterChange("priceRange", value)}
          />
          <div>
            <span>₱{filters.priceRange[0]}</span> -{" "}
            <span>₱{filters.priceRange[1]}</span>
          </div>
        </Form.Group>

        {/* Condition Checkboxes */}
        <Form.Group className="mb-3">
          <Form.Label>Condition</Form.Label>
          {CONDITIONS.map((condition) => (
            <Form.Check
              key={condition}
              type="checkbox"
              label={condition}
              value={condition}
              checked={filters.condition.includes(condition)}
              onChange={() => handleConditionChange(condition)}
            />
          ))}
        </Form.Group>

        {/* Sorting Options */}
        <Form.Group className="mb-3">
          <Form.Label>Sort By</Form.Label>
          <Form.Select
            value={filters.sortBy}
            onChange={(e) => handleFilterChange("sortBy", e.target.value)}
          >
            <option value="">None</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </Form.Select>
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={close}>
          Close
        </Button>
        <Button variant="primary" onClick={handleApplyFilters}>
          Apply Filters
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default FilterModal;
