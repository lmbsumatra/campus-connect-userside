// Imports
import React, { useEffect, useState } from "react";
import ItemCard from "../../components/item-card/ItemCard";
import TimeoutComponent from "../../utils/TimeoutComponent";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllApprovedItemForSale } from "../../redux/item-for-sale/allApprovedItemsForSaleSlice";
import LoadingItemCardSkeleton from "../../components/loading-skeleton/loading-item-card-skeleton/LoadingItemCardSkeleton";
import { useLocation } from "react-router-dom";
import FilterToolbar from "../../components/item-filter/FilterToolbar";
import FilterFunction from "../../components/item-filter/FilterFunction";
import FilterModal from "../../components/item-filter/FilterModal";
import ResetFilters from "../../components/item-filter/ResetFilters";
import { defaultFilters } from "../../utils/consonants";

// Shop Component
const Shop = () => {
  // State Variables

  const dispatch = useDispatch();

  const { search } = useLocation();
  const searchParams = new URLSearchParams(search);

  const [showAdvancefilter, setShowAdvanceFilter] = useState(false);
  const [filters, setFilters] = useState(defaultFilters);

  const keyword = searchParams.get("q")?.trim() || "";

  const {
    allApprovedItemForSale,
    loadingAllApprovedItemForSale,
    errorAllApprovedItemForSale,
  } = useSelector((state) => state.allApprovedItemForSale);

  const [filteredItems, setFilteredItems] = useState(allApprovedItemForSale);

  useEffect(() => {
    dispatch(fetchAllApprovedItemForSale(keyword));
  }, [dispatch, keyword]);

  useEffect(() => {
    setFilteredItems(allApprovedItemForSale);
  }, [allApprovedItemForSale]);

  const handleFilterChange = (updatedFilters) => {
    setFilters(updatedFilters);
    const updatedItems = FilterFunction(allApprovedItemForSale, updatedFilters);
    setFilteredItems(updatedItems);
  };

  // Component JSX
  return (
    <div className="container-content page-container">
      <div className="">
        <FilterToolbar
          filters={filters}
          setFilters={setFilters}
          showPriceRange={true}
          onFilterChange={handleFilterChange}
          setShowAdvanceFilter={setShowAdvanceFilter}
          showAdvancefilter={showAdvancefilter}
          allApprovedPosts={allApprovedItemForSale}
          setFilteredItems={setFilteredItems}
        />

        {showAdvancefilter && (
          <FilterModal
            showFilterModal={showAdvancefilter}
            close={(e) => setShowAdvanceFilter(!showAdvancefilter)}
            applyFilters={handleFilterChange}
            filters={filters}
            setFilters={setFilters}
          />
        )}
      </div>

      {/* Item Display Section */}
      <div className="items-section">
        <TimeoutComponent
          timeoutDuration={1000}
          fallback={
            <div className="card-container vertical">
              {Array.from({ length: 6 }).map((_, index) => (
                <LoadingItemCardSkeleton key={index} />
              ))}
            </div>
          }
        >
          {!loadingAllApprovedItemForSale && (
            <ItemCard items={filteredItems} title="For Sale" />
          )}
        </TimeoutComponent>
      </div>
    </div>
  );
};

export default Shop;
