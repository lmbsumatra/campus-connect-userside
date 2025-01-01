import React, { useState } from "react";
import { Modal, Button, Form, Row, Col, Accordion } from "react-bootstrap";
import deleteIcon from "../../assets/images/table/delete.svg";
import listIcon from "../../assets/images/toolbar/list.svg";
import cardIcon from "../../assets/images/toolbar/card.svg";
import "./toolbarStyles.css";

function Toolbar({
  selectedItems,
  onSelectAll,
  onViewToggle,
  viewType,
  onAction,
  items,
  onSearch,
  onFilter,
  filterOptions,
  onAdvancedFilter,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setModalOpen] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({
    // Text-based filters
    searchTerm: "",
    category: "",
    tags: [],
    ownerName: "",

    // Price-based filters
    minPrice: "",
    maxPrice: "",

    // Date-based filters
    startDate: "",
    endDate: "",
    listingDuration: "", // e.g., "7", "30" days

    // Status-based filters
    status: "",
    isActive: true,
    isExpired: false,

    // Location-based filters
    city: "",
    state: "",
    country: "",
    radius: "",

    // Item condition filters
    condition: "",
    hasWarranty: false,

    // Quantity-based filters
    minQuantity: "",
    maxQuantity: "",

    // Custom fields
    size: "",
    color: "",
    brand: "",
    minRating: "",

    // Boolean filters
    inStock: true,
    isFeatured: false,

    // Sort options
    sortBy: "newest", // Default sort
  });

  const categories = [
    "Electronics",
    "Furniture",
    "Clothing",
    "Books",
    "Sports",
    "Others",
  ];

  const conditions = ["New", "Like New", "Good", "Fair", "Poor"];

  const sortOptions = [
    { value: "priceAsc", label: "Price: Low to High" },
    { value: "priceDsc", label: "Price: High to Low" },
    { value: "newest", label: "Newest First" },
    { value: "oldest", label: "Oldest First" },
    { value: "rating", label: "Highest Rated" },
  ];

  const handleAdvancedFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAdvancedFilters((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleTagInput = (e) => {
    if (e.key === "Enter" && e.target.value) {
      setAdvancedFilters((prev) => ({
        ...prev,
        tags: [...prev.tags, e.target.value],
      }));
      e.target.value = "";
    }
  };

  const removeTag = (tagToRemove) => {
    setAdvancedFilters((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const resetFilters = () => {
    setAdvancedFilters({
      searchTerm: "",
      category: "",
      tags: [],
      ownerName: "",
      minPrice: "",
      maxPrice: "",
      startDate: "",
      endDate: "",
      listingDuration: "",
      status: "",
      isActive: true,
      isExpired: false,
      city: "",
      state: "",
      country: "",
      radius: "",
      condition: "",
      hasWarranty: false,
      minQuantity: "",
      maxQuantity: "",
      size: "",
      color: "",
      brand: "",
      minRating: "",
      inStock: true,
      isFeatured: false,
      sortBy: "newest",
    });
  };

  const applyAdvancedFilters = () => {
    onAdvancedFilter(advancedFilters);
    setModalOpen(false);
  };

  return (
    <div className="toolbar items">
      <div className="search-container">
        <input
          type="text"
          className="search-input"
          placeholder="Quick Search..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            onSearch(e.target.value);
          }}
        />
      </div>

      <div className="filter-container">
        <select
          onChange={(e) => onFilter(e.target.value)}
          className="filter-select"
        >
          {filterOptions.map((option, index) => (
            <option key={index} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="select-container">
        <label className="select">
          <input
            type="checkbox"
            checked={selectedItems.length === items.length}
            onChange={onSelectAll}
          />
          {selectedItems.length === items.length
            ? "Deselect All"
            : "Select All"}
        </label>
      </div>

      <div className="d-flex gap-2">
        <div className="view-type">
          Switch to {viewType === "card" ? "Table" : "Card"}
          <button className="btn btn-icon primary" onClick={onViewToggle}>
            {viewType === "card" ? (
              <img src={cardIcon} alt="Card view" />
            ) : (
              <img src={listIcon} alt="Table view" />
            )}
          </button>
        </div>

        <button
          className="btn btn-secondary"
          onClick={() => setModalOpen(true)}
        >
          Advanced Search
        </button>

        <div className="action-btns">
          <button
            className="btn btn-icon primary"
            disabled={selectedItems.length === 0}
            onClick={onAction}
          >
            <img src={deleteIcon} alt="Delete" />
          </button>
        </div>
      </div>

      <Modal
        show={isModalOpen}
        onHide={() => setModalOpen(false)}
        size="lg"
        className="advanced-search-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>Advanced Search</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Accordion defaultActiveKey="0">
            {/* Text-based Filters */}
            <Accordion.Item eventKey="0">
              <Accordion.Header>Basic Information</Accordion.Header>
              <Accordion.Body>
                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Category</Form.Label>
                      <Form.Select
                        name="category"
                        value={advancedFilters.category}
                        onChange={handleAdvancedFilterChange}
                      >
                        <option value="">All Categories</option>
                        {categories.map((cat, idx) => (
                          <option key={idx} value={cat.toLowerCase()}>
                            {cat}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Owner Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="ownerName"
                        value={advancedFilters.ownerName}
                        onChange={handleAdvancedFilterChange}
                        placeholder="Search by owner name"
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Form.Group className="mb-3">
                  <Form.Label>Tags</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Press Enter to add tags"
                    onKeyPress={handleTagInput}
                  />
                  <div className="mt-2">
                    {advancedFilters.tags.map((tag, idx) => (
                      <span key={idx} className="badge bg-primary me-2">
                        {tag}
                        <button
                          className="btn-close btn-close-white ms-2"
                          onClick={() => removeTag(tag)}
                        />
                      </span>
                    ))}
                  </div>
                </Form.Group>
              </Accordion.Body>
            </Accordion.Item>

            {/* Price and Quantity Filters */}
            <Accordion.Item eventKey="1">
              <Accordion.Header>Price & Quantity</Accordion.Header>
              <Accordion.Body>
                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Min Price</Form.Label>
                      <Form.Control
                        type="number"
                        name="minPrice"
                        value={advancedFilters.minPrice}
                        onChange={handleAdvancedFilterChange}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Max Price</Form.Label>
                      <Form.Control
                        type="number"
                        name="maxPrice"
                        value={advancedFilters.maxPrice}
                        onChange={handleAdvancedFilterChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Min Quantity</Form.Label>
                      <Form.Control
                        type="number"
                        name="minQuantity"
                        value={advancedFilters.minQuantity}
                        onChange={handleAdvancedFilterChange}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Max Quantity</Form.Label>
                      <Form.Control
                        type="number"
                        name="maxQuantity"
                        value={advancedFilters.maxQuantity}
                        onChange={handleAdvancedFilterChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Accordion.Body>
            </Accordion.Item>

            {/* Date Filters */}
            <Accordion.Item eventKey="2">
              <Accordion.Header>Date & Time</Accordion.Header>
              <Accordion.Body>
                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Start Date</Form.Label>
                      <Form.Control
                        type="date"
                        name="startDate"
                        value={advancedFilters.startDate}
                        onChange={handleAdvancedFilterChange}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>End Date</Form.Label>
                      <Form.Control
                        type="date"
                        name="endDate"
                        value={advancedFilters.endDate}
                        onChange={handleAdvancedFilterChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Form.Group>
                  <Form.Label>Listing Duration (days)</Form.Label>
                  <Form.Select
                    name="listingDuration"
                    value={advancedFilters.listingDuration}
                    onChange={handleAdvancedFilterChange}
                  >
                    <option value="">Any Duration</option>
                    <option value="7">Last 7 days</option>
                    <option value="30">Last 30 days</option>
                    <option value="90">Last 90 days</option>
                  </Form.Select>
                </Form.Group>
              </Accordion.Body>
            </Accordion.Item>

            {/* Location Filters */}
            <Accordion.Item eventKey="3">
              <Accordion.Header>Location</Accordion.Header>
              <Accordion.Body>
                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>City</Form.Label>
                      <Form.Control
                        type="text"
                        name="city"
                        value={advancedFilters.city}
                        onChange={handleAdvancedFilterChange}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>State/Province</Form.Label>
                      <Form.Control
                        type="text"
                        name="state"
                        value={advancedFilters.state}
                        onChange={handleAdvancedFilterChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Country</Form.Label>
                      <Form.Control
                        type="text"
                        name="country"
                        value={advancedFilters.country}
                        onChange={handleAdvancedFilterChange}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Radius (km)</Form.Label>
                      <Form.Control
                        type="number"
                        name="radius"
                        value={advancedFilters.radius}
                        onChange={handleAdvancedFilterChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Accordion.Body>
            </Accordion.Item>

            {/* Item Details */}
            <Accordion.Item eventKey="4">
              <Accordion.Header>Item Details</Accordion.Header>
              <Accordion.Body>
                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Condition</Form.Label>
                      <Form.Select
                        name="condition"
                        value={advancedFilters.condition}
                        onChange={handleAdvancedFilterChange}
                      >
                        <option value="">Any Condition</option>
                        {conditions.map((cond, idx) => (
                          <option key={idx} value={cond.toLowerCase()}>
                            {cond}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Brand</Form.Label>
                      <Form.Control
                        type="text"
                        name="brand"
                        value={advancedFilters.brand}
                        onChange={handleAdvancedFilterChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Size</Form.Label>
                      <Form.Control
                        type="text"
                        name="size"
                        value={advancedFilters.size}
                        onChange={handleAdvancedFilterChange}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Color</Form.Label>
                      <Form.Control
                        type="text"
                        name="color"
                        value={advancedFilters.color}
                        onChange={handleAdvancedFilterChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Minimum Rating</Form.Label>
                      <Form.Select
                        name="minRating"
                        value={advancedFilters.minRating}
                        onChange={handleAdvancedFilterChange}
                      >
                        <option value="">Any Rating</option>
                        <option value="5">5 Stars</option>
                        <option value="4">4+ Stars</option>
                        <option value="3">3+ Stars</option>
                        <option value="2">2+ Stars</option>
                        <option value="1">1+ Star</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>
              </Accordion.Body>
            </Accordion.Item>

            {/* Status and Availability */}
            <Accordion.Item eventKey="5">
              <Accordion.Header>Status & Availability</Accordion.Header>
              <Accordion.Body>
                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Status</Form.Label>
                      <Form.Select
                        name="status"
                        value={advancedFilters.status}
                        onChange={handleAdvancedFilterChange}
                      >
                        <option value="">Any Status</option>
                        {filterOptions.map((option, index) => (
                          <option key={index} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col md={6}>
                    <Form.Check
                      type="checkbox"
                      label="Show Only Active Listings"
                      name="isActive"
                      checked={advancedFilters.isActive}
                      onChange={handleAdvancedFilterChange}
                    />
                  </Col>
                  <Col md={6}>
                    <Form.Check
                      type="checkbox"
                      label="Include Expired Listings"
                      name="isExpired"
                      checked={advancedFilters.isExpired}
                      onChange={handleAdvancedFilterChange}
                    />
                  </Col>
                </Row>
                <Row className="mt-3">
                  <Col md={6}>
                    <Form.Check
                      type="checkbox"
                      label="In Stock Only"
                      name="inStock"
                      checked={advancedFilters.inStock}
                      onChange={handleAdvancedFilterChange}
                    />
                  </Col>
                  <Col md={6}>
                    <Form.Check
                      type="checkbox"
                      label="Featured Items Only"
                      name="isFeatured"
                      checked={advancedFilters.isFeatured}
                      onChange={handleAdvancedFilterChange}
                    />
                  </Col>
                </Row>
                <Row className="mt-3">
                  <Col md={6}>
                    <Form.Check
                      type="checkbox"
                      label="Has Warranty"
                      name="hasWarranty"
                      checked={advancedFilters.hasWarranty}
                      onChange={handleAdvancedFilterChange}
                    />
                  </Col>
                </Row>
              </Accordion.Body>
            </Accordion.Item>

            {/* Sort Options */}
            <Accordion.Item eventKey="6">
              <Accordion.Header>Sort Options</Accordion.Header>
              <Accordion.Body>
                <Form.Group>
                  <Form.Label>Sort By</Form.Label>
                  <Form.Select
                    name="sortBy"
                    value={advancedFilters.sortBy}
                    onChange={handleAdvancedFilterChange}
                  >
                    {sortOptions.map((option, index) => (
                      <option key={index} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>
        </Modal.Body>
        <Modal.Footer>
          <div className="d-flex justify-content-between w-100">
            <Button variant="outline-secondary" onClick={resetFilters}>
              Reset All Filters
            </Button>
            <div>
              <Button
                variant="secondary"
                onClick={() => setModalOpen(false)}
                className="me-2"
              >
                Cancel
              </Button>
              <Button variant="primary" onClick={applyAdvancedFilters}>
                Apply Filters
              </Button>
            </div>
          </div>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default Toolbar;
