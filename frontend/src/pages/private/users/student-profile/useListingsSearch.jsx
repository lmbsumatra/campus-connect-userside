// useListingsSearch.js
import { useMemo } from "react";
import Fuse from "fuse.js";

const useListingsSearch = (allListingsByUser, searchTerm) => {
  const fuse = useMemo(() => new Fuse(allListingsByUser || [], {
    keys: [
      "name",
      "tags",
      "category",
      "owner.fname",
      "owner.lname",
      "price",
      "createAt",
    ],
    threshold: 0.3,
  }), [allListingsByUser]);

  const filteredListings = useMemo(() => {
    let filtered = allListingsByUser || [];

    // Apply search if there's a search term
    if (searchTerm) {
      filtered = fuse.search(searchTerm).map(result => result.item);
    }

    return filtered;
  }, [allListingsByUser, searchTerm, fuse]);

  return filteredListings;
};

export default useListingsSearch;
