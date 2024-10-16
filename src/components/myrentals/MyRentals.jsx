import React, { useState, useEffect } from "react";
// MyRentals
import RentalFilters from "../../components/myrentals/RentalFilters";
import RentalItem from "../../components/myrentals/RentalItem";
import { rentalItems, filterOptions } from "../../components/myrentals/data";
import ReviewModal from "../../components/modalReview/ReviewModal";

const MyRentals = () => {
  const [activeFilter, setActiveFilter] = useState("Request");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const handleFilterClick = (filter) => {
    setActiveFilter(filter);
  };

  const openModal = (item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
  };

  return (
    <div className="container rounded bg-white">
      <div className="my-rentals">
        <RentalFilters
          filterOptions={filterOptions}
          activeFilter={activeFilter}
          onFilterClick={handleFilterClick}
        />
        <div className="rental-items">
          {rentalItems
            .filter(
              (item) =>
                activeFilter === "All" ||
                item.status === activeFilter ||
                (activeFilter === "Request" && item.status === "Pending")
            )
            .map((item) => (
              <RentalItem key={item.id} item={item} onOpenModal={openModal} />
            ))}
        </div>
        {selectedItem && (
          <ReviewModal
            isOpen={isModalOpen}
            onClose={closeModal}
            item={{
              ...selectedItem,
              rentalPeriod: `${selectedItem.requestDate} - ${selectedItem.returnDate}`,
              rentalRate: "10php",
              ownerName: "Owner name", // Placeholder, replace with actual data
            }}
          />
        )}
      </div>
    </div>
  );
};

export default MyRentals;
