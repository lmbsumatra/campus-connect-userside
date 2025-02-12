import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { fetchAllApprovedPosts } from "../../redux/post/allApprovedPostsSlice";
import { fetchAllApprovedListings } from "../../redux/listing/allApprovedListingsSlice";
import { fetchAllApprovedItemForSale } from "../../redux/item-for-sale/allApprovedItemsForSaleSlice";
import { useEffect } from "react";
import ItemCard from "../../components/item-card/ItemCard";
import PostCard from "../../components/post-card/PostCard";
import UserCard from "../../components/user-card/UserCard";
import { fetchAllUsers } from "../../redux/user/allUsersSlice";

const SearchResults = () => {
  const { search } = useLocation();
  const dispatch = useDispatch();
  const searchParams = new URLSearchParams(search);

  const keyword = searchParams.get("q")?.trim() || "N/A"; // Default to "N/A" if no keyword
  const type = searchParams.get("type") || "all"; // Default to "all" if type is missing

  useEffect(() => {
    dispatch(fetchAllApprovedPosts(keyword));
    dispatch(fetchAllApprovedListings(keyword));
    dispatch(fetchAllApprovedItemForSale(keyword));
    dispatch(fetchAllUsers(keyword));
  }, [dispatch, keyword]);

  const {
    allApprovedPosts,
    loadingAllApprovedPosts,
    errorAllApprovedPosts,
    allApprovedListings,
    loadingAllApprovedListings,
    errorAllApprovedListings,
    allApprovedItemForSale,
    loadingAllApprovedItemForSale,
    errorAllApprovedItemForSale,
    allUsers,
    loadingAllUsers,
    errorAllUsers,
  } = useSelector((state) => ({
    ...state.allApprovedPosts,
    ...state.allApprovedListings,
    ...state.allApprovedItemForSale,
    ...state.allUsers,
  }));


  return (
    <div className="container-content">
      <h2>Search Results</h2>
      <p>
        Showing results for <strong>{type}</strong>: <em>{keyword}</em>
      </p>

      <UserCard users={allUsers} />

      <ItemCard items={allApprovedListings} title="Listings" />
      <ItemCard items={allApprovedItemForSale} title="For Sale" />
      <PostCard borrowingPosts={allApprovedPosts} title="Lend" />
    </div>
  );
};

export default SearchResults;
