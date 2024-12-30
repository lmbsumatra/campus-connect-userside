import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import ItemList from "../../../../components/item-card/ItemCard";
import { selectStudentUser } from "../../../../redux/auth/studentAuthSlice";
import { fetchAllListingsByUser, deleteListingById } from "../../../../redux/listing/allListingsByUserSlice";
import ShowAlert from "../../../../utils/ShowAlert";

function MyListings() {
  const [error, setError] = useState(null);
  const { userId } = useSelector(selectStudentUser); // Get userId from Redux state
  const dispatch = useDispatch(); // Dispatch function from Redux
  const navigate = useNavigate(); // Navigation hook

  // Get the state from Redux (listings, loading, error)
  const { allListingsByUser, loadingAllListingsByUser, errorAllListingsByUser } =
    useSelector((state) => state.allListingsByUser);

  useEffect(() => {
    if (userId) {
      dispatch(fetchAllListingsByUser(userId)); // Dispatch the action with userId as payload
    }
  }, [userId, dispatch]);

  // Set the error if there is any error in fetching the listings
  useEffect(() => {
    if (errorAllListingsByUser) {
      setError(errorAllListingsByUser);
    }
  }, [errorAllListingsByUser]);

  const handleOptionClick = async (e, option, item) => {
    e.stopPropagation();

    if (option === "delete") {
      ShowAlert(dispatch, "loading", "Deleting...");

      try {
        await dispatch(deleteListingById({ userId, listingId: item.id })).unwrap();
        ShowAlert(dispatch, "success", "Item deleted successfully!");
      } catch (error) {
        console.error("Error deleting listing:", error);
        ShowAlert(dispatch, "error", "Error", error || "Failed to delete listing!");
      }
    } else {
      switch (option) {
        case "view":
          navigate(`/view/${item.id}`);
          break;
        case "edit":
          navigate(`/profile/my-listings/edit/${item.id}`);
          break;
        default:
          break;
      }
    }
  };

  if (loadingAllListingsByUser) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container rounded bg-white">
      {error ? (
        <div>Error: {error}</div>
      ) : (
        <ItemList
          items={allListingsByUser}
          title="Rent"
          isYou={true}
          onOptionClick={handleOptionClick} // Pass the handler as a prop
        />
      )}
    </div>
  );
}

export default MyListings;
