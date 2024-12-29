import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import ItemList from "../../../../components/item-card/ItemCard";
import { selectStudentUser } from "../../../../redux/auth/studentAuthSlice";
import { deleteItemForSaleById, fetchAllItemForSaleByUser } from "../../../../redux/item-for-sale/allItemForSaleByUserSlice";
import ShowAlert from "../../../../utils/ShowAlert";
import { useNavigate } from "react-router-dom";

function MyForSale() {
  const [error, setError] = useState(null);
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

  const handleOptionClick = async (e, option, item) => {
    e.stopPropagation();

    if (option === "delete") {
      ShowAlert(dispatch, "loading", "Deleting...");

      try {
        await dispatch(deleteItemForSaleById({ userId, itemForSaleId: item.id })).unwrap();
        ShowAlert(dispatch, "success", "Item deleted successfully!");
      } catch (error) {
        console.error("Error deleting Item for sale:", error);
        ShowAlert(dispatch, "error", "Error", error || "Failed to delete Item for sale!");
      }
    } else {
      switch (option) {
        case "view":
          navigate(`/view/${item.id}`);
          break;
        case "edit":
          navigate(`/edit/${item.id}`);
          break;
        default:
          break;
      }
    }
  };

  if (loadingAllItemForSaleByUser) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container rounded bg-white">
      {error ? (
        <div>Error: {error}</div>
      ) : (
        <ItemList
          items={allItemForSaleByUser}
          title="Rent"
          isYou={true}
          onOptionClick={handleOptionClick} // Pass the handler as a prop
        />
      )}
    </div>
  );
}

export default MyForSale;
