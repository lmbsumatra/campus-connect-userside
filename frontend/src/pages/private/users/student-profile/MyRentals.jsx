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

  useEffect(() => {}, [rentalItems]);

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

  const filterOptions = [
    { name: "Requests", statuses: ["Requested"] },
    {
      name:
        selectedOption === "owner"
          ? "To Hand Over"
          : selectedOption === "buyer "
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
    { name: "Completed", statuses: ["Returned"] },
    { name: "To Review", statuses: ["Completed"] },
    { name: "Cancelled", statuses: ["Cancelled", "Declined"] },
  ];

  const formattedFilterOptions = filterOptions.map((option) => ({
    ...option,
    nameForLabel: option.name,
    nameForRoute: formatForRoute(option.name),
  }));

  const filteredItems = rentalItems.filter((item) => {
    if (
      (selectedOption === "owner" && item.owner_id !== userId) ||
      (selectedOption === "renter" && item.renter_id !== userId) ||
      (selectedOption === "buyer" && item.buyer_id !== userId)
    )
      return false;
    if (activeFilter === "all") return true;
    const filterOption = formattedFilterOptions.find(
      (option) => option.nameForRoute === activeFilter
    );
    return filterOption && filterOption.statuses.includes(item.status);
  });

  const countByStatus = () => {
    return formattedFilterOptions.reduce((acc, option) => {
      const filtered = rentalItems.filter((item) => {
        if (
          (selectedOption === "owner" && item.owner_id !== userId) ||
          (selectedOption === "renter" && item.renter_id !== userId) ||
          (selectedOption === "buyer" && item.buyer_id !== userId)
        )
          return false;
        if (option.statuses.length && !option.statuses.includes(item.status))
          return false;
        return true;
      });

      let count = filtered.length;

      if (option.name === "To Review") {
        const reviewedCount = filtered.filter(
          (item) =>
            (userId === item.owner_id && item.owner_confirmed) ||
            (userId === item.renter_id && item.renter_confirmed)
        ).length;
        count -= reviewedCount;
      }

      let statusColor = "gray";
      if (option.name === "To Review" && count === 0) statusColor = "gray";
      else if (option.name === "Request" && count > 0) statusColor = "orange";
      else if (option.name === "Cancelled" || option.name === "All")
        statusColor = "white";
      else {
        statusColor = filtered.reduce((color, item) => {
          if (
            (selectedOption === "owner" && item.owner_confirmed) ||
            (selectedOption === "renter" && item.renter_confirmed) ||
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
            filteredItems.map((item) => (
              <div
                id={`rental-${item.id}`}
                // className={`rental-item ${
                //   item.id === highlightedItem ? "highlighted" : ""
                // }`}
                key={item.id}
                onClick={() => openRentProgress(item.id)}
              >
                <RentalItem
                  item={item}
                  highlighted={item.id === highlightedItem}
                  onButtonClick={(e) => e.stopPropagation()}
                  selectedOption={selectedOption}
                  selectedTab={selectedTab}
                  onTabChange={onTabChange}
                />
              </div>
            ))
          ) : (
            <p>No transactions available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyRentals;
