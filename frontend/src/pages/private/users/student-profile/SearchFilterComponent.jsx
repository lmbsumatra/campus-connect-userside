import React, { useMemo, useCallback } from "react";
import Fuse from "fuse.js";

const SearchFilterComponent = ({
  items,
  searchTerm,
  setSearchTerm,
  filter,
  setFilter,
  advancedFilters,
  setAdvancedFilters,
  onResetFilters,
  children,
}) => {
  const fuse = useMemo(
    () =>
      new Fuse(items, {
        keys: ["name", "tags", "category", "owner.fname", "owner.lname", "price", "createAt"],
        threshold: 0.3,
      }),
    [items]
  );

  const applyFilters = useCallback(
    (item) => {
      if (filter.status && item.status !== filter.status) return false;

      if (Object.keys(advancedFilters).length > 0) {
        if (
          advancedFilters.category &&
          item.category?.toLowerCase() !== advancedFilters.category.toLowerCase()
        )
          return false;

        if (
          advancedFilters.tags.length > 0 &&
          !advancedFilters.tags.every((tag) => item.tags?.includes(tag))
        )
          return false;

        if (
          advancedFilters.ownerName &&
          !(`${item.owner?.fname} ${item.owner?.lname}`)
            .toLowerCase()
            .includes(advancedFilters.ownerName.toLowerCase())
        )
          return false;

        const itemPrice = parseFloat(item.price);
        if (
          advancedFilters.minPrice &&
          itemPrice < parseFloat(advancedFilters.minPrice)
        )
          return false;

        if (
          advancedFilters.maxPrice &&
          itemPrice > parseFloat(advancedFilters.maxPrice)
        )
          return false;

        const itemDate = new Date(item.createAt);
        if (
          advancedFilters.startDate &&
          itemDate < new Date(advancedFilters.startDate)
        )
          return false;

        if (
          advancedFilters.endDate &&
          itemDate > new Date(advancedFilters.endDate)
        )
          return false;

        if (
          advancedFilters.city &&
          !item.city?.toLowerCase().includes(advancedFilters.city.toLowerCase())
        )
          return false;

        if (
          advancedFilters.state &&
          !item.state?.toLowerCase().includes(advancedFilters.state.toLowerCase())
        )
          return false;

        if (
          advancedFilters.country &&
          !item.country?.toLowerCase().includes(advancedFilters.country.toLowerCase())
        )
          return false;

        if (
          advancedFilters.condition &&
          item.condition?.toLowerCase() !== advancedFilters.condition.toLowerCase()
        )
          return false;

        if (
          advancedFilters.minRating &&
          parseFloat(item.rating) < parseFloat(advancedFilters.minRating)
        )
          return false;

        if (advancedFilters.inStock === true && !item.inStock) return false;

        if (advancedFilters.isActive === true && item.status !== "active")
          return false;

        if (advancedFilters.isExpired === true && !item.isExpired) return false;
      }

      return true;
    },
    [filter.status, advancedFilters]
  );

  const filteredItems = useMemo(() => {
    let result = items;

    if (searchTerm) {
      result = fuse.search(searchTerm).map((result) => result.item);
    }

    return result.filter(applyFilters);
  }, [items, searchTerm, applyFilters, fuse]);

  return children({
    filteredItems,
    setSearchTerm,
    setFilter,
    setAdvancedFilters,
    onResetFilters,
  });
};

export default SearchFilterComponent;
