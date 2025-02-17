import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import ItemList from "../../../../components/item-card/ItemCard";
import Toolbar from "../../../../components/toolbar/Toolbar";
import { selectStudentUser } from "../../../../redux/auth/studentAuthSlice";
import {
  deleteItemForSaleById,
  fetchAllItemForSaleByUser,
} from "../../../../redux/item-for-sale/allItemForSaleByUserSlice";
import ShowAlert from "../../../../utils/ShowAlert";
import { FOR_SALE } from "../../../../utils/consonants";
import TimeoutComponent from "../../../../utils/TimeoutComponent";
import LoadingItemCardSkeleton from "../../../../components/loading-skeleton/loading-item-card-skeleton/LoadingItemCardSkeleton";

function MyForSale() {
  const [error, setError] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [viewType, setViewType] = useState("card");
  const [searchTerm, setSearchTerm] = useState("");

  const { userId } = useSelector(selectStudentUser); // Get userId from Redux state
  const dispatch = useDispatch(); // Dispatch function from Redux
  const navigate = useNavigate(); // Navigation hook

  // Get the state from Redux (ItemForSale, loading, error)
  const {
    allItemForSaleByUser,
    loadingAllItemForSaleByUser,
    errorAllItemForSaleByUser,
  } = useSelector((state) => state.allItemForSaleByUser);

  useEffect(() => {
    if (userId) {
      dispatch(fetchAllItemForSaleByUser(userId)); // Dispatch the action with userId as payload
    }
  }, [userId, dispatch]);

  // Set the error if there is any error in fetching the ItemForSale
  useEffect(() => {
    if (errorAllItemForSaleByUser) {
      setError(errorAllItemForSaleByUser);
    }
  }, [errorAllItemForSaleByUser]);

  const handleOptionClick = useCallback(
    async (e, option, item) => {
      e.stopPropagation();

      if (option === "delete") {
        ShowAlert(dispatch, "loading", "Deleting...");

        try {
          await dispatch(
            deleteItemForSaleById({ userId, itemForSaleId: item.id })
          ).unwrap();
          ShowAlert(dispatch, "success", "Item deleted successfully!");
        } catch (error) {
          console.error("Error deleting Item for sale:", error);
          ShowAlert(
            dispatch,
            "error",
            "Error",
            error || "Failed to delete Item for sale!"
          );
        }
      } else {
        switch (option) {
          case "view":
            navigate(`/view/${item.id}`);
            break;
          case "edit":
            navigate(`/profile/my-for-sale/edit/${item.id}`, {
              state: { item },
            });
            break;
          default:
            break;
        }
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
          dispatch(
            deleteItemForSaleById({ userId, itemForSaleId: itemId })
          ).unwrap()
        )
      );

      ShowAlert(dispatch, "success", "Selected items deleted successfully!");
      setSelectedItems([]);
      dispatch(fetchAllItemForSaleByUser(userId));
    } catch (error) {
      console.error("Error deleting items for sale:", error);
      ShowAlert(
        dispatch,
        "error",
        "Error",
        error || "Failed to delete items for sale!"
      );
    }
  }, [selectedItems, dispatch, userId]);

  if (loadingAllItemForSaleByUser) {
    return <div>Loading...</div>;
  }

  return (
    <div className="item-container">
      {error ? (
        <div>Error: {error}</div>
      ) : (
        <>
          <Toolbar
            selectedItems={selectedItems}
            onSelectAll={() => {
              setSelectedItems(
                selectedItems.length === allItemForSaleByUser.length
                  ? []
                  : allItemForSaleByUser.map((item) => item.id)
              );
            }}
            onViewToggle={() =>
              setViewType((prev) => (prev === "card" ? "table" : "card"))
            }
            viewType={viewType}
            onAction={handleBulkDelete}
            items={allItemForSaleByUser}
            onSearch={setSearchTerm}
          />

          <div className="card-items-container">
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
                itemType={FOR_SALE}
                items={allItemForSaleByUser.filter((item) =>
                  item.name.toLowerCase().includes(searchTerm.toLowerCase())
                )}
                title="For Sale"
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
          </div>
        </>
      )}
    </div>
  );
}

export default MyForSale;
