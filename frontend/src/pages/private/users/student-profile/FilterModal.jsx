import React from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import Slider from "rc-slider";
import Fuse from "fuse.js"; // Import Fuse.js for fuzzy searching
import "rc-slider/assets/index.css"; // Import slider styles
import { categories } from "../../../../utils/consonants"; // Import categories
import {
  setFilter,
  applyFiltersAndSort,
  resetFilters, // Import resetFilters action
} from "../../../../redux/filter/filterSlice";

const FilterModal = ({ show, handleClose, items }) => {
  const dispatch = useDispatch();

  // Get current filter values from Redux store
  const filters = useSelector((state) => state.filter.filters);

  const handleInputChange = (key, value) => {
    dispatch(setFilter({ key, value }));
  };

  const handleApplyFilters = () => {
    let filteredItems = [...items]; // Clone listings to apply filters

    // Apply Fuse.js for fuzzy keyword search
    if (filters.keyword) {
      const fuseOptions = {
        keys: [
          "name",
          "description",
          "category",
          "tags",
          "specs.brand",
          "specs.model",
        ], // Customize the fields to search
        threshold: 0.3, // Fuzzy matching threshold
      };

      const fuse = new Fuse(filteredItems, fuseOptions);
      const results = fuse.search(filters.keyword);

      const matchingIds = new Set(results.map((result) => result.item.id));
      filteredItems = filteredItems.filter((item) =>
        matchingIds.has(item.id)
      );
    }

    // Dispatch the filtered listings and apply other filters
    dispatch(applyFiltersAndSort(filteredItems));
    handleClose();
  };

  const handleResetFilters = () => {
    dispatch(resetFilters()); // Dispatch resetFilters to clear all filter values
  };

  const sliderMarks = {
    200: "200",
    500: "500",
    700: "700",
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Filter Listings</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          {/* Keyword Search */}
          <Form.Group controlId="keywordFilter" className="mb-3">
            <Form.Label>Keyword</Form.Label>
            <Form.Control
              type="text"
              placeholder="Search by keyword"
              value={filters.keyword || ""}
              onChange={(e) => handleInputChange("keyword", e.target.value)}
            />
          </Form.Group>

          {/* Category Filter */}
          <Form.Group controlId="categoryFilter" className="mb-3">
            <Form.Label>Category</Form.Label>
            <Form.Control
              as="select"
              value={filters.category}
              onChange={(e) => handleInputChange("category", e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map((category, index) => (
                <option key={index} value={category.toLowerCase()}>
                  {category}
                </option>
              ))}
            </Form.Control>
          </Form.Group>

          {/* Condition Filter */}
          <Form.Group controlId="itemConditionFilter" className="mb-3">
            <Form.Label>Item Condition</Form.Label>
            <Row>
              <Col>
                <Form.Control
                  as="select"
                  value={filters.itemCondition || ""}
                  onChange={(e) =>
                    handleInputChange("itemCondition", e.target.value)
                  }
                >
                  <option value="">All Conditions</option>
                  <option value="new">New</option>
                  <option value="used">Used</option>
                </Form.Control>
              </Col>
            </Row>
          </Form.Group>

          {/* Price Range Slider */}
          <Form.Group controlId="priceRangeFilter" className="mb-3">
            <Form.Label>Price Range</Form.Label>
            <Slider
              range
              min={0}
              max={1000}
              step={10}
              marks={sliderMarks}
              value={[
                Math.max(0, filters.priceRange.min || 0),
                Math.min(1000, filters.priceRange.max || 1000),
              ]}
              onChange={(values) => {
                handleInputChange("priceRange", {
                  min: values[0],
                  max: values[1],
                });
              }}
              allowCross={false}
            />
            <div className="d-flex justify-content-between mt-2">
              <span>Min: P{filters.priceRange.min || 0}</span>
              <span>Max: P{filters.priceRange.max || 1000}</span>
            </div>
          </Form.Group>

          {/* Delivery Method */}
          <Form.Group controlId="deliveryMethodFilter" className="mb-3">
            <Form.Label>Delivery Method</Form.Label>
            <Form.Check
              type="radio"
              label="Pickup"
              name="deliveryMethod"
              checked={filters.deliveryMethod === "pickup"}
              onChange={() => handleInputChange("deliveryMethod", "pickup")}
            />
            <Form.Check
              type="radio"
              label="Meetup"
              name="deliveryMethod"
              checked={filters.deliveryMethod === "meetup"}
              onChange={() => handleInputChange("deliveryMethod", "meetup")}
            />
          </Form.Group>

          {/* Payment Method */}
          <Form.Group controlId="paymentMethodFilter" className="mb-3">
            <Form.Label>Payment Method</Form.Label>
            <Form.Check
              type="radio"
              label="Payment upon Meetup"
              name="paymentMethod"
              checked={filters.paymentMethod === "payment upon meetup"}
              onChange={() =>
                handleInputChange("paymentMethod", "payment upon meetup")
              }
            />
            <Form.Check
              type="radio"
              label="GCash"
              name="paymentMethod"
              checked={filters.paymentMethod === "gcash"}
              onChange={() => handleInputChange("paymentMethod", "gcash")}
            />
          </Form.Group>

          {/* Checkboxes for Features */}
          <Form.Group controlId="featuresFilter" className="mb-3">
          <Form.Label>Other Fees</Form.Label>
            <Form.Check
              type="checkbox"
              label="Has Late Charges"
              checked={filters.lateCharges}
              onChange={(e) =>
                handleInputChange("lateCharges", e.target.checked)
              }
            />
            <Form.Check
              type="checkbox"
              label="Has Security Deposit"
              checked={filters.securityDeposit}
              onChange={(e) =>
                handleInputChange("securityDeposit", e.target.checked)
              }
            />
            <Form.Check
              type="checkbox"
              label="Has Repair/Replacement"
              checked={filters.repairReplacement}
              onChange={(e) =>
                handleInputChange("repairReplacement", e.target.checked)
              }
            />
          </Form.Group>

          {/* Available Date Filter */}
          <Form.Group controlId="availableDateFilter" className="mb-3">
            <Form.Label>Available Date</Form.Label>
            <Form.Control
              type="date"
              value={filters.availableDates.date || ""}
              onChange={(e) =>
                handleInputChange("availableDates", {
                  ...filters.availableDates,
                  date: e.target.value,
                })
              }
            />
          </Form.Group>

          {/* Status Filter */}
          <Form.Group controlId="statusFilter" className="mb-3">
            <Form.Label>Status</Form.Label>
            <Form.Control
              as="select"
              value={filters.status}
              onChange={(e) => handleInputChange("status", e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="declined">Declined</option>
              <option value="removed">Removed</option>
              <option value="revoked">Revoked</option>
              <option value="flagged">Flagged</option>
              <option value="unavailable">Unavailable</option>
            </Form.Control>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
        <Button variant="outline-primary" onClick={handleResetFilters}>
          Reset Filters
        </Button>
        <Button variant="primary" onClick={handleApplyFilters}>
          Apply Filters
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default FilterModal;
