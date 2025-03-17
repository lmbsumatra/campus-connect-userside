import { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import RangeSlider from "react-range-slider-input";
import "react-range-slider-input/dist/style.css";
import {
  categories,
  COLLEGES,
  CONDITIONS,
  DELIVERYMODE,
  PAYMENTMODE,
  STATUS_OPTIONS,
} from "../../../../utils/consonants";
import ResetFilters from "../../../../components/item-filter/ResetFilters";

const FilterModal = ({
  filters = {
    condition: [],
    college: [],
    priceRange: [0, 1000],
    sortBy: "",
    category: "",
    deliveryMethod: "",
    paymentMethod: "",
    lateCharges: false,
    securityDeposit: false,
    repairReplacement: false,
    dateAvailable: "",
    status: "",
  },
  setFilters,
  showFilterModal,
  close,
  applyFilters,
  isListingsPage = false,
  setFilteredItems,
  allApprovedPosts,
  isYou,
  isPostPage = false,
}) => {
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

  const handleCollegeChange = (college) => {
    setFilters((prevFilters) => {
      const updatedColleges = prevFilters.college.includes(college)
        ? prevFilters.condition.filter((c) => c !== college)
        : [...prevFilters.college, college];

      return { ...prevFilters, college: updatedColleges };
    });
  };

  const handleApplyFilters = () => {
    applyFilters(filters);
    close();
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

        {/* Delivery Method Dropdown */}
        {isPostPage !== true && (
          <Form.Group className="mb-3">
            <Form.Label>Category</Form.Label>
            <Form.Select
              value={filters.deliveryMethod}
              onChange={(e) =>
                handleFilterChange("deliveryMethod", e.target.value)
              }
            >
              <option value="">Pick delivery method</option>
              {DELIVERYMODE.map((mode) => (
                <option key={mode} value={mode}>
                  {mode}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        )}

        {/* Payment Method Dropdown */}
        {isPostPage !== true && (
          <Form.Group className="mb-3">
            <Form.Label>Payment Method</Form.Label>
            <Form.Select
              value={filters.paymentMethod}
              onChange={(e) =>
                handleFilterChange("paymentMethod", e.target.value)
              }
            >
              <option value="">Pick payment method</option>
              {PAYMENTMODE.map((mode) => (
                <option key={mode} value={mode}>
                  {mode}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        )}

        {/* Price Range */}
        {isPostPage !== true && (
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
        )}
        {/* Condition Checkboxes */}
        {isPostPage !== true && (
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
        )}

        {isListingsPage ||
          (isPostPage !== true && (
            <>
              {/* Late Charges Checkbox */}
              <Form.Group className="mb-3">
                <Form.Check
                  type="checkbox"
                  label="Has Late Charges"
                  checked={filters.lateCharges}
                  onChange={(e) =>
                    handleFilterChange("lateCharges", e.target.checked)
                  }
                />
              </Form.Group>
              {/* Security Deposit Checkbox */}
              <Form.Group className="mb-3">
                <Form.Check
                  type="checkbox"
                  label="Requires Security Deposit"
                  checked={filters.securityDeposit}
                  onChange={(e) =>
                    handleFilterChange("securityDeposit", e.target.checked)
                  }
                />
              </Form.Group>
              {/* Repair & Replacement Checkbox */}
              <Form.Group className="mb-3">
                <Form.Check
                  type="checkbox"
                  label="Requires Repair/Replacement"
                  checked={filters.repairReplacement}
                  onChange={(e) =>
                    handleFilterChange("repairReplacement", e.target.checked)
                  }
                />
              </Form.Group>
            </>
          ))}

        {/* College Checkboxes */}
        <Form.Group className="mb-3">
          <Form.Label>College</Form.Label>
          {COLLEGES.map((college) => (
            <Form.Check
              key={college}
              type="checkbox"
              label={college}
              value={college}
              checked={filters.college.includes(college)}
              onChange={() => handleCollegeChange(college)}
            />
          ))}
        </Form.Group>

        {/* Sorting Options */}
        {isPostPage !== true && (
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
        )}

        {isPostPage === true && (
          <>
            <Form.Group className="mb-3">
              <Form.Label>
                {isPostPage ? "Prefer Date" : "Available Date"}
              </Form.Label>
              <Form.Control
                type="date"
                value={filters.dateAvailable}
                onChange={(e) =>
                  handleFilterChange("dateAvailable", e.target.value)
                }
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Select
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
              >
                <option value="">All Status</option>
                {STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </>
        )}
      </Modal.Body>
      <ResetFilters
        setFilteredItems={setFilteredItems}
        setFilters={setFilters}
        allApprovedPosts={allApprovedPosts}
      />
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
