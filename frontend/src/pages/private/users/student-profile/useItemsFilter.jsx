import Fuse from "fuse.js";
import { useSelector } from "react-redux";

const useItemsFilter = (items) => {
  const filters = useSelector((state) => state.filter.filters);

  const fuseOptions = {
    keys: [
      "name",
      "description",
      "category",
      "tags",
      "specs",
    ],
    threshold: 0.3,
  };

  const fuse = new Fuse(items, fuseOptions);

  return items.filter((listing) => {
    //
    if (filters.keyword) {
      const results = fuse.search(filters.keyword);
      const matchingIds = new Set(results.map((result) => result.item.id));
      if (!matchingIds.has(listing.id)) {
        return false;
      }
    }

    // Apply Category Filter
    if (
      filters.category &&
      filters.category.trim().toLowerCase() !==
        listing.category.trim().toLowerCase()
    ) {
      return false;
    }
    // Apply Item Condition Filter
    if (
      filters.itemCondition &&
      listing.itemCondition.trim().toLowerCase() !==
        filters.itemCondition.trim().toLowerCase()
    ) {
      return false;
    }

    // Apply Price Range Filter
    const price = listing.price || 0;
    if (
      (filters.priceRange.min && price < filters.priceRange.min) ||
      (filters.priceRange.max && price > filters.priceRange.max)
    ) {
      return false;
    }

    // delivery
    if (
      filters.deliveryMethod &&
      listing.deliveryMethod.trim().toLowerCase() !==
        filters.deliveryMethod.trim().toLowerCase()
    ) {
      console.log(
        listing.deliveryMethod.trim().toLowerCase(),
        filters.deliveryMethod.trim().toLowerCase()
      );
      return false;
    }
    // delivery
    if (
      filters.paymentMethod &&
      listing.paymentMethod.trim().toLowerCase() !==
        filters.paymentMethod.trim().toLowerCase()
    ) {
      return false;
    }

    // Apply Status Filter
    if (filters.status && listing.status !== filters.status) return false;

    // Apply late charges Filter
    if (filters.lateCharges && listing.lateCharges) {
      return true;
    }

    // Apply security deposit Filter
    if (filters.securityDeposit && listing.securityDeposit) {
      return true;
    }

    // Apply security deposit Filter
    if (filters.repairReplacement && listing.repairReplacement) {
      console.log(filters, listing);
      return true;
    }

    // Apply date Filter
    if (
      filters.availableDates?.date &&
      !listing.availableDates?.some(
        (dateEntry) => dateEntry.date === filters.availableDates.date
      )
    ) {
      return false;
    }

    // Apply Owner College Filter
    if (
      filters.ownerCollege &&
      !listing.ownerCollege
        ?.toLowerCase()
        .includes(filters.ownerCollege.toLowerCase())
    ) {
      return false;
    }

    return true;
  });
};

export default useItemsFilter;
