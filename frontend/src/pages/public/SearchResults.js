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
import { Link } from "react-router-dom"; // For "View All" link
import LoadingItemCardSkeleton from "../../components/loading-skeleton/loading-item-card-skeleton/LoadingItemCardSkeleton";
import LoadingPostCardSkeleton from "../../components/loading-skeleton/loading-post-card-skeleton/LoadingPostCardSkeleton";
import TimeoutComponent from "../../utils/TimeoutComponent";
import "./homeStyles.css"; // Assuming CSS is added for any styling

// Centralized function for skeleton rendering
const SkeletonLoader = ({ type, count }) => {
  const SkeletonComponent =
    type === "item" ? LoadingItemCardSkeleton : LoadingPostCardSkeleton;
  return (
    <div className="card-container minimal">
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonComponent key={index} />
      ))}
    </div>
  );
};

// Section Title component with View All link
function SectionTitle({ title, viewAllLink }) {
  return (
    <div className="section-header">
      <h2 className="section-title">{title}</h2>
      {viewAllLink && (
        <Link to={viewAllLink} className="view-all-link">
          View All
        </Link>
      )}
    </div>
  );
}

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

      {/* Users Section */}
      <div className="content-section py-3">
        <SectionTitle title="Users" />
        <TimeoutComponent
          timeoutDuration={1000}
          fallback={<SkeletonLoader type="item" count={6} />}
        >
          {!loadingAllUsers && <UserCard users={allUsers} />}
        </TimeoutComponent>
      </div>

      {/* Listings Section */}
      <div className="content-section  py-3">
        <SectionTitle title="Listings" viewAllLink={`/rent?q=${keyword}`} />
        <TimeoutComponent
          timeoutDuration={1000}
          fallback={<SkeletonLoader type="item" count={6} />}
        >
          {!loadingAllApprovedListings && (
            <ItemCard items={allApprovedListings.slice(0, 6)} />
          )}
        </TimeoutComponent>
      </div>

      {/* Items for Sale Section */}
      <div className="content-section py-3">
        <SectionTitle title="For Sale" viewAllLink={`/shop?q=${keyword}`} />
        <TimeoutComponent
          timeoutDuration={1000}
          fallback={<SkeletonLoader type="item" count={6} />}
        >
          {!loadingAllApprovedItemForSale && (
            <ItemCard items={allApprovedItemForSale.slice(0, 6)} />
          )}
        </TimeoutComponent>
      </div>

      {/* Posts Section */}
      <div className="content-section  py-3">
        <SectionTitle title="Lend" viewAllLink={`/lookingfor?q=${keyword}`} />
        <TimeoutComponent
          timeoutDuration={1000}
          fallback={<SkeletonLoader type="post" count={4} />}
        >
          {!loadingAllApprovedPosts && (
            <PostCard borrowingPosts={allApprovedPosts.slice(0, 4)} />
          )}
        </TimeoutComponent>
      </div>
    </div>
  );
};

export default SearchResults;
