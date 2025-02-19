const FilterFunction = (items, filters) => {
  let filteredItems = [...items];

  console.log("🔥 Filters received:", filters);

  if (!filters) return items;

  if (filters.category && filters.category !== "") {
    filteredItems = filteredItems.filter(
      (item) => item.category === filters.category
    );
  }

  if (filters.condition && Array.isArray(filters.condition) && filters.condition.length > 0) {
    filteredItems = filteredItems.filter((item) =>
      filters.condition.includes(item.condition)
    );
  }

  if (filters.priceRange && Array.isArray(filters.priceRange) && filters.priceRange.length === 2) {
    const [minPrice, maxPrice] = filters.priceRange;
    filteredItems = filteredItems.filter(
      (item) => item.price >= minPrice && item.price <= maxPrice
    );
  }

  if (filters.sortBy === "price_asc") {
    filteredItems.sort((a, b) => a.price - b.price);
  } else if (filters.sortBy === "desc") {
    filteredItems.sort((a, b) => b.price - a.price);
  }

  console.log("✅ Filtered items:", filteredItems);
  return filteredItems;
};

export default FilterFunction;
