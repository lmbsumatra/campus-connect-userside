const FilterFunction = (items, filters, usePriceRange = true) => {
  let filteredItems = [...items];

  if (!filters) return items;

  if (filters.category && filters.category !== "") {
    filteredItems = filteredItems.filter(
      (item) => item.category === filters.category
    );
  }

  if (filters.deliveryMethod && filters.deliveryMethod !== "") {
    console.log(filters.deliveryMethod);
    filteredItems = filteredItems.filter(
      (item) => item.deliveryMethod === filters.deliveryMethod
    );
  }

  if (filters.paymentMethod && filters.paymentMethod !== "") {
    console.log(filters.paymentMethod);
    filteredItems = filteredItems.filter(
      (item) => item.paymentMethod === filters.paymentMethod
    );
  }

  if (
    filters.condition &&
    Array.isArray(filters.condition) &&
    filters.condition.length > 0
  ) {
    filteredItems = filteredItems.filter((item) =>
      filters.condition.includes(item.condition)
    );
  }

  if (
    filters.college &&
    Array.isArray(filters.college) &&
    filters.college.length > 0
  ) {
    filteredItems = filteredItems.filter((item) =>
      filters.college.includes(item.college)
    );
  }

  if (
    usePriceRange &&
    filters.priceRange &&
    Array.isArray(filters.priceRange) &&
    filters.priceRange.length === 2
  ) {
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

  if (filters.lateCharges) {
    filteredItems = filteredItems.filter((item) => item.lateCharges > 0);
  }

  if (filters.securityDeposit) {
    filteredItems = filteredItems.filter((item) => item.securityDeposit > 0);
  }

  if (filters.repairReplacement) {
    filteredItems = filteredItems.filter(
      (item) => item.repairReplacement !== (null || undefined || "")
    );
  }
  return filteredItems;
};

export default FilterFunction;
