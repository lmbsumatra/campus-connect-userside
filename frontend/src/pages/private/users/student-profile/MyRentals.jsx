import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import RentalFilters from "../../../../components/myrentals/RentalFilters";
import RentalItem from "../../../../components/myrentals/RentalItem";
import { useAuth } from "../../../../context/AuthContext";
import { useDispatch, useSelector } from "react-redux";
import { fetchRentalTransactions } from "../../../../redux/transactions/rentalTransactionsSlice";

const formatForRoute = (name) => (name ? name.toLowerCase() : "");

const MyRentals = ({ selectedOption, selectedTab, onTabChange }) => {
  const { studentUser } = useAuth();
  const userId = studentUser.userId;
  const [activeFilter, setActiveFilter] = useState(selectedTab || "requests");
  const [highlightedItem, setHighlightedItem] = useState(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  const highlightId = location.state?.highlight;
  const {
    transactions: rentalItems,
    error,
    loading,
  } = useSelector((state) => state.rentalTransactions);

  useEffect(() => {
    if (userId) {
      dispatch(fetchRentalTransactions(userId));
    }
  }, [dispatch, userId]);

  useEffect(() => {
    setActiveFilter(formatForRoute(selectedTab));
  }, [selectedTab]);

  const handleFilterClick = (filter) => {
    const formattedFilter = formatForRoute(filter);
    setActiveFilter(formattedFilter);
    onTabChange(filter);
  };

  useEffect(() => {
    if (highlightId && rentalItems.length > 0) {
      setHighlightedItem(highlightId);

      requestAnimationFrame(() => {
        const element = document.getElementById(`rental-${highlightId}`);

        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
          element.classList.add("highlighted");

          setTimeout(() => {
            element.classList.remove("highlighted");
            setHighlightedItem(null);
          }, 2000);
        }
      });
    }
  }, [highlightId, rentalItems]);

  const openRentProgress = (rentalId) => {
    if (!rentalId) {
      console.error("Invalid rentalId:", rentalId);
      return;
    }

    const formattedRentalId = String(rentalId).replace(/\s+/g, "-");
    navigate(`/rent-progress/${formattedRentalId}`);
  };

  if (loading) return <p>Loading...</p>;

  // Updated filter options to include both rental and purchase transactions
  const filterOptions = [
    { name: "Requests", statuses: ["Requested"] },
    {
      name:
        selectedOption === "owner"
          ? "To Hand Over"
          : selectedOption === "buyer"
          ? "To Receive"
          : "To Receive",
      statuses: ["Accepted"],
    },
    ...(selectedOption !== "buyer"
      ? [
          {
            name: selectedOption === "renter" ? "To Return" : "To Receive",
            statuses: ["HandedOver"],
          },
        ]
      : []),
    { name: "To Complete", statuses: ["Returned"] }, // Added "Completed" status
    { name: "To Review", statuses: ["Completed"] },
    { name: "Cancelled", statuses: ["Cancelled", "Declined"] },
  ];

  const formattedFilterOptions = filterOptions.map((option) => ({
    ...option,
    nameForLabel: option.name,
    nameForRoute: formatForRoute(option.name),
  }));

  const filteredItems = rentalItems.filter((item) => {
    // Handle both direct items and items with tx property
    const transaction = item.tx || item;
    const itemStatus = transaction.status || item.status;
    const itemTransactionType = (
      transaction.transaction_type ||
      item.transactionType ||
      ""
    ).toLowerCase();
    const itemOwnerId =
      transaction.owner_id || (transaction.owner && transaction.owner.user_id);
    const itemRenterId =
      transaction.renter_id ||
      (transaction.renter && transaction.renter.user_id);
    const itemBuyerId =
      transaction.buyer_id || (transaction.buyer && transaction.buyer.user_id);

    // Check if user is involved in the transaction based on their role
    if (
      (selectedOption === "owner" && itemOwnerId !== userId) ||
      (selectedOption === "renter" && itemRenterId !== userId) ||
      (selectedOption === "buyer" && itemBuyerId !== userId)
    )
      return false;

    // Filter by transaction type if needed
    if (selectedOption === "buyer" && itemTransactionType !== "sell")
      return false;
    if (selectedOption === "renter" && itemTransactionType !== "rental")
      return false;

    // Always show all items if "all" filter is selected
    if (activeFilter === "all") return true;

    // Find the filter option that matches the current active filter
    const filterOption = formattedFilterOptions.find(
      (option) => option.nameForRoute === activeFilter
    );

    // Apply status filter
    return filterOption && filterOption.statuses.includes(itemStatus);
  });

  const countByStatus = () => {
    return formattedFilterOptions.reduce((acc, option) => {
      const filtered = rentalItems.filter((item) => {
        // Handle both direct items and items with tx property
        const transaction = item.tx || item;
        const itemStatus = transaction.status || item.status;
        const itemTransactionType = (
          transaction.transaction_type ||
          item.transactionType ||
          ""
        ).toLowerCase();
        const itemOwnerId =
          transaction.owner_id ||
          (transaction.owner && transaction.owner.user_id);
        const itemRenterId =
          transaction.renter_id ||
          (transaction.renter && transaction.renter.user_id);
        const itemBuyerId =
          transaction.buyer_id ||
          (transaction.buyer && transaction.buyer.user_id);
        const ownerConfirmed =
          transaction.owner_confirmed || item.owner_confirmed || false;
        const renterConfirmed =
          transaction.renter_confirmed || item.renter_confirmed || false;

        // Filter by user role
        if (
          (selectedOption === "owner" && itemOwnerId !== userId) ||
          (selectedOption === "renter" && itemRenterId !== userId) ||
          (selectedOption === "buyer" && itemBuyerId !== userId)
        )
          return false;

        // Filter by transaction type if needed
        if (selectedOption === "buyer" && itemTransactionType !== "sell")
          return false;
        if (selectedOption === "renter" && itemTransactionType !== "rental")
          return false;

        // Filter by status
        if (option.statuses.length && !option.statuses.includes(itemStatus))
          return false;

        return true;
      });

      let count = filtered.length;

      // Handle special case for "To Review"
      if (option.name === "To Review") {
        const reviewedCount = filtered.filter((item) => {
          const transaction = item.tx || item;
          const itemOwnerId =
            transaction.owner_id ||
            (transaction.owner && transaction.owner.user_id);
          const itemRenterId =
            transaction.renter_id ||
            (transaction.renter && transaction.renter.user_id);
          const itemBuyerId =
            transaction.buyer_id ||
            (transaction.buyer && transaction.buyer.user_id);
          const ownerConfirmed =
            transaction.owner_confirmed || item.owner_confirmed || false;
          const renterConfirmed =
            transaction.renter_confirmed || item.renter_confirmed || false;

          return (
            (userId === itemOwnerId && ownerConfirmed) ||
            ((userId === itemRenterId || userId === itemBuyerId) &&
              renterConfirmed)
          );
        }).length;
        count -= reviewedCount;
      }

      // Determine status color
      let statusColor = "gray";
      if (option.name === "To Review" && count === 0) statusColor = "gray";
      else if (option.name === "Request" && count > 0) statusColor = "orange";
      else if (option.name === "Cancelled" || option.name === "All")
        statusColor = "white";
      else {
        statusColor = filtered.reduce((color, item) => {
          const transaction = item.tx || item;
          const itemOwnerId =
            transaction.owner_id ||
            (transaction.owner && transaction.owner.user_id);
          const itemRenterId =
            transaction.renter_id ||
            (transaction.renter && transaction.renter.user_id);
          const itemBuyerId =
            transaction.buyer_id ||
            (transaction.buyer && transaction.buyer.user_id);
          const ownerConfirmed =
            transaction.owner_confirmed || item.owner_confirmed || false;
          const renterConfirmed =
            transaction.renter_confirmed || item.renter_confirmed || false;

          if (
            (selectedOption === "owner" && ownerConfirmed) ||
            ((selectedOption === "renter" || selectedOption === "buyer") &&
              renterConfirmed) ||
            option.name === "To Review"
          )
            return "orange";
          return "red";
        }, "gray");
      }

      acc[option.nameForLabel] = { count, color: statusColor };
      return acc;
    }, {});
  };

  return (
    <div className="container rounded bg-white">
      <div className="w-100">
        <RentalFilters
          filterOptions={formattedFilterOptions.map(
            (option) => option.nameForLabel
          )}
          activeFilter={activeFilter}
          onFilterClick={handleFilterClick}
          selectedOption={selectedOption}
          countTransactions={countByStatus()}
          selectedTab={selectedTab}
          onTabChange={onTabChange}
        />
        <div className="rental-items">
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => {
              const itemId = item.id || (item.tx && item.tx.id);
              return (
                <div
                  id={`rental-${itemId}`}
                  key={itemId}
                  onClick={() => openRentProgress(itemId)}
                >
                  <RentalItem
                    item={item}
                    highlighted={itemId === highlightedItem}
                    onButtonClick={(e) => e.stopPropagation()}
                    selectedOption={selectedOption}
                    selectedTab={selectedTab}
                    onTabChange={onTabChange}
                  />
                </div>
              );
            })
          ) : (
            <p>No transactions available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyRentals;
