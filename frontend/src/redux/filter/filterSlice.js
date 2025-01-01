import { createSlice } from "@reduxjs/toolkit";
import Fuse from "fuse.js"; // Import Fuse.js for fuzzy searching

const initialState = {
  filters: {
    category: "",
    itemCondition: "",
    itemConditionCustom: "",
    priceRange: { min: 0, max: 1000 },
    deliveryMethod: "",
    paymentMethod: "",
    repairReplacement: false,
    lateCharges: false,
    securityDeposit: false,
    availableDates: { date: "" },
    status: "",
    specs: [],
    keyword: "", // Add a keyword field for searching across all listings
  },
  sort: {
    option: "createdAt",
    direction: "desc",
  },
  items: [],
  pagination: {
    page: 1,
    limit: 10,
  },
};

const filterSlice = createSlice({
  name: "listing",
  initialState,
  reducers: {
    // Set a single filter dynamically by key
    setFilter: (state, action) => {
      const { key, value } = action.payload;
      state.filters[key] = value;
    },
    // Reset all filters
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },
    // Set sorting option
    setSortOption: (state, action) => {
      state.sort.option = action.payload;
    },
    // Set sorting direction
    setSortDirection: (state, action) => {
      state.sort.direction = action.payload;
    },
    // Replace current listings
    setItems: (state, action) => {
      state.items = action.payload;
    },
    // Update pagination
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    // Apply filters, sort, and paginate
    applyFiltersAndSort: (state) => {
      const { filters, sort, pagination } = state;
      let filteredItems = state.items;

      // Apply Fuse.js for fuzzy keyword search
      if (filters.keyword) {
        const fuseOptions = {
          keys: ["name", "description", "category", "tags", "specs.brand", "specs.model"], // Customize the fields to search
          threshold: 0.3, // Fuzzy matching threshold
        };

        const fuse = new Fuse(filteredItems, fuseOptions);
        const results = fuse.search(filters.keyword);

        const matchingIds = new Set(results.map((result) => result.item.id));
        filteredItems = filteredItems.filter((listing) =>
          matchingIds.has(listing.id)
        );
      }

      // Apply category filter
      if (filters.category) {
        filteredItems = filteredItems.filter(
          (listing) => listing.category === filters.category
        );
      }

      // Apply item condition filter
      if (filters.itemCondition) {
        filteredItems = filteredItems.filter(
          (listing) => listing.itemCondition === filters.itemCondition
        );
      }

      // Apply custom condition filter
      if (filters.itemConditionCustom) {
        filteredItems = filteredItems.filter(
          (listing) =>
            listing.itemCondition
              ?.toLowerCase()
              .includes(filters.itemConditionCustom.toLowerCase())
        );
      }

      // Apply price range filter
      filteredItems = filteredItems.filter(
        (listing) =>
          listing.rate >= filters.priceRange.min &&
          listing.rate <= filters.priceRange.max
      );

      // Apply delivery method filter
      if (filters.deliveryMethod) {
        filteredItems = filteredItems.filter(
          (listing) => listing.deliveryMethod === filters.deliveryMethod
        );
      }

      // Apply payment method filter
      if (filters.paymentMethod) {
        filteredItems = filteredItems.filter(
          (listing) => listing.paymentMethod === filters.paymentMethod
        );
      }

      // Apply feature-based checkboxes
      if (filters.repairReplacement) {
        filteredItems = filteredItems.filter(
          (listing) => listing.repairReplacement === true
        );
      }

      if (filters.lateCharges) {
        filteredItems = filteredItems.filter(
          (listing) => listing.lateCharges === true
        );
      }

      if (filters.securityDeposit) {
        filteredItems = filteredItems.filter(
          (listing) => listing.securityDeposit === true
        );
      }

      // Apply available dates filter
      if (filters.availableDates.date) {
        const selectedDate = new Date(filters.availableDates.date);
        filteredItems = filteredItems.filter((listing) => {
          const listingDate = new Date(listing.availableDate);
          return listingDate.toDateString() === selectedDate.toDateString();
        });
      }

      // Apply status filter
      if (filters.status) {
        filteredItems = filteredItems.filter(
          (listing) => listing.status === filters.status
        );
      }

      // Apply specs filter
      if (filters.specs.length > 0) {
        filters.specs.forEach(({ key, value }) => {
          filteredItems = filteredItems.filter((listing) =>
            listing.specs.some(
              (spec) =>
                spec.key.toLowerCase() === key.toLowerCase() &&
                spec.value.toLowerCase().includes(value.toLowerCase())
            )
          );
        });
      }

      // Apply sorting
      filteredItems.sort((a, b) => {
        const valueA = a[sort.option];
        const valueB = b[sort.option];

        if (typeof valueA === "string" && typeof valueB === "string") {
          return sort.direction === "asc"
            ? valueA.localeCompare(valueB)
            : valueB.localeCompare(valueA);
        }

        return sort.direction === "asc" ? valueA - valueB : valueB - valueA;
      });

      // Apply pagination
      const { page, limit } = pagination;
      state.listings = filteredItems.slice(
        (page - 1) * limit,
        page * limit
      );
    },
  },
});

export const {
  setFilter,
  resetFilters,
  setSortOption,
  setSortDirection,
  setListings,
  setPagination,
  applyFiltersAndSort,
} = filterSlice.actions;

export default filterSlice.reducer;
