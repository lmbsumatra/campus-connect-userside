import React, { useState } from "react";
import { Pagination, Modal, Button, Form } from "react-bootstrap";

const PaginationComponent = ({ currentPage, totalPages, onPageChange }) => {
  const [showModal, setShowModal] = useState(false);
  const [inputPage, setInputPage] = useState("");

  const handleEllipsisClick = () => {
    setShowModal(true); // Open the modal when ellipsis is clicked
  };

  const handleCloseModal = () => {
    setShowModal(false); // Close the modal
    setInputPage(""); // Clear input on close
  };

  const handlePageSubmit = () => {
    const pageNumber = parseInt(inputPage, 10);
    if (!isNaN(pageNumber) && pageNumber >= 1 && pageNumber <= totalPages) {
      onPageChange(pageNumber);
      handleCloseModal(); // Close the modal after a valid input
    } else {
      alert("Invalid page number");
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const renderPaginationItems = () => {
    let items = [];

    // Always show the first page
    items.push(
      <Pagination.Item
        key={1}
        active={currentPage === 1}
        onClick={() => onPageChange(1)}
      >
        1
      </Pagination.Item>
    );

    // If there are more than 4 pages, add ellipsis and only a few middle items
    if (totalPages > 4) {
      if (currentPage > 3) {
        items.push(
          <Pagination.Ellipsis
            key="ellipsis-start"
            onClick={handleEllipsisClick}
          />
        );
      }

      // Display middle pages
      const startPage = Math.max(2, currentPage - 1);
      const endPage = Math.min(totalPages - 1, currentPage + 1);

      for (let page = startPage; page <= endPage; page++) {
        items.push(
          <Pagination.Item
            key={page}
            active={currentPage === page}
            onClick={() => onPageChange(page)}
          >
            {page}
          </Pagination.Item>
        );
      }

      // If not at the last few pages, add ellipsis before the last page
      if (currentPage < totalPages - 2) {
        items.push(
          <Pagination.Ellipsis
            key="ellipsis-end"
            onClick={handleEllipsisClick}
          />
        );
      }
    }

    // Always show the last page if there are more than one
    if (totalPages > 1) {
      items.push(
        <Pagination.Item
          key={totalPages}
          active={currentPage === totalPages}
          onClick={() => onPageChange(totalPages)}
        >
          {totalPages}
        </Pagination.Item>
      );
    }

    return items;
  };

  return (
    <>
      <Pagination className="justify-content-center">
        <Pagination.Prev
          onClick={handlePreviousPage}
          disabled={currentPage === 1}
        />
        {renderPaginationItems()}
        <Pagination.Next
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
        />
      </Pagination>

      {/* Modal for entering page number */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Jump to Page</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="pageInput">
              <Form.Label>Enter page number</Form.Label>
              <Form.Control
                type="number"
                min={1}
                max={totalPages}
                value={inputPage}
                onChange={(e) => setInputPage(e.target.value)}
                placeholder={`1 - ${totalPages}`}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handlePageSubmit}>
            Go to Page
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default PaginationComponent;
