import { useState, useEffect, useCallback } from "react";
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
import { FOR_RENT } from "../../../../utils/consonants.js";
import TimeoutComponent from "../../../../utils/TimeoutComponent.jsx";
import LoadingItemCardSkeleton from "../../../../components/loading-skeleton/loading-item-card-skeleton/LoadingItemCardSkeleton.js";

function MyListings() {
  const [error, setError] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [viewType, setViewType] = useState("card");
  const [searchTerm, setSearchTerm] = useState("");

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

  const handleOptionClick = useCallback(
    async (e, option, item) => {
      e.stopPropagation();

      if (option === "delete") {
        try {
          ShowAlert(dispatch, "loading", "Deleting...");
          await dispatch(
            deleteListingById({ userId, listingId: item.id })
          ).unwrap();
          ShowAlert(dispatch, "success", "Item deleted successfully!");
        } catch (error) {
          console.error("Error deleting listing:", error);
          ShowAlert(
            dispatch,
            "error",
            "Error",
            error?.message || "Failed to delete listing!"
          );
        }
        return;
      }

      const routes = {
        view: `/profile/my-listings/edit/${item.id}`,
        edit: `/profile/my-listings/edit/${item.id}`,
      };

      if (routes[option]) {
        navigate(
          routes[option],
          option === "edit" ? { state: { item } } : undefined
        );
      }
    },
    [dispatch, navigate, userId]
  );

  const handleBulkDelete = useCallback(async () => {
    if (!selectedItems.length) {
      ShowAlert(dispatch, "warning", "No items selected for deletion");
      return;
    }

    try {
      ShowAlert(dispatch, "loading", "Deleting selected items...");
      await Promise.all(
        selectedItems.map((itemId) =>
          dispatch(deleteListingById({ userId, listingId: itemId })).unwrap()
        )
      );

      ShowAlert(dispatch, "success", "Selected items deleted successfully!");
      setSelectedItems([]);
      dispatch(fetchAllListingsByUser(userId));
    } catch (error) {
      console.error("Error deleting listings:", error);
      ShowAlert(
        dispatch,
        "error",
        "Error",
        error?.message || "Failed to delete listings!"
      );
    }
  }, [selectedItems, dispatch, userId]);

  if (loadingAllListingsByUser) {
    return <div>Loading...</div>;
  }

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
                selectedItems.length === allListingsByUser.length
                  ? []
                  : allListingsByUser.map((item) => item.id)
              );
            }}
            onViewToggle={() =>
              setViewType((prev) => (prev === "card" ? "table" : "card"))
            }
            viewType={viewType}
            onAction={handleBulkDelete}
            items={allListingsByUser}
            onSearch={setSearchTerm}
          />

          <TimeoutComponent
            timeoutDuration={5000}
            fallback={
              <div className="card-container">
                {Array.from({ length: 4 }).map((_, index) => (
                  <LoadingItemCardSkeleton key={index} />
                ))}
              </div>
            }
          >
            <ItemList
              itemType={FOR_RENT}
              items={allListingsByUser.filter((item) =>
                item.name.toLowerCase().includes(searchTerm.toLowerCase())
              )}
              title="For Rent"
              isYou={true}
              onOptionClick={handleOptionClick}
              selectedItems={selectedItems}
              onSelectItem={(itemId) => {
                setSelectedItems((prev) =>
                  prev.includes(itemId)
                    ? prev.filter((id) => id !== itemId)
                    : [...prev, itemId]
                );
              }}
              viewType={viewType}
            />
          </TimeoutComponent>
        </>
      )}
    </div>
  );
}

export default MyListings;
