const FilterFunction = (items = [], filters = {}, usePriceRange = true) => {
  if (!Array.isArray(items)) return [];

  let filteredItems = [...items];

  if (!filters || typeof filters !== "object") return filteredItems;

  const {
    category,
    deliveryMethod,
    paymentMethod,
    condition,
    college,
    priceRange,
    sort,
    sortBy,
    lateCharges,
    securityDeposit,
    repairReplacement,
    dateAvailable,
    status,
  } = filters;

  if (category?.trim()) {
    filteredItems = filteredItems.filter((item) => item?.category === category);
  }

  if (deliveryMethod?.trim()) {
    filteredItems = filteredItems.filter(
      (item) => item?.deliveryMethod === deliveryMethod
    );
  }

  if (paymentMethod?.trim()) {
    filteredItems = filteredItems.filter(
      (item) => item?.paymentMethod === paymentMethod
    );
  }

  if (Array.isArray(condition) && condition.length > 0) {
    filteredItems = filteredItems.filter((item) =>
      condition.includes(item?.condition)
    );
  }

  if (Array.isArray(college) && college.length > 0) {
    filteredItems = filteredItems.filter((item) =>
      college.includes(item?.college)
    );
  }

  if (
    usePriceRange &&
    Array.isArray(priceRange) &&
    priceRange.length === 2 &&
    typeof priceRange[0] === "number" &&
    typeof priceRange[1] === "number"
  ) {
    const [minPrice, maxPrice] = priceRange;
    filteredItems = filteredItems.filter((item) => {
      const price = item?.price ?? 0;
      return price >= minPrice && price <= maxPrice;
    });
  }

  switch (sort) {
    case "priceAsc":
      filteredItems.sort((a, b) => (a?.price ?? 0) - (b?.price ?? 0));
      break;
    case "priceDesc":
      filteredItems.sort((a, b) => (b?.price ?? 0) - (a?.price ?? 0));
      break;
    case "nameAsc":
      filteredItems.sort((a, b) =>
        (a?.name ?? "").localeCompare(b?.name ?? "")
      );
      break;
    case "nameDesc":
      filteredItems.sort((a, b) =>
        (b?.name ?? "").localeCompare(a?.name ?? "")
      );
      break;
    case "ratingAsc":
      filteredItems.sort(
        (a, b) => (a?.averageRating ?? 0) - (b?.averageRating ?? 0)
      );
      break;
    case "ratingDesc":
      filteredItems.sort(
        (a, b) => (b?.averageRating ?? 0) - (a?.averageRating ?? 0)
      );
      break;

      break;
    case "dateAsc":
      filteredItems.sort((a, b) =>
        (a?.createdAt ?? "").localeCompare(b?.createdAt ?? "")
      );
      break;
    case "dateDesc":
      filteredItems.sort((a, b) =>
        (b?.createdAt ?? "").localeCompare(a?.createdAt ?? "")
      );
      break;
    default:
      break;
  }

  if (sortBy === "price_asc") {
    filteredItems.sort((a, b) => (a?.price ?? 0) - (b?.price ?? 0));
  } else if (sortBy === "price_desc") {
    filteredItems.sort((a, b) => (b?.price ?? 0) - (a?.price ?? 0));
  }

  if (lateCharges) {
    filteredItems = filteredItems.filter((item) => item?.lateCharges > 0);
  }

  if (securityDeposit) {
    filteredItems = filteredItems.filter((item) => item?.securityDeposit > 0);
  }

  if (repairReplacement) {
    filteredItems = filteredItems.filter(
      (item) =>
        item?.repairReplacement !== null &&
        item?.repairReplacement !== undefined &&
        item?.repairReplacement !== ""
    );
  }

  if (dateAvailable?.trim()) {
    filteredItems = filteredItems.filter((item) =>
      item?.availableDates?.some((dateObj) => dateObj?.date === dateAvailable)
    );
  }

  if (status?.trim()) {
    filteredItems = filteredItems.filter((item) => item?.status === status);
  }

  return filteredItems;
};

export default FilterFunction;
