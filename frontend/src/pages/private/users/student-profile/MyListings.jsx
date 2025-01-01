import { useState, useEffect, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import ItemList from "../../../../components/item-card/ItemCard";
import { selectStudentUser } from "../../../../redux/auth/studentAuthSlice";
import {
  fetchAllListingsByUser,
  deleteListingById,
} from "../../../../redux/listing/allListingsByUserSlice";
import ShowAlert from "../../../../utils/ShowAlert";
import Toolbar from "../../../../components/toolbar/Toolbar";
import Fuse from "fuse.js";

function MyListings() {
  const [error, setError] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [viewType, setViewType] = useState("card");
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState({ status: "" });
  const [advancedFilters, setAdvancedFilters] = useState({
    searchTerm: "",
    category: "",
    tags: [],
    ownerName: "",
    minPrice: "",
    maxPrice: "",
    startDate: "",
    endDate: "",
    city: "",
    state: "",
    country: "",
    condition: "",
    minRating: "",
    inStock: null,
    isActive: null,
    isExpired: null,
    sortBy: "newest",
  });

  const { userId } = useSelector(selectStudentUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    allListingsByUser,
    loadingAllListingsByUser,
    errorAllListingsByUser,
  } = useSelector((state) => state.allListingsByUser);

  useEffect(() => {
    if (userId) {
      dispatch(fetchAllListingsByUser(userId));
    }
  }, [userId, dispatch]);

  useEffect(() => {
    if (errorAllListingsByUser) {
      setError(errorAllListingsByUser);
    }
  }, [errorAllListingsByUser]);

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

  const applyFilters = useCallback((item) => {
    // Basic status filter
    if (filter.status && item.status !== filter.status) {
      return false;
    }
  
    // Advanced filters
    if (Object.keys(advancedFilters).length > 0) {
      // Category filter
      if (advancedFilters.category && item.category?.toLowerCase() !== advancedFilters.category.toLowerCase()) {
        return false;
      }
  
      // Tags filter
      if (advancedFilters.tags.length > 0 && !advancedFilters.tags.every(tag => item.tags?.includes(tag))) {
        return false;
      }
  
      // Owner name filter
      if (advancedFilters.ownerName && !(`${item.owner?.fname} ${item.owner?.lname}`).toLowerCase().includes(advancedFilters.ownerName.toLowerCase())) {
        return false;
      }
  
      // Price range filter - Ensure prices are compared as numbers
      const itemPrice = parseFloat(item.price);
      if (advancedFilters.minPrice && itemPrice < parseFloat(advancedFilters.minPrice)) {
        return false;
      }
      if (advancedFilters.maxPrice && itemPrice > parseFloat(advancedFilters.maxPrice)) {
        return false;
      }
  
      // Date range filter
      const itemDate = new Date(item.createAt);
      if (advancedFilters.startDate && itemDate < new Date(advancedFilters.startDate)) {
        return false;
      }
      if (advancedFilters.endDate && itemDate > new Date(advancedFilters.endDate)) {
        return false;
      }
  
      // Location filters
      if (advancedFilters.city && !item.city?.toLowerCase().includes(advancedFilters.city.toLowerCase())) {
        return false;
      }
      if (advancedFilters.state && !item.state?.toLowerCase().includes(advancedFilters.state.toLowerCase())) {
        return false;
      }
      if (advancedFilters.country && !item.country?.toLowerCase().includes(advancedFilters.country.toLowerCase())) {
        return false;
      }
  
      // Condition filter
      if (advancedFilters.condition && item.condition?.toLowerCase() !== advancedFilters.condition.toLowerCase()) {
        return false;
      }
  
      // Rating filter
      if (advancedFilters.minRating && parseFloat(item.rating) < parseFloat(advancedFilters.minRating)) {
        return false;
      }
  
      // Boolean filters
      if (advancedFilters.inStock === true && !item.inStock) {
        return false;
      }
      if (advancedFilters.isActive === true && item.status !== 'active') {
        return false;
      }
      if (advancedFilters.isExpired === true && !item.isExpired) {
        return false;
      }
    }
  
    return true;
  }, [filter.status, advancedFilters]);
  
  const finalListings = useMemo(() => {
    let filtered = allListingsByUser || [];

    // Apply search if there's a search term
    if (searchTerm) {
      filtered = fuse.search(searchTerm).map(result => result.item);
    }

    // Apply all filters
    filtered = filtered.filter(applyFilters);

    // Apply sorting
    return filtered.sort((a, b) => {
      const sortBy = advancedFilters.sortBy || 'newest';
      switch (sortBy) {
        case 'priceAsc':
          return parseFloat(a.price) - parseFloat(b.price);
        case 'priceDsc':
          return parseFloat(b.price) - parseFloat(a.price);
        case 'oldest':
          return new Date(a.createAt) - new Date(b.createAt);
        case 'newest':
        default:
          return new Date(b.createAt) - new Date(a.createAt);
      }
    });
  }, [allListingsByUser, searchTerm, applyFilters, advancedFilters.sortBy, fuse]);

  const handleAdvancedFilter = (newFilters) => {
    setAdvancedFilters(newFilters);
  };

  const handleOptionClick = useCallback(async (e, option, item) => {
    e.stopPropagation();

    if (option === "delete") {
      try {
        ShowAlert(dispatch, "loading", "Deleting...");
        await dispatch(deleteListingById({ userId, listingId: item.id })).unwrap();
        ShowAlert(dispatch, "success", "Item deleted successfully!");
      } catch (error) {
        console.error("Error deleting listing:", error);
        ShowAlert(dispatch, "error", "Error", error?.message || "Failed to delete listing!");
      }
      return;
    }

    const routes = {
      view: `/view/${item.id}`,
      edit: `/profile/my-listings/edit/${item.id}`,
    };

    if (routes[option]) {
      navigate(routes[option], option === 'edit' ? { state: { item } } : undefined);
    }
  }, [dispatch, navigate, userId]);

  const handleBulkDelete = useCallback(async () => {
    if (!selectedItems.length) {
      ShowAlert(dispatch, "warning", "No items selected for deletion");
      return;
    }

    try {
      ShowAlert(dispatch, "loading", "Deleting selected items...");
      await Promise.all(
        selectedItems.map(itemId =>
          dispatch(deleteListingById({ userId, listingId: itemId })).unwrap()
        )
      );

      ShowAlert(dispatch, "success", "Selected items deleted successfully!");
      setSelectedItems([]);
      dispatch(fetchAllListingsByUser(userId));
    } catch (error) {
      console.error("Error deleting listings:", error);
      ShowAlert(dispatch, "error", "Error", error?.message || "Failed to delete listings!");
    }
  }, [selectedItems, dispatch, userId]);

  if (loadingAllListingsByUser) {
    return <div>Loading...</div>;
  }

  console.log("Advanced Filters: ", advancedFilters);
console.log("Filtered Listings: ", finalListings);


  return (
    <div className="container rounded bg-white">
      {error ? (
        <div>Error: {error}</div>
      ) : (
        <>
          <Toolbar
            selectedItems={selectedItems}
            onSelectAll={() => {
              setSelectedItems(
                selectedItems.length === finalListings.length
                  ? []
                  : finalListings.map(item => item.id)
              );
            }}
            onViewToggle={() => setViewType(prev => prev === "card" ? "table" : "card")}
            viewType={viewType}
            onAction={handleBulkDelete}
            items={finalListings}
            onSearch={setSearchTerm}
            onFilter={(value) => setFilter({ status: value })}
            onAdvancedFilter={handleAdvancedFilter}
            filterOptions={[
              { value: "", label: "All" },
              { value: "pending", label: "Pending" },
              { value: "approved", label: "Approved" },
              { value: "declined", label: "Declined" },
              { value: "removed", label: "Removed" },
              { value: "revoked", label: "Revoked" },
              { value: "flagged", label: "Flagged" },
              { value: "unavailable", label: "Unavailable" },
            ]}
          />

          <ItemList
            items={finalListings}
            title="Rent"
            isYou={true}
            onOptionClick={handleOptionClick}
            selectedItems={selectedItems}
            onSelectItem={(itemId) => {
              setSelectedItems(prev =>
                prev.includes(itemId)
                  ? prev.filter(id => id !== itemId)
                  : [...prev, itemId]
              );
            }}
            viewType={viewType}
          />
        </>
      )}
    </div>
  );
}

export default MyListings;
